import Post from "../models/post.js";
import Review from "../models/review.js";


export const isLoggedIn = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be logged in to do that.');
    res.redirect('/auth/login');
};

export const isPostAuthor = async (req, res, next) => {
    const { id } = req.params; // URL से Post ID निकालें
    
    try {
        // 1. Post को डेटाबेस से फ़ेच करें
        const post = await Post.findById(id);
        
        if (!post) {
            req.flash('error', 'Post not found.');
            return res.redirect('/');
        }
        
        // 2. Author ID की तुलना Session ID से करें
        // ध्यान दें: MongoDB ID (post.author) एक ऑब्जेक्ट होता है, 
        // इसलिए हमें इसे स्ट्रिंग में बदलना होगा (.toString())
        if (post.author.toString() !== req.session.userId) {
            req.flash('error', 'You do not have permission to do that! You are not the author.');
            return res.redirect(`/posts/${id}`);
        }
        
        // 3. यदि यूज़र लेखक है, तो आगे बढ़ें
        next();
        
    } catch (err) {
        console.error("isPostAuthor Error:", err);
        req.flash('error', 'Server error while checking post authority.');
        res.redirect(`/posts/${id}`);
    }
};

export const isReviewAuthor = async (req, res, next) => {
    // req.params में postId (id) और reviewId (reviewId) दोनों होंगे
    const { id: postId, reviewId } = req.params; 
    
    try {
        // 1. रिव्यू को डेटाबेस से फ़ेच करें
        const review = await Review.findById(reviewId);
        
        if (!review) {
            req.flash('error', 'Review not found.');
            return res.redirect(`/posts/${postId}`);
        }
        
        // 2. Author ID की तुलना Session ID से करें
        // अगर सेशन ID और रिव्यू के लेखक की ID मैच नहीं करती
        if (review.author.toString() !== req.session.userId) {
            req.flash('error', 'You do not have permission to delete this review.');
            return res.redirect(`/posts/${postId}`);
        }
        
        // 3. यदि यूज़र लेखक है, तो आगे बढ़ें
        next();
        
    } catch (err) {
        console.error("isReviewAuthor Error:", err);
        req.flash('error', 'Server error while checking review authority.');
        res.redirect(`/posts/${postId}`);
    }
};

