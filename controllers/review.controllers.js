import Post from "../models/post.js";
import Review from "../models/review.js";


export const createReview = async (req, res) => {
    const postId = req.params.id; 
    const authorId = req.session.userId; 
    const { content } = req.body; 

    try {
        const post = await Post.findById(postId);
        if (!post) {
            req.flash('error', 'Post not found.');
            return res.redirect('/');
        }
        
        const newReview = new Review({
            content,
            author: authorId,
            post: postId 
        });

        await newReview.save();
        post.reviews.push(newReview._id);
        await post.save();

        req.flash('success', 'Review added successfully!');
        res.redirect(`/posts/${postId}`);

    } catch (err) {
        req.flash('error', 'Could not post review.');
        res.redirect(`/posts/${postId}`);
    }
};

export const deleteReview = async (req, res) => {
    const postId = req.params.id; 
    const reviewId = req.params.reviewId; 



    try {
        await Post.findByIdAndUpdate(postId, { $pull: { reviews: reviewId } }, { new: true }); 
        
        await Review.findByIdAndDelete(reviewId);

        req.flash('success', 'Review deleted successfully!');
        res.redirect(`/posts/${postId}`); 

    } catch (err) {
        console.error("Review Deletion FAILED:", err); 
        req.flash('error', 'Could not delete review due to server error.');
        res.redirect(`/posts/${postId}`); 
    }
};