import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participent:[
        {
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        }
    ],
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message',
        default:null
      },
   

},{timestamps:true});

export const Conversation = mongoose.model('Conversation',conversationSchema)