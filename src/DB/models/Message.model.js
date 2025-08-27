import mongoose from "mongoose";

export const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      minLength: 2,
      maxLength: 10000,
      required: function () {
        return this.attachments?.length > 0 ? false : true;
      },
    },
    attachments: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const MessageModel =
  mongoose.models.Message || mongoose.model("Message", messageSchema);
