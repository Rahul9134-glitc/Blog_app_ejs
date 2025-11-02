import express from "express"
const router = express.Router();
import { getAllpost , getComposePage , getSinglePost , createPost , searchPosts , deletePost , getEditPage , updatePost } from "../controllers/post.controllers.js";
import { uploadPostImage } from "../middleware/multer.js";
import { isLoggedIn , isPostAuthor } from "../middleware/auth.js";


router.get("/" , getAllpost);
router.post("/compose" , isLoggedIn, uploadPostImage, createPost);
router.get("/compose" , isLoggedIn, getComposePage);
router.get("/search" ,  searchPosts);
router.get("/posts/:id" ,  getSinglePost);
router.delete("/posts/:id" , isLoggedIn, isPostAuthor, deletePost);
router.get("/posts/:id/edit" , isLoggedIn, isPostAuthor, getEditPage);
router.put("/posts/:id" , isLoggedIn, isPostAuthor, uploadPostImage, updatePost);


export default router;