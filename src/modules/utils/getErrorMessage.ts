/**
 * Used to unwrap the string value of an error message and return it. Useful for getting try/catch blocks
 * to play nicely with Typescript
 */
export default function getErrorMessage(error: unknown) {
    if ((error as any).message) {
        return (error as any).message
    }

    return String(error)
}
