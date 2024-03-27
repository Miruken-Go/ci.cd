import {
    handle,
    EnvSecrets,
    EnvVariables,
    Git,
    logging,
    bash
} from '../src/index'

handle(async () => {
    const variables = new EnvVariables()
        .required(['repositoryPath'])
        .variables

    logging.printVariables(variables)
    
    const secrets = new EnvSecrets()
        .require(['ghToken'])
        .secrets

    logging.printSecrets(secrets)

    logging.header("Publishing ci.cd")

    //This docker container is running docker in docker from github actions
    //Therefore using $(pwd) to get the working directory would be the working directory of the running container 
    //Not the working directory from the host system. So we need to pass in the repository path.
    const rawVersion = await bash.execute(`
        docker run --rm -v '${variables.repositoryPath}:/repo' \
        gittools/gitversion:5.12.0-alpine.3.14-6.0 /repo /showvariable SemVer
    `)

    await new Git(secrets.ghToken)
        .tagAndPush(`v${rawVersion}`)
})
