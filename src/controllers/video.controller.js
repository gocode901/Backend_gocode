import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const filter = {};
  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }
  if (userId && isValidObjectId(userId)) {
    filter.user = new mongoose.Types.ObjectId(userId);
  }
  const sort = {};
  if (sortBy && sortType) {
    sort[sortBy] = sortType === "asc" ? 1 : -1;
  } else {
    sort.createdAt = -1; // default sort by createdAt descending
  }
  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
  };
  const videos = await Video.paginate(filter, options);

  if (!videos) {
    throw new ApiError(404, "No videos found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, "Videos fetched successfully", videos));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video

  const videoLocalPath = req.file?.path;
  if (!videoLocalPath) {
    throw new ApiError(400, "CoverImage is missing");
  }

  const videoUpload = await uploadOnCloudinary(videoLocalPath);
  if (!videoUpload.secure_url) {
    fs.unlinkSync(videoLocalPath);
    throw new ApiError(400, "Error while uploading on video on cloudinary");
  }

  const newVideo = await Video.create({
    title,
    description,
    videoUrl: videoUpload.secure_url,
    duration: videoUpload.duration,
    user: req.user.id,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, "Video published successfully", newVideo));
});

const getVideoById = asyncHandler(async (req, res) => {
  //TODO: get video by id
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const video = await Video.findById(videoId)
    .populate({
      path: "user",
      select: "username avatar", // Only expose public fields
    })
    .lean(); // Convert to plain JS object (faster)
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, "Video fetched successfully", video));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }
  const { title, description } = req.body;
  const video = await Video.findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  }
  if (title) video.title = title;
  if (description) video.description = description;
  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    if (!thumbnail?.url) {
      throw new ApiError(400, "Thumbnail upload failed");
    }
    video.thumbnail = thumbnail.url; // Save Cloudinary URL
  }
  await video.save({ validateBeforeSave: false });
  res
    .status(200)
    .json(new ApiResponse(200, "Video updated successfully", video));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
  
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const video = await Video.findByIdAndDelete(videoId);
  if (!video) {
    throw new ApiError(404, "Video not found");
  } 
  if (video.user.toString() !== req.user._id.toString()) {
  throw new ApiError(403, "Unauthorized to delete this video");
  }
    // Optionally delete from Cloudinary if you store the URL
    // if (video.videoUrl) {
    //   await deleteFromCloudinary(video.videoUrl);
    // }
    // Optionally delete from file system if you store the path
    // if (video.videoLocalPath) {
    //   fs.unlinkSync(video.videoLocalPath);
    // }




    res
        .status(200)
        .json(new ApiResponse(200, "Video deleted successfully", video));

    
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
