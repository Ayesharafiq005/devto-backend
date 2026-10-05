import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Bookmark } from "../models/bookmark.model.js";
import mongoose from "mongoose";

const toggleBookmark = asyncHandler(async(req , res) => {
    const {articleId} = req.params;
    const userId = req.user._id;

if(!mongoose.Types.ObjectId.isValid(articleId)){
    throw new ApiError(400, "Invalid ArticleId Format");
}

const existingBookmark = await Bookmark.findOne({
    article : articleId,
    user : userId,
});

if(existingBookmark){
   await Bookmark.findByIdAndDelete(existingBookmark._id)
        return res
        .status(200)
        .json(new ApiResponse(
            200, 
            {isBookmarked : false},
            "Article Removed from Reading list (Bookmark Removed ) !!")
        )
};

await Bookmark.create({
    article : articleId,
    user : userId
});

return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isBookmarked: true },
        "Article saved to reading list"
      )
    );
});


const getUserBookmarks = asyncHandler(async(req,res) => {
    const userId = req.user._id;

    const bookmarks = await Bookmark.find({user : userId})
    .populate({
        path : "article",
        populate : {
            path : "author",
            select: "fullName username avatar",
        }
    })
    .sort({createdAt : -1});

   const bookmarkedArticle =  bookmarks.map((b) => b.article);

   return res.status(200)
    .json(new ApiResponse(200, bookmarkedArticle, "Reading List fetched Successfully.. "));
})


export { toggleBookmark, getUserBookmarks};