import {apiError} from '../utils/apiErorr.js'
import {apiResponse} from '../utils/apiResponse.js'
import {asynchandeler} from '../utils/asyncHandeler.js'
import {User} from '../models/users.models.js'
import {uplodOnCloudNary} from '../utils/cloudNary.js'
import jwt from 'jsonwebtoken'
import {Subscription} from '../models/Subscription.models.js'
import {Video} from '../models/video.models.js'
import {Blog} from '../models/blog.modles.js'
import mongoose from 'mongoose'


const ganareteAccessAndRefereshToken = async(userID) => {
       try {
        console.log('userID',userID)
         const user = await User.findById(userID);
         console.log('user',user)
         const accessToken = user.ganareteAccesstoken();
         console.log('accesstoken',accessToken)
         const refreshToken = user.ganareteRefreshToken();
         console.log('refreshtoken',refreshToken)


         user.refreshToken = refreshToken;
         await  user.save({ validateBeforeSave: false });
     
         return {accessToken,refreshToken};
       } catch (error) {
        throw new apiError(500,'someThing went wrong while ganarating tokens')
       }
}

const registerUser  = asynchandeler(async (req,res,next) => {
//    userNmae 
// FullNAme
// email 
// password 
// avatar
// validation 
// chack user alredy exit 


 const {userName,FulName,password,email} = req.body

   if(
     [userName || FulName || password || email].some((filds) => filds?.trim() === '')
   ){
     throw new apiError(400,'all filds are required')
   }

   const exitUser = await User.findOne({
    $or : [{userName} , {email}]
   })

  //  console.log('exit user' , exitUser)

   if(exitUser){
    throw new apiError(409,'user alredy axit')
   }
    
   let avatarLocalPath;
   let coverImgLocalPath;

   if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
     avatarLocalPath = req.files.avatar[0].path;
   }

   if (req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length > 0) {
    coverImgLocalPath = req.files.coverImg[0].path
   }

   console.log('avaterLocal path' , avatarLocalPath);
   console.log('coverImgLocalPath' , coverImgLocalPath);
   
   
   const avatar = await uplodOnCloudNary(avatarLocalPath)
   const coverImg = await uplodOnCloudNary(coverImgLocalPath)

   const user = await User.create({
    userName,
    FulName,
    avatar : avatar?.url || '',
    coverImg:coverImg?.url || '',
    email,
    password,
   })

   const {refreshToken,accessToken} = await ganareteAccessAndRefereshToken(user._id);
   const createdUser = await User.findById(user._id).select("-password -refreshToken");
  //  console.log('access token' , accessToken);
  //  console.log('refresh token' , refreshToken)
   if(!createdUser){
    throw new apiError(500,  'Something went wrong')
   }
  
   const options= {
    httpOnly:true,
    secure:true
   }
   return res
   .status(200)
   .cookie('accessToken',accessToken,options)
   .cookie('refreshToken',refreshToken,options)
   .json(
    new apiResponse(200, createdUser,accessToken,refreshToken , 'user regester successfully')
   )

})

const loginUser = asynchandeler(async(req,res,next)=>{
  const {email , FulName ,password} = req.body
   
  // console.log('email' , email);
  // console.log('password' , password);
  if(!email && !password){
     throw new apiError(400,'all filds are required')
  }
  
  const user = await User.findOne({
    $or:[{email},{FulName}]
  })

  // console.log('user' , user)
  if(!user){
    throw new apiError(400,'user doesnot exit')
  }

  const isPasswordCurrect = await user.isPasswordCorrect(password)
  
  // console.log('ispasswordcorrect',isPasswordCurrect)
  if(!isPasswordCurrect){
    throw new apiError(401,'place enter currect password')
  }
 
  const {accessToken,refreshToken} = await ganareteAccessAndRefereshToken(user._id)

  const logIngUser = await User.findById(user._id).select('-password -refreshToken')
  
  const options = {
    httpOnly : true,
secure: false,
sameSite: 'lax'

  }
 
  return res
  .status(200)
  .cookie('accessToken',accessToken,options)
  .cookie('refreshToken',refreshToken,options)
  .json(new apiResponse(
    200,
    {
      user:logIngUser , accessToken,refreshToken
    },
    'user loged In successFully'
  ))

})

const logOutUser = asynchandeler(async(req,res) => {
  const ID = req.user._id

  await User.findByIdAndUpdate(
    ID,
    {
      $set:{
        refereshToken : undefined
      }
    },
    {
      new : true
    }
  )

  const options = {
    httpOnly : true,
    secure : false,
  }

  return res
  .status(200)
  .clearCookie('accessToken',options)
  .clearCookie('refereshToken',options)
  .json(new apiResponse(200,{},'user log out successfull'))
})

const refreshAccessToke = asynchandeler(async(req,res) => {
  const incomingRefreshToken = req.cookies.refereshToken || req.body.refereshToken

  if(!incomingRefreshToken){
    throw new apiError(401,'unauthorised request refresh toke')
  }

 try {
  const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRETE
   )
   const user = await User.findById(decodedToken?._id)
 
   if(!user){
     throw new apiError(401,'invalide referesh token')
   }
 
   if(incomingRefreshToken !== user?.refreshToken){
     throw new apiError(401,'refresh token is expiar and used')
   }
 
   const options = {
     httpOnly : true,
     secure : true
   }
   const {accessToken,newrefereshToken} = await ganareteAccessAndRefereshToken(user._id)
 
   return res
   .status(200)
   .cookie('accessToken',accessToken,options)
   .cookie('refereshToken' , newrefereshToken , options)
   .json(new apiResponse(
     200,
     {accessToken , refereshToken : newrefereshToken},
     'access token refreshed'
   ))
 } catch (error) {
   throw new apiError(401,error?.message || 'invalide referesh token')
 }
})

const getCurrentUser = asynchandeler(async(req,res) => {
  // console.log('currentUSer',req.user);
  return res
  .status(200)
  .json(new apiResponse(200,req.user,'user fatched successfully'))
})

const updateCoverImg = asynchandeler(async(req,res) => {
  const coverImgPath = req.file?.path
   console.log('coverImgPath',coverImgPath)
  if(!coverImgPath){
    throw new apiError(400,'cover img is required');
  }
  const coverImg = await uplodOnCloudNary(coverImgPath)

  if(!coverImg.url){
    throw new apiError(400,'when uplod coverimg on cloundinary create some problem')
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set :{
        coverImg : coverImg.url
      }
    },
    {new:true},
  ).select('-password')

  return res
  .status(200)
  .json(new apiResponse(200,user,'coverImg update successfully'))
})

const updateAvatar = asynchandeler(async(req,res) => {
     const avatarLocalPath = req.file?.path
     console.log('avatarLocalPath',avatarLocalPath)
     if(!avatarLocalPath){
      throw new apiError('avatar is required');
     }

     const avatarImg = await uplodOnCloudNary(avatarLocalPath)
     console.log('avater',avatarImg)
     if(!avatarImg.url){
      throw new apiError('wheen avatart localpath uplod on cloudinary create some problem');
     }

     const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set : {
          avatar:avatarImg.url
        }
      },{
        new:true
      }
     ).select('-password');

     return res
     .status(200)
     .json(new apiResponse(200,user,'user avatar update successfully'))
})

const accountDetalsUpdate = asynchandeler(async(req,res) => {
   const {FulName,userName,email} = req.body

   const user = await User.findByIdAndUpdate(
     req.user?._id,
     {
      $set : {
        FulName : FulName,
        userName : userName,
        email:email
      }
     },{
      new: true
     }
   ).select('-password');

   return res
   .status(200)
   .json(new apiResponse(200,user,'account detels updated successfully'))
})

const updatePassword = asynchandeler(async(req,res) => {
  const {oldPassword,newPassword} = req.body
   
  const user = await User.findById(req.user?._id)
  const isPasswordCurrect = await user.isPasswordCorrect(oldPassword)

  if(!isPasswordCurrect){
    throw new apiError(401,'password was wrong')
  }
  user.password = newPassword
  await user.save({validateBeforeSave: false});

  return res
  .status(200)
  .json(new apiResponse(200,{},'password changed successfully'));
})


const deleteAccount = asynchandeler(async (req, res) => {
    const user = await User.deleteOne({ _id: req.user?._id });

    if (user.deletedCount === 1) {
        return res.status(200).json(
            new apiResponse(200, {}, "Account deleted successfully")
        );
    } else {
        return res.status(404).json(
            new apiResponse(404, {}, "Account not found")
        );
    }
});

const getUserProfail = asynchandeler(async (req, res) => {
  const { id, loggedInUserId } = req.body; // Pass both the profile user ID and logged-in user ID

  if (!id) {
    throw new apiError(500, 'id not found');
  }

  const profile = await User.aggregate([
    { $match: { _id: new mongoose.Types.ObjectId(id) } },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "followingId",
        as: "Followers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "followerId",
        as: "Following",
      },
    },
    {
      $addFields: {
        followersCount: { $size: "$Followers" },
        followingCount: { $size: "$Following" },
        isFollowers: {
          $in: [new mongoose.Types.ObjectId(loggedInUserId), "$Followers.followerId"],
        },
      },
    },
    {
      $project: {
        fullName: 1,
        avatar: 1,
        userName: 1,
        coverImg: 1,
        followersCount: 1,
        followingCount: 1,
        isFollowers: 1,
      },
    },
  ]);

  console.log('profail',profile)

  if (!profile.length) {
    throw new apiError(404, 'User not found');
  }

  return res
    .status(200)
    .json(new apiResponse(200, profile[0], 'User fetched successfully'));
});


// const userFollow = asynchandeler(async(req,res) => {
//   const { followerId, followingId } = req.body;

//   try {
//     // Check if the follow relationship already exists
//     const existingSubscription = await Subscription.find({
//       followers: followerId,
//       following: followingId,
//     });

//     if (existingSubscription) {
//       throw new apiError(400,' alredy follow this user')
//     }

//     // Create a new subscription
//     const subscription = new Subscription({
//       followers: followerId,
//       following: followingId,
//     });
//     await subscription.save();


//    return res
//    .status(200)
//    .json(new apiResponse(200,subscription,'user follow successFully'));
//   } catch (error) {
//   console.log('user follow error : ' , error)
//   }
// })

const search = asynchandeler(async(req,res) => {
  const {searchResult} = req.body

  if(!searchResult){
    throw new apiError(400,'searchResult not found')
  }
  
  const videos = await Video.find({ title: { $regex: searchResult, $options: 'i' } }).populate('owner','avatar userName FulName');

  const videoIds = videos.map(video => video._id);
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

  const blogs = await Blog.find({ title: { $regex: searchResult, $options: 'i' } }).populate('owner','avatar userName FulName');
  const blogIds = blogs.map((blog) => blog._id)
  const aggregatedDatae = await Blog.aggregate([
    {
        $match: { _id: { $in: blogIds } }, // Match only the blogs in the feed
    },
    {
        $lookup: {
            from: 'socialcomments',
            let: { blogId: '$_id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$postId', '$$blogId'] } } }, // Fixed blogId reference
            ],
            as: 'Comments', // Join comments
        },
    },
    {
        $lookup: {
            from: 'sociallikes',
            let: { blogId: '$_id' },
            pipeline: [
                { $match: { $expr: { $eq: ['$postId', '$$blogId'] } } } // Fixed blogId reference
            ],
            as: 'Like', // Join likes
        },
    },
    {
        $addFields: {
            commentsCount: { $size: '$Comments' }, // Count comments for each blog
            likeCount: { $size: '$Like' }, // Count likes for each blog
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


const aggregatedMaps = Object.fromEntries(
  aggregatedDatae.map(data => [data._id.toString(), data])
);

const enrichedBlogs = blogs.map(blog => {
  const aggregation = aggregatedMaps[blog._id.toString()] || {};
  return {
      ...blog.toObject(),
      commentsCount: aggregation.commentsCount || 0,
      likeCount: aggregation.likeCount || 0,
  };
});

  const users = await User.find(
    {
        $or: [
            { userName: { $regex: searchResult, $options: 'i' } },
            { FulName: { $regex: searchResult, $options: 'i' } }
        ]
    },
    'FulName avatar userName' // Specify only the required fields
);

  return res
  .status(200)
  .json(new apiResponse(200,{
    videos:enrichedVideos,
    people:users,
    posts:enrichedBlogs
  },'search successfully'))
})

export {
  registerUser,
  loginUser ,
  logOutUser  ,
  getCurrentUser ,
  refreshAccessToke,
  updateCoverImg ,
  updateAvatar ,
  accountDetailsUpdate ,
  updatePassword  ,
  deleteAccount ,
  getUserProfile,
  // userFollow,
  search
};
