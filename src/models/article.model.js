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
      views: {
      type: Number,
      default: 0,
    },
    },
    { timestamps : true }
);


articleSchema.pre("save", async function () {
  if (this.isModified("title") || !this.slug) {
    const slugBase = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    
    this.slug = `${slugBase}-${Date.now()}`;
  }

  if (this.isModified("content")) {
    const words = this.content.trim().split(/\s+/).length;
    this.readingTime = Math.ceil(words / 200) || 1;
  }
});

export const Article = mongoose.model("Article", articleSchema);