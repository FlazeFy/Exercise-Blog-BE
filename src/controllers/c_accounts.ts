import { NextFunction, Request, Response } from "express"
import { randomUUID } from "crypto"
import { hashPassword, verifyPassword } from "../helpers/hashing"
import dbConfig from "../config/db"


export const postRegister = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Body
        const { name, email, password } = req.body

        // Validation: name required
        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Name cannot be empty",
                data: null,
            })
        }

        // Validation: email unique
        const checkEmailScript = `select id from author where email = $1`
        const checkEmail = await dbConfig.query(checkEmailScript, [email])

        if (checkEmail.rows.length > 0) {
            return res.status(400).json({
                message: "Email already registered",
                data: null,
            })
        }

        // Hashing
        const { hash, salt } = hashPassword(password)

        // Query
        const insertScript = `
            insert into author (id, name, email, password, salt, createdAt)
            values ($1, $2, $3, $4, $5, now())
            returning id, name, email, createdAt;
        `
        const result = await dbConfig.query(insertScript, [randomUUID(), name, email,hash, salt])

        // Response
        res.status(201).json({
            message: "Register successful",
            data: result.rows[0],
        })
    } catch (error) {
        next(error)
    }
}

export const getLogin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Body
        const { email, password } = req.body

        // Query
        const getScript = `select * from author where email = $1`
        const result = await dbConfig.query(getScript, [email])

        // Validation: email exists
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Email not found",
                data: null,
            })
        }

        const account = result.rows[0]

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
        const { password: _, salt: __, ...safeAccount } = account
        res.status(200).json({
            message: "Login successful",
            data: {
                user: safeAccount,
                token,
            },
        })
    } catch (error) {
        next(error)
    }
}