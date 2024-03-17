export async function handle<T>(func: () => Promise<T>) {
    try {
        return await func().then(() => {
            console.log("Script completed successfully")
        })
    } catch (error) {
        process.exitCode = 1
        console.log(error)
        console.log("Script Failed")
    }
}