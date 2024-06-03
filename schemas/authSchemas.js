import Joi from "joi";

import {
  emailRegexp,
  nameRegexp,
  passwordRegexp,
} from "../constants/user-constants.js";

export const authSignUpSchema = Joi.object({
  name: Joi.string().pattern(nameRegexp).required(),
  email: Joi.string().pattern(emailRegexp).required(),
  password: Joi.string().min(6).pattern(passwordRegexp).required(),
});

export const authSignInSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
});

export const authEmailSchema = Joi.object({
  email: Joi.string().pattern(emailRegexp).required(),
});
