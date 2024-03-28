import * as bash    from './bash'
import * as logging from './logging'

export class Git {
    configured: Promise<string>

    constructor (ghToken: string) {
        if (!ghToken) throw new Error('ghToken is required')

        console.log("Configuring git")
        this.configured = bash.execute(`
            echo "setting working directory as git safe.directory $(pwd)"
            git config --global --add safe.directory $(pwd)
            git config --global user.email "mirukenjs@gmail.com"
            git config --global user.name "buildpipeline"
            git config --global url."https://api:${ghToken}@github.com/".insteadOf "https://github.com/"
            git config --global url."https://ssh:${ghToken}@github.com/".insteadOf "ssh://git@github.com/"
            git config --global url."https://git:${ghToken}@github.com/".insteadOf "git@github.com:"
        `)
    }

    async tagAndPush(tag: string) { 
        await this.configured

        logging.header("Tagging the commit")

        const existingTag = await bash.execute(`
            git tag -l ${tag}
        `)

        console.log(`existingTag: [${existingTag}]`)
        console.log(`tag: [${tag}]`)

        if (existingTag === tag) {
            console.log("Tag already created")
        } else {
            console.log("Tagging the release")
            await bash.execute(`
                git tag -a ${tag} -m "Tagged by build pipeline"
                git push origin ${tag}
            `)
        }
    }

    async anyChanges() { 
        await this.configured

        const status = await bash.execute(`
            git status
        `)
        const foundChanges = status.includes('Changes not staged for commit');
        if (foundChanges) {
            console.log("Changes found in git repo")
        } else {
            console.log("No changes found in git repo")
        }
        return foundChanges
    }

    async commitAll(message: string) { 
        await this.configured

        logging.header("Commiting Changes")

        await bash.execute(`
            git commit -am "${message}"
        `)
    }

    async push() { 
        await this.configured

        logging.header("Pushing branch")
        await bash.execute(`
            git push origin
        `)
    }
}
