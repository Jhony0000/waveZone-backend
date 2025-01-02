import {apiError} from '../../utils/apiErorr.js';
import {apiResponse} from '../../utils/apiResponse.js';
import {BusinessUser} from '../../models/business.model/users.models.js';
import {uplodOnCloudNary} from '../../utils/cloudNary.js';
import { asynchandeler } from '../../utils/asyncHandeler.js';


const ganareteAccessAndRefereshToken = async(userID) => {
       try {
        console.log('businessuserID',userID)
         const user = await BusinessUser.findById(userID);
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


const registerUser = asynchandeler(async(req,res) => {
     const {businessName,email,password} = req.body

     if(!businessName || !email || !password){
        throw new apiError(400,'all Fileds are required');
     }

     let avatarLocalPath;
     
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length > 0){
       avatarLocalPath = req.files.avatar[0].path;
    }

   
   
    const exitUser = await BusinessUser.findOne({
        $or : [{businessName} , {email}]
       })

    if(exitUser){
        throw new apiError(402,'user alredy exit');
    }

     const avatarPublicPath = await uplodOnCloudNary(avatarLocalPath);

    const user = await BusinessUser.create({
        businessName,
        email,
        password,
        avatar : avatarPublicPath?.url || '',
   })

   const {refreshToken,accessToken} = await ganareteAccessAndRefereshToken(user._id);
   const createdUser = await BusinessUser.findById(user._id).select("-password -refreshToken");
   console.log('access token' , accessToken);
   console.log('refresh token' , refreshToken)

   if(!createdUser){
    throw new apiError(500,'something went wrong')
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


const loginUser = asynchandeler(async(req,res)=>{
  const {email , businessName ,password} = req.body
   
  // console.log('email' , email);
  console.log('password' , password);
  if(!email && !password){
     throw new apiError(400,'all filds are required')
  }
  
  const user = await BusinessUser.findOne({
    $or:[{email},{businessName}]
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

  const logIngUser = await BusinessUser.findById(user._id).select('-password -refreshToken')
  
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
  const id = req.user._id

  await BusinessUser.findByIdAndUpdate(
    id,
    {
      $set:{
        refreshToken : undefined
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


const getCurrentUser = asynchandeler(async(req,res) => {
    console.log('currentUSer',req.user);
    return res
    .status(200)
    .json(new apiResponse(200,req.user,'user fatched successfully'))
})

export {
    registerUser,
    loginUser,
    logOutUser,
    getCurrentUser
}