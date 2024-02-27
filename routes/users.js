import User from '../models/user.js';
import express from 'express';
const router = express.Router();
import catchAsync from '../utils/catchAsync.js';
import passport from 'passport';
import { storeReturnTo } from '../middleware.js';
import * as users from '../controllers/users.js';

router.route('/register')
    .get(catchAsync(users.renderRegister))
    .post(catchAsync(users.register));

router.route('/login')
    .get(catchAsync(users.renderLogin))
    .post(
        storeReturnTo, 
        passport.authenticate('local', { failureFlash: true, failureRedirect: '/login'}), 
        catchAsync(users.login));

router.get('/logout', catchAsync(users.logout));

export default router;