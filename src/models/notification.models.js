import mongoose, { Schema } from "mongoose";

// Notification schema
const notificationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  
  postId: {
    type: Schema.Types.ObjectId,
    ref: "Video", // Assuming you have a Video model
    required: false, // It can be optional
  },
  expiresAt: {
     type: Date, required: true 
  },
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
    required:true
  },
  read: {
    type: Boolean,
    default: false,
  }

},{timestamps:true});

notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Notification = mongoose.model("Notification", notificationSchema);
