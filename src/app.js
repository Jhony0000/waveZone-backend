import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'


const app = express();

app.use(cors({
    origin:process.env.CORSE_ORIGIN,
    credentials:true,
}))



app.use(express.json({limit: '10gb'}))
app.use(express.urlencoded({extended: true , limit: '10gb',parameterLimit:15000}))
app.use(express.static('public'))
app.use(cookieParser())

// routs import 
import userRouter from './routes/user.Router.js'
import videoRouter from './routes/video.Router.js'
import messageRouter from './routes/message.router.js'
import blogRouter from './routes/blog.routs.js'
import notificationRouter from './routes/notifications.routes.js';

//  reguller user 
app.use('/api/v1/users' , function(){
    userRouter
} )
app.use('/api/v1/videos',videoRouter)
app.use('/api/v1/message',messageRouter)
app.use('/api/v1/blog',blogRouter)
app.use('/api/v1/notification',notificationRouter)

// bussiness user 


export default app
