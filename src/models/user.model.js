import mongoose, { Schema } from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        minlength: 3,
        index: true // for optimised searching purpose
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    fullname: {
        type: String,
        required: true,
        index: true,
        trim: true,

    },
    avatar:{
        type:string , // cloudinary url
        required: true,
    },
    coverImage:{
        type:string , // cloudinary url
    },
     watchHistory:[
        {
            type: Schema.Types.ObjectId,
            ref: "Video",
        }
     ],
    password: {
        type: String,
        required:[true, "Password is required"],
        minlength: 6
    },
    refreshToken:{

    }
}, {timestamps: true});

userSchema.pre("save", async function(next){
    if(!this.password(this.isModified)) return next()
    this.password= bcrypt.hash(this.password, 10) 
    next()
} )

userSchema.methods.isPasswordCorrect= async function(password){
    return await bcrypt.compare(password,this.password)
}

userSchema.methods.generateAccessToken=function(){   
    return jwt.sign({
            _id: this._id,
            email:this.email,
            username:this.username,
            fullname: this.fullname,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRATION
        }
    )
}

userSchema.methods.generateRefreshToken=function(){
    return jwt.sign({
            _id: this._id,
            },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRATION
        }
    )
}

export const User = mongoose.model("User", userSchema);