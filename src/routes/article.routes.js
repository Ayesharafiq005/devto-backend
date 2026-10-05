import { Router } from "express";
import { getAllArticles, getArticleBySlug,
     createArticle, getPopularTags, searchArticles} from "../controllers/article.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(getAllArticles);
router.route("/:slug").get(getArticleBySlug);

router.route("/search").get(searchArticles);
router.route("/tags/popular").get(getPopularTags);

router.route("/").post(verifyJWT, createArticle);

export default router;