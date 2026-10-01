import { Router } from "express";
import {toggleArticleLike} from "../controllers/like.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router();

router.route("/toggle/:articleId").post(verifyJWT, toggleArticleLike);

export default router;