import { Router } from "express";
import { getAllArticles, getArticleBySlug, createArticle} from "../controllers/article.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getAllArticles);
router.route("/:slug").get(getArticleBySlug);

router.route("/").post(verifyJWT, createArticle);

export default router;