import Blog from '../models/blog.js';
import Comment from '../models/comment.js';

export const index = async (req, res) => {
    const blogPosts = (await Blog.find({}).populate('author'));
    let isAdmin = false;
    if (req.user && req.user.accountType === 'admin') {
        isAdmin = true;
    } 
    res.render('blogs/index', { blogPosts, isAdmin});
}

export const renderNewForm = async (req, res) => {
    res.render('blogs/new');
}

export const createBlog = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const blogPost = new Blog({
        title: req.body.title,
        body: req.body.body,
        image: req.file.buffer, 
        author: req.user._id
    });
    
    await blogPost.save();
    req.flash('success', 'Successfully made a new blog post!');
    res.redirect(`/blog/${blogPost._id}`);
}

export const showBlog = async (req, res) => {
    const blogPost = await Blog.findById(req.params.id).populate('author');
    if (!blogPost) {
        req.flash('error', 'Cannot find that blog post!');
        return res.redirect('/blog');
    }
    const comments = await Comment.find({ blogPost: req.params.id }).populate('author');
    res.render('blogs/blog', { blogPost, loggedIn:req.isAuthenticated(), comments });
}

export const updateBlog = async (req, res) => {
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

}

export const deleteBlog = async (req, res) => {
    const { id } = req.params;
    await Blog.findByIdAndDelete(id);
    await Comment.deleteMany({ blogPost: id });
    req.flash('success', 'Successfully deleted the blog post!');
    res.redirect('/blog');
}

export const renderEditForm = async (req, res) => {
    const blogPost = await Blog.findById(req.params.id);
    if (!blogPost) {
        req.flash('error', 'Cannot find that blog post!');
        return res.redirect('/blog');
    }
    res.render('blogs/edit', { blogPost });
}

export const renderNewCommentForm = async (req, res) => {
    const blogID = req.params.id;
    res.render('comments/new', { blogID });
}

export const createComment = async (req, res, next) => {

    const comment = new Comment({
        body: req.body.body,
        author: req.user._id,
        blogPost: req.params.id
    });
    
    await comment.save();
    req.flash('success', 'Successfully made a new comment!');
    res.redirect(`/blog/${req.params.id}`);
}

export const updateComment = async (req, res) => {
    const { id, commentId } = req.params;
    const comment = await Comment.findById(commentId);
    if (req.body.body) {
        comment.body = req.body.body;
    }
    await comment.save();
    req.flash('success', 'Successfully updated the comment!');
    res.redirect(`/blog/${id}`);

}

export const renderCommentEditForm = async (req, res) => {
    const comment = await Comment.findById(req.params.commentId).populate('author');
    if (!comment) {
        req.flash('error', 'Cannot find that comment!');
        return res.redirect('/blog/${req.params.id}');
    }
    res.render('comments/edit', { comment, blogID: req.params.id });
}

export const deleteComment = async (req, res) => {
    const { id, commentId } = req.params;
    await Comment.findByIdAndDelete(commentId);
    req.flash('success', 'Successfully deleted the comment!');
    res.redirect(`/blog/${id}`);
}