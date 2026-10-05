import mongoose, {Schema} from "mongoose";

const bookmarkSchema = new Schema(
    {
        article : {
            type : Schema.Types.ObjectId,
            ref : "Article",
            required : true,
            index : true,
        },
        user : {
           type : Schema.Types.ObjectId,
            ref : "User",
            required : true,
            index : true,
        }
    },
    { timestamps : true }
);

bookmarkSchema.index({ article : 1 , user : 1 }, {unique : true});

export const Bookmark = mongoose.model("Bookmark", bookmarkSchema);