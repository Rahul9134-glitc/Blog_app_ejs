import express from "express";
import dotenv from "dotenv"
import mongoConnect from "./db/mongoConnect.js";
import PostRouter from "./routes/post.routes.js"
import methodOverride from "method-override";
import session from "express-session";
import AuthRouter from "./routes/auth.routes.js";
import MongoStore from "connect-mongo";
import flash from "connect-flash";
import User from "./models/user.js";
import ReviewRouter from "./routes/review.routes.js";
import UserRouter from "./routes/user.routes.js"
const app = express();
const port = process.env.PORT || 8080


dotenv.config();
mongoConnect();

const isProduction = process.env.NODE_ENV === 'production';

app.use(methodOverride("_method"));
app.set ("view engine" , "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); 
app.use(express.json());

app.enable('trust proxy');

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI, 
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'interval',
        autoRemoveInterval: 10
    }),
    cookie: { 
        secure: isProduction, 
        sameSite: isProduction ? 'none' : 'lax',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.use(flash());

app.use(async (req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    if (req.session.userId) {
        res.locals.currentUser = await User.findById(req.session.userId).select('username');
        res.locals.isLoggedIn = true;
    } else {
        res.locals.currentUser = null;
        res.locals.isLoggedIn = false;
    }
    next();
});


app.use("/" , PostRouter);
app.use("/auth" , AuthRouter);
app.use("/posts/:id/reviews" , ReviewRouter);
app.use("/users" , UserRouter);


app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    console.error('--- ERROR CAUGHT ---');
    console.error(`Status: ${err.status || 500}`);
    console.error(`Message: ${err.message}`);
    console.error(err.stack);
    console.error('--------------------');
    
    res.status(err.status || 500);

    res.render('error', {
        title: `Error ${err.status || 500}`,
        error: {
            status: err.status || 500,
            message: err.message
        }
    });
});

app.listen(port , function(){
    console.log("App is listening on ", port);
})

