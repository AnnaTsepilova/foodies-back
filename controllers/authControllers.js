import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import { findUser, saveUser, updateUser } from "../services/authServices.js";
import ctrlWrapper from "../decorators/ctrlWrapper.js";
import HttpError from "../helpers/HttpError.js";
import compareHash from "../helpers/compareHash.js";
import { createToken } from "../helpers/jwt.js";

const avatarPath = path.resolve("public", "avatars");

const signUp = async (req, res) => {
  const { email } = req.body;
  const user = await findUser({ email });

  if (user) {
    throw HttpError(409, `Email ${email} in use`);
  }
  const newUser = await saveUser(req.body);

  res.status(201).json({
    user: { id: newUser._id, name: newUser.name, email: newUser.email },
  });
};

const signIn = async (req, res) => {
  const { email, password } = req.body;
  const user = await findUser({ email });

  if (!user) {
    throw HttpError(401, "Email or password is wrong");
  }

  const comparePassword = await compareHash(password, user.password);

  if (!comparePassword) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;
  const payload = { id };

  const token = createToken(payload);
  await updateUser({ _id: id }, { token });

  res.status(200).json({
    token: token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

const signOut = async (req, res) => {
  const { _id } = req.user;
  const user = await findUser(_id);

  if (!user) {
    throw HttpError(401, "Not authorized");
  }

  await updateUser({ _id }, { token: null });

  res.status(204).json();
};

const getCurrentUser = async (req, res) => {
  const { name, email } = req.user;

  res.json({ name, email });
};

const updateAvatar = async (req, res) => {
  const { _id } = req.user;

  if (!req.file) {
    throw HttpError(400, "Please upload a file");
  }

  const { path: oldPath, filename } = req.file;

  const newPath = path.join(avatarPath, filename);
  await fs.rename(oldPath, newPath);
  await imgResize(newPath);
  const avatarURL = path.join("avatars", filename);

  const result = await updateUser({ _id }, { avatarURL: avatarURL });
  if (!result) {
    throw HttpError(401, "Not authorized");
  }
  return res.status(200).json({ avatarURL: avatarURL });
};

const getUserById = async (req, res) => {
  const user = req.user;
  const { _id: requestId } = req.params;

  if (user._id === requestId) {
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarURL: user.avatarURL,
        followers: user.followers,
        following: user.following,
      },
    });
  } else {
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatarURL: user.avatarURL,
        following: user.following,
      },
    });
  }
};

export default {
  signUp: ctrlWrapper(signUp),
  signIn: ctrlWrapper(signIn),
  getCurrentUser: ctrlWrapper(getCurrentUser),
  signOut: ctrlWrapper(signOut),
  updateAvatar: ctrlWrapper(updateAvatar),
  getUserById: ctrlWrapper(getUserById),
};
