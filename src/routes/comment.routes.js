import { Router } from "express";
import { getArticleComments , addComment} from "../controllers/comment.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/:articleId").get(getArticleComments);
router.route("/:articleId").post(verifyJWT, addComment);

export default router;