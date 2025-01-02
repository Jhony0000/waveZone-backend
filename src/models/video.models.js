import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const postSchema = mongoose.Schema(
  {
    cloudinaryPublicId: {
       type: String, 
       required: true
     }, // Cloudinary public ID
    videoFile: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
    },
    views: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    viewedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Track users who have viewed the video
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ], // Track users who liked the video
  },
  { timestamps: true }
);

// Add pagination plugin
postSchema.plugin(mongooseAggregatePaginate);

export const Video = mongoose.model("Video", postSchema);
