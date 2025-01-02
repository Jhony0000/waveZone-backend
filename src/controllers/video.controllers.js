import { uplodOnCloudNary } from "../utils/cloudNary.js";
import {cloudnary} from '../utils/cloudNary.js'
import { asynchandeler } from "../utils/asyncHandeler.js";
import { apiError } from "../utils/apiErorr.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/users.models.js";
import  {Video} from '../models/video.models.js'
import mongoose from "mongoose";
import {SocialComment} from '../models/VideoComment/comment.models.js'
import {sendNotification} from './notification.controllers.js'
import {SocialLike} from '../models/like/like.models.js'

const videoCommonAgregation = (req) => {
    return [
        {
            $lookup:{
                from:"SocialComment",
                localField:'_id',
                foreignField:'postId',
                as:'coments'
            }
        },
        {
            $lookup:{
                from:'socialLikes',
                localField:'_id',
                foreignField:'postId',
                as:'like'
            }
        },
        {
            $lookup:{
                from:'socialLikes',
                localField:'_id',
                foreignField:'postId',
                as:'isLiked',
                pipeline:[
                    {
                        $match:{
                            likedBy:new mongoose.Types.ObjectId(req.user?._id)
                        },
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"User",
                localField:'owner',
                foreignField:"_id",
                as:"author",
                pipeline:[
                    {
                        $project:{
                            avatar:1,
                            FulName:1,
                            userName:1
                        }
                    },
                  
                ],
                
            },
        },
        {
            $addFields:{
                author: { $arrayElemAt: ["$author", 0] },
                likes:{$size:"$like"},
                Comments:{$size:"$coments"},
                isLiked:{
                    $cond:{
                        if:{
                           $get:[
                            {
                                $size:"$isLiked"
                            },
                            1
                           ]
                        },
                        then:true,
                        else:false
                    }
                }
            }
        }
    ]
}

const uplodVideo = asynchandeler(async(req,res) => {
    const {title} = req.body
    const videoFile = req.file?.path
    const {userId} = req.query
    if(!title || !videoFile){
        throw new apiError(400,'title and video file requerd  must required')
    }
    if(!userId){
        throw new apiError(403,'userId not found something went wrong')
    }
//   console.log('videoFile',videoFile)
//   console.log(req.file?.path)
    const videoFileUrl = await uplodOnCloudNary(videoFile)
    console.log('video file url',videoFileUrl)
    if(!videoFileUrl){
        throw new apiError(500,'video uplod problem in cloudnary')
    }

    const video = await new Video({
        owner:userId,
        title:title,
        videoFile:videoFileUrl.secure_url,
        duration:videoFileUrl.duration,
        cloudinaryPublicId:videoFileUrl.public_id
    })


    await video.save({validateBeforeSave:false});
    
   
     await sendNotification({userId:userId,videoId:video._id,message:'new video upload'});

       
      
      
    return res
    .status(200)
    .json(new apiResponse(200,video,'video uplod successfully'))
})

const getMixedFeed = async (req, res) => {
    const { page = 1, limit = 10, userId } = req.query;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Sort Criteria
        const sortCriteria = [
            ['views', -1],
            ['createdAt', 1],
        ];

        // Fetch videos
        const videos = await Video.find()
            .skip(skip)
            .limit(limitNumber)
            .sort(Object.fromEntries(sortCriteria))
            .populate('owner', 'avatar FulName');

        const videoIds = videos.map(video => video._id);

        // Aggregate comment counts for all videos
        const aggregatedData = await Video.aggregate([
            {
                $match: { _id: { $in: videoIds } }, // Match only the videos in the feed
            },
            {
                $lookup: {
                    from: 'socialcomments', 
                    let: { videoId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$postId', '$$videoId'] } } }, // Match postId with videoId
                    ],
                    as: 'Comments', // Join comments
                },
            },
            {
            
                    $lookup: {
                        from: 'sociallikes',
                        let: { videoId: '$_id' },
                        pipeline: [
                            { $match: { $expr: { $eq: ['$postId', '$$videoId'] } } }
                        ],
                        as: 'Like'
                    }
            
            },
            {
                $addFields: {
                    commentsCount: { $size: '$Comments' }, // Count comments for each video
                    likeCount: { $size: '$Like' }, // Count likes for each video
                },
            },
            {
                $project: {
                    _id: 1,
                    commentsCount: 1,
                    likeCount: 1,
                    views: 1,
                },
            },
        ]);

        // Map aggregation results back to videos
        const aggregatedMap = Object.fromEntries(
            aggregatedData.map(data => [data._id.toString(), data])
        );

        const enrichedVideos = videos.map(video => {
            const aggregation = aggregatedMap[video._id.toString()] || {};
            return {
                ...video.toObject(),
                commentsCount: aggregation.commentsCount || 0,
                likeCount: aggregation.likeCount || 0,
            };
        });

        const totalVideos = await Video.countDocuments();
        const totalPages = Math.ceil(totalVideos / limitNumber);

        return res.status(200).json(
            new apiResponse(200, {
                videos: enrichedVideos,
                pagination: {
                    currentPage: pageNumber,
                    totalPages,
                    totalVideos,
                    limit: limitNumber,
                },
            }, 'Videos fetched successfully')
        );
    } catch (error) {
        console.error('Error fetching video feed:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
}

const updateVideo = asynchandeler(async(req,res) => {
    const {id} = req.query
    const {title} = req.body
     
    console.log(title)
    if(!id){
        throw new apiError('video id not found')
    }

    if(!title){
        throw new apiError(400,'title must be required')
    }

    const video = await Video.findById(id)

    if(!video){
        throw new apiError(500,'video not found')
    }

    if(title !== undefined) video.title = title

    await video.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new apiResponse(200,video, 'video update successfully'))
    
})
const deleteVideo = async (req, res) => {
    const { videoId } = req.query;
    console.log('Video ID:', videoId);

    if (!videoId) {
        throw new apiError(500, 'Video ID not found');
    }

    // Find the video in MongoDB to get the Cloudinary public ID
    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(500, 'Video not found');
    }

    console.log('Video to be deleted:', video);

    // Delete the video from Cloudinary
    if (video.cloudinaryPublicId) {
        try {
            const cloudinaryResponse = await cloudnary.uploader.destroy(video.cloudinaryPublicId);
            console.log(`Cloudinary Response: ${JSON.stringify(cloudinaryResponse)}`);
            console.log(`Video deleted from Cloudinary with public ID: ${video.cloudinaryPublicId}`);
        } catch (cloudinaryError) {
            console.error('Error deleting video from Cloudinary:', cloudinaryError);
            throw new apiError(500, 'Failed to delete video from Cloudinary');
        }
    } else {
        console.warn('No Cloudinary public ID found for this video.');
    }

    // Now delete the video from MongoDB
    try {
        await Video.findByIdAndDelete(videoId);
        console.log('Video deleted from MongoDB');
    } catch (mongodbError) {
        console.error('Error deleting video from MongoDB:', mongodbError);
        throw new apiError(500, 'Failed to delete video from MongoDB');
    }

    // Return success response
    return res
        .status(200)
        .json(new apiResponse(200, {}, 'Video deleted successfully'));
};
const getUserVideo = asynchandeler(async(req,res) => {
    const { userId } = req.query;

    console.log('userID',userId)
 
    if(!userId){
        throw new apiError(500,'ownerID not found')
    }

    const video = await Video.find({owner:userId}).sort({ createdAt: -1 });
    
    // console.log('videos',video)
    if(!video){
        throw new apiError(402,'no videos avaleable')
    }
     const videoIds = video.map((video) => video._id)

    const aggregatedData = await Video.aggregate([
        {
            $match: { _id: { $in: videoIds } }, // Match only the videos in the feed
        },
        {
            $lookup: {
                from: 'socialcomments', 
                let: { videoId: '$_id' },
                pipeline: [
                    { $match: { $expr: { $eq: ['$postId', '$$videoId'] } } }, // Match postId with videoId
                ],
                as: 'Comments', // Join comments
            },
        },
        {
        
                $lookup: {
                    from: 'sociallikes',
                    let: { videoId: '$_id' },
                    pipeline: [
                        { $match: { $expr: { $eq: ['$postId', '$$videoId'] } } }
                    ],
                    as: 'Like'
                }
        
        },
        {
            $addFields: {
                commentsCount: { $size: '$Comments' }, // Count comments for each video
                likeCount: { $size: '$Like' }, // Count likes for each video
            },
        },
        {
            $project: {
                _id: 1,
                commentsCount: 1,
                likeCount: 1,
                views: 1,
            },
        },
    ]);

    // Map aggregation results back to videos
    const aggregatedMap = Object.fromEntries(
        aggregatedData.map(data => [data._id.toString(), data])
    );

    const enrichedVideos = video.map(video => {
        const aggregation = aggregatedMap[video._id.toString()] || {};
        return {
            ...video.toObject(),
            commentsCount: aggregation.commentsCount || 0,
            likeCount: aggregation.likeCount || 0,
        };
    });

    return res
    .status(200)
    .json(new apiResponse(200,{data:enrichedVideos},'video fached successsfully'))
})

const updateView = asynchandeler(async(req,res) => {
    const { videoId, userId } = req.body; // Receive videoId and userId from the request body

    if (!videoId) {
      throw new apiError(402, 'videoId not found'); // Error if videoId is not provided
    }
  
    if (!userId) {
      throw new apiError(402, 'userId not found'); // Error if userId is not provided
    }
  
    // Find the video by its ID
    const video = await Video.findById(videoId);
  
    if (!video) {
      throw new apiError(404, 'Video not found'); // Error if video is not found
    }
  
    // Check if the user has already viewed the video
    if (video.viewedBy && video.viewedBy.includes(userId)) {
           throw new apiError(402,'user alredy view this video') // Return success without updating views
    }
  
    // Increment views and add the user to the viewedBy array to track their view
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      { 
        $inc: { views: 1 }, // Increment the view count by 1
        $addToSet: { viewedBy: userId }, // Ensure the user is added to the viewedBy array only once
      },
      { new: true }
    );
  
    if (!updatedVideo) {
      throw new apiError(500, 'Something went wrong when updating the video view'); // Error if update fails
    }

    return res
    .status(200)
    .json(new apiResponse(200,updatedVideo,'video view update successFully'))
})

const getVideoComments= asynchandeler(async(req,res) => {
    const {videoId} = req.body

    if(!videoId){
        throw new apiError(403,'video id not found')
    }

    const comments = await SocialComment.find({postId:videoId}).populate('author','userName FulName avatar')

    if(!comments){
        throw new apiError(403,'No comments avalavle')
    }

    return res
    .status(200)
    .json(new apiResponse(200,comments,'comments facthed successfully'))
})

const searchUserVideo = asynchandeler(async(req,res) => {
    const {title} = req.body

    if(!title){
        throw new apiError(400,'title not found');
    }

    const videos = await Video.find({title:{$regex: title, $options: 'i' }});

    if(!videos){
        return res
        .status(200)
        .json(new apiResponse(200,videos,'video search successfully'))
    }

    return res
    .status(200)
    .json(new apiResponse(200,videos,'video search successfully'))
})

// video analytic page 
const getVideo = asynchandeler(async (req, res) => {
    const { videoId } = req.body;
  
    if (!videoId) {
      throw new apiError(403, 'Video ID not found');
    }
    // Fetch the video from the Video collection
    const video = await Video.findOne({ _id: videoId });
  
    if (!video) {
      throw new apiError(500, 'Video not found');
    }
            // Perform aggregation for comments and likes
            const aggregatedData = await Video.aggregate([
                {
                    // Match the video by its ID
                    $match: { _id: new mongoose.Types.ObjectId(videoId) },
                },
                {
                    // Look up comments related to this video
                    $lookup: {
                        from: 'socialcomments',
                        let: { videoId: '$_id' }, // Reference the video ID
                        pipeline: [
                            {
                                $match: { 
                                    $expr: { 
                                        $eq: ['$postId', '$$videoId'] // Match postId from comments to videoId
                                    }
                                }
                            }
                        ],
                        as: 'Comments' // Store the matched comments as 'Comments'
                    }
                },
                {
                    // Look up likes related to this video
                    $lookup: {
                        from: 'sociallikes',
                        let: { videoId: '$_id' }, // Reference the video ID
                        pipeline: [
                            {
                                $match: { 
                                    $expr: { 
                                        $eq: ['$postId', '$$videoId'] // Match postId from likes to videoId
                                    }
                                }
                            }
                        ],
                        as: 'Likes' // Store the matched likes as 'Likes'
                    }
                },
                {
                    // Add fields for comment and like counts
                    $addFields: {
                        commentsCount: { $size: '$Comments' }, // Count the number of comments
                        likeCount: { $size: '$Likes' }, // Count the number of likes
                    }
                },
                {
                    // Project only relevant fields
                    $project: {
                        _id: 1,
                        title: 1,
                        views: 1,
                        commentsCount: 1,
                        likeCount: 1,
                        createdAt: 1,
                    }
                }
            ]);
    // If no aggregated data is found
    if (!aggregatedData || aggregatedData.length === 0) {
      throw new apiError(500, 'Something went wrong when fetching video data');
    }
  
    // Return the video data with comments and likes count
    return res
      .status(200)
      .json(new apiResponse(200, aggregatedData[0], 'Video fetched successfully'));
  });
  

const deleteUserAllVideo = asynchandeler(async (req, res) => {
    const userId = req.params.userId; // Assuming the user ID is passed as a parameter in the route
  console.log('user id',userId);
    // Ensure userId is provided
    if (!userId) {
      throw new apiError(400, 'User ID is required');
    }
  
    // Delete videos matching the provided user ID
    const result = await Video.deleteMany({ owner: userId });
    console.log('result',result);
    if (result.deletedCount === 0) {
      throw new apiError(404, 'No videos found for this user');
    }
  
    // Send success response
    return res
      .status(200)
      .json(new apiResponse(200, {}, `${result.deletedCount} videos deleted successfully`));
  });
  

export {
    uplodVideo,
    updateVideo,
    deleteVideo,
    getUserVideo,
    getMixedFeed,
    updateView,
    searchUserVideo,
    getVideoComments,
    getVideo,
    deleteUserAllVideo
}