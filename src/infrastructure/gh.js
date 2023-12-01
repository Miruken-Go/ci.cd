import * as bash   from './bash.js'
import { secrets } from './envSecrets.js'
import axios       from 'axios'

secrets.require([
    'ghToken',
    'GH_TOKEN'
])

export async function sendRepositoryDispatches(githubOrg, eventType, payload) { 
    const repos = await bash.json(`
        gh repo list ${githubOrg} --json name
    `)

    for (const repo of repos) {
        await axios.post(`https://api.github.com/repos/${githubOrg}/${repo.name}/dispatches`, {
            event_type:     eventType,
            client_payload: payload
        }, {
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${secrets.ghToken}`,
                "X-GitHub-Api-Version": '2022-11-28'
            }
        })

        console.log(`Sent [${eventType}] repository dispatch to [${repo.name}] with data [${JSON.stringify(payload)}]`)
    }
}