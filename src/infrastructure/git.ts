import * as bash    from './bash'
import * as logging from './logging'
import * as fs      from 'node:fs'
import * as path    from 'node:path'

export class Git {
    configured: Promise<void>

    constructor (ghToken: string) {
        this.configured = this.configure(ghToken)
    }

    async configure(ghToken: string): Promise<void> {
        const workingDir = await(bash.execute(`
            pwd
        `))

        const gitDirectory = this.findGitDirectory(workingDir)

        console.log("Configuring git")

        await bash.execute(`
            git config --global --add safe.directory ${gitDirectory}
            git config --global user.email "mirukenjs@gmail.com"
            git config --global user.name "buildpipeline"
            git config --global url."https://api:${ghToken}@github.com/".insteadOf "https://github.com/"
            git config --global url."https://ssh:${ghToken}@github.com/".insteadOf "ssh://git@github.com/"
            git config --global url."https://git:${ghToken}@github.com/".insteadOf "git@github.com:"
        `)

        console.log("Configured git")
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

    async addAndCommit(selector:string, message: string) { 
        await this.configured

        logging.header(`Committing [${selector}] Changes`)

        await bash.execute(`
            git add ${selector}
            git commit -m "${message}"
        `)
    }

    async push() { 
        await this.configured

        logging.header("Pushing branch")
        await bash.execute(`
            git push origin
        `)
    }

    findGitDirectory(dir: string): string {
        if (!dir) {
            throw new Error("No .github folder found")
        }
        if (!fs.existsSync(dir)) { 
            throw new Error(`Directory ${dir} does not exist`)
        }
        if (fs.existsSync(path.join(dir, '.github'))) {
            //Found it
            return dir
        } else {
            //Look in the parent directory
            const split = dir.split(path.sep)
            split.pop()
            const parent = split.join(path.sep)
            return this.findGitDirectory(parent)
        }
    }
}
