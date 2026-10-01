import mongoose , {Schema} from 'mongoose';

const commentSchema = new Schema(
    {
        content : {
            type : String ,
            required : true,
            trim : true
        },
        article : {
            type : Schema.Types.ObjectId,
            ref : "Article",
            required : true,
            index : true
        },
        author : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true,
        },        
    },
    {timestamps : true}
)

export const Comment = mongoose.model("Comment", commentSchema);