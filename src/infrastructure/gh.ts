import * as bash from './bash'
import axios     from 'axios'

interface ghOptions {
    ghToken: string
    repository: string
    repositoryOwner: string
    ref: string
    skipRepositoryDispatches?: boolean
}

export class GH {
    options: ghOptions

    constructor(options: ghOptions) {
        this.options = options

        if (!process.env['GH_TOKEN']) {
            throw new Error('The gh command line tool requires GH_TOKEN to be set as and environment variable.')
        }
    }

    async sendRepositoryDispatch(eventType: string, payload: object, repository: string) { 
        if (this.options?.skipRepositoryDispatches == true) return

        const repo = repository || this.options.repository
        if (!repo) throw new Error("Repository name is required")

        payload =  {
            ...payload,
            ref: this.options.ref,
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
                Authorization: `Bearer ${this.options.ghToken}`,
                "X-GitHub-Api-Version": '2022-11-28'
            }
        })

        console.log(`Sent [${eventType}] repository dispatch to [${repo}] with data [${JSON.stringify(payload)}]`)
    }

    async sendRepositoryDispatches(eventType: string, payload: object) { 
        if (this.options?.skipRepositoryDispatches == true) return

        if (!process.env.GH_TOKEN) throw 'Environment variable required: GH_TOKEN'

        const repos = await bash.json(`
            gh repo list ${this.options.repositoryOwner} --json name
        `)

        for (const repo of repos) {
            await this.sendRepositoryDispatch(eventType, payload, `${this.options.repositoryOwner}/${repo.name}`)
        }
    }
}


