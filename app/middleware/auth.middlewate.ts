import jwt from "jsonwebtoken"

export async function verify(token: string) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)

        return decoded
    } catch {
        return null
    }
}