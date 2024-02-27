import User from '../models/user.js';

export const renderRegister = async (req, res) => {
    res.render('users/register');
}

export const register = async (req, res) => {
    try{
        const { email, username, password } = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        console.log(registeredUser);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to the blog!');
            res.redirect('/blog');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('/register');
    }
}

export const renderLogin = async (req, res) => {
    res.render('users/login');
}

export const login = async(req, res) => {
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/blog';
    delete res.locals.returnTo;
    res.redirect(redirectUrl);
}

export const logout = async(req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/blog');
    });
}