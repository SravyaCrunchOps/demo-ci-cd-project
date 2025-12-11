import { Octokit } from "@octokit/rest";
import dotenv from 'dotenv'

dotenv.config()

export const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

// create new branch

export async function createBranch(repo, baseBranch, newBranch) {
    const [owner, repo] = repo.split('/')
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

export async function commitFile(repo, branch, path, content, commitMessage) {
    const [owner, repo] = repo.split('/')
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

export async function createPullRequest(repo, baseBranch, newBranch, title, body) {
    const [owner, repo] = repo.split('/')
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

export async function listOpenPRs(repo, headBranch) {
    const [owner, repo] = repo.split('/')
    const { data } = await octokit.rest.pulls.list({
        owner,
        repo,
        head: `${owner}:${headBranch}`,
        state: 'open'
    })
    return data
}

export async function mergePR(repo, prNumber) {
    const [owner, repo] = repo.split('/')
    const { data } = await octokit.rest.pulls.merge({
        owner,
        repo,
        oull_number: prNumber,
        merge_method: "merge"
    })
    return data
}