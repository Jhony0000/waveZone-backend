import { Router } from 'express'
import {veryfyJwt} from '../middlewares/auth.middelwers.js'
import app from '../app.js'
import { upload } from '../middlewares/multer.middlewere.js'
import { deleteVideo, getUserVideo, updateVideo, uplodVideo,getMixedFeed, updateView,  getVideoComments, searchUserVideo, getVideo, deleteUserAllVideo } from '../controllers/video.controllers.js'



const videoRouter = Router()

videoRouter.post('/uplod-video',function(req,res){ veryfyJwt,upload.single('videoFile'),uplodVideo})
videoRouter.post('/update-video',function(req,res){ veryfyJwt,updateVideo})
videoRouter.delete('/delete-video',function(req,res){ veryfyJwt,deleteVideo})
videoRouter.get('/getUserAll-video',function(req,res){ veryfyJwt,getUserVideo})
videoRouter.get('/video-feed',function(req,res){ veryfyJwt,getMixedFeed})
videoRouter.post('/update-video-view',function(req,res){ veryfyJwt,updateView})
videoRouter.post('/user-video-search',function(req,res){ veryfyJwt,searchUserVideo})
// videoRouter.route('/video-comment').post(veryfyJwt,videoComment)
videoRouter.post('/get-all-vide-comments',function(req,res){ veryfyJwt,getVideoComments})
videoRouter.post('/get-video',function(req,res){ veryfyJwt,getVideo});
videoRouter.delete('/delete-all-user-Video/:userId',function(req,res){ veryfyJwt,deleteUserAllVideo});


export default videoRouter
