import { Router } from 'express'
import {verifyJwt } from '../middlewares/auth.middelwers.js'
import app from '../app.js'
import { upload } from '../middlewares/multer.middlewere.js'
import { updateBlog,uplodBlog,getUserBlog,deleteBlog ,getBlogFeed, updateBlogViews, searchUserBlog, getBlog} from '../controllers/blog.controllers.js'



const blogRouter = Router()

blogRouter.route('/uplod-blog').post(verifyJwt ,upload.single('Image'),uplodBlog)
blogRouter.route('/update-blog').post(verifyJwt ,updateBlog)
blogRouter.route('/delete-blog').post(verifyJwt ,deleteBlog)
blogRouter.route('/update-blog-view').post(verifyJwt ,updateBlogViews)
blogRouter.route('/search-user-blog').post(verifyJwt ,searchUserBlog)
blogRouter.route('/getUserAll-blog').get(verifyJwt ,getUserBlog)
blogRouter.route('/blog-feed').get(verifyJwt ,getBlogFeed)
blogRouter.route('/get-blog').post(verifyJwt ,getBlog)


export default blogRouter
