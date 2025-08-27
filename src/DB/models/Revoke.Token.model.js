import mongoose from "mongoose";

const revokeTokenSchema = new mongoose.Schema(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    expiresIn: {type:Number, required:true},
    userId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);


export const RevokeTokenModel = mongoose.models.RevokeToken || mongoose.model("RevokeToken", revokeTokenSchema);
