import mongoose, {Schema} from "mongoose";

const likeSchema = new Schema(
    {
        article : {
            type : Schema.Types.ObjectId,
            ref : "Article",
            required : true,
            index : true
        },
        likedBy : {
            type : Schema.Types.ObjectId,
            ref : "User",
            
        }
    },
    { timestamps : true }
);

likeSchema.index({ article : 1, likedBy : 1}, {unique : true});

export const Like = mongoose.model("Like", likeSchema);