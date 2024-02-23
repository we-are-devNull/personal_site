import express from 'express';
const router = express.Router();
import catchAsync from '../utils/catchAsync.js'; 
import ExpressError from '../utils/ExpressError.js'; 
import Blog from '../models/blog.js';
import multer from 'multer';
import { blogSchema } from '../schemas/schemas.js';
import { fileTypeFromBuffer } from 'file-type';


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 4, // Limit file size to 4MB
    },
});

const validateBlog = (req, res, next) => {
    const { error } = blogSchema.validate(req.body);
    if (error) {    
        throw new ExpressError(error.details.map(e => e.message).join(', '), 400);
    } else {
        if (req.file && req.file.buffer) {
            validateImage(req.file.buffer);
        }
        next();
    }
}

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


router.get('/', catchAsync(async (req, res) => {
    const blogPosts = await Blog.find({});
    res.render('blogs/index', { blogPosts });

}));

router.get('/new', (req, res) => {
    res.render('blogs/new');
});

router.post('/',upload.single('image'), validateBlog, catchAsync(async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const blogPost = new Blog({
        title: req.body.title,
        body: req.body.body,
        image: req.file.buffer, 
    });
    
    await blogPost.save();
    req.flash('success', 'Successfully made a new blog post!');
    res.redirect(`/blog/${blogPost._id}`);
}));
    
    
   

router.get('/:id', catchAsync(async (req, res) => {
        const blogPost = await Blog.findById(req.params.id);
        if (!blogPost) {
            req.flash('error', 'Cannot find that blog post!');
            return res.redirect('/blog');
        }
        res.render('blogs/blog', { blogPost });
        console.error('Error in GET /blog/:id:', error);
        res.status(500).send('Internal Server Error');
}));

router.put('/:id',upload.single('image'), validateBlog, catchAsync(async (req, res) => {
    const { id } = req.params;
    const blogPost = await Blog.findById(id);

    if (req.body.title) {
        blogPost.title = req.body.title;
    }
    if (req.body.body) {
        blogPost.body = req.body.body;
    }

    if (req.file && req.file.buffer) {
        blogPost.image = req.file.buffer;
    }

    await blogPost.save();
    req.flash('success', 'Successfully updated the blog post!');
    res.redirect(`/blog/${blogPost._id}`);

}));

router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted the blog post!');
    res.redirect('/blog');
}));

router.get('/:id/edit', catchAsync(async (req, res) => {
    const blogPost = await Blog.findById(req.params.id);
    if (!blogPost) {
        req.flash('error', 'Cannot find that blog post!');
        return res.redirect('/blog');
    }
    res.render('blogs/edit', { blogPost });
}));

export default router;