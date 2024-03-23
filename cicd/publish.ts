import * as bash        from '../src/infrastructure/bash'
import * as logging     from '../src/infrastructure/logging'
import { Git }          from '../src/infrastructure/git'
import { handle }       from '../src/infrastructure/handler'
import { EnvVariables } from '../src/infrastructure/envVariables'
import { EnvSecrets }   from '../src/infrastructure/envSecrets'

handle(async () => {
    const variables = new EnvVariables()
        .required(['repositoryPath'])
        .variables
    
    const secrets = new EnvSecrets()
        .require(['ghToken'])
        .secrets

    logging.printEnvironmentVariables(variables)
    logging.printEnvironmentSecrets(secrets)

    logging.header("Publishing ci.cd")

    //This docker container is running docker in docker from github actions
    //Therefore using $(pwd) to get the working directory would be the working directory of the running container 
    //Not the working directory from the host system. So we need to pass in the repository path.
    const rawVersion = await bash.execute(`
        docker run --rm -v '${variables.repositoryPath}:/repo' \
        gittools/gitversion:5.12.0-alpine.3.14-6.0 /repo /showvariable SemVer
    `)

    const git = new Git(secrets.ghToken)
    await git.commitAll('Transpiled typescript to javascript')
    await git.push()

    const gitTag = `v${rawVersion}`
    console.log(`gitTag: [${gitTag}]`)
    await git.tagAndPush(gitTag)
})
