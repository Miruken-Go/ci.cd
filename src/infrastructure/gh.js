import * as bash   from './bash.js'
import { secrets } from './envSecrets.js'
import { variables } from './envVariables.js'
import axios       from 'axios'

secrets.require([
    'ghToken',
    'GH_TOKEN'
])

variables.requireEnvVariables([
    'repository',
    'repositoryOwner'
])

variables.optionalEnvVariables([
    'skipRepositoryDispatches'
])

export async function sendRepositoryDispatch(eventType, payload, repository) { 
    if (variables.skipRepositoryDispatches) return

    const repo = repository || variables.repository
    if (!repo) throw new Error("Repository name is required")

    //in this case the repo variable should be repositoryOwner/repositoryName
    //for example Miruken-Go/demo.microservices
    //the git.repository context variable is in this format
    await axios.post(`https://api.github.com/repos/${repo}/dispatches`, {
        event_type:     eventType,
        client_payload: payload | {}
    }, {
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${secrets.ghToken}`,
            "X-GitHub-Api-Version": '2022-11-28'
        }
    })

    console.log(`Sent [${eventType}] repository dispatch to [${variables.repository}] with data [${JSON.stringify(payload)}]`)
}

export async function sendRepositoryDispatches(eventType, payload) { 
    if (variables.skipRepositoryDispatches) return

    const repos = await bash.json(`
        gh repo list ${variables.repositoryOwner} --json name
    `)

    for (const repo of repos) {
        await sendRepositoryDispatch(eventType, payload, `${variables.repositoryOwner}/${repo.name}`)
    }
}
