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
userRouter.post('/logout',  veryfyJwt , function(req,res){logOutUser} );
userRouter.get('/current-user', veryfyJwt, function(req,res){ getCurrentUser});
userRouter.post('/get-user-profail',veryfyJwt,function(req,res){ getUserProfail});
userRouter.post('/changed-Password',veryfyJwt, function(req,res){ updatePassword});
userRouter.post('/refresh-access-token',veryfyJwt,function(req,res){ refreshAccessToke});


// userRouter.route('/user-follow').post(veryfyJwt,userFollow)
userRouter.post('/user-search',veryfyJwt,function(req,res){ search});


userRouter.post('/avatar',veryfyJwt,function(req,res){ upload.single("avatar"),updateAvatar});
userRouter.post('/coverImg',veryfyJwt,function(req,res) {upload.single("coverImg"),updateCoverImg});
 

userRouter.post('/update-account',veryfyJwt,function(req,res){ accountDetalsUpdate});
userRouter.get('/delete-account',veryfyJwt,function(req,res){ deleteAccount});


export default userRouter;

