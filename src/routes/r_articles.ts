import { Router } from "express"
import { getAllArticles, getArticleById, deleteArticleById, createArticle, updateArticleById } from "../controllers/c_articles"

const router = Router()

router.get("/", getAllArticles)
router.get("/:id", getArticleById)
router.delete("/:id", deleteArticleById)
router.post("/", createArticle)
router.put("/:id", updateArticleById)

export default router
