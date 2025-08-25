
import { Router, Request, Response } from "express";
import { createUser, getAllUsers, getUserById, } from "../controllers/user.controller";

const router = Router();

router.get("/", getAllUsers);
router.get("/:userId", getUserById);
router.post("/", createUser);


export default router;