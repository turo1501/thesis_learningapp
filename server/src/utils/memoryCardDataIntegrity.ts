import MemoryCardDeck from "../models/memoryCardModel";

interface DataIntegrityReport {
  totalDecks: number;
  totalCards: number;
  corruptedDecks: string[];
  orphanedCards: string[];
  inconsistentStats: string[];
  recommendations: string[];
}

interface MemoryCard {
  cardId: string;
  question: string;
  answer: string;
  chapterId: string;
  sectionId: string;
  difficultyLevel: number;
  lastReviewed: number;
  nextReviewDue: number;
  repetitionCount: number;
  correctCount: number;
  incorrectCount: number;
  aiGenerated?: boolean;
  averageThinkingTime?: number;
  lastConfidence?: number;
}

interface MemoryCardDeckModel {
  deckId: string;
  userId: string;
  courseId: string;
  title: string;
  description?: string;
  cards: MemoryCard[];
  intervalModifier: number;
  easyBonus: number;
  totalReviews: number;
  correctReviews: number;
  createdAt: number;
  updatedAt: number;
}

export class MemoryCardDataIntegrityChecker {
  
  static async checkDataIntegrity(userId?: string): Promise<DataIntegrityReport> {
    console.log("Starting memory card data integrity check...");
    
    const report: DataIntegrityReport = {
      totalDecks: 0,
      totalCards: 0,
      corruptedDecks: [],
      orphanedCards: [],
      inconsistentStats: [],
      recommendations: []
    };

    try {
      // Get all decks or user-specific decks
      const decks = userId 
        ? await MemoryCardDeck.scan("userId").eq(userId).exec()
        : await MemoryCardDeck.scan().exec();

      report.totalDecks = decks.length;
      console.log(`Found ${decks.length} decks to check`);

      for (const deck of decks) {
        const deckModel = deck as unknown as MemoryCardDeckModel;
        
        try {
          // Check deck structure
          const deckIssues = this.validateDeckStructure(deckModel);
          if (deckIssues.length > 0) {
            report.corruptedDecks.push(`${deckModel.deckId}: ${deckIssues.join(', ')}`);
          }

          // Check cards in deck
          if (deckModel.cards && Array.isArray(deckModel.cards)) {
            report.totalCards += deckModel.cards.length;
            
            for (const card of deckModel.cards) {
              const cardIssues = this.validateCardStructure(card);
              if (cardIssues.length > 0) {
                report.orphanedCards.push(`${card.cardId} in ${deckModel.deckId}: ${cardIssues.join(', ')}`);
              }
            }

            // Check deck statistics consistency
            const statsIssues = this.validateDeckStatistics(deckModel);
            if (statsIssues.length > 0) {
              report.inconsistentStats.push(`${deckModel.deckId}: ${statsIssues.join(', ')}`);
            }
          }

        } catch (error) {
          console.error(`Error checking deck ${deckModel.deckId}:`, error);
          report.corruptedDecks.push(`${deckModel.deckId}: Critical error during validation`);
        }
      }

      // Generate recommendations
      report.recommendations = this.generateRecommendations(report);

      console.log("Data integrity check completed");
      return report;

    } catch (error) {
      console.error("Error during data integrity check:", error);
      throw error;
    }
  }

  private static validateDeckStructure(deck: MemoryCardDeckModel): string[] {
    const issues: string[] = [];

    if (!deck.deckId) issues.push("Missing deck ID");
    if (!deck.userId) issues.push("Missing user ID");
    if (!deck.title || deck.title.trim().length === 0) issues.push("Empty title");
    if (!deck.createdAt || deck.createdAt <= 0) issues.push("Invalid creation date");
    if (!deck.updatedAt || deck.updatedAt <= 0) issues.push("Invalid update date");
    if (deck.totalReviews < 0) issues.push("Negative total reviews");
    if (deck.correctReviews < 0) issues.push("Negative correct reviews");
    if (deck.correctReviews > deck.totalReviews) issues.push("Correct reviews exceed total");
    if (!Array.isArray(deck.cards)) issues.push("Cards property is not an array");

    return issues;
  }

  private static validateCardStructure(card: MemoryCard): string[] {
    const issues: string[] = [];

    if (!card.cardId) issues.push("Missing card ID");
    if (!card.question || card.question.trim().length === 0) issues.push("Empty question");
    if (!card.answer || card.answer.trim().length === 0) issues.push("Empty answer");
    if (card.difficultyLevel < 1 || card.difficultyLevel > 5) issues.push("Invalid difficulty level");
    if (card.repetitionCount < 0) issues.push("Negative repetition count");
    if (card.correctCount < 0) issues.push("Negative correct count");
    if (card.incorrectCount < 0) issues.push("Negative incorrect count");
    if (!card.lastReviewed || card.lastReviewed <= 0) issues.push("Invalid last reviewed date");
    if (!card.nextReviewDue || card.nextReviewDue <= 0) issues.push("Invalid next review due date");

    // Check for reasonable timestamp values
    const now = Date.now();
    const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
    const oneYearFromNow = now + (365 * 24 * 60 * 60 * 1000);

    if (card.lastReviewed < oneYearAgo) issues.push("Last reviewed date too old");
    if (card.nextReviewDue > oneYearFromNow) issues.push("Next review due date too far in future");

    return issues;
  }

  private static validateDeckStatistics(deck: MemoryCardDeckModel): string[] {
    const issues: string[] = [];

    if (!deck.cards || !Array.isArray(deck.cards)) {
      return issues;
    }

    // Calculate actual statistics from cards
    let actualTotalReviews = 0;
    let actualCorrectReviews = 0;

    for (const card of deck.cards) {
      const cardTotalReviews = (card.correctCount || 0) + (card.incorrectCount || 0);
      actualTotalReviews += cardTotalReviews;
      actualCorrectReviews += (card.correctCount || 0);
    }

    // Allow for some discrepancy due to deck-level reviews that may not be card-specific
    const totalDiff = Math.abs(deck.totalReviews - actualTotalReviews);
    const correctDiff = Math.abs(deck.correctReviews - actualCorrectReviews);

    if (totalDiff > 10) {
      issues.push(`Total reviews mismatch: deck=${deck.totalReviews}, calculated=${actualTotalReviews}`);
    }

    if (correctDiff > 10) {
      issues.push(`Correct reviews mismatch: deck=${deck.correctReviews}, calculated=${actualCorrectReviews}`);
    }

    return issues;
  }

  private static generateRecommendations(report: DataIntegrityReport): string[] {
    const recommendations: string[] = [];

    if (report.corruptedDecks.length > 0) {
      recommendations.push(`Found ${report.corruptedDecks.length} corrupted decks - consider restoration or cleanup`);
    }

    if (report.orphanedCards.length > 0) {
      recommendations.push(`Found ${report.orphanedCards.length} problematic cards - review and fix data validation`);
    }

    if (report.inconsistentStats.length > 0) {
      recommendations.push(`Found ${report.inconsistentStats.length} decks with statistical inconsistencies - recommend stats recalculation`);
    }

    if (report.totalCards === 0 && report.totalDecks > 0) {
      recommendations.push("Found decks with no cards - consider removing empty decks");
    }

    if (report.corruptedDecks.length === 0 && report.orphanedCards.length === 0 && report.inconsistentStats.length === 0) {
      recommendations.push("All memory card data appears to be in good condition");
    }

    return recommendations;
  }

  static async repairDataIntegrity(userId?: string): Promise<number> {
    console.log("Starting memory card data repair...");
    let repairedCount = 0;

    try {
      const decks = userId 
        ? await MemoryCardDeck.scan("userId").eq(userId).exec()
        : await MemoryCardDeck.scan().exec();

      for (const deck of decks) {
        const deckModel = deck as unknown as MemoryCardDeckModel;
        let needsUpdate = false;

        // Repair deck-level issues
        if (!Array.isArray(deckModel.cards)) {
          deckModel.cards = [];
          needsUpdate = true;
        }

        if (deckModel.totalReviews < 0) {
          deckModel.totalReviews = 0;
          needsUpdate = true;
        }

        if (deckModel.correctReviews < 0) {
          deckModel.correctReviews = 0;
          needsUpdate = true;
        }

        if (deckModel.correctReviews > deckModel.totalReviews) {
          deckModel.correctReviews = deckModel.totalReviews;
          needsUpdate = true;
        }

        // Repair card-level issues
        for (const card of deckModel.cards) {
          if (card.difficultyLevel < 1 || card.difficultyLevel > 5) {
            card.difficultyLevel = 3;
            needsUpdate = true;
          }

          if (card.repetitionCount < 0) {
            card.repetitionCount = 0;
            needsUpdate = true;
          }

          if (card.correctCount < 0) {
            card.correctCount = 0;
            needsUpdate = true;
          }

          if (card.incorrectCount < 0) {
            card.incorrectCount = 0;
            needsUpdate = true;
          }

          if (!card.lastReviewed || card.lastReviewed <= 0) {
            card.lastReviewed = deckModel.createdAt || Date.now();
            needsUpdate = true;
          }

          if (!card.nextReviewDue || card.nextReviewDue <= 0) {
            card.nextReviewDue = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          try {
            await MemoryCardDeck.update(
              {
                deckId: deckModel.deckId,
                userId: deckModel.userId,
              },
              {
                cards: deckModel.cards,
                totalReviews: deckModel.totalReviews,
                correctReviews: deckModel.correctReviews,
                updatedAt: Date.now(),
              }
            );
            repairedCount++;
            console.log(`Repaired deck: ${deckModel.deckId}`);
          } catch (error) {
            console.error(`Failed to repair deck ${deckModel.deckId}:`, error);
          }
        }
      }

      console.log(`Data repair completed. Repaired ${repairedCount} decks.`);
      return repairedCount;

    } catch (error) {
      console.error("Error during data repair:", error);
      throw error;
    }
  }
}

export default MemoryCardDataIntegrityChecker; 