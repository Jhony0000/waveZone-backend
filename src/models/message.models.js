import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Conversation',
        required:true,
    },
    sendId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    createId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    content:{
        type:String,
        required:true
    },
    media:{
        type:String,
        default:null
    },
    // sendId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    seenBy: [
        { 
          type: mongoose.Schema.Types.ObjectId,
          ref: "User" 
        }
    ],
},{timestamps:true});

export const Message = mongoose.model('Message',messageSchema);