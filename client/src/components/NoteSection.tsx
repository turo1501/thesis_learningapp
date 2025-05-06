"use client";

import { useState, useRef, useEffect } from "react";
import { Edit, Plus, Save, Trash2, X, Brain, Sparkles, ChevronsUpDown, Info, Search, Tag, Filter, MoreHorizontal, Loader2, Smile, Star, Lightbulb, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  useGetChapterNotesQuery,
  useCreateNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
  useCreateDeckMutation,
  useAddCardMutation,
  UserNote,
} from "@/state/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import Link from "next/link";

interface NoteSectionProps {
  courseId: string;
  sectionId: string;
  chapterId: string;
}

const COLORS = [
  "#FFFFFF", // White
  "#FFEDD5", // Orange pastel
  "#FEF3C7", // Yellow pastel
  "#D1FAE5", // Green pastel
  "#DBEAFE", // Blue pastel
  "#EDE9FE", // Purple pastel
  "#FCE7F3", // Pink pastel
];

interface EditingNoteState {
  id: string | null;
  content: string;
  color: string;
}

interface FlashcardCreationState {
  noteId: string | null;
  question: string;
  answer: string;
  deckTitle: string;
  deckId?: string;
  isAIGenerated?: boolean;
}

const REACTIONS = [
  { emoji: "👍", name: "thumbs_up" },
  { emoji: "💡", name: "insight" },
  { emoji: "⭐", name: "important" },
  { emoji: "🔖", name: "bookmark" },
];

const NoteSection = ({ courseId, sectionId, chapterId }: NoteSectionProps) => {
  const { userId, isSignedIn } = useCurrentUser();
  const [newNoteOpen, setNewNoteOpen] = useState(false);
  const [newNoteContent, setNewNoteContent] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [editingNote, setEditingNote] = useState<EditingNoteState>({
    id: null,
    content: "",
    color: COLORS[0],
  });
  const [flashcardCreation, setFlashcardCreation] = useState<FlashcardCreationState>({
    noteId: null,
    question: "",
    answer: "",
    deckTitle: `Notes from ${courseId}`,
  });
  const [isFlashcardDialogOpen, setIsFlashcardDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "content">("newest");
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, Record<string, number>>>({});
  
  const {
    data: notes = [],
    isLoading,
    error,
  } = useGetChapterNotesQuery({ courseId, sectionId, chapterId });

  const [createNote, { isLoading: isCreating }] = useCreateNoteMutation();
  const [updateNote, { isLoading: isUpdating }] = useUpdateNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();
  const [createDeck, { isLoading: isCreatingDeck }] = useCreateDeckMutation();
  const [addCard, { isLoading: isAddingCard }] = useAddCardMutation();

  const handleCreateNote = async () => {
    if (!newNoteContent.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    try {
      await createNote({
        courseId,
        sectionId,
        chapterId,
        content: newNoteContent,
        color: selectedColor,
      }).unwrap();
      
      setNewNoteContent("");
      setSelectedColor(COLORS[0]);
      setNewNoteOpen(false);
      toast.success("Note created successfully");
    } catch (error) {
      console.error("Failed to create note:", error);
      toast.error("Failed to create note. Please try again.");
    }
  };

  const handleUpdateNote = async () => {
    if (!editingNote.id) return;
    if (!editingNote.content.trim()) {
      toast.error("Note content cannot be empty");
      return;
    }

    try {
      await updateNote({
        noteId: editingNote.id,
        content: editingNote.content,
        color: editingNote.color,
      }).unwrap();
      
      setEditingNote({ id: null, content: "", color: COLORS[0] });
      toast.success("Note updated successfully");
    } catch (error) {
      console.error("Failed to update note:", error);
      toast.error("Failed to update note. Please try again.");
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        await deleteNote({ noteId }).unwrap();
        toast.success("Note deleted successfully");
      } catch (error) {
        console.error("Failed to delete note:", error);
        toast.error("Failed to delete note. Please try again.");
      }
    }
  };

  const startEditing = (note: UserNote) => {
    setEditingNote({
      id: note.noteId,
      content: note.content,
      color: note.color,
    });
  };

  const cancelEditing = () => {
    setEditingNote({ id: null, content: "", color: COLORS[0] });
  };

  const openFlashcardDialog = (note: UserNote) => {
    // Generate a question from the note content using simple AI logic
    // (In a real app, you might use a more sophisticated AI approach)
    const defaultQuestion = generateQuestionFromNote(note.content);
    
    setFlashcardCreation({
      noteId: note.noteId,
      question: defaultQuestion,
      answer: note.content,
      deckTitle: `Notes from ${courseId}`,
    });
    
    setIsFlashcardDialogOpen(true);
  };

  const generateQuestionFromNote = (content: string): string => {
    // Simple question generation logic - in a real app, this would use actual AI
    const trimmedContent = content.trim();
    
    // If content has a question mark, use the first sentence as the question
    if (trimmedContent.includes("?")) {
      const questionPart = trimmedContent.split("?")[0] + "?";
      if (questionPart.length > 10) {
        return questionPart;
      }
    }
    
    // Default approach: convert first sentence to question
    const firstSentence = trimmedContent.split(/[.!?]/, 1)[0];
    if (firstSentence.length > 5) {
      // For simple conversion, add "What is" to the beginning if not already a question
      return `What is meant by "${firstSentence.substring(0, 50)}${firstSentence.length > 50 ? '...' : ''}"?`;
    }
    
    return "What does this note explain?";
  };

  const handleCreateFlashcard = async () => {
    if (!userId) {
      toast.error("You must be signed in to create flashcards");
      return;
    }

    if (!flashcardCreation.question.trim() || !flashcardCreation.answer.trim()) {
      toast.error("Question and answer cannot be empty");
      return;
    }

    try {
      // First create a new deck
      console.log(`Creating deck with userId: ${userId}, courseId: ${courseId}`);
      
      const newDeck = await createDeck({
        userId: userId,
        courseId,
        title: flashcardCreation.deckTitle || `Notes from ${courseId}`,
        description: "Deck created from course notes",
      }).unwrap();
      
      if (!newDeck || !newDeck.deckId) {
        console.error("Failed to create deck: Invalid response", newDeck);
        toast.error("Error creating flashcard deck");
        return;
      }
      
      console.log("Deck created successfully:", newDeck);
      const deckId = newDeck.deckId;
      
      if (!deckId) {
        toast.error("Failed to create deck: Missing deck ID");
        return;
      }
      
      // Now add the card to the newly created deck
      console.log(`Adding card to deck ${deckId} for user ${userId}`);
      await addCard({
        userId: userId,
        deckId: deckId,
        question: flashcardCreation.question,
        answer: flashcardCreation.answer,
        sectionId,
        chapterId,
        difficultyLevel: 3,
        lastReviewed: Date.now(),
        nextReviewDue: Date.now() + 24 * 60 * 60 * 1000, // 24 hours from now
        repetitionCount: 0,
        correctCount: 0,
        incorrectCount: 0,
      }).unwrap();
      
      // Success message and reset state
      setIsFlashcardDialogOpen(false);
      setFlashcardCreation({
        noteId: null,
        question: "",
        answer: "",
        deckTitle: `Notes from ${courseId}`,
      });
      
      // Show success message with link to memory cards page
      toast.success(
        <div className="flex flex-col space-y-1">
          <span>Flashcard created successfully!</span>
          <Link 
            href={`/user/memory-cards/${deckId}`}
            className="text-xs underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            View in Memory Cards →
          </Link>
        </div>
      );
      
    } catch (error: any) {
      console.error("Failed to create flashcard:", error);
      
      // Enhanced error reporting
      if (error.status === 403) {
        toast.error("Authorization error: You don't have permission to create flashcards");
      } else if (error.status === 404) {
        toast.error("Error: Couldn't find the deck. Please try again.");
      } else if (error.data?.message) {
        toast.error(`Error: ${error.data.message}`);
      } else {
        toast.error("Failed to create flashcard. Please try again.");
      }
    }
  };

  // Function to handle AI-powered suggestion for question
  const generateAIQuestion = async () => {
    try {
      // Show loading state
      toast.promise(
        new Promise(resolve => {
          // Simulate AI thinking process
          setTimeout(() => {
            // Generate multiple AI questions based on the answer content
            const answerText = flashcardCreation.answer.trim();
            
            // Extract keywords and concepts from the answer
            const keywords = answerText.split(/\s+/)
              .filter(word => word.length > 4)
              .filter(word => !['about', 'these', 'those', 'their', 'there'].includes(word.toLowerCase()));
            
            // Generate a set of questions using different templates
            const generatedQuestions = [
              `What is the key concept explained in: "${answerText.substring(0, 40)}..."?`,
              `Can you explain ${keywords.length > 1 ? keywords[1] : 'this concept'} in the context of ${keywords.length > 0 ? keywords[0] : 'the topic'}?`,
              `How would you describe the relationship between ${keywords.length > 1 ? keywords[0] + ' and ' + keywords[1] : 'these concepts'}?`,
              `What are the implications of ${answerText.substring(0, 30)}...?`,
              `Define ${keywords.length > 0 ? keywords[0] : 'this concept'} as described in the note.`
            ];
            
            // Filter out any duplicate questions
            const uniqueQuestions = [...new Set(generatedQuestions)];
            
            // Return the generated questions
            resolve({
              questions: uniqueQuestions.slice(0, 3) // Limit to 3 suggestions
            });
          }, 1500);
        }),
        {
          loading: "Generating questions using AI...",
          success: (data: any) => {
            // Update state with the generated questions
            setAiSuggestions(data.questions);
            return "AI suggestions ready!";
          },
          error: "Failed to generate questions"
        }
      );
    } catch (error) {
      console.error("AI question generation failed:", error);
      toast.error("Failed to generate AI suggestions");
    }
  };

  // Function to apply a suggested question
  const applySuggestedQuestion = (question: string) => {
    setFlashcardCreation({
      ...flashcardCreation,
      question
    });
    setAiSuggestions([]); // Clear suggestions after selection
  };
  
  // Function to generate a complete flashcard
  const generateCompleteFlashcard = async () => {
    if (!flashcardCreation.noteId) return;
    
    // Find the source note
    const sourceNote = notes.find(note => note.noteId === flashcardCreation.noteId);
    if (!sourceNote) return;
    
    try {
      toast.promise(
        new Promise(resolve => {
          setTimeout(() => {
            // Extract keywords and key phrases
            const content = sourceNote.content;
            const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
            
            // Get the first substantial sentence for the answer
            let answer = sentences[0];
            if (sentences.length > 1 && sentences[0].length < 40) {
              // If first sentence is short, add the second one
              answer = sentences[0] + ". " + sentences[1];
            }
            
            // Generate a question based on the answer
            let question = "";
            
            // Attempt to find a definition pattern
            const definitionMatch = content.match(/([A-Z][a-z]+(?:\s[a-z]+){0,3})\s(?:is|are|refers to|means|describes)\s([^.]+)/i);
            
            if (definitionMatch) {
              // Create a "what is" question from the definition
              question = `What ${definitionMatch[2].includes("are") ? "are" : "is"} ${definitionMatch[1]}?`;
            } else {
              // Generate a general question about the content
              question = `What is the main concept described in: "${content.substring(0, 40)}..."?`;
            }
            
            resolve({
              question,
              answer: answer.trim()
            });
          }, 2000);
        }),
        {
          loading: "Generating complete flashcard using AI...",
          success: (data: any) => {
            // Update the flashcard creation state
            setFlashcardCreation({
              ...flashcardCreation,
              question: data.question,
              answer: data.answer,
              isAIGenerated: true  // Mark as AI generated
            });
            return "AI-generated flashcard ready!";
          },
          error: "Failed to generate flashcard"
        }
      );
    } catch (error) {
      console.error("Complete flashcard generation failed:", error);
    }
  };

  const handleReaction = (noteId: string, reaction: string) => {
    setReactionCounts((prev) => {
      const noteReactions = prev[noteId] || {};
      return {
        ...prev,
        [noteId]: {
          ...noteReactions,
          [reaction]: (noteReactions[reaction] || 0) + 1,
        },
      };
    });
    
    // In a real app, you'd save this to the backend
    toast.success(`Reaction added!`);
  };

  const formatNoteContent = (content: string) => {
    if (!content) return "";
    
    // Highlight text between ** for bold
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>');
    
    // Highlight text between !! for important highlights
    content = content.replace(/!!(.*?)!!/g, '<span class="bg-yellow-200 dark:bg-yellow-900 px-1 rounded">$1</span>');
    
    // Highlight text between == for definitions
    content = content.replace(/==(.*?)==/g, '<span class="border-b-2 border-dashed border-primary">$1</span>');
    
    return content;
  };

  // Sort and filter notes
  const sortedAndFilteredNotes = [...notes]
    .filter((note) => {
      if (!searchQuery) return true;
      return note.content.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      if (sortOption === "newest") {
        return new Date(b.updatedAt || b.createdAt || 0).getTime() - 
               new Date(a.updatedAt || a.createdAt || 0).getTime();
      } else if (sortOption === "oldest") {
        return new Date(a.updatedAt || a.createdAt || 0).getTime() - 
               new Date(b.updatedAt || b.createdAt || 0).getTime();
      } else {
        return a.content.localeCompare(b.content);
      }
    });

  return (
    <div className="note-section space-y-6">
      <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Your Notes</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Capture your thoughts and convert them to flashcards
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Filter size={16} />
            <span>Filter</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setNewNoteOpen(true)}
            disabled={newNoteOpen}
          >
            <Plus size={16} />
            <span>Add Note</span>
          </Button>
        </div>
      </div>
      
      {/* Filter & Search Controls */}
      <AnimatePresence>
        {filterOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-accent/20 rounded-lg p-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label htmlFor="search-notes" className="text-sm font-medium mb-1 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search-notes"
                      placeholder="Search in notes..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1 block">Sort by</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-[180px] justify-between">
                        {sortOption === "newest" && "Newest first"}
                        {sortOption === "oldest" && "Oldest first"}
                        {sortOption === "content" && "Content A-Z"}
                        <ChevronsUpDown size={16} className="opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setSortOption("newest")}>
                        Newest first
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("oldest")}>
                        Oldest first
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setSortOption("content")}>
                        Content A-Z
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {newNoteOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="border-2 border-primary-200 dark:border-primary-900" style={{ backgroundColor: selectedColor }}>
            <CardContent className="pt-6">
              <Textarea
                className="resize-none min-h-[120px] text-base border-0 focus-visible:ring-1 bg-transparent"
                placeholder="Type your note here..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 pb-4">
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-1">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "w-6 h-6 rounded-full transition-all flex items-center justify-center",
                      color === selectedColor && "ring-2 ring-primary-600 ring-offset-2"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                    type="button"
                    aria-label={`Select color ${color}`}
                  >
                    {color === selectedColor && (
                      <div className="w-2 h-2 rounded-full bg-primary-600" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setNewNoteOpen(false);
                    setNewNoteContent("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateNote}
                  disabled={!newNoteContent.trim() || isCreating}
                >
                  {isCreating ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-40 rounded-lg border border-dashed">
          <div className="flex flex-col items-center text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary/70"></div>
            <span className="mt-2">Loading notes...</span>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-40 rounded-lg border border-dashed">
          <div className="text-center text-muted-foreground">
            <p>Failed to load notes</p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </div>
        </div>
      ) : sortedAndFilteredNotes.length === 0 ? (
        <div className="flex items-center justify-center h-40 rounded-lg border border-dashed">
          <div className="text-center space-y-2 p-4">
            <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <h4 className="text-lg font-medium">No notes yet</h4>
            <p className="text-sm text-muted-foreground">
              {searchQuery 
                ? "No notes match your search. Try a different query." 
                : "Click 'Add Note' above to create your first note."}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedAndFilteredNotes.map((note: UserNote) =>
            editingNote.id === note.noteId ? (
              <Card
                key={note.noteId}
                className="border-2 border-primary-200 dark:border-primary-900 overflow-hidden transition-all"
                style={{ backgroundColor: editingNote.color }}
              >
                <CardContent className="pt-6">
                  <Textarea
                    className="resize-none min-h-[120px] text-base border-0 focus-visible:ring-1 bg-transparent"
                    value={editingNote.content}
                    onChange={(e) =>
                      setEditingNote({ ...editingNote, content: e.target.value })
                    }
                    placeholder="Use **bold** for important text, !!highlight!! for key points, and ==definition== for terms"
                  />
                </CardContent>
                
                <CardFooter className="flex justify-between items-center pb-4">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          "w-6 h-6 rounded-full transition-all flex items-center justify-center",
                          editingNote.color === color && "ring-2 ring-primary-600 ring-offset-2"
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setEditingNote({ ...editingNote, color })}
                        type="button"
                        aria-label={`Select color ${color}`}
                      >
                        {color === editingNote.color && (
                          <div className="w-2 h-2 rounded-full bg-primary-600" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={cancelEditing}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button 
                      variant="default"
                      size="sm"
                      onClick={handleUpdateNote}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-1" />
                      )}
                      Save
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ) : (
              <motion.div 
                key={note.noteId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <Card
                  className="h-full flex flex-col border transition-all hover:shadow-md group card-shadow-hover relative overflow-hidden"
                  style={{ backgroundColor: note.color }}
                >
                  {/* Top action buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => startEditing(note)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openFlashcardDialog(note)}>
                          <Brain className="mr-2 h-4 w-4" />
                          <span>Create Flashcard</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteNote(note.noteId)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Note content */}
                  <CardContent className="pt-6 pb-2 flex-1">
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatNoteContent(note.content) }}
                    />
                  </CardContent>
                  
                  {/* Note footer */}
                  <CardFooter className="pt-2 pb-3 flex flex-col items-stretch gap-2">
                    {/* Reactions */}
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1">
                        {REACTIONS.map((reaction) => (
                          <button
                            key={reaction.name}
                            className={cn(
                              "text-xs rounded px-1.5 py-0.5 transition-colors",
                              "hover:bg-primary/10 flex items-center gap-1"
                            )}
                            onClick={() => handleReaction(note.noteId, reaction.name)}
                          >
                            <span>{reaction.emoji}</span>
                            {reactionCounts[note.noteId]?.[reaction.name] > 0 && (
                              <span className="text-xs">
                                {reactionCounts[note.noteId]?.[reaction.name]}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        {new Date(note.updatedAt || note.createdAt || Date.now()).toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Quick actions */}
                    <div className="flex justify-end gap-2 mt-1">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => startEditing(note)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-7 text-xs px-2"
                        onClick={() => openFlashcardDialog(note)}
                      >
                        <Brain className="h-3 w-3 mr-1" />
                        Flashcard
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            )
          )}
        </div>
      )}

      {/* Flashcard Creation Dialog */}
      <Dialog open={isFlashcardDialogOpen} onOpenChange={setIsFlashcardDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Create Flashcard from Note
            </DialogTitle>
            <DialogDescription>
              Turn your note into a memory card for better retention and study
            </DialogDescription>
          </DialogHeader>
          
          {!userId ? (
            <div className="my-4 p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 rounded-md text-center">
              <Info className="h-10 w-10 text-amber-500 mx-auto mb-2" />
              <h4 className="text-base font-medium">Authentication Required</h4>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                You need to be signed in to create flashcards.
              </p>
              <Button 
                variant="outline"
                className="bg-amber-100 dark:bg-amber-900 hover:bg-amber-200 dark:hover:bg-amber-800"
                onClick={() => setIsFlashcardDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          ) :
            <>
              <div className="space-y-4 my-2">
                <div className="flex justify-between items-center mb-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">Question:</label>
                    {flashcardCreation.isAIGenerated && (
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary">AI Generated</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                      onClick={generateAIQuestion}
                    >
                      <Sparkles className="h-3 w-3" />
                      Suggest Questions
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 gap-1.5 text-xs"
                      onClick={generateCompleteFlashcard}
                    >
                      <Brain className="h-3 w-3" />
                      Auto Generate
                    </Button>
                  </div>
                </div>
                
                <div className="relative">
                  <Textarea
                    value={flashcardCreation.question}
                    onChange={(e) => setFlashcardCreation({
                      ...flashcardCreation,
                      question: e.target.value,
                      isAIGenerated: false  // Reset AI flag when user edits
                    })}
                    placeholder="Enter a question for this flashcard..."
                    className="min-h-[80px]"
                  />
                </div>
                
                {/* AI suggestions */}
                <AnimatePresence>
                  {aiSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">AI Suggestions</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => setAiSuggestions([])}
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        <div className="space-y-1.5">
                          {aiSuggestions.map((suggestion, index) => (
                            <div 
                              key={index}
                              className="bg-background rounded p-2 text-sm cursor-pointer hover:bg-primary/10 transition-colors"
                              onClick={() => applySuggestedQuestion(suggestion)}
                            >
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Answer:</label>
                    
                    {flashcardCreation.isAIGenerated && (
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-xs text-primary">AI Generated</span>
                      </div>
                    )}
                  </div>
                  
                  <Textarea
                    value={flashcardCreation.answer}
                    onChange={(e) => setFlashcardCreation({
                      ...flashcardCreation,
                      answer: e.target.value,
                      isAIGenerated: false  // Reset AI flag when user edits
                    })}
                    placeholder="Enter the answer to the question..."
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2 mt-4">
                  <label className="text-sm font-medium">Deck Title:</label>
                  <Input
                    value={flashcardCreation.deckTitle}
                    onChange={(e) => setFlashcardCreation({
                      ...flashcardCreation,
                      deckTitle: e.target.value
                    })}
                    placeholder="Enter a title for the flashcard deck"
                  />
                </div>
              </div>
              
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsFlashcardDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateFlashcard}
                  disabled={isCreatingDeck || isAddingCard || !flashcardCreation.question.trim() || !flashcardCreation.answer.trim()}
                  className="gap-1.5"
                >
                  {(isCreatingDeck || isAddingCard) ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      <span>Create Flashcard</span>
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          }
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NoteSection;