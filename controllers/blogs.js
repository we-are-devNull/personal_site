import Blog from '../models/blog.js';

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
    res.render('blogs/blog', { blogPost, loggedIn:req.isAuthenticated() });
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