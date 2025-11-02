import Post from "../models/post.js";
import User from "../models/user.js";
import cloudinary from "../config/cloudinary.js";
import bcrypt from "bcryptjs";
import fs from "fs";

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).render('404', { title: 'User Not Found' });
        }
        
        const posts = await Post.find({ author: userId })
                                .sort({ createdAt: -1 })
                                .populate('author', 'username');

        res.render('profile', {
            title: `${user.username}'s Profile`,
            profileUser: user,
            userPosts: posts
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
        if (req.file) {
            const localFilePath = req.file.path;

            if (oldProfileImage && oldProfileImage.includes('cloudinary.com') && !oldProfileImage.includes('default_profile_image')) {
                const urlParts = oldProfileImage.split('/');
                const folderName = 'blog_profiles';
                const publicIdWithExtension = urlParts[urlParts.length - 1];
                const publicId = folderName + '/' + publicIdWithExtension.substring(0, publicIdWithExtension.lastIndexOf('.'));
                await cloudinary.uploader.destroy(publicId);
            }

            const result = await cloudinary.uploader.upload(localFilePath, { folder: "blog_profiles" });
            profileImagePath = result.secure_url;
            
            fs.unlink(localFilePath, (err) => {
                if (err) console.error("Error deleting local file:", err);
            });
        }
        
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


export const getChangePasswordPage = async (req, res) => {
    try {
        const user = await User.findById(req.session.userId).select('username');
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/');
        }
        res.render('change_password', {
            title: 'Change Password',
            user: user
        });
    } catch (err) {
        res.status(500).send('Error loading password change page.');
    }
};

export const updatePassword = async (req, res) => {
    const userId = req.session.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        req.flash('error', 'New password and confirm password do not match.');
        return res.redirect(`/users/${userId}/password`);
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect('/auth/login');
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);

        if (!isMatch) {
            req.flash('error', 'Current password is incorrect.');
            return res.redirect(`/users/${userId}/password`);
        }
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        req.flash('success', 'Your password has been changed successfully!');
        res.redirect(`/users/${userId}`);

    } catch (err) {
        console.error("Password Update Error:", err);
        req.flash('error', 'An error occurred while changing password.');
        res.redirect(`/users/${userId}/password`);
    }
};