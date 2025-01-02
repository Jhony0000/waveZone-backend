import { Router } from 'express'
import {veryfyJwt} from '../middlewares/auth.middelwers.js'
import { deleteNotification, getNotification, nonreadNotification, readNotification } from '../controllers/notification.controllers.js'




const notificationRouter = Router()


notificationRouter.route('/get-notification').post(veryfyJwt,getNotification)
notificationRouter.route('/delete-notification').post(veryfyJwt,deleteNotification);
notificationRouter.route('/readNotification').post(veryfyJwt,readNotification);
notificationRouter.route('/nonreadNotification').post(veryfyJwt,nonreadNotification);



export default notificationRouter