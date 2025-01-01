import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const postSchema = mongoose.Schema({
    postFile: {
        type : String,
        required : true
    },
    title : {
        type: String,
    },
    description:{
        type : String
    },
    duration:{
        type: Number,
    },
    views:{
        type: Number,
        default : 0
    },
    isPublished:{
        type:Boolean,
        default: true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{timestamps : true})


postSchema.plugin()

export const Post  = mongoose.model('Post',postSchema);