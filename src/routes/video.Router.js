import { Router } from 'express'
import {verifyJwt } from '../middlewares/auth.middelwers.js'
import app from '../app.js'
import { upload } from '../middlewares/multer.middlewere.js'
import { deleteVideo, getUserVideo, updateVideo, uplodVideo,getMixedFeed, updateView,  getVideoComments, searchUserVideo, getVideo, deleteUserAllVideo } from '../controllers/video.controllers.js'



const videoRouter = Router()

videoRouter.route('/uplod-video').post(verifyJwt ,upload.single('videoFile'),uplodVideo)
videoRouter.route('/update-video').post(verifyJwt ,updateVideo)
videoRouter.route('/delete-video').delete(verifyJwt ,deleteVideo)
videoRouter.route('/getUserAll-video').get(verifyJwt ,getUserVideo)
videoRouter.route('/video-feed').get(verifyJwt ,getMixedFeed)
videoRouter.route('/update-video-view').post(verifyJwt ,updateView)
videoRouter.route('/user-video-search').post(verifyJwt ,searchUserVideo)
// videoRouter.route('/video-comment').post(veryfyJwt,videoComment)
videoRouter.route('/get-all-vide-comments').post(verifyJwt ,getVideoComments)
videoRouter.route('/get-video').post(verifyJwt ,getVideo);
videoRouter.route('/delete-all-user-Video/:userId').delete(verifyJwt ,deleteUserAllVideo);


export default videoRouter
