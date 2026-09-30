import mongoose , {Schema} from 'mongoose';

const articleSchema = new Schema(
    {
        title : {
            type : String,
            trim : true,
            required : true,
        },
        slug : {
            type : String,
            required : true,
            trim : true,
            index : true,
            unique : true,
            lowerCase : true,
        },
        content : {
            type : String,
            required : true
        },
        coverImage : {
            type : String,
            default : ""
        },
        tags : [
            {
                type : String ,
                trim : true,
                lowerCase : true
            }
        ],
        author : {
            type : Schema.Types.ObjectId,
            ref : "User",
            required : true
        },
        isPublished : {
            type : Boolean,
            default : true
        },
        readingTime : {
            type : Number ,
            default : 1
        },
    },
    { timestamps : true }
);


articleSchema.pre("validate", function(){
    if(this.title && !this.slug ){
        this.slug == this.title
        .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .replace(/\s+/g, "-") + `-${Date.now()}`;
    }

    if(this.content){
        const words = this.content.trim().split(/\s+/).length;
        this.readingTime = Math.ceil(words / 200) || 1;
    }
});

export const Article = mongoose.model("Article", articleSchema);