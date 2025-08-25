import { Request, Response, NextFunction } from "express";
import AWS from "aws-sdk";
import { UserModel, User } from "../models/user.model";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";

const docClient = new AWS.DynamoDB.DocumentClient({
  endpoint: process.env["DYNAMODB_ENDPOINT"] || "http://localhost:8000",
  region: "us-east-1",
  accessKeyId: "fakeMyKeyId",
  secretAccessKey: "fakeSecretAccessKey",
});

const userModel = new UserModel(docClient);
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
      userId: uuidv4(),
      name,
      email,
      passwordHash,
      role,
      freeSessionsUsed: 0,
      createdAt: new Date().toISOString(),
    };
    await userModel.createUser(user);
    return res.status(201).json({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (err) {
    return next(err);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "Missing userId parameter" });
    }
    const user = await userModel.getUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      userId: user.userId,
      name: user.name,
      email: user.email,
      role: user.role,
      freeSessionsUsed: user.freeSessionsUsed,
      createdAt: user.createdAt,
    });
  } catch (err) {
    return next(err);
  }
};

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await userModel.getAllUsers();
    return res.json(users);
  } catch (err) {
    return next(err);
  }
};
