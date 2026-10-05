import { Router } from "express";
import {
    toggleFollowUser, getFollowedFeed , getUserProfile,
} from "../controllers/follow.controller.js";
import { verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/feed").get(verifyJWT,getFollowedFeed);

router.route("/profile/:username").get(getUserProfile);

router.route("/toggle/:targetUserId").get(verifyJWT,toggleFollowUser);


export default router;
