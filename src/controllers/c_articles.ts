import { Request, Response } from "express"
import { readJsonFile, writeJsonFile } from "../helpers/database"
import { randomUUID } from "crypto"

const ARTICLE_DATA = "articles.json"
const ACCOUNT_DATA = "accounts.json"

export const getAllArticles = (req: Request, res: Response) => {
    // Query param
    const { category, search, authorId } = req.query

    // Database
    const articles = readJsonFile(ARTICLE_DATA)

    // Filtering
    let filtered = articles

    // Filter by category
    if (category) {
        filtered = filtered.filter(
            (dt: any) => dt.category?.toLowerCase() === String(category).toLowerCase()
        )
    }

    // Filter by keyword (title or content)
    if (search) {
        const keyword = String(search).toLowerCase()
        filtered = filtered.filter(
            (dt: any) => dt.title?.toLowerCase().includes(keyword) || dt.content?.toLowerCase().includes(keyword)
        )
    }

    // Filter by authorId
    if (authorId) {
        filtered = filtered.filter((dt: any) => String(dt.authorId) === String(authorId))
    }

    // Select columns
    const mapped = filtered.map((dt: any) => ({
        id: dt.id,
        title: dt.title,
        category: dt.category,
        authorId: dt.authorId,
        createdAt: dt.createdAt,
    }))

    // Sorting
    const sorted = mapped.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    // Response
    res.status(sorted.length > 0 ? 200 : 404).json({
        message: `Get articles ${sorted.length > 0 ? 'successful' : 'failed'}`,
        data: sorted.length > 0 ? sorted : null,
    })
}

export const getArticleById = (req: Request, res: Response) => {
    // Param
    const { id } = req.params

    // Database
    const articles = readJsonFile(ARTICLE_DATA)

    // Filtering
    const article = articles.find((p: any) => p.id === id)
    if (!article) {
        return res.status(404).json({ 
            message: "article not found",
            data: null
        })
    }

    // Response
    res.status(200).json({
        message: "Get article successful",
        data: article,
    })
}

export const createArticle = (req: Request, res: Response) => {
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
    const accounts = readJsonFile(ACCOUNT_DATA)
    const authorExists = accounts.some((acc: any) => acc.id === authorId)
    if (!authorExists) {
        return res.status(400).json({
            message: "Invalid authorId: account not found",
            data: null,
        })
    }

    // Database
    const articles = readJsonFile(ARTICLE_DATA)

    // Insert
    const newArticle = {
        id: randomUUID(),
        title,
        category,
        content,
        authorId,
        createdAt: new Date().toISOString(),
    }
    articles.push(newArticle)

    // Database
    writeJsonFile(ARTICLE_DATA, articles)

    // Response
    res.status(201).json({
        message: "Create article successful",
        data: newArticle,
    })
}

export const updateArticleById = (req: Request, res: Response) => {
    // Param & Body
    const { id } = req.params
    const { title, category, content, authorId } = req.body

    // Database
    const articles = readJsonFile(ARTICLE_DATA)

    // Filtering
    const articleIndex = articles.findIndex((dt: any) => dt.id === id)
    if (articleIndex === -1) {
        return res.status(404).json({
            message: "article not found",
            data: null,
        })
    }

    // Validation: title length
    if (title && title.length < 3) {
        return res.status(400).json({
            message: "Title must be at least 3 characters",
            data: null,
        })
    }

    // Validation: authorId must exists
    if (authorId) {
        const accounts = readJsonFile(ACCOUNT_DATA)
        const authorExists = accounts.some((acc: any) => acc.id === authorId)
        if (!authorExists) {
            return res.status(400).json({
                message: "Invalid authorId: account not found",
                data: null,
            })
        }
    }

    // Update fields
    const updatedArticle = {
        ...articles[articleIndex],
        title: title ?? articles[articleIndex].title,
        content: content ?? articles[articleIndex].content,
        category: category ?? articles[articleIndex].category,
        authorId: authorId ?? articles[articleIndex].authorId,
        updatedAt: new Date().toISOString(),
    }
    articles[articleIndex] = updatedArticle

    // Database
    writeJsonFile(ARTICLE_DATA, articles)

    // Response
    res.status(200).json({
        message: "Update article successful",
        data: updatedArticle,
    })
}

export const deleteArticleById = (req: Request, res: Response) => {
    // Param
    const { id } = req.params

    // Database
    const articles = readJsonFile(ARTICLE_DATA)

    // Filtering
    const articleIndex = articles.findIndex((dt: any) => dt.id === id)
    if (articleIndex === -1) {
        // Response
        return res.status(404).json({ 
            message: "article not found",
            data: null
        })
    }

    // Delete
    const deleted = articles.splice(articleIndex, 1)

    // Database
    writeJsonFile(ARTICLE_DATA, articles)

    // Response
    res.status(200).json({
        message: "Delete article successful",
        data: deleted[0],
    })
}
