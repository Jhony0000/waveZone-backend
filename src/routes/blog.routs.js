import { Router } from 'express'
import {veryfyJwt} from '../middlewares/auth.middelwers.js'
import app from '../app.js'
import { upload } from '../middlewares/multer.middlewere.js'
import { updateBlog,uplodBlog,getUserBlog,deleteBlog ,getBlogFeed, updateBlogViews, searchUserBlog, getBlog} from '../controllers/blog.controllers.js'



const blogRouter = Router()

blogRouter.route('/uplod-blog').post(veryfyJwt,upload.single('Image'),uplodBlog)
blogRouter.route('/update-blog').post(veryfyJwt,updateBlog)
blogRouter.route('/delete-blog').post(veryfyJwt,deleteBlog)
blogRouter.route('/update-blog-view').post(veryfyJwt,updateBlogViews)
blogRouter.route('/search-user-blog').post(veryfyJwt,searchUserBlog)
blogRouter.route('/getUserAll-blog').get(veryfyJwt,getUserBlog)
blogRouter.route('/blog-feed').get(veryfyJwt,getBlogFeed)
blogRouter.route('/get-blog').post(veryfyJwt,getBlog)


export default blogRouter