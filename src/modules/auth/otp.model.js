import Mongoose from 'mongoose';
import {sendOTPEmail} from "../com/emails/email.service.js";

const OTPSchema = new Mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
    },
})

OTPSchema.pre("save", async function (next) {
    console.log("New OTP saved to database");

    // Only send an email when a new document is created
    if (this.isNew) {
        await sendOTPEmail(this.email, this.otp);
    }
    next();
});

/**
 * @typedef Token
 */
const OTP = Mongoose.model('OTP', OTPSchema);

export default OTP;