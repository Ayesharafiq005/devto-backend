import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Article } from "../models/article.model.js";
import {Like } from "../models/like.model.js";
import { Comment} from "../models/comment.model.js"


const createArticle = asyncHandler(async(req, res) => {
    const { title, content , tags ,coverImage } = req.body;

    if(!title || !content){
        throw new ApiError(400, "Title and content are required");
    }

    const article = await Article.create({
        title,
        content,
        tags: Array.isArray(tags) ? tags : [],
        coverImage : coverImage || "",
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

const getArticleBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const article = await Article.findOneAndUpdate(
    { slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  ).populate("author", "fullName username avatar");

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, article, "Article fetched successfully"));
});

const searchArticles = asyncHandler(async (req, res) => {
  const { q, tag } = req.query;

  let query = { isPublished: true };

  if (q?.trim()) {
    query.$or = [
      { title: { $regex: q.trim(),$options: "i" } },
      { content: { $regex: q.trim(),$options: "i" } },
    ];
  }

  if (tag?.trim()) {
    query.tags = tag.trim().toLowerCase();
  }

  const articles = await Article.find(query)
    .populate("author", "fullName username avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        articles,
        `Found ${articles.length} articles matching criteria`
      )
    );
});

// const searchArticles = asyncHandler(async (req, res) => {
//   const { q, tag } = req.query;

//   // 1. Base query (Sirf published articles)
//   let query = { isPublished: true };

//   // 2. Strict Tag Filter (Agar tag aaya hai, toh pehle use match karo)
//   if (tag && tag.trim()) {
//     query.tags = { "\$regex": new RegExp(`^${tag.trim()}$`, "i") };
//   }

//   // 3. Text Search Filter (Sirf tab chalega jab query text 'q' aaya ho)
//   if (q && q.trim()) {
//     const searchRegex = new RegExp(`\\b${q.trim()}\\b`, "i");
//     query["\$or"] = [
//       { title: { "\$regex": searchRegex } },
//       { content: { "\$regex": searchRegex } }
//     ];
//   }

//   // Debugging console log
//   console.log("Generated MongoDB Query:", JSON.stringify(query, null, 2));

//   const articles = await Article.find(query)
//     .populate("author", "fullName username avatar")
//     .sort({ createdAt: -1 });

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(
//         200,
//         articles,
//         `Found ${articles.length} articles matching criteria`
//       )
//     );
// });


const getPopularTags = asyncHandler(async (req, res) => {
  const tagsAggregation = await Article.aggregate([
    { $match: { isPublished: true } },
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $sort: { count: -1 } },  
       {$limit: 10 },
  ]);

  const popularTags = tagsAggregation.map((t) => ({
    tag: t._id,
    count: t.count,
  }));

  return res
    .status(200)
    .json(
      new ApiResponse(200, popularTags, "Popular tags fetched successfully")
    );
});

const getAuthorDashboard = asyncHandler(async (req, res) => {
  const authorId = req.user._id;

  const articles = await Article.find({ author: authorId }).sort({ createdAt: -1 });
  const articleIds = articles.map((a) => a._id);

  const totalArticles = articles.length;
  const totalViews = articles.reduce((acc, curr) => acc + (curr.views || 0), 0);
  const totalLikes = await Like.countDocuments({ article: { $in: articleIds } });
  const totalComments = await Comment.countDocuments({ article: { $in: articleIds } });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        stats: {
          totalArticles,
          totalViews,
          totalLikes,
          totalComments,
        },
        articles,
      },
      "Dashboard analytics fetched successfully"
    )
  );
});

const updateArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;
  const { title, content, tags, coverImage, isPublished } = req.body;

  const article = await Article.findById(articleId);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  if (article.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to edit this article");
  }

  if (title) article.title = title;
  if (content) article.content = content;
  if (tags) article.tags = Array.isArray(tags) ? tags : article.tags;
  if (coverImage !== undefined) article.coverImage = coverImage;
  if (isPublished !== undefined) article.isPublished = isPublished;

  await article.save();

  return res
    .status(200)
    .json(new ApiResponse(200, article, "Article updated successfully"));
});

const deleteArticle = asyncHandler(async (req, res) => {
  const { articleId } = req.params;

  const article = await Article.findById(articleId);

  if (!article) {
    throw new ApiError(404, "Article not found");
  }

  if (article.author.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You do not have permission to delete this article");
  }

  await Article.findByIdAndDelete(articleId);

  // delete  associated likes And comments , beacuse as article isdeleted then its of no use 
  await Like.deleteMany({ article: articleId });
  await Comment.deleteMany({ article: articleId });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Article deleted successfully"));
});

export {createArticle,
    getAllArticles,
    getArticleBySlug,
    searchArticles,
    getPopularTags,
    getAuthorDashboard,
    updateArticle,
    deleteArticle
}
