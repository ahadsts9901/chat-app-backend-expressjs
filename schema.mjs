import mongoose, { Schema } from "mongoose";

export const emailPattern = /^[a-zA-Z0-9!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/; // RFC 822 email specification
export const passwordPattern = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,100}$/;
export const otpPattern = /^[0-9]{6}$/;
export const profilePicturePattern = /^https:\/\/[^\s\/$.?#].[^\s]*$/;
export const firstNamePattern = /^[a-zA-Z0-9 !@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{2,15}$/;
export const lastNamePattern = /^[a-zA-Z0-9 !@#$%^&*()_+{}\[\]:;<>,.?~\\/-]{2,15}$/;
export const initialSessionInDays = 15;
export const extendedSessionInDays = 30;

// user schema
let userSchema = new Schema({
    profilePhoto: {
        type: String,
        default: null,
        maxlength: 1000,
        match: profilePicturePattern
    },
    firstName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 15,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 2,
        maxlength: 15,
        trim: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        minlength: 3,
        maxlength: 100,
        trim: true,
        match: emailPattern
    },
    password: {
        type: String,
        required: true,
    },
    createdOn: {
        type: Date,
        default: Date.now
    }
});

userSchema.pre('save', function (next) {
    if (this?.email) {
        this.email = this?.email?.toLowerCase();
    }
    next();
});

export const userModel = mongoose.model("users", userSchema);

// chat schema
let chatSchema = new Schema({
    message: {
        type: String,
        required: true,
        trim: true,
    },
    from_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    to_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    fileUrl: {
        type: String,
        default: null,
        trim: true,
    },
    fileType: {
        type: String,
        default: null,
        trim: true,
    }
})

export const chatModel = mongoose.model("chat", chatSchema);