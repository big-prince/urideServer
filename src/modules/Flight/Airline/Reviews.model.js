import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true, 
      unique: true 
    },
    airline: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Airline", 
      required: true 
    },
    rating: { 
      type: Number, 
      required: true, 
      min: 1, 
      max: 5 
    }, 
    review: { 
      type: String, 
      required: true, 
      trim: true 
    },
  },
  { timestamps: true } 
);

export default mongoose.model("Review", ReviewSchema);
