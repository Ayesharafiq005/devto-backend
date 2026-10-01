import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async(req, res) => {
    const { articleId } = req.params;
    const { content } = req.body ;

    if(!content?.trim()) {
        throw new ApiError(400, "Comment Content cannot be empty");
    }

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new ApiError(400, "Invalid Article ID format");
  };

    const comment = await Comment.create({
        content,
        article : articleId,
        author : req.user._id
    });

    const populatedComment = await comment.populate( "author", "fullName username avatar");

    return res
        .status(200)
        .json( new ApiResponse(200, populatedComment ,"Comment added successfully"))
});

const getArticleComments = asyncHandler(async(req,res) => {
    const { articleId } = req.params;

if (!mongoose.Types.ObjectId.isValid(articleId)) {
    throw new ApiError(400, "Invalid Article ID format");
  };

    const comments = await Comment.find({ article : articleId})
        .populate("author" , "fullName username avatar")
        .sort({createdAt : -1});

    return res
    .status(200)
    .json(new ApiResponse(200, comments , "Comments fetched successfully"));
})

export {
    getArticleComments,
    addComment,
}