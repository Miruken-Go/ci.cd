import * as bash from './bash'
import { Application } from './config'

interface Container {
    image: string
}

interface Revision {
    properties: {
        active: boolean
        trafficWeight: number
        template: {
            containers: Container[]
        }
    }
}

export async function getImageTagForActiveRevision(application: Application) { 
    try {
        const revisions: Revision[] = await bash.json(`
            az containerapp revision list                 \
                -n ${application.containerAppName}        \
                -g ${application.resourceGroups.instance} \
        `)
        const active = revisions.filter(r => 
            r.properties.active == true &&
            r.properties.trafficWeight == 100
        )

        if (active.length) {
            const image = active[0].properties.template.containers[0].image
            const split = image.split(':')
            return split.length > 1
                ? split[1]
                : null
        } else {
            return null
        }
    } catch {
        console.log(`no active container app revision for ${application.containerAppName}`)
    }

    return null
}
