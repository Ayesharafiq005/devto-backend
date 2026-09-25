import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";

const getOrCreateWelcomeBot = async () => {
  let bot = await User.findOne({ username: "welcome_bot", isBot: true });

  if (!bot) {
    bot = await User.create({
      username: "welcome_bot",
      email: "bot@devto.local",
      fullName: "Dev.to Onboarding Bot",
      password: "SystemBotPassword123!",
      isBot: true,
    });
  }
  return bot;
};

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some(
      (field) => field?.trim() === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(
      409,
      "User with this username and email already exists!"
    );
  }

  const user = await User.create({
    fullName,
    username,
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  try {
    const welcomeBot = await getOrCreateWelcomeBot();

    const welcomeChat = await Chat.create({
      participants: [createdUser._id, welcomeBot._id],
      isAutomatedBotChat: true,
      messages: [
        {
          sender: welcomeBot._id,
          content: `Welcome to Dev.to clone, ${createdUser.fullName}! We're excited to have you here. Feel free to explore articles and post your thoughts!`,
        },
      ],
    });

    const io = req.app.get("io");
    if (io) {
      io.emit(`Chat:${createdUser._id}`, {
        event: "WELCOME_CHAT_CREATED",
        chat: welcomeChat,
      });
    }
  } catch (botError) {
    console.log("Failed to create Automated Bot Chat : ", botError);
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("TOKEN GENERATION DETAILED ERROR:", error);
    throw new ApiError(
      500,
      `Token Error: ${error.message}`
    );
  }
};

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(401, "User does not exist!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")
    .lean();

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});

export { registerUser, loginUser };