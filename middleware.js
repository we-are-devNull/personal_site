import ExpressError from './utils/ExpressError.js';
import { blogSchema } from './schemas/schemas.js';
import { fileTypeFromBuffer } from 'file-type';
import Comment from './models/comment.js';

export const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    next();
};

export const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in!');
        return res.redirect('/login');
    }
    if (req.user.accountType !== 'admin') {
        req.flash('error', 'You must be an admin!');
        return res.redirect('/blog'); 
    }
    next();
};

export const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

export const validateImage = async (buff, next) => {
    try {
        const type = await fileTypeFromBuffer(buff);
        if (!type || type.mime !== 'image/png') {
            throw new ExpressError('Only PNG files are allowed', 400);
        }
    } catch (error) {
        next(error);
    }
}

export const validateBlog = (req, res, next) => {
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

export const isCommentAuthor = async (req, res, next) =>{
    req.commentId = req.params.commentId;
    const comment = await Comment.findById(req.params.commentId).populate('author')
    const author = comment.author._id.toString();
    const user = req.user._id.toString();
    if (user != author) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/blog/${req.params.id}`);
    }
    next();
};