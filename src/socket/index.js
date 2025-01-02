// socket.js
import { Server } from 'socket.io';
// import { postComment } from './commentHandler.js'; // Import comment handler
import { sendNotification } from '../controllers/notification.controllers.js'; // Import notification handler
import {Message} from '../models/message.models.js'
import {SocialComment} from '../models/VideoComment/comment.models.js'
import {SocialLike} from '../models/like/like.models.js'
import { Video } from '../models/video.models.js';
import { Blog } from '../models/blog.modles.js';
import { Subscription } from '../models/Subscription.models.js';

let io;
const onlineUsers = new Map(); 
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:5173', // Frontend URL
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A new user connected:', socket.id);

    // User goes online
    socket.on('userOnline', (userId) => {
      onlineUsers.set(userId, socket.id); // Add user to online users map
      io.emit('userOnline', Array.from(onlineUsers.keys())); // Emit updated list to all clients
      console.log(`User online: ${userId}`);
    });

    // User disconnects
    socket.on('disconnect', () => {
      const userId = [...onlineUsers.entries()].find(([, id]) => id === socket.id)?.[0];
      if (userId) {
        onlineUsers.delete(userId); // Remove user from online users map
        io.emit('userOnline', Array.from(onlineUsers.keys())); // Emit updated list to all clients
        console.log(`User offline: ${userId}`);
      }
    });

    socket.on('joinRoom', (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });
    


  // Backend - Socket.IO (Node.js)
  socket.on("sendMessage", async (message) => {
    try {
        const savedMessage = new Message({
            chat: message.chatId,
            sendId: message.sendId,
            createId: message.createId,
            content: message.content,
            media: message.media || null,
        });

        await savedMessage.save();

        io.to(message.chatId).emit("receiveMessage", {
            ...savedMessage.toObject(),
            createId: savedMessage.createId.toString(), // Ensure consistency
            _id: savedMessage._id,
        });
    } catch (error) {
        console.error("Error saving message:", error);
    }
});

  // message senby event 
  // socket.on("messageSeen", async ({ chatId, userId }) => {
  //   try {
  //     const messages = await Message.find({ chat: chatId });
  
  //     for (const message of messages) {
  //       if (!message.seenBy.includes(userId)) {
  //         message.seenBy.push(userId);  // Add userId if not already present
  //         await message.save();
  //       }
  //     }
  
  //     const updatedMessages = await Message.find({ chat: chatId })
  //       .populate("seenBy", " avatar ")  // Populating seenBy to get avatar and name
  //     // Optionally populate message creator info
  
  //     io.to(chatId).emit("messageSeenUpdate", updatedMessages);  // Emit updated messages to clients
  //   } catch (error) {
  //     console.error("Error updating seen status:", error);
  //   }
  // });
  


// Typing event
// On the backend, listen for typing events

socket.on('typing', (chatId, userId) => {
  socket.to(chatId).emit('typing', userId); // Emit typing status to the room
});

socket.on('stopTyping', (chatId, userId) => {
  socket.to(chatId).emit('stopTyping', userId); // Emit stop typing status to the room
});

    // Listen for new comments and handle them
socket.on('postComment', async (commentData) => {
            try {
              const saveComment = new SocialComment({
                content:commentData.content,
                postId:commentData.videoId,
                author:commentData.userId
              })
             
              await saveComment.save();

                // Populate the author field to include user details
               const populatedComment = await SocialComment.findById(saveComment._id).populate('author', 'userName avatar');

              // Emit the fully populated comment to the room
              io.to(commentData.videoId).emit('receiveComment', populatedComment);
            } catch (error) {
              console.log('saving comment error in mogodb',error)
            }
    });

    socket.on('like', async ({ postId, userId }) => {
      console.log(`Like event received for video postId: ${postId}, userId: ${userId}`);
      try {
          const existingLike = await SocialLike.findOne({ likedBy: userId, postId });
  
          if (existingLike) {
              // Unlike the video
              await existingLike.deleteOne();
              console.log(`Video ${postId} unliked by ${userId}`);
  
              // Remove userId from the likedBy array in the Video document
              await Video.updateOne(
                  { _id: postId },
                  { $pull: { likedBy: userId } }
              );
          } else {
              // Like the video
              const newLike = new SocialLike({ likedBy: userId, postId });
              await newLike.save();
              console.log(`Video ${postId} liked by ${userId}`);
  
              // Add userId to the likedBy array in the Video document
              await Video.updateOne(
                  { _id: postId },
                  { $addToSet: { likedBy: userId } }
              );
          }
  
          // Dynamically calculate the like count
          const likeCount = await SocialLike.countDocuments({ postId });
          const likedByUsers = await SocialLike.find({ postId }).select('likedBy');
  
          // Broadcast updated like data to other users in the room
          socket.broadcast.to(postId).emit('likeUpdate', {
              postId,
              likeCount,
              likedBy: likedByUsers.map((like) => like.likedBy.toString()),
          });
          console.log("Emitting likeUpdate event:", { postId, likeCount });
          console.log(`Updated likeCount for video postId: ${postId}: ${likeCount}`);
      } catch (error) {
          console.error('Error handling video like action:', error);
      }
  });
  
    
    
    
       
// blog like update 
 // socket.on('like', async ({ postId, userId }) => {
    //   try {
    //     const existingLike = await SocialLike.findOne({ likedBy: userId, postId });
    
    //     if (existingLike) {
    //       // Unlike
    //       await existingLike.deleteOne();
    //       await Blog.findByIdAndUpdate(postId, { $inc: { likeCount: -1 } });
    //     } else {
    //       // Like
    //       const newLike = new SocialLike({ likedBy: userId, postId });
    //       await newLike.save();
    //       await Blog.findByIdAndUpdate(postId, { $inc: { likeCount: 1 } });
    //     }
    
    //     // Emit the updated likeCount and likedBy list to clients
    //     const updatedBlog = await Blog.findById(postId).populate('likedBy', '_id');
    //     io.to(postId).emit('likeUpdate', {
    //       postId,
    //       likeCount: updatedBlog.likeCount,
    //       likedBy: updatedBlog.likedBy.map((user) => user._id),
    //     });
    //   } catch (error) {
    //     console.error('Error handling like:', error);
    //   }
    // });

socket.on("toggleFollow", async ({ followerId, followingId }) => {
      try {
        const subscription = await Subscription.findOne({ followerId, followingId });
    
        if (subscription) {
          // Unfollow
          await Subscription.deleteOne({ followerId, followingId });
        } else {
          // Follow
          await Subscription.create({ followerId, followingId });
        }
    
        const followersCount = await Subscription.countDocuments({ followingId });
        const followingCount = await Subscription.countDocuments({ followerId });
    
        io.to(followingId).emit("followStatusChanged", {
          followerId,
          followingId,
          isFollowers: !subscription,
          followersCount,
          followingCount,
        });
      } catch (error) {
        console.error("Error toggling follow:", error);
      }
});
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};

export const getIO = () => io;
