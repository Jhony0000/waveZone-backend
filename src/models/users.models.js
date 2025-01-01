import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const userSchama = new mongoose.Schema({
    userName:{
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true,
    },
    FulName: {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true,
        index : true
    },
    email: {
        type: String,
        required : true,
        unique: true,
        trim : true,
        lowercase: true
    },
    password: {
        type: String,
        required : [true,'password is required'],
        unique : true,
    },
    avatar: {
        type : String,
    },
    coverImg: {
        type : String,
    },
    refireshToken: {
        type : String
    }
},{timestamps : true})

userSchama.pre('save', async function (next) {
    if(!this.isModified('password')) return next()

    this.password = bcrypt.hash(this.password, 10)
    next()
})


userSchama.methods.isPasswordCorrect = async function (password){
  return await  bcrypt.compare(password, this.password)
}

userSchama.methods.genereteAccessToken = function(){
  return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            userName: this.userName,
            FulName: this.FulName
        },
        process.env.ACCESS_TOKEN_SECRETE,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchama.methods.genereteRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRETE,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model('User' , userSchama)