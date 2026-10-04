
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Follow } from "../models/follow.model.js";
import { User } from "../models/user.model.js";
import { Article } from "../models/article.model.js";
import mongoose from "mongoose";

const toggleFollowUser = asyncHandler(async (req, res) => {
  const { targetUserId } = req.params;
  const currentUserId = req.user._id;

  if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
    throw new ApiError(400, "Invalid User ID format");
  }

  if (currentUserId.toString() === targetUserId) {
    throw new ApiError(400, "You cannot follow yourself");
  }

  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  const existingFollow = await Follow.findOne({
    follower: currentUserId,
    following: targetUserId,
  });

  if (existingFollow) {
    await Follow.findByIdAndDelete(existingFollow._id);
    const followerCount = await Follow.countDocuments({ following: targetUserId });
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isFollowing: false, followerCount },
          "Unfollowed user successfully"
        )
      );
  }

  await Follow.create({
    follower: currentUserId,
    following: targetUserId,
  });

  const followerCount = await Follow.countDocuments({ following: targetUserId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isFollowing: true, followerCount },
        "Followed user successfully"
      )
    );
});


const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select("-password -refreshToken");
  if (!user) {
    throw new ApiError(404, "User profile not found");
  }

  const followersCount = await Follow.countDocuments({ following: user._id });
  const followingCount = await Follow.countDocuments({ follower: user._id });

  let isFollowing = false;
  if (req.user) {
    const followRecord = await Follow.findOne({
      follower: req.user._id,
      following: user._id,
    });
    isFollowing = !!followRecord;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...user.toObject(),
        followersCount,
        followingCount,
        isFollowing,
      },
      "User profile fetched successfully"
    )
  );
});


const getFollowedFeed = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  const followingList = await Follow.find({ follower: currentUserId }).select("following");
  const followingIds = followingList.map((f) => f.following);

  const articles = await Article.find({
    author: { $in: followingIds },
    isPublished: true,
  })
    .populate("author", "fullName username avatar")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, articles, "Followed feed fetched successfully"));
});

export { toggleFollowUser, getUserProfile, getFollowedFeed }; 