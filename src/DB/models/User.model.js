import mongoose from "mongoose";

export const genderEnum = { male: "male", female: "female" };
export const rolesEmum = { user: "user", admin: "admin" };
export const providerEnum = { system: "system", google: "google" };

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "name is too short {VALUE}"],
      maxLength: 18,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "name is too short {VALUE}"],
      maxLength: 18,
    },
    email: {
      type: String,
      unique: [true, "email must be unique {VALUE}"],
    },
    password: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },
    phone: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },
    gender: {
      type: String,
      enum: {
        values: Object.values(genderEnum),
        message: "invalid gender {VALUE}",
      },
      default: genderEnum.male,
    },
    role: {
      type: String,
      enum: {
        values: Object.values(rolesEmum),
        message: `role only allow ${Object.values(rolesEmum)}`,
      },
      default: rolesEmum.user,
    },
    provider: {
      type: String,
      enum: Object.values(providerEnum),
      default: providerEnum.system,
    },
    confirmEmail: Date,
    freezedAt: Date,
    freezedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    restoredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    picture: { secure_url: String, public_id: String },
    coverImages: [{ secure_url: String, public_id: String }],
    confirmEmailOtp: {
      type: String,
      required: function () {
        return this.provider === providerEnum.system ? true : false;
      },
    },
    forgotCode: {
      type: String,
    },
    changeCredentialsTime: Date,
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
    //needs to learn
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

userSchema
  .virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

userSchema.virtual("messages", {
  localField: "_id",
  foreignField: "receiverId",
  ref: "Message",
});

export const userModel =
  mongoose.models.User || mongoose.model("User", userSchema);

userModel.syncIndexes();
