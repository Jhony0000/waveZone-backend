import { uplodOnCloudNary } from "../utils/cloudNary.js";
import { asynchandeler } from "../utils/asyncHandeler.js";
import { apiError } from "../utils/apiErorr.js";
import { apiResponse } from "../utils/apiResponse.js";
import { User } from "../models/users.models.js";
import { Blog } from "../models/blog.modles.js";
import mongoose from "mongoose";



const uplodBlog = asynchandeler(async(req,res) => {
    const {title,content,userId} = req.body
    const {} = req.query
    const ImageFile = req.file?.path

    if(!title || !content){
        throw new apiError(400,'title and content must be requerd  must required')
    }

    if(!userId){
        throw new apiError(403,'userId not found something went wrong')
    }

    if(!ImageFile){
        throw new apiError(400,'img must be required')
    }

      console.log('img url',ImageFile)

    const Image = await uplodOnCloudNary(ImageFile);
      if (Image) {
          console.log("Uploaded file URL:", Image.url);
      } else {
    console.error("Failed to upload file to Cloudinary.");
     }
    const blog = await new Blog({
       content:content,
       Image:Image.url,
       owner:userId,
       title:title
    }).populate('owner','avatar FulName  userName')
    await blog.save({validateBeforeSave:false});
     
    // console.log('video',video)

    return res
    .status(200)
    .json(new apiResponse(200,{},'blog uplod successfully'))
})

const getBlogFeed = async (req, res) => {
    const { page = 1, limit = 10, userId } = req.query;

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Convert to integer
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const skip = (pageNumber - 1) * limitNumber;

        // Define sorting criteria: sort by views, comments, and createdAt (oldest first)
        const sortCriteria = [
            ['Views', -1], // Sort by views in descending order
            ['commentsCount', -1], // Sort by number of comments in descending order
            ['createdAt', 1], // Sort by creation date (oldest first)
        ];

        // Query to fetch blogs with pagination, sorting, and populated author data
        const blogs = await Blog.find()
            .skip(skip)
            .limit(limitNumber)
            .sort(Object.fromEntries(sortCriteria))  // Sort by views, comments, and createdAt
            .populate('owner', 'FulName avatar userName');  // Populate the author information (FullName and avatar)

        // Get total count for pagination

        const blogIds = blogs.map((blog) => blog._id)
        const aggregatedData = await Blog.aggregate([
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
      

      const aggregatedMap = Object.fromEntries(
        aggregatedData.map(data => [data._id.toString(), data])
    );

    const enrichedBlogs = blogs.map(blog => {
        const aggregation = aggregatedMap[blog._id.toString()] || {};
        return {
            ...blog.toObject(),
            commentsCount: aggregation.commentsCount || 0,
            likeCount: aggregation.likeCount || 0,
        };
    });

        const totalBlogs = await Blog.countDocuments();

        // Calculate total pages
        const totalPages = Math.ceil(totalBlogs / limitNumber);

        return res.status(200).json(new apiResponse(200,{
            data: enrichedBlogs,
            pagination: {
                currentPage: pageNumber,
                totalPages,
                totalBlogs,
                limit: limitNumber
            }
        },'blog feched successFully'));
    } catch (error) {
        console.error('Error fetching blog feed:', error);
        return res.status(500).json({ message: 'Server error', error });
    }
};


const updateBlog = asynchandeler(async(req,res) => {
    const {title} = req.body
    const {id} = req.query
     
    console.log(title)
    if(!id){
        throw new apiError('blog id not found')
    }

    if(!title){
        throw new apiError(400,'title must be required')
    }

    const blog = await Blog.findById(id)

    if(!blog){
        throw new apiError(500,'video not found')
    }

    if(title !== undefined) blog.title = title

    await blog.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(new apiResponse(200,blog, 'video update successfully'))
    
})

const deleteBlog = asynchandeler(async(req,res) => {
    const {blogId} = req.body
    console.log('video ID',blogId)
    if(!blogId){
        throw new apiError(500,'blog id not found')
    }

  const blog =  await Blog.findByIdAndDelete(blogId)
  
  if(!blog){
    throw new apiError(500,'video not found')
  }

  return res
  .status(200)
  .json(new apiResponse(200,{},'blog delete successfully'))
})

const getUserBlog = asynchandeler(async(req,res) => {
    const {userId} = req.query
    console.log('userID',userId)
 
    if(!userId){
        throw new apiError(500,'ownerID not found')
    }

    const blog = await Blog.find({owner:userId}).populate("owner").sort({ createdAt: -1 });
    // const userVideo = await Video.findById(video._id).select('-password -refreshToken')
    // console.log('videos',Blog)
    if(!blog){
        throw new apiError(402,'No Blog avaleable')
    }

    const blogIds = blog.map((blog) => blog._id)
    const aggregatedData = await Blog.aggregate([
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
  

  const aggregatedMap = Object.fromEntries(
    aggregatedData.map(data => [data._id.toString(), data])
);

const enrichedBlogs = blog.map(blog => {
    const aggregation = aggregatedMap[blog._id.toString()] || {};
    return {
        ...blog.toObject(),
        commentsCount: aggregation.commentsCount || 0,
        likeCount: aggregation.likeCount || 0,
    };
});


    return res
    .status(200)
    .json(new apiResponse(200,{data:enrichedBlogs},'Blog fached successsfully'))
})
// Inside blog.controllers.js
const updateBlogViews = async (req, res) => {
    const { blogId } = req.body;
    const userId = req.user?._id; // Ensure the user is authenticated
  
    try {
      console.log("Incoming Request:", { blogId, userId }); // Debug logs
  
      // Use findById to fetch the blog first
      const blog = await Blog.findById(blogId);
  
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      console.log("Initial Blog Data:", blog);
  
      // Check if userId is already in the viewedBy array
      if (userId && !blog.viewedBy.includes(userId.toString())) {
        // Use findByIdAndUpdate for atomic operations
        const updatedBlog = await Blog.findByIdAndUpdate(
          blogId,
          {
            $inc: { Views: 1 }, // Increment the view count
            $push: { viewedBy: userId.toString() }, // Add userId to viewedBy array
          },
          { new: true } // Return the updated document
        );
  
        console.log("Updated Blog Data:", updatedBlog);
  
        return res.status(200).json({
          message: "View count updated successfully",
          views: updatedBlog.Views,
        });
      } else {
        console.log("User has already viewed this blog.");
        return res.status(200).json({
          message: "User has already viewed this blog.",
          views: blog.Views,
        });
      }
    } catch (error) {
      console.error("Error updating blog views:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
  
  const searchUserBlog = asynchandeler(async(req,res) => {
    const {title} = req.body

    if(!title){
        throw new apiError(400,'title not found');
    }

    const blogs = await Blog.find({title:{$regex: title, $options: 'i' }});

    if(!videos){
        return res
        .status(200)
        .json(new apiResponse(200,blogs,'video search successfully'))
    }

    return res
    .status(200)
    .json(new apiResponse(200,blogs,'video search successfully'))
}) 

const getBlog = asynchandeler(async (req, res) => {
    const { blogId } = req.body;
  
    if (!blogId) {
      throw new apiError(403, 'Video ID not found');
    }
    // Fetch the video from the Video collection
    const blog = await Blog.findOne({ _id: blogId });
  
    if (!blog) {
      throw new apiError(500, 'Video not found');
    }
            // Perform aggregation for comments and likes
            const aggregatedData = await Blog.aggregate([
                {
                    // Match the video by its ID
                    $match: { _id: new mongoose.Types.ObjectId(blogId) },
                },
                {
                    // Look up comments related to this video
                    $lookup: {
                        from: 'socialcomments',
                        let: { blogId: '$_id' }, // Reference the video ID
                        pipeline: [
                            {
                                $match: { 
                                    $expr: { 
                                        $eq: ['$postId', '$$blogId'] // Match postId from comments to videoId
                                    }
                                }
                            }
                        ],
                        as: 'Comments' // Store the matched comments as 'Comments'
                    }
                },
                {
                    // Look up likes related to this video
                    $lookup: {
                        from: 'sociallikes',
                        let: { blogId: '$_id' }, // Reference the video ID
                        pipeline: [
                            {
                                $match: { 
                                    $expr: { 
                                        $eq: ['$postId', '$$blogId'] // Match postId from likes to videoId
                                    }
                                }
                            }
                        ],
                        as: 'Likes' // Store the matched likes as 'Likes'
                    }
                },
                {
                    // Add fields for comment and like counts
                    $addFields: {
                        commentsCount: { $size: '$Comments' }, // Count the number of comments
                        likeCount: { $size: '$Likes' }, // Count the number of likes
                    }
                },
                {
                    // Project only relevant fields
                    $project: {
                        _id: 1,
                        title: 1,
                        views: 1,
                        commentsCount: 1,
                        likeCount: 1,
                        createdAt: 1,
                    }
                }
            ]);
    // If no aggregated data is found
    if (!aggregatedData || aggregatedData.length === 0) {
      throw new apiError(500, 'Something went wrong when fetching blog data');
    }
  
    // Return the video data with comments and likes count
    return res
      .status(200)
      .json(new apiResponse(200, aggregatedData[0], 'Video fetched successfully'));
  }); 
  
export {uplodBlog,updateBlog,deleteBlog,getUserBlog,getBlogFeed,updateBlogViews,searchUserBlog,getBlog}