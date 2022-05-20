export async function retry<T>(executableFunction: () => Promise<T>, maxRetries: number, timeout: number): Promise<T> {
    try {
        return await executableFunction();
    }
    catch (err) {
        console.log(err);
        if (maxRetries > 0) {
            console.log(`Retrying in ${timeout} ms`);
            await delay(timeout);

            return retry(executableFunction, maxRetries - 1, timeout);
        } else {
            throw err;
        }
    }
}

function delay(timeout: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, timeout));
}