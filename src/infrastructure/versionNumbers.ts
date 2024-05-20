import { execute } from './bash'

export function epochVerion() {
    return `v${Math.floor(Date.now()/1000)}`.trim()
}

//This docker container is running docker in docker from github actions
//Therefore using $(pwd) to get the working directory would be the working directory of the running container 
//Not the working directory from the host system. So we need to pass in the repository path.
export async function repoVersion (repositoryPath: string, ref: string): Promise<string> {
    const versionFormat = (ref === 'refs/heads/main') ? 'MajorMinorPatch' : 'SemVer'
    const rawVersion = await execute(`
        docker run --rm -v '${repositoryPath}:/repo' \
        gittools/gitversion:6.0.0-alpine.3.18-7.0 /repo /showvariable ${versionFormat}
    `)
    return `v${rawVersion}`
}

//This docker container is running docker in docker from github actions
//Therefore using $(pwd) to get the working directory would be the working directory of the running container 
//Not the working directory from the host system. So we need to pass in the repository path.
export async function tagVersion (repositoryPath: string, ref: string, tagPrefix): Promise<string> {
    const versionFormat = (ref === 'refs/heads/main') ? 'MajorMinorPatch' : 'SemVer'
    const rawVersion = await execute(`
        docker run --rm -v '${repositoryPath}:/repo' \
        gittools/gitversion:6.0.0-alpine.3.18-7.0 /repo /showvariable ${versionFormat} /overrideconfig tag-prefix=${tagPrefix}
    `)
    return `v${rawVersion}`
}