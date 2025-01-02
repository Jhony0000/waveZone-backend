import { User } from "../models/users.models.js";
import mongoose from "mongoose";
import { asynchandeler } from "../utils/asyncHandeler.js";
import { apiError } from "../utils/apiErorr.js";
import { apiResponse } from "../utils/apiResponse.js";
import { Conversation } from "../models/ConverSation.models.js";
import { Notification } from "../models/notification.models.js";
import {Subscription} from '../models/Subscription.models.js'


const sendNotification = async ({ userId, videoId, message }) => {
    try {
        console.log('userIDsss', userId);
        console.log('videoIDss', videoId);
        console.log('messagesss', message);

        // Ensure userId and videoId are properly cast to ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const videoObjectId = new mongoose.Types.ObjectId(videoId);

        // Find followers of the user
        const followers = await Subscription.find({ followerId: userObjectId });
        console.log('followers', followers);
        if (!followers || followers.length === 0) {
            throw new Error('No followers exist');
        }

        console.log('followers', followers);

        // Prepare notifications
        const notifications = followers.map(follower => ({
            owner: userObjectId,
            postId: videoObjectId,
            userId: follower.followingId, // This assumes followerId is already populated and is an ObjectId
            message: message,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
        }));

        // Save all notifications in bulk
        await Notification.insertMany(notifications);

        console.log('Notifications sent successfully');
        return notifications;
    } catch (error) {
        console.error('Send notification error:', error);
        throw error; // Optionally re-throw the error for higher-level handling
    }
};


const getNotification = asynchandeler(async(req,res) => {
    const {userId} = req.body

    if(!userId){
        throw new apiError(402,'user id not found')
    }

    const notifications = await Notification.find({
        userId: userId,
        expiresAt: { $gt: new Date() }, // Include only non-expired notifications
    })
    .populate('owner','avatar userName FulName')
    .sort({ createdAt: -1 }); 

    return res
    .status(200)
    .json(new apiResponse(200,notifications,'notification fached successsfully'))
})

const deleteNotification = asynchandeler(async(req,res) => {
    const {notificationId} = req.body

    if(!notificationId){
        throw new apiError(403,'notification Id not found')
    }

    await Notification.findByIdAndDelete(notificationId);

    return res
    .status(200)
    .json(new apiResponse(200,{},'notification delete successfully'))
})

const readNotification = asynchandeler(async(req,res) => {
    const {userId} = req.body

    if(!userId){
        throw new apiError(403,'user id not found')
    }

    await Notification.updateMany({userId:userId,read:false},{$set:{read:true}});

    return res
    .status(200)
    .json(new apiResponse(200,{},'real all notification'));
});

const nonreadNotification = asynchandeler(async(req,res)=> {
    const {userId} = req.body;

    if(!userId){
        throw new apiError(403,'userId not found');
    }

    const countNotification = await Notification.countDocuments({userId:userId,read:false});

    // if(!countNotification){
    //     throw new apiError('no notificaton avalebale');
    // }

    return res
    .status(200)
    .json(new apiResponse(200,countNotification,'notification count fatched successfully'));
});
export{
    sendNotification,
    getNotification,
    deleteNotification,
    readNotification,
    nonreadNotification
}