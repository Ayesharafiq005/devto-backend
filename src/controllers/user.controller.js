import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from  "../utils/apiError.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/user.model.js";


const getOrCreateWelcomeBot = async () => {

  let bot = await User.findOne({username : "wecome_bot" , isBot : true });

  if(!bot) {
    bot = User.create({
        username : "welcome_bot",
        email : " bot@devto.local",
        fullName : "Dev.to Onboarding Bot ",
        password : "SystemBotPassword123!",
        isBot : true 
    });
  }
  return bot ;
}


const registerUser = asyncHandler(async (req, res) => {
    const { fullName , email , username , password } = req.body ;

    if( [fullName , email , username , password ].some( (field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    }


const existedUser = await User.findOne({
    $or : [{username}, {email}]
})

if(existedUser) {
    throw new ApiError(409,"User with this username and email already exists!");
}

const user = await User.create({
    fullName,
    username,
    email,
    password,
});

const createdUser = await User.findById(user._id).select("-password -refreshToken")

if(!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
} 

try {
    const welcomeBot = getOrCreateWelcomeBot();

    const welcomeChat = await Chat.create({
        participants : [ createdUser._id , welcomeBot._id ],
        isAutomatedBotChat : true,
        messages : [
            {
                sender : welcomeBot._id,
                content : `Welcome to Dev.to clone , ${createdUser.fullName}! , We're excited to have you here. Feel free to explore articles and post your thoughts! `
            }
        ]
    })

const io = req.app.get("io");
if(io) {
    io.emit(`Chat:${createdUser._id}`, {
        event : "WELCOME_CHAT_CREATED",
        chat : welcomeChat
    })
}

} catch (botError) {
    console.log("Failed to create Automated Bot Chat : ", botError);
}

return res 
.status(201)
.json(new ApiResponse(200, createdUser, "User registered successfully"))

})

export { registerUser}