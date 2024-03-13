import express from 'express';
const router = express.Router();
import catchAsync from '../utils/catchAsync.js'; 
import multer from 'multer';
import  { isLoggedIn, isAdmin, validateBlog, isCommentAuthor} from '../middleware.js';
import * as blogs from '../controllers/blogs.js';


const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 1024 * 1024 * 4, // Limit file size to 4MB
    },
});

router.route('/')
    .get(catchAsync(blogs.index))
    .post(upload.single('image'), isAdmin, validateBlog, catchAsync(blogs.createBlog));

router.get('/new', isAdmin, catchAsync(blogs.renderNewForm));

router.route('/:id')
    .get(catchAsync(blogs.showBlog))
    .put(upload.single('image'), isAdmin, validateBlog, catchAsync(blogs.updateBlog))
    .delete(isAdmin, catchAsync(blogs.deleteBlog));

router.get('/:id/edit', isAdmin, catchAsync(blogs.renderEditForm));

router.get('/:id/comment/new', isLoggedIn, catchAsync(blogs.renderNewCommentForm));

router.post('/:id/comment', isLoggedIn, catchAsync(blogs.createComment))
    
router.route('/:id/comment/:commentId')
    .put( isLoggedIn,isCommentAuthor, catchAsync(blogs.updateComment))
    .delete(isLoggedIn, isCommentAuthor, catchAsync(blogs.deleteComment));

router.get('/:id/comment/:commentId/edit', isLoggedIn, isCommentAuthor, catchAsync(blogs.renderCommentEditForm));

export default router;
