import * as bash from './bash'
import axios     from 'axios'

interface ghConfig {
    ghToken: string
    repository: string
    repositoryOwner: string
    ref: string
    skipRepositoryDispatches: boolean
}

export async function sendRepositoryDispatch(eventType: string, payload: object, repository: string,  config: ghConfig) { 
    if (config.skipRepositoryDispatches) return

    const repo = repository || config.repository
    if (!repo) throw new Error("Repository name is required")

    payload =  {
        ...payload,
        ref: config.ref,
    }

    //in this case the repo variable should be repositoryOwner/repositoryName
    //for example Miruken-Go/demo.microservices
    //the git.repository context variable is in this format
    await axios.post(`https://api.github.com/repos/${repo}/dispatches`, {
        event_type:     eventType,
        client_payload: payload
    }, {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${config.ghToken}`,
            "X-GitHub-Api-Version": '2022-11-28'
        }
    })

    console.log(`Sent [${eventType}] repository dispatch to [${repo}] with data [${JSON.stringify(payload)}]`)
}

export async function sendRepositoryDispatches(eventType: string, payload: object, config: ghConfig) { 
    if (config.skipRepositoryDispatches) return

    if (!process.env.GH_TOKEN) throw 'Environment variable required: GH_TOKEN'

    const repos = await bash.json(`
        gh repo list ${config.repositoryOwner} --json name
    `)

    for (const repo of repos) {
        await sendRepositoryDispatch(eventType, payload, `${config.repositoryOwner}/${repo.name}`, config)
    }
}
