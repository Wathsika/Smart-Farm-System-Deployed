import express from "express";
import {
  addUserByAdmin, listUsers, getUserById, updateUserByAdmin, deleteUserByAdmin
} from "../controllers/staffOwner.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

const router = express.Router();

router.use(requireAuth, requireRole("Admin"));

router.post("/", addUserByAdmin);        // POST   /api/admin/users
router.get("/", listUsers);              // GET    /api/admin/users?q=&role=&page=&limit=
router.get("/:id", getUserById);         // GET    /api/admin/users/:id
router.patch("/:id", updateUserByAdmin); // PATCH  /api/admin/users/:id
router.delete("/:id", deleteUserByAdmin);// DELETE /api/admin/users/:id

export default router;
