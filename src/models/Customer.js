import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import Joi from "joi";

const customerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    addresses: [
      {
        label: { type: String, required: true }, // E.g., "Home", "Work", etc.
        street: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false },
      },
    ],
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    token: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

customerSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

customerSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const passwordRegex = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,20}$/
);

export const createCustomerValidation = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(10).required(),
  password: Joi.string()
    .pattern(passwordRegex)
    .messages({
      "string.pattern.base":
        "Password must be strong. At least one upper case alphabet, one lower case alphabet, one digit and one special character. Password length must be between 6 and 20.",

      "string.empty": "Password cannot be empty.",
      "any.required": "Password is required.",
    })
    .required(),
});
export const updateCustomerValidation = Joi.object({
  name: Joi.string().min(3).max(30),
  phone: Joi.string().min(10),
  password: Joi.string().pattern(passwordRegex).messages({
    "string.pattern.base":
      "Password must be strong. At least one upper case alphabet, one lower case alphabet, one digit and one special character. Password length must be between 6 and 20.",

    "string.empty": "Password cannot be empty.",
    "any.required": "Password is required.",
  }),
});
export const createAddressValidation = Joi.object({
  label: Joi.string().required(),
  street: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  postalCode: Joi.string().required(),
  country: Joi.string().required(),
  isDefault: Joi.boolean().default(false),
});
export const updateAddressValidation = Joi.object({
  label: Joi.string(),
  street: Joi.string(),
  city: Joi.string(),
  state: Joi.string(),
  postalCode: Joi.string(),
  country: Joi.string(),
  isDefault: Joi.boolean(),
});

const Customer = model("Customer", customerSchema);

export default Customer;
