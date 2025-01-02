import mongoose, { Schema } from "mongoose";


const likeSchema = new Schema(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: "Video",
      default: null,
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "SocialComment",
      default: null,
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required : true
    },
  },
  { timestamps: true }
);

likeSchema.index({ postId: 1, likedBy: 1 }, { unique: true });

export const SocialLike = mongoose.model("SocialLike", likeSchema);
