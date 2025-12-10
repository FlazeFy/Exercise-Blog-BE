import { Request, Response } from "express"
import { readJsonFile, writeJsonFile } from "../helpers/database"
import { randomUUID } from "crypto"
import { hashPassword, verifyPassword } from "../helpers/hashing"

const ACCOUNT_DATA = "accounts.json"

export const postRegister = (req: Request, res: Response) => {
    // Body
    const { name, email, password } = req.body

    // Validation: name required
    if (!name || name.trim() === "") {
        return res.status(400).json({
            message: "Name cannot be empty",
            data: null,
        })
    }

    // Database
    const accounts = readJsonFile(ACCOUNT_DATA)

    // Validation: email unique
    const emailExists = accounts.some((acc: any) => acc.email === email)
    if (emailExists) {
        return res.status(400).json({
            message: "Email already registered",
            data: null,
        })
    }

    // Hashing
    const { hash, salt } = hashPassword(password)

    // Insert
    const newAccount = {
        id: randomUUID(),
        name,
        email,
        password: hash,
        salt,
        createdAt: new Date().toISOString(),
    }

    // Database
    accounts.push(newAccount)
    writeJsonFile(ACCOUNT_DATA, accounts)

    // Response
    const { password: _, ...safeAccount } = newAccount
    res.status(201).json({
        message: "Register successful",
        data: safeAccount,
    })
}

export const getLogin = (req: Request, res: Response) => {
    // Body
    const { email, password } = req.body

    // Database
    const accounts = readJsonFile(ACCOUNT_DATA)

    // Validation: email exists
    const account = accounts.find((acc: any) => acc.email === email)
    if (!account) {
        return res.status(404).json({
            message: "Email not found",
            data: null,
        })
    }

    // Validation: password match
    const isValid = verifyPassword(password, account.password, account.salt)
    if (!isValid) {
        return res.status(400).json({
            message: "Invalid password",
            data: null,
        })
    }

    // Dummy token
    const token = "ABCD12345"

    // Response
    const { password: _, ...safeAccount } = account
    res.status(200).json({
        message: "Login successful",
        data: {
            user: safeAccount,
            token,
        },
    })
}