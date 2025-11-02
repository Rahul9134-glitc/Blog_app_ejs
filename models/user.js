import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username : {
        type : String,
        required : true,
        unique : true,
    },
    email : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    password : {
        type : String,
        required : true,
        trim : true
    },
    profileImage: {
        type: String,
        default: 'https://res.cloudinary.com/dxrnkiwr9/image/upload/v1761376739/0684456b-aa2b-4631-86f7-93ceaf33303c_hdwaui.jpg' 
    },
    bio: {
        type: String,
        default: 'Hello! I am a new member of this blog community.',
        maxlength: 250
    },
    createdAt : {
        type : Date,
        default : Date.now()
    }
})

const User = mongoose.model("User", userSchema);
export default User;