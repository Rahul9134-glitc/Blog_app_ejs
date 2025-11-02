import mongoose from "mongoose";
import Review from "./review.js";
const postSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true,
        trim : true
    },
     
    content : {
        type:String,
        required : true
    },
    snippet : {
        type : String,
        required : true
    },
    coverImage: { 
        type: String,
        default: '/uploads/default-cover.png'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',                         
        required: true
    },
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Review'
        }
    ],
    createdAt : {
        type : Date,
        default : Date.now()
    }
})

postSchema.pre('findOneAndDelete', async function(next) {
    const docToUpdate = this;
    if (docToUpdate.reviews.length) {

        await Review.deleteMany({
            _id: { $in: docToUpdate.reviews }
        });
        console.log(`Cleaned up ${docToUpdate.reviews.length} reviews for post ${docToUpdate._id}`);
    }
    next();
});


const Post = mongoose.model("Post" , postSchema);
export default Post;
