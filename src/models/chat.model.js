import mongoose , {Schema}  from "mongoose";

const messageSchema = new Schema(
    {
        sender : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true 
        },
        content : {
            type : String ,
            required : true,
            trim : true 
        },
    },
    {timestamps : true}
);

const chatSchema = new Schema(
    {
        participants : [
            {
            type : Schema.Types.ObjectId,
            ref : "User"
            }
        ],

        messages : [messageSchema],
        isAutomatedBotChat : {
            type : Boolean ,
            default : false 
        },
    },
    {timestamps : true }
);


export const Chat = mongoose.model("Chat",  chatSchema)