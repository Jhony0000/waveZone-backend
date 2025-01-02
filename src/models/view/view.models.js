import mongoose from "mongoose";

const viewSchema = new mongoose.Schema({
    postId : {
        type:mongoose.Schema.Types.ObjectId(),
        ref:'User',
        required:true
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId(),
        ref:'User',
        required:true
    }
},{timestamps:true})

export const Views = mongoose.model('Views',viewSchema);