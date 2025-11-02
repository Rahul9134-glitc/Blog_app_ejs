import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoConnect = async() =>{
    try{
       await mongoose.connect(process.env.MONGO_URI)
       .then(()=>{
        console.log("MONGO DB is connected sucessfully ");
       })
       .catch((error)=>{
        console.log("Something went wrong when connecting MONGO");
       })
    }
    catch(err){
        console.log("Error :", err);
    }
}

export default mongoConnect;