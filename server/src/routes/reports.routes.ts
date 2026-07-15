import { Router } from "express";
import {
  createNote,
  exportCsv,
  getExecutiveReport,
  getNotes,
  removeNote,
  updateNote,
} from "../controllers/reports.controller";

const router = Router();

router.get("/", getExecutiveReport);

router.get("/export/csv", exportCsv);

router.get("/notes", getNotes);
router.post("/notes", createNote);
router.put("/notes/:id", updateNote);
router.delete("/notes/:id", removeNote);

export default router;