import { NextFunction, Request, Response } from "express"
import dbConfig from "../config/db"
import { randomUUID } from "crypto"

export const getAllArticles = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Body
        const { category, search, authorId } = req.query

        // Query
        let getScript = `select id, title, category, authorId, createdAt from articles`
        const params: any[] = []
        const conditions: string[] = []

        // Filter by category
        if (category){
            params.push(String(category).toLowerCase())
            conditions.push(`lower(category) = $${params.length}`)
        }

        // Filter by keyword (title or content)
        if (search){
            const keyword = `%${String(search).toLowerCase()}%`
            params.push(keyword)
            params.push(keyword)
            conditions.push(`(lower(title) like $${params.length - 1} or lower(content) like $${params.length})`)
        }

        // Filter by authorId
        if (authorId){
            params.push(String(authorId))
            conditions.push(`authorId = $${params.length}`)
        }

        // Join
        if (conditions.length > 0){
            getScript += ` where ` + conditions.join(" and ")
        }

        // Sorting
        getScript += ' order by createdAt desc'

        // Query
        const result = await dbConfig.query(getScript, params)

        // Response
        res.status(result.rows.length > 0 ? 200 : 404).json({
            message: `Get articles ${result.rows.length > 0 ? 'successful' : 'failed'}`,
            data: result.rows.length > 0 ? result.rows : null,
        })
    } catch (error) {
        next(error)
    }
}

export const getArticleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Param
        const { id } = req.params

        // Query
        const getScript = `select * from articles where id = $1`
        const result = await dbConfig.query(getScript, [id])

        if (result.rows.length === 0){
            return res.status(404).json({
                message: "article not found",
                data: null
            })
        }

        // Response
        res.status(200).json({
            message: "Get article successful",
            data: result.rows[0],
        })
    } catch (error) {
        next(error)
    }
}

export const createArticle = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Body
        const { title, category, content, authorId } = req.body

        // Validation: title length
        if (!title || title.length < 3) {
            return res.status(400).json({
                message: "Title must be at least 3 characters",
                data: null,
            })
        }

        // Validation: authorId must exists
        const checkAuthorScript = `select id from author where id = $1`
        const checkAuthor = await dbConfig.query(checkAuthorScript, [authorId])

        if (checkAuthor.rows.length === 0) {
            return res.status(400).json({
                message: "Invalid authorId: account not found",
                data: null,
            })
        }

        const insertScript = `
            insert into articles (id, title, content, category, authorId)
            values ($1, $2, $3, $4, $5)
            returning *;
        `
        // Query
        const result = await dbConfig.query(insertScript, [randomUUID(),title, content, category,authorId])

        const newArticle = result.rows[0]

        // Response
        res.status(201).json({
            message: "Create article successful",
            data: newArticle,
        })
    } catch (error) {
        next(error)
    }
}

export const updateArticleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Param & Body
        const { id } = req.params
        const { title, category, content, authorId } = req.body

        // Query
        const checkScript = `select * from articles where id = $1`
        const checkResult = await dbConfig.query(checkScript, [id])

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                message: "article not found",
                data: null,
            })
        }

        const oldArticle = checkResult.rows[0]

        // Validation: title length
        if (title && title.length < 3) {
            return res.status(400).json({
                message: "Title must be at least 3 characters",
                data: null,
            })
        }

        // Validation: authorId must exists
        if (authorId) {
            const checkAuthorScript = `select id from author where id = $1`
            const authorResult = await dbConfig.query(checkAuthorScript, [authorId])

            if (authorResult.rows.length === 0) {
                return res.status(400).json({
                    message: "Invalid authorId: account not found",
                    data: null,
                })
            }
        }

        const updatedArticle = {
            title: title ?? oldArticle.title,
            content: content ?? oldArticle.content,
            category: category ?? oldArticle.category,
            authorId: authorId ?? oldArticle.authorid,
        }

        // Query
        const updateScript = `update articles
            set title = $1, content = $2, category = $3, authorId = $4, updatedAt = now()
            where id = $5
            returning *;
        `
        const result = await dbConfig.query(updateScript, [
            updatedArticle.title,
            updatedArticle.content,
            updatedArticle.category,
            updatedArticle.authorId,
            id
        ])

        // Response
        res.status(200).json({
            message: "Update article successful",
            data: result.rows[0],
        })
    } catch (error) {
        next(error)
    }
}

export const deleteArticleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Param
        const { id } = req.params

        // Query
        const checkScript = `select * from articles where id = $1`
        const checkResult = await dbConfig.query(checkScript, [id])

        if (checkResult.rows.length === 0) {
            // Response
            return res.status(404).json({
                message: "article not found",
                data: null
            })
        }

        // Query
        const deleteScript = `delete from articles where id = $1 returning *`
        const result = await dbConfig.query(deleteScript, [id])

        // Response
        res.status(200).json({
            message: "Delete article successful",
            data: result.rows[0],
        })
    } catch (error) {
        next(error)
    }
}