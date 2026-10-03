/** Makes user input safe to put in a MongoDB $regex: matched literally, no catastrophic patterns. */
export function escapeRegex(input: string): string {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
