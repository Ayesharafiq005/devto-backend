import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Like  } from "../models/like.model.js";

const toggleArticleLike = asyncHandler(async(req , res) => {

    const { articleId } = req.params;
    const { userId } = req.user._id;

    const existingLike = await Like.findOne({ article : articleId , likedBy : userId})

    if(existingLike){
        await Like.findByIdAndDelete(existingLike._id );
        const LikeCount = await Like.countDocuments({article : articleId});

        return res
        .status(200)
        .json(new ApiResponse(200, {isLiked : false , LikeCount}, "Article Unliked successfully!"))
    }

    await Like.create({ article : articleId , likedBy : userId});
    const LikeCount = await Like.countDocuments({article : articleId});

    return res
    .status(200)
    .json(new ApiResponse(200, {isLiked : true , LikeCount}, "Article Liked Successfully"));

    });

    export  {
        toggleArticleLike
    }