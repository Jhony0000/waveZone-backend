import { Router } from "express";
import { verifyJwt  } from "../middlewares/auth.middelwers.js";
import {searchUserForChat,selectedUserForChat,sendMessage,getAllMessageProfail, getAllMessages} from '../controllers/messsage.controllers.js'

const messageRouter = Router();

messageRouter.route('/search-user').post(verifyJwt ,searchUserForChat);
messageRouter.route('/select-user-for-chat').post(verifyJwt ,selectedUserForChat);
// messageRouter.route('/send-message').post(veryfyJwt,sendMessage);
messageRouter.route('/get-all-user-message-profail').post(verifyJwt ,getAllMessageProfail);
messageRouter.route('/get-all-message').post(verifyJwt ,getAllMessages);

export default messageRouter;
