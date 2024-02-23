import * as bash from '#infrastructure/bash.js'

export async function getImageTagForActiveRevision(application) { 
    try {
        const revisions = await bash.json(`
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
