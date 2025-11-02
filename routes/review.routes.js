import express from "express";
const router = express.Router({ mergeParams: true });

import { createReview, deleteReview } from "../controllers/review.controllers.js";

import { isLoggedIn , isReviewAuthor } from "../middleware/auth.js";


router.post("/" , isLoggedIn , createReview);
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, deleteReview);

export default router;