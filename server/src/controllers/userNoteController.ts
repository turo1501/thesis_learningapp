import { Request, Response } from "express";
import UserNote from "../models/userNoteModel";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";

// Get all notes for a user in a specific course
export const getUserCourseNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);
  const { courseId } = req.params;

  try {
    const notes = await UserNote.scan("userId")
      .eq(userId as string)
      .and()
      .where("courseId")
      .eq(courseId)
      .exec();

    res.json({ message: "Notes retrieved successfully", data: notes });
  } catch (error) {
    console.error("Error retrieving notes:", error);
    res.status(500).json({ message: "Error retrieving notes", error });
  }
};

// Get notes for a specific chapter
export const getChapterNotes = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);
  const { courseId, sectionId, chapterId } = req.params;

  try {
    const notes = await UserNote.scan("userId")
      .eq(userId as string)
      .and()
      .where("courseId")
      .eq(courseId)
      .and()
      .where("sectionId")
      .eq(sectionId)
      .and()
      .where("chapterId")
      .eq(chapterId)
      .exec();

    res.json({ message: "Chapter notes retrieved successfully", data: notes });
  } catch (error) {
    console.error("Error retrieving chapter notes:", error);
    res.status(500).json({ message: "Error retrieving chapter notes", error });
  }
};

// Create a new note
export const createNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);
  const { courseId, sectionId, chapterId, content, color } = req.body;

  if (!content) {
    res.status(400).json({ message: "Note content is required" });
    return;
  }

  try {
    const newNote = new UserNote({
      noteId: uuidv4(),
      userId,
      courseId,
      sectionId,
      chapterId,
      content,
      color: color || "#FFFFFF",
    });

    await newNote.save();
    res.status(201).json({ message: "Note created successfully", data: newNote });
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Error creating note", error });
  }
};

// Update an existing note
export const updateNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);
  const { noteId } = req.params;
  const { content, color } = req.body;

  try {
    const note = await UserNote.get(noteId);

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    if (note.userId !== userId) {
      res.status(403).json({ message: "Not authorized to update this note" });
      return;
    }

    if (content) note.content = content;
    if (color) note.color = color;

    await note.save();
    res.json({ message: "Note updated successfully", data: note });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Error updating note", error });
  }
};

// Delete a note
export const deleteNote = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = getAuth(req);
  const { noteId } = req.params;

  try {
    const note = await UserNote.get(noteId);

    if (!note) {
      res.status(404).json({ message: "Note not found" });
      return;
    }

    if (note.userId !== userId) {
      res.status(403).json({ message: "Not authorized to delete this note" });
      return;
    }

    await UserNote.delete(noteId);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Error deleting note", error });
  }
}; 