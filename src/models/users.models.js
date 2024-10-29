import mongoose from 'module'
import { type } from 'os'

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

export const User = mongoose.Model('User' , userSchama)