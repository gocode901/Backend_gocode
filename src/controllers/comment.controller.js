import mongoose  from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        sort: {createdAt: -1}
    }   
    const comments = await Comment.paginate({video: videoId}, options)
    if (!comments || comments.length === 0) {
        throw new ApiError(404, "No comments found for this video")
    }
    res.status(200).json(new ApiResponse(200, "Comments fetched successfully", comments
    ))

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    if (!mongoose.isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video ID")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }
    const newComment = await Comment.create({
        video: videoId,
        user: req.user._id, // assuming user is authenticated and req.user is set
        content: content.trim() 
    })
    if (!newComment) {
        throw new ApiError(500, "Error creating comment")
    }
    res.status(201).json(new ApiResponse(201, "Comment added successfully", newComment))    

})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
    const {content} = req.body
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    if (!content || content.trim() === "") {
        throw new ApiError(400, "Comment content is required")
    }
    const updatedComment = await Comment.findByIdAndUpdate(commentId, 
        {content: content.trim()},
        {new: true, runValidators: true}
    )
    if (!updatedComment) {
        throw new ApiError(404, "Comment not found")
    }
    res.status(200).json(new ApiResponse(200, "Comment updated successfully", updatedComment))  
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId} = req.params
    if (!mongoose.isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment ID")
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId)
    if (!deletedComment) {
        throw new ApiError(404, "Comment not found")
    }
    res.status(200).json(new ApiResponse(200, "Comment deleted successfully", deletedComment))  
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
