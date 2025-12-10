import { Router } from "express"
import { postRegister, getLogin } from "../controllers/c_accounts"

const router = Router()

router.post("/register", postRegister)
router.get("/login", getLogin)

export default router
