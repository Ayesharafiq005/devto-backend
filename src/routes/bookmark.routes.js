import { Router } from "express";
import { toggleBookmark, getUserBookmarks} from "../controllers/bookmark.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUserBookmarks);

router.route("/toggle/:articleId").post(toggleBookmark);


export default router;