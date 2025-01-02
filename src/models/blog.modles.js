import mongoose from "mongoose";

const blogSchema =  mongoose.Schema({
    content:{
        type:String,
        required:true
    },
    Image:{
        type:String,
        required:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    title:{
        type:String,
        required:true
    },
    Views: {
        type: Number,
         default: 0 
    }, // View count
     viewedBy: {
       type: [String],
       default: [] 
    }, // User IDs who viewed the blog
},{timestamps:true})
export const Blog = mongoose.model('Blog',blogSchema)