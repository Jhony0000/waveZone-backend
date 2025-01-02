import { Router } from "express";
import { upload } from '../middlewares/multer.middlewere.js';
import {
    registerUser,
    loginUser,
    logOutUser,
    getCurrentUser,
    updateAvatar,
    updateCoverImg,
    updatePassword,
    accountDetailsUpdate, // Fixed typo
    refreshAccessToken,   // Fixed typo
    deleteAccount,
    getUserProfile,       // Fixed typo
    search,
} from '../controllers/user.controllers.js';
import { verifyJwt } from '../middlewares/auth.middelwers.js'; // Fixed typo

const userRouter = Router();

userRouter.route('/register').post(
    upload.fields([
        { name: 'avatar', maxCount: 1 },
        { name: 'coverImg', maxCount: 1 }
    ]),
    registerUser
);

userRouter.route('/login').post(loginUser);

// SECURE ROUTES
userRouter.route('/logout').post(verifyJwt, logOutUser);
userRouter.route('/current-user').get(verifyJwt, getCurrentUser);
userRouter.route('/get-user-profile').post(verifyJwt, getUserProfile); // Fixed typo
userRouter.route('/change-password').post(verifyJwt, updatePassword); // Fixed typo
userRouter.route('/refresh-access-token').post(verifyJwt, refreshAccessToken); // Fixed typo

userRouter.route('/user-search').post(verifyJwt, search);

userRouter.route('/avatar').post(verifyJwt, upload.single("avatar"), updateAvatar);
userRouter.route('/coverImg').post(verifyJwt, upload.single("coverImg"), updateCoverImg);

userRouter.route('/update-account').post(verifyJwt, accountDetailsUpdate); // Fixed typo
userRouter.route('/delete-account').get(verifyJwt, deleteAccount);

export default userRouter;
