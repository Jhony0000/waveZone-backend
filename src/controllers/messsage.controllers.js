import { User } from "../models/users.models.js";
import { asynchandeler } from "../utils/asyncHandeler.js";
import { apiError } from "../utils/apiErorr.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Conversation } from "../models/ConverSation.models.js";
import { Message } from "../models/message.models.js";
import mongoose from "mongoose";

const searchUserForChat = asynchandeler(async(req,res) => {
    console.log(req.body)
    const {FulName} = req.body
   console.log(FulName)
    if(!FulName){
        throw new apiError(400,'FullName name not send');
    }

    const user = await User.find({
        FulName:{$regex : FulName , $options: 'i'},
    }).select('-password -refreshToken')

    return res
    .status(200)
    .json(new apiResponse(200 , user , 'user search successfully'))
})

const selectedUserForChat = asynchandeler(async (req, res) => {
    const { partcipantUserID } = req.body;
    if (!partcipantUserID) {
        throw new apiError(400, 'Participant user ID not sent');
    }

    const existingConversation = await Conversation.findOne({
        participent: { $all: [req.user._id, partcipantUserID] },
    });

    if (existingConversation) {
        return res
            .status(200)
            .json(new apiResponse(200, existingConversation, 'Conversation already exists'));
    }

    const newConversation = await Conversation.create({
        participent : [req.user._id, partcipantUserID],
    });

    return res
        .status(200)
        .json(new apiResponse(200, newConversation, 'New conversation created'));
});


const sendMessage = asynchandeler(async(req,res) => {
    const {content,chatId,sendId,createId} = req.body
       
    console.log(content)
    console.log(chatId)
    if(!content || !chatId){
        throw new apiError(400,'this fild is required');
    }

    const message = await Message.create({
        sendId:new mongoose.Types.ObjectId(sendId),
        createId:new mongoose.Types.ObjectId(createId),
        content:content,
        chat:new mongoose.Types.ObjectId(chatId)
    });

    await Conversation.findByIdAndUpdate(
        chatId,
        { 
            $set:{
                lastMessage: message._id
            }
            },
        { new: true }
    );
//   await message.save({val})
    return res
    .status(200)
    .json(new apiResponse (200,message,'message send successfully'))
})

const getAllMessages = asynchandeler(async (req, res) => {
    const { chatId } = req.body;

    if (!chatId) {
        throw new apiError(400, 'Conversation ID is required');
    }

    const messages = await Message.find({ chat: chatId })
        .populate('sendId', 'FulName userName avatar')
        .populate('createId', 'FulName userName avatar');

        if(!messages){
             throw new apiError(500,'something went wrong when fached message')
        }

    return res
        .status(200)
        .json(new apiResponse(200, messages, 'Messages fetched successfully'));
});

const getAllMessageProfail = asynchandeler(async(req,res) => {
    const {userID} = req.body
    console.log(userID)
    if(!userID){
        throw new apiError(500,'userID not send')
    }

    const user = await Message.find({
        $or: [
          {sendId  : new  mongoose.Types.ObjectId(userID)},
          {createId: new mongoose.Types.ObjectId(userID) },
        ]
      })
      .populate("sendId", "FulName userName avatar") // Populate sendId with profileName and userName
      .populate("createId", "FulName userName avatar") 
      .exec(); 
  
console.log(user)
      if(!user){
        throw new apiError('your userID is wrong')
      }
       
      return res
      .status(200)
      .json(new apiResponse(200,user,'mesage user profail fatched successfully'))
})

const deleteMessageUserPrfoail = asynchandeler(async(req,res) => {
    const {chatId} = req.body

    if(!chatId){
        throw new apiError(402,'chatId not found')
    }

    await Message.deleteMany({chat:chatId});

    return res
    .status(200)
    .json(new apiResponse(200,{},'All message delete successFully'))
})

export {searchUserForChat,selectedUserForChat,sendMessage,getAllMessageProfail,getAllMessages,deleteMessageUserPrfoail}