import { Router } from "express";
import {upload} from '../middlewares/multer.middlewere.js'
import {registerUser,
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
        } from '../controllers/user.controllers.js'
       import {veryfyJwt} from '../middlewares/auth.middelwers.js'

const userRouter = Router(); 

userRouter.route('/register').post(registerUser  )

userRouter.route('/login').post(loginUser)

// SECURE ROUT
userRouter.route('/logout').post(veryfyJwt,logOutUser)
userRouter.route('/current-user').get(veryfyJwt,getCurrentUser);
userRouter.route('/get-user-profail').post(veryfyJwt,getUserProfail);
userRouter.route('/changed-Password').post(veryfyJwt,updatePassword)
userRouter.route('/refresh-access-token').post(veryfyJwt,refreshAccessToke)


// userRouter.route('/user-follow').post(veryfyJwt,userFollow)
userRouter.route('/user-search').post(veryfyJwt,search)


userRouter.route('/avatar').post(veryfyJwt,upload.single("avatar"),updateAvatar)
userRouter.route('/coverImg').post(veryfyJwt,upload.single("coverImg"),updateCoverImg)
 

userRouter.route('/update-account').post(veryfyJwt,accountDetalsUpdate)
userRouter.route('/delete-account').get(veryfyJwt,deleteAccount)


export default userRouter;

