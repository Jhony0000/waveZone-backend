import { Router } from "express";
import {upload} from '../../middlewares/multer.middlewere.js'
import { businessVeryfyJwt } from "../../middlewares/business.auth.midelwere.js";
import {registerUser,logOutUser,getCurrentUser,loginUser} from '../../controllers/business.controllers/user.coltrollers.js';

const userBusinessRouter = Router(); 

userBusinessRouter.route('/register').post(
    upload.fields([
        {
            name : 'avatar',
            maxCount : 1
        },
       
    ]),
    registerUser 
 
)

userBusinessRouter.route('/login').post(loginUser)

// SECURE ROUT
userBusinessRouter.route('/logout').post(businessVeryfyJwt,logOutUser)
userBusinessRouter.route('/current-user').get(businessVeryfyJwt,getCurrentUser);



export default userBusinessRouter;

