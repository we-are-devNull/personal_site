import express from 'express';
const app = express();
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import engine from 'ejs-mate';
import Blog from './models/blog.js';
import methodOverride from 'method-override';
import multer from 'multer';
const storage = multer.memoryStorage();
import { fileTypeFromBuffer } from 'file-type';
import catchAsync from './utils/catchAsync.js'; 
import ExpressError from './utils/ExpressError.js'; 
import { stat } from 'fs';
import e from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 4, // Limit file size to 4MB
    },
});


mongoose.connect('mongodb://localhost:27017/blogDB');

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
app.use(express.static('public'));

const validateImage = async (buff, next) => {
    try {
        const type = await fileTypeFromBuffer(buff);
        if (!type || type.mime !== 'image/png') {
            throw new ExpressError('Only PNG files are allowed', 400);
        }
    } catch (error) {
        next(error); // Pass any errors to the next middleware
    }
}

app.get('/', (req, res) => {
  res.render('home.ejs');
}); 

app.get('/blog', catchAsync(async (req, res) => {
    const blogPosts = await Blog.find({});
    res.render('blogs/index', { blogPosts });

}));

app.get('/blog/new', (req, res) => {
    res.render('blogs/new');
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

app.post('/blog',upload.single('image'), catchAsync(async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    validateImage(req.file.buffer);

    const blogPost = new Blog({
        title: req.body.title,
        body: req.body.body,
        image: req.file.buffer, 
    });
    
    await blogPost.save();
    res.redirect(`/blog/${blogPost._id}`);
}));
    
    
   

app.get('/blog/:id', catchAsync(async (req, res) => {
        const blogPost = await Blog.findById(req.params.id);
        if (!blogPost) {
            return res.status(404).send('Blog post not found');
        }
        res.render('blogs/blog', { blogPost });
        console.error('Error in GET /blog/:id:', error);
        res.status(500).send('Internal Server Error');
}));

app.put('/blog/:id',upload.single('image'), catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogPost = await Blog.findById(id);

    if (req.body.title) {
        blogPost.title = req.body.title;
    }
    if (req.body.body) {
        blogPost.body = req.body.body;
    }

    if (req.file && req.file.buffer) {
        validateImage(req.file.buffer);
        blogPost.image = req.file.buffer;
    }

    await blogPost.save();
    res.redirect(`/blog/${blogPost._id}`);

}));

app.delete('/blog/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    res.redirect('/blog');
}));

app.get('/blog/:id/edit', catchAsync(async (req, res) => {
    const blogPost = await Blog.findById(req.params.id);
    if (!blogPost) {
        return next(new ExpressError('Blog Post Not Found', 404));
    }
    res.render('blogs/edit', { blogPost });
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

app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
