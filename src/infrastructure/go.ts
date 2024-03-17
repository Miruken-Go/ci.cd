import * as bash from './bash'

export async function getModuleVersion(folder: string, module: string) { 
    return await bash.execute(`
        cd ${folder}
        go list -m all | grep ${module} | awk '{print $2}' \
    `)
}
