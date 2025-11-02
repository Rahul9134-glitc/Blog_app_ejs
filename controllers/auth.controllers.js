import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const getRegisterPage = (req, res) => {
    res.render("register", { title: "Register" });
};

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).render("register", {
                title: "Register",
                error: "User with this email already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });
        await newUser.save();

        req.session.userId = newUser._id;

        req.flash('success', 'Registration successful! Welcome to the blog.');
        res.redirect("/");

    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).render("register", {
            title: "Register",
            error: "Internal server error."
        });
    }
};

export const getLoginPage = (req, res) => {
    res.render('login', { title: 'Login', error: null }); 
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(400).render('login', { 
                title: 'Login', 
                error: 'Invalid Credentials (Email not found).' 
            });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(400).render('login', { 
                title: 'Login', 
                error: 'Invalid Credentials (Password incorrect).' 
            });
        }
        
        req.session.userId = user._id;
        
        console.log(`User logged in: ${user.username}`);
        req.flash('success', 'Login successful! Welcome back to the blog.');
        res.redirect('/'); 

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).render('login', { 
            title: 'Login', 
            error: 'Server error during login.' 
        });
    }
};

export const logoutUser = (req, res) => {
    req.flash('success', 'You have been successfully logged out!');
    req.session.destroy(err => {
        if (err) {
            console.error("Logout Error:", err);
            return res.redirect('/');
        }
        res.redirect('/auth/login'); 
    });
};