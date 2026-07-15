import { useEffect, useState } from "react";
import {
  createReportNote,
  getReportNotes,
  type ReportNote,
} from "../../api/report";

import "./ExecutiveNotes.css";

export default function ExecutiveNotes() {
  const [notes, setNotes] = useState<ReportNote[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadNotes() {
    try {
      const data = await getReportNotes();
      setNotes(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      return;
    }

    try {
      setSaving(true);

      await createReportNote(
        title,
        content
      );

      setTitle("");
      setContent("");

      await loadNotes();
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="executive-notes">
      <h2>Brief summary of your review</h2>

      <p>
        Record significant cost drivers, budget concerns, optimization 
        opportunities, stakeholder decisions, approvals, or follow-up actions.
      </p>

      <input
        value={title}
        onChange={(e) =>
          setTitle(e.target.value)
        }
        placeholder="Title"
      />

      <textarea
        rows={6}
        value={content}
        onChange={(e) =>
          setContent(e.target.value)
        }
        placeholder="Example: EC2 compute costs increased after the production deployment. Evaluate Reserved Instances and rightsizing opportunities before next month's billing cycle."
      />

      <button
        onClick={handleSave}
        disabled={saving}
      >
        {saving
          ? "Saving..."
          : "Save Review"}
      </button>

      <div className="notes-list">
        {notes.map((note) => (
          <div
            key={note.id}
            className="note-card"
          >
            <h3>{note.title}</h3>

            <p>{note.content}</p>

            <small>
              {new Date(
                note.createdAt
              ).toLocaleString()}
            </small>
          </div>
        ))}
      </div>
    </section>
  );
}