import { Router } from "express";
// import { veryfyJwt } from "../middlewares/auth.middelwers.js";
// import {searchUserForChat,selectedUserForChat,sendMessage,getAllMessageProfail, getAllMessages} from '../controllers/messsage.controllers.js'

const messageRouter = Router();

// messageRouter.route('/search-user').post(veryfyJwt,searchUserForChat);
// messageRouter.route('/select-user-for-chat').post(veryfyJwt,selectedUserForChat);
// // messageRouter.route('/send-message').post(veryfyJwt,sendMessage);
// messageRouter.route('/get-all-user-message-profail').post(veryfyJwt,getAllMessageProfail);
// messageRouter.route('/get-all-message').post(veryfyJwt,getAllMessages);

export default messageRouter;
