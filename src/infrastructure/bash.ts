import { promisify }      from 'node:util'
import * as child_process from 'node:child_process'

const exec = promisify(child_process.exec);

export async function execute(cmd: string, suppressLog: boolean = false) { 
    const { stdout, stderr } = await exec(cmd);
    if (!suppressLog) {
        console.log('bash stdout:', stdout);
        if (stderr){
            console.log('bash stderr:', stderr);
        }
    }
    return stdout.trim();
}

export async function json(cmd: string, suppressLog: boolean = false) { 
    const response = await execute(cmd, suppressLog)
    return JSON.parse(response)
}
