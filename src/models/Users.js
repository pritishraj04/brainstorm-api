import { Schema, model } from "mongoose";
import Joi from "joi";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 6,
    },
    token: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "client"],
      default: "user",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// User Validation
const passwordRegex = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,20}$/
);

export const userCreateValidation = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(passwordRegex)
    .messages({
      "string.pattern.base":
        "Password must be strong. At least one upper case alphabet, one lower case alphabet, one digit and one special character. Password length must be between 6 and 20.",

      "string.empty": "Password cannot be empty.",
      "any.required": "Password is required.",
    })
    .required(),
  role: Joi.string().valid("user", "admin", "client").optional(),
});

export const userUpdateValidation = Joi.object({
  password: Joi.string().pattern(passwordRegex).messages({
    "string.pattern.base":
      "Password must be strong. At least one upper case alphabet, one lower case alphabet, one digit and one special character. Password length must be between 6 and 20.",

    "string.empty": "Password cannot be empty.",
  }),
  role: Joi.string().valid("user", "admin", "client").optional(),
});

const User = model("User", userSchema);

export default User;
