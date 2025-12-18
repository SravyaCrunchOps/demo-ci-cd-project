import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv'

dotenv.config()

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })


// fetch all jobs
export async function fetchJobs(repoFullName, runId) {
    const [owner, repo] = repoFullName.split('/')
    const jobs = await octokit.rest.actions.listJobsForWorkflowRun({
        owner,
        repo,
        run_id: runId,
    })
    return jobs.data.jobs
}

// request logs for a job
export async function requestLogs(repoFullName, jobId) {
    const [owner, repo] = repoFullName.split('/')
    // output is zip file which i have to unzip to extract logs
    // const logs = await octokit.rest.actions.downloadJobLogsForWorkflowRun({
    //     owner,
    //     repo,
    //     job_id: jobId,
    // }) 
    const logs = await octokit.request('GET /repos/{owner}/{repo}/actions/jobs/{job_id}/logs', {
        owner,
        repo,
        job_id: jobId,
    })
    const lines = logs.data.split('\n')
    const truncated_logs = lines.slice(-100).join("\n") 
    console.log('logs data: ', truncated_logs)
    return truncated_logs
}



// create new branch
export async function createBranch(repoFullName, baseBranch, newBranch) {
    const [owner, repo] = repoFullName.split('/')
    const {data: baseRef} = await octokit.rest.repos.getBranch({ 
        owner,
        repo,
        branch: baseBranch
    })
    const baseSha = baseRef.commit.sha

    await octokit.rest.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${newBranch}`,
        sha: baseSha
    })

    return newBranch
}

export async function commitFile(repoFullName, branch, path, content, commitMessage) {
    const [owner, repo] = repoFullName.split('/')
    // get file; if exists update, else create
    try{ 
        const get = await octokit.rest.repos.getContent({
            owner,
            repo,
            path,
            ref: branch
        })
        const sha = get.data.sha

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message: commitMessage,
            content: Buffer.from(content).toString('base64'),
            branch,
            sha
        })
    }
    catch (err) {
        // if not found, create
        if (err.status === 404) {
            await octokit.repos.createOrUpdateFileContents({
                owner, repo, path, message: commitMessage, content: Buffer.from(content).toString('base64'),
                branch
            });
        } else throw err;
    }
}

export async function createPullRequest(repoFullName, baseBranch, newBranch, title, body) {
    const [owner, repo] = repoFullName.split('/')
    const {data: pr } = await octokit.rest.pulls.create({
        owner,
        repo,
        head: newBranch,
        base: baseBranch,
        title,
        body,
        maintainer_can_modify: true
    })
    return pr
}

export async function listOpenPRs(repoFullName, headBranch) {
    const [owner, repo] = repoFullName.split('/')
    const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        head: `${owner}:${headBranch}`,
        state: 'open'
    })
    return data
}

export async function mergePR(repoFullName, prNumber) {
    const [owner, repo] = repoFullName.split('/')
    const { data } = await octokit.rest.pulls.merge({
        owner,
        repo,
        oull_number: prNumber,
        merge_method: "merge"
    })
    return data
}