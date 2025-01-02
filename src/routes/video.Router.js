import { Router } from 'express'
// import {veryfyJwt} from '../middlewares/auth.middelwers.js'
// import app from '../app.js'
// import { upload } from '../middlewares/multer.middlewere.js'
// import { deleteVideo, getUserVideo, updateVideo, uplodVideo,getMixedFeed, updateView,  getVideoComments, searchUserVideo, getVideo, deleteUserAllVideo } from '../controllers/video.controllers.js'



const videoRouter = Router()

// videoRouter.route('/uplod-video').post(veryfyJwt,upload.single('videoFile'),uplodVideo)
// videoRouter.route('/update-video').post(veryfyJwt,updateVideo)
// videoRouter.route('/delete-video').delete(veryfyJwt,deleteVideo)
// videoRouter.route('/getUserAll-video').get(veryfyJwt,getUserVideo)
// videoRouter.route('/video-feed').get(veryfyJwt,getMixedFeed)
// videoRouter.route('/update-video-view').post(veryfyJwt,updateView)
// videoRouter.route('/user-video-search').post(veryfyJwt,searchUserVideo)
// // videoRouter.route('/video-comment').post(veryfyJwt,videoComment)
// videoRouter.route('/get-all-vide-comments').post(veryfyJwt,getVideoComments)
// videoRouter.route('/get-video').post(veryfyJwt,getVideo);
// videoRouter.route('/delete-all-user-Video/:userId').delete(veryfyJwt,deleteUserAllVideo);


export default videoRouter
