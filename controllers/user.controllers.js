import Post from "../models/post.js";
import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        
        // 1. यूज़र डेटा फ़ेच करें
        const user = await User.findById(userId).select('-password'); // पासवर्ड छुपाएँ
        if (!user) {
            return res.status(404).render('404', { title: 'User Not Found' });
        }
        
        // 2. उस यूज़र की सभी पोस्ट फ़ेच करें (Author ID से)
        const posts = await Post.find({ author: userId })
                                .sort({ createdAt: -1 })
                                .populate('author', 'username');

        res.render('profile', {
            title: `${user.username}'s Profile`,
            profileUser: user, // यह वह यूज़र है जिसकी प्रोफ़ाइल हम देख रहे हैं
            userPosts: posts   // उस यूज़र की पोस्ट्स
        });

    } catch (err) {
        console.error("Error fetching user profile:", err);
        res.status(500).send('Error loading profile.');
    }
};

export const getEditProfilePage = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/');
        }
        res.render('edit_profile', {
            title: 'Edit Your Profile',
            user: user
        });
    } catch (err) {
        res.status(500).send('Error loading edit page.');
    }
};

export const updateProfile = async (req, res) => {
    const userId = req.session.userId;
    const { username, bio, oldProfileImage } = req.body;
    let profileImagePath = oldProfileImage;

    try {
        // 1. Image Upload Logic
        if (req.file) {
            const localFilePath = req.file.path;

            // अगर पुरानी इमेज Cloudinary पर है और नई इमेज अपलोड हो रही है, तो पुरानी को डिलीट करें
            if (oldProfileImage && oldProfileImage.includes('cloudinary.com') && !oldProfileImage.includes('default_profile_image')) {
                // यहाँ Cloudinary से पुरानी इमेज डिलीट करने का लॉजिक डालें (जैसा कि postController में किया था)
                // Cloudinary deletion logic...
            }

            const result = await cloudinary.uploader.upload(localFilePath, { folder: "blog_profiles" });
            profileImagePath = result.secure_url;
            
            fs.unlink(localFilePath, (err) => {
                if (err) console.error("Error deleting local file:", err);
            });
        }
        
        // 2. डेटाबेस अपडेट करें
        const updatedUser = await User.findByIdAndUpdate(userId, 
            { username, bio, profileImage: profileImagePath }, 
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            req.flash('error', 'User not found during update.');
            return res.redirect('/auth/login');
        }

        req.flash('success', 'Profile updated successfully!');
        res.redirect(`/users/${userId}`);

    } catch (err) {
        if (req.file) {
            fs.unlink(req.file.path, (e) => {});
        }
        // हैंडल डुप्लीकेट यूज़रनेम/ईमेल एरर
        if (err.code === 11000) {
            req.flash('error', 'Username or Email is already taken.');
        } else {
            req.flash('error', 'Error updating profile.');
        }
        res.redirect(`/users/${userId}/edit`);
    }
};