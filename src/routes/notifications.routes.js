import { Router } from 'express'
import {verifyJwt } from '../middlewares/auth.middelwers.js'
import { deleteNotification, getNotification, nonreadNotification, readNotification } from '../controllers/notification.controllers.js'




const notificationRouter = Router()


notificationRouter.route('/get-notification').post(verifyJwt ,getNotification)
notificationRouter.route('/delete-notification').post(verifyJwt ,deleteNotification);
notificationRouter.route('/readNotification').post(verifyJwt ,readNotification);
notificationRouter.route('/nonreadNotification').post(verifyJwt ,nonreadNotification);



export default notificationRouter
