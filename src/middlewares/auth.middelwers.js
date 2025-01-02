import {asynchandeler} from '../utils/asyncHandeler.js';
import {apiError} from '../utils/apiErorr.js'
import jwt from 'jsonwebtoken'
import {User} from '../models/users.models.js'

export const veryfyJwt = asynchandeler(async(req,_,next) => {
   try {
      const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ',"")
      //  console.log('token',token)
      //  console.log('Cookies:', req.cookies);
// console.log('Authorization Header:', req.header('Authorization'));

      if(!token){
       throw new  apiError(401,'Unauthorized request')
      }
   //  console.log( 'access token secrite',process.env.ACCESS_TOKEN_SECRETE)
   const deCoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRETE)
   // console.log('decoded',deCoded)
   const user = await User.findById(deCoded?._id).select("-password -refreshToken")
   //  console.log('user found',user)
  if(!user){
     throw new apiError(401,'user does not exit')
  }
 
  req.user = user
  next()
   } catch (error) {
    throw new apiError(401,error?.message || 'invlid token')
   }
})