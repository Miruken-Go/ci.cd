import {
    handle,
    EnvSecrets,
    EnvVariables,
    Git,
    logging,
    versionNumbers
} from '../src/index'

handle(async () => {
    const variables = new EnvVariables()
        .required([
            'repositoryPath',
            'ref'
        ])
        .variables

    logging.printVariables(variables)
    
    const secrets = new EnvSecrets()
        .require(['ghToken'])
        .secrets

    logging.printSecrets(secrets)

    logging.header("Publishing ci.cd")

    const version = await versionNumbers.repoVersion(variables.repositoryPath, variables.ref)

    const git = await new Git(secrets.ghToken)
    await git.commitAndPush('dist* -f', 'built javascript dist modules')
    await git.tagAndPush(`v${version}`)
})
