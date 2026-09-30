import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Article } from "../models/article.model.js";

const createArticle = asyncHandler(async(req, res) => {
    const { title, content , tags ,coverImage } = req.body;

    if(!title || !content){
        throw new ApiError(400, "Title and content are required");
    }

    const article = await Article.create({
        title,
        content,
        tags: Array.isArray(tags) ? tags : [],
        coverImage : coverIamge || "",
        author : req.user._id
    });

    return res
    .status(200)
    .json(new ApiResponse(201, "Article created successfully"));
})

const getAllArticles = asyncHandler(async(req,res) => {
    const articles = await Article.find({isPublished : true})
        .populate("author", "fullName username avatar")
        .sort({createdAt : -1});

        return res
        .status(200)
        .json(new ApiResponse(200, articles, "Articles fetched successfully"))
});

const getArticleBySlug = asyncHandler(async(req,res) => {
    const {slug} = req.params;
    const article = await Article.findOne({slug, isPublished : true}).populate(
        "author",
         "fullName username avatar"
    )

    if (!article) {
    throw new ApiError(404, "Article not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, article, "Article fetched successfully"));
});


export {createArticle,
    getAllArticles,
    getArticleBySlug
}
