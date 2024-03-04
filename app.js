import express from 'express';
const app = express();
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import engine from 'ejs-mate';
import Blog from './models/blog.js';
import methodOverride from 'method-override';
import catchAsync from './utils/catchAsync.js'; 
import ExpressError from './utils/ExpressError.js'; 
import blogsRoutes from './routes/blogs.js';
import userRoutes from './routes/users.js';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import User from './models/user.js';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import MongoStore from 'connect-mongo';
import dotenv from 'dotenv';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbURL = process.env.DB_URL || 'mongodb://mongodb:27017/blogDB';
const secret = process.env.SECRET || 'thisshouldbeabettersecret';

mongoose.connect(dbURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Connected to MongoDB');
});

app.engine('ejs', engine);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());
app.use(mongoSanitize());
app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com/css?family=Roboto", "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css", "'unsafe-inline'"],
        objectSrc: ["'self'"],
      },
      reportOnly: false,
    })
  );
    
const store = MongoStore.create({
    mongoUrl: dbURL,
    secret,
    touchAfter: 24 * 60 * 60
});

store.on("error", function(e) {
    console.log("Session Store Error", e);
});

const sessionConfig = {
    store,
    name: 'mjm_sessionID',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }

};
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.use('/blog', blogsRoutes);
app.use('/', userRoutes);

app.get('/', (req, res) => {
  res.render('home.ejs');
}); 

app.get('/resume', (req, res) => {
    res.render('resume.ejs');
  }); 

app.get('/images/:blogId', catchAsync(async (req, res) => {
    const blogId = req.params.blogId;
    const blogPost = await Blog.findById(blogId);

    if (!blogPost || !blogPost.image) {
        return res.status(404).send('Image not found');
    }

    res.contentType('image/png');
    res.send(blogPost.image);
}));

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if (!err.message) err.message = 'Oh no, something went wrong!';
    if (!res.headersSent) {
        res.status(statusCode).render('error', { err });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });


