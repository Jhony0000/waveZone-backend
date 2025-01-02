import mongoose, {Mongoose, Schema} from "mongoose"

const subscriptionSchema = new Schema({
    followerId: {
        type:mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required:true
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        required:true
    },
  
}, {timestamps: true});

subscriptionSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export const Subscription = mongoose.model("Subscription", subscriptionSchema)