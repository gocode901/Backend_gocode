import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    const userId = req.user._id
    const existingSubscription = await Subscription.findOne({channel: channelId, subscriber: userId})
    if (existingSubscription) {
        // If subscription exists, remove it
        await Subscription.findByIdAndDelete(existingSubscription._id)
        return res.status(200).json(new ApiResponse(200, "Unsubscribed successfully", null))
    }   
    // If subscription does not exist, create it
    const newSubscription = await Subscription.create({
        channel: channelId,
        subscriber: userId  
    })
    if (!newSubscription) {
        throw new ApiError(500, "Error creating subscription")
    }           
    res.status(201).json(new ApiResponse(201, "Subscribed successfully", newSubscription))  
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }
    const user = await User.findById(channelId)
    if (!user) {        
        throw new ApiError(404, "User not found")
    }
    const subscribers = await Subscription  
        .find({channel: channelId}) 
        .populate('subscriber', 'username avatar')
    if (!subscribers || subscribers.length === 0) {
        throw new ApiError(404, "No subscribers found for this channel")
    }
    res.status(200).json(new ApiResponse(200, "Subscribers fetched successfully", subscribers))

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber ID")
    }
    const user = await User.findById(subscriberId)
    if (!user) {        
        throw new ApiError(404, "User not found")
    }
    const subscriptions = await Subscription.find({subscriber: subscriberId})
        .populate('channel')
    if (!subscriptions || subscriptions.length === 0) {
        throw new ApiError(404, "No subscriptions found for this user")
    }
    res.status(200).json(new ApiResponse(200, "Subscribed channels fetched successfully", subscriptions))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}