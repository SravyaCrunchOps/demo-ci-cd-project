import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { verifySignature } from './helper.js'
import { createBranch, commitFile, createPullRequest, listOpenPRs, mergePR } from './githubTools.js'
import { invokeBedrockLLM } from './bedrockClient.js'


dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || "default"

app.use(cors())
app.use(express.json())

app.post('/webhook', async (req, res) => {
  try {
    if(!verifySignature(req, WEBHOOK_SECRET)) {
      return res.status(401).send('Invalid signature')
    }

    const event = req.headers['x-github-event']
    console.log('event: ', event)
    const payload = req.body
    console.log('payload: ', payload)

    //  configure your workflow_run: to get details of that workflow
    if(event === "workflow_run" && payload.action === "completed") {
      const conclusion = payload.workflow_run?.conclusion // completed | failure | ...
      const runEventName = payload.workflow_run?.name || payload.workflow_run?.workflow_id
      const headSha = payload.workflow_run?.head_sha
      const repo = payload.repository?.full_name
      const branch = payload.workflow_run?.head_branch || 'default'
      console.log(`Recieved workflow_run details:\n repo: ${repo},\n event: ${runEventName},\n status: ${conclusion}`)
    
      // if status = 'failed' ?
      if(conclusion === 'failure') {
        // call agent to fix
        const intent = `
          CI workflow failed. Details are: 
          event ${runEventName} failed on commit ${headSha} for branch ${branch} in repo ${repo}.

          Provide a short plan, suggest fix and candidate a code patch. Output JSON format with:
          {
            "summary": "...",
            "patches": [
              {
                "file_path": "relative/path",
                "new_content": "file contents (full file)",
                "commit_message": "..."
              }
            ],
            "pr_title": "...",
            "pr_body": "..."
          } 

          If you cannot produce a safe patch, respond with {"patches": []} only. Be conservative and minimal.
        `

        const modelResponse = await invokeBedrockLLM(intent)
        console.log('modelResponse: ', modelResponse)

        if(!Array.isArray(modelResponse.patches) || modelResponse.patches.length === 0) {
          console.log("Model suggested no patches; stopping.");
          return res.status(200).json({ message: "No patches suggested" });
        }

        // create new branch and commit patches
        const baseBranch = branch || 'default'
        const newBranch = `agent/fix-${Date.now()}`

        await createBranch(repo, baseBranch, newBranch) 
        
        for (const p of modelResponse.patches) {
          const path = p.file_path
          const content = p.new_content
          const commitMsg = p.commit_message || `agent-fixed: ${path}`
          await commitFile(repo, newBranch, path, content, commitMsg)
        }

        // create PR
        const prTitle = modelResponse.pr_title || `Agent-fix: CI is fixed for ${headSha.slice(0, 7)}`
        const prBody = modelResponse.pr_body || `Autmated PR created by Agent to address failing CI ppieline`
        const pr = await createPullRequest(repo, baseBranch, newBranch, prTitle, prBody)

        console.log('created PR: ', pr.html_url)

        return res.status(200).json({message: "PR created", url: pr.html_url})
      }
      return res.status(200).json({message: 'workflow handled'})
      // end workflow-run for failure
    }

    // 2. workflow-run completed and coclusion is success try merge
    if(event === 'workflow_run' && payload.action === 'completed') {
      const conclusion = payload.workflow_run?.conclusion
      const repo = payload.repository?.full_name
      const headBranch = payload.workflow_run?.head_branch
      console.log(`worklfow_run completed for new branch: ${headBranch}, conclusion: ${conclusion}`)

      if(conclusion === 'success' && headBranch) {
        // find PR(s) matching this head branch
        const prs = await listOpenPRs(repo, headBranch)
        if(prs.length === 0) {
          console.log('No open PRs for branch: ', headBranch)
          return res.status(200).json({message: 'No open PRs for branch'})
        }
        // Simple policy: merge all open PRs with this head if checks passed
        const merged = []
        for (const pr of prs) {
          try {
            const mergeRes = await mergePR(repo, pr.number)
            merged.push({pr: pr.html_url, merge: mergeRes})
            console.log('Mergerd PR: ', pr.html_url)
          } 
          catch(err) {
            console.error('Failed to merge PR: ', pr.html_url, err.message)
          }
        }
        return res.status(200).json(merged)
      }
      return res.status(200).json({message: 'no-action for this workflow_run conclusion'})
      //  end workflow siccess
    }

  return res.status(200).json({ message: "event ignored" });
  }
  catch(err) {
    console.error("Webhook handler error:", err);
    return res.status(500).json({ error: String(err) });
  }
})


app.get("/health", (req, res) => {
  return res.status(200).send("CI/CD Bedrock Agent alive")
});


app.listen(PORT, () => {
    console.log(`AI Agent server running in port: ${PORT}`)
})