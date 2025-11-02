import Post from "../models/post.js";
import { marked } from "marked";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";

const getAllpost = async(req ,res)=>{
    try{
        const posts = await Post.find().sort({createdAt : -1}).populate('author' , 'username');
        res.render("index",{
            title : "Home page",
            posts : posts
        })
    }catch(err){
        res.status(500).send("Error fecthing data");
    }
}


const getComposePage = async(req ,res) => {
   res.render("compose" , {title : "Create new post"});
}

const createPost = async (req, res) => {
    const authorId = req.session.userId; 
    const { title, content, snippet } = req.body;
    let coverImagePath = req.body.defaultCover;

    try {
        if (req.file) {
            const localFilePath = req.file.path; 
            const result = await cloudinary.uploader.upload(localFilePath, {
                folder: "blog_covers"
            });
            coverImagePath = result.secure_url;
            fs.unlink(localFilePath, (err) => {
                if (err) console.error("Error deleting local file:", err);
            });
        }

        const newPost = new Post({
            title,
            content,
            snippet,
            coverImage: coverImagePath,
            author: authorId 
        });

        await newPost.save();
        req.flash('success', 'Post created successfully!');
        res.redirect(`/posts/${newPost._id}`);
    } catch (err) {
        if (req.file) {
            fs.unlink(req.file.path, (e) => {
                if (e) console.error("Error cleaning up file after failure:", e);
            });
        }
        res.status(500).send('Error saving post or uploading image.');
    }
};

const getSinglePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username').populate({
            path : "reviews",
            populate : {
                path : "author",
                select : "username"
            }
        });
        
        if (!post) {
            return res.status(404).render('404', { title: 'Post Not Found' });
        }
        
        const htmlContent = marked(post.content); 

        res.render('post', { 
            title: post.title, 
            post: post,
            htmlContent: htmlContent
        });
    } catch (err) {
        console.error("CRASH in getSinglePost:", err); 
        res.status(500).send('Error fetching post.');
    }
};

const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send('Post not found for deletion.');
        }
        if (post.coverImage && post.coverImage.includes('cloudinary.com')) {
            
            const urlParts = post.coverImage.split('/');
            const folderName = 'blog_covers'; 
            
            const publicIdWithExtension = urlParts[urlParts.length - 1];
            
            const publicId = folderName + '/' + publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
    
            await cloudinary.uploader.destroy(publicId); 
            console.log(`Cloudinary image deleted successfully: ${publicId}`);
        }

        await Post.findByIdAndDelete(postId);

        console.log(`Post ID ${postId} successfully deleted.`);
        req.flash('success', 'Post deleted successfully!');
        res.redirect('/'); 
    } catch (err) {
        console.error("Deletion Error:", err);
        res.status(500).send('Error deleting post.');
    }
};

const getEditPage = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).render('404', { title: 'Post Not Found' });
        }
        res.render('edit', { 
            title: `Edit: ${post.title}`, 
            post: post 
        });
    } catch (err) {
        res.status(500).send('Error fetching post for editing.');
    }
};

const updatePost = async (req, res) => {
    const postId = req.params.id;
    
    const { title, content, snippet, oldCoverImage } = req.body; 
    let coverImagePath = oldCoverImage;  
    try {

        if (req.file) {
            const localFilePath = req.file.path; 

             if (oldCoverImage && oldCoverImage.includes('cloudinary.com')) {
                
                
                const folderName = 'blog_covers';
                const urlParts = oldCoverImage.split('/');

                const folderIndex = urlParts.indexOf(folderName);
                if (folderIndex !== -1) {
                    const fullPublicPathWithExt = urlParts.slice(folderIndex).join('/');
            
                    const publicId = fullPublicPathWithExt.substring(0, fullPublicPathWithExt.lastIndexOf('.'));
                
                    const destroyResult = await cloudinary.uploader.destroy(publicId);
                    
                    if (destroyResult.result === 'ok') {
                        console.log(`Old Cloudinary image deleted successfully: ${publicId}`);
                    } else {
                        console.warn(`Cloudinary deletion failed for ${publicId}. Result: ${destroyResult.result}`);
                    }
                }
            }
            
            const result = await cloudinary.uploader.upload(localFilePath, {
                folder: "blog_covers"
            });
            coverImagePath = result.secure_url;
            fs.unlink(localFilePath, (err) => {
                if (err) console.error("Error deleting local file after update:", err);
            });
        }
        const updatedPost = await Post.findByIdAndUpdate(postId, 
            { title, content, snippet, coverImage: coverImagePath }, 
            { new: true } 
        );

        if (!updatedPost) {
            return res.status(404).send('Post not found for update.');
        }
        req.flash('success', 'Post updated successfully!');
        res.redirect(`/posts/${postId}`); 
        
    } catch (err) {
        if (req.file) {
             fs.unlink(req.file.path, (e) => {
                if (e) console.error("Error cleaning up file after update failure:", e);
             });
        }
        console.error("Update Error:", err);
        res.status(500).send('Error updating post.');
    }
};

export const searchPosts = async (req, res) => {
    try {
        const searchQuery = req.query.q;

        if (!searchQuery || searchQuery.trim() === '') {
            req.flash('error', 'Please enter a search term.');
            return res.redirect('/');
        }

        const searchRegex = new RegExp(searchQuery, 'i'); 

        const searchResults = await Post.find({
            $or: [
                { title: { $regex: searchRegex } },
                { snippet: { $regex: searchRegex } }
            ]
        })
        .populate('author', 'username profileImage')
        .sort({ createdAt: -1 });

        res.render('search_results', {
            title: `Search Results for "${searchQuery}"`,
            query: searchQuery,
            posts: searchResults
        });

    } catch (err) {
        console.error("Search Error:", err);
        req.flash('error', 'An error occurred during search.');
        res.redirect('/');
    }
};

export {
    createPost,
    getAllpost,
    getComposePage,
    getSinglePost,
    deletePost,
    getEditPage,
    updatePost,
}
