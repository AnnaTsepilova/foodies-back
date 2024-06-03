import bcrypt from "bcrypt";
import gravatar from "gravatar";

import User from "../models/User.js";

export async function saveUser(data) {
  const hashPassword = await bcrypt.hash(data.password, 10);
  const avatarURL = gravatar.url(data.email);
  return User.create({
    ...data,
    password: hashPassword,
    avatarURL: avatarURL,
  });
}

export async function findUser(data) {
  return await User.findOne(data);
}

export async function updateUser(filter, data) {
  return await User.findOneAndUpdate(filter, data);
}
