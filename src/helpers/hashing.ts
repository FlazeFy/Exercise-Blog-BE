import crypto from "crypto"

export const hashPassword = (password: string, salt?: string) => {
    const usedSalt = salt || crypto.randomBytes(16).toString("hex")
    const hash = crypto.createHash("sha256").update(password + usedSalt).digest("hex")

    return { hash, salt: usedSalt }
}

export const verifyPassword = (password: string, hash: string, salt: string) => {
    const checkHash = crypto.createHash("sha256").update(password + salt).digest("hex")

    return checkHash === hash
}