import dotenv from 'dotenv'
import {connectDB} from './db/index.js'
import app from './app.js';

dotenv.config({
    path: './env'
})

connectDB()
.then(() => {
    app.listen(process.env.PORT || 5017 , () => {
        console.log(`server is running at port : ${process.env.PORT}`)
    })
    app.on('erorr' , (error) => {
        console.log('Error:',error)
        throw error
    })
})
.catch((erorr) => console.log('mongoDb connnect faild ' , erorr));
