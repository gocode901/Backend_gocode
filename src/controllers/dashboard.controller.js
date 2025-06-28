import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const {channelId} = req.params
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }       
    const channelVideos = await Video.find({user: channelId})
    if (!channelVideos || channelVideos.length === 0) {
        throw new ApiError(404, "No videos found for this channel")
    }
    const totalViews = channelVideos.reduce((acc, video) => acc + video.views, 0)
    const totalSubscribers = await Subscription.countDocuments({channel: channelId})
    const totalVideos = channelVideos.length
    const totalLikes = await Like.countDocuments({video: {$in: channelVideos.map(video => video._id)}})     
    res.status(200).json(new ApiResponse(200, "Channel stats fetched successfully", {
        totalViews,
        totalSubscribers,
        totalVideos,
        totalLikes
    })) 
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const {channelId} = req.params
    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    const channelVideos = await Video.find({user: channelId}).populate('user', 'username avatar').sort({createdAt: -1}).lean()
    if (!channelVideos || channelVideos.length === 0) {
        throw new ApiError(404, "No videos found for this channel")
    }
    res.status(200).json(new ApiResponse(200, "Channel videos fetched successfully", channelVideos))            
        
})

export {
    getChannelStats, 
    getChannelVideos
    }