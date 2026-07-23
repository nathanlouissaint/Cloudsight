import { Router } from "express";
import {
  createNote,
  exportCsv,
  getExecutiveReport,
  getNotes,
  removeNote,
  updateNote,
} from "../controllers/reports.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticateToken, getExecutiveReport);

router.get("/export/csv", authenticateToken, exportCsv);

router.get("/notes", authenticateToken, getNotes);
router.post("/notes", authenticateToken, createNote);
router.put("/notes/:id", authenticateToken, updateNote);
router.delete("/notes/:id", authenticateToken, removeNote);

export default router;