import * as bash     from '#infrastructure/bash.js'
import * as logging  from '#infrastructure/logging.js'
import * as git      from '#infrastructure/git.js'
import * as gh       from '#infrastructure/gh.js'
import { handle }    from '#infrastructure/handler.js'
import { variables } from '#infrastructure/envVariables.js'

variables.requireEnvVariables([
    'repositoryPath'
])

variables.optionalEnvVariables([
    'skipRepositoryDispatches'
])

handle(async () => {
    logging.printEnvironmentVariables(variables)

    logging.header("Building ci.cd")

    await bash.execute(`
        npm run test
    `)

    //This docker container is running docker in docker from github actions
    //Therefore using $(pwd) to get the working directory would be the working directory of the running container 
    //Not the working directory from the host system. So we need to pass in the repository path.
    const rawVersion = await bash.execute(`
        docker run --rm -v '${variables.repositoryPath}:/repo' \
        gittools/gitversion:5.12.0-alpine.3.14-6.0 /repo /showvariable SemVer
    `)

    const gitTag = `v${rawVersion}`

    console.log(`gitTag: [${gitTag}]`)

    await git.tagAndPush(gitTag)

    await gh.sendRepositoryDispatches('built-cicd', {
        cicdVersion: gitTag
    })
})
