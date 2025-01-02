import { Router } from "express";
import {upload} from '../middlewares/multer.middlewere.js'
import {
    registerUser,
    loginUser,
    logOutUser,
    getCurrentUser,
    updateAvatar,
    updateCoverImg,
    updatePassword,
    accountDetalsUpdate,
    refreshAccessToke,
    deleteAccount,
    getUserProfail,
    search,
} from '../controllers/user.controllers.js';
import {veryfyJwt} from '../middlewares/auth.middelwers.js'

const userRouter = Router();

userRouter.post('/register',function(req, res){
    registerUser
});


userRouter.post('/login', function(req,res){loginUser});

// SECURE ROUT
userRouter.post('/logout', function(req,res){veryfyJwt, logOutUser} );
userRouter.get('/current-user', function(req,res){veryfyJwt, getCurrentUser});
userRouter.post('/get-user-profail',function(req,res){veryfyJwt, getUserProfail});
userRouter.post('/changed-Password', function(req,res){veryfyJwt, updatePassword});
userRouter.post('/refresh-access-token',function(req,res){veryfyJwt, refreshAccessToke});


// userRouter.route('/user-follow').post(veryfyJwt,userFollow)
userRouter.post('/user-search',function(req,res){veryfyJwt, search});


userRouter.post('/avatar',function(req,res){veryfyJwt, upload.single("avatar"),updateAvatar});
userRouter.post('/coverImg',function(req,res) {veryfyJwt, upload.single("coverImg"),updateCoverImg});
 

userRouter.post('/update-account',function(req,res){veryfyJwt, accountDetalsUpdate});
userRouter.get('/delete-account',function(req,res){veryfyJwt, deleteAccount});


export default userRouter;

