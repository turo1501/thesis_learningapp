import axios from 'axios';

interface ContentAnalysisResult {
  concepts: string[];
  keyPoints: string[];
  suggestedQuestions: Array<{
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'definition' | 'concept' | 'application' | 'analysis';
  }>;
  summary: string;
}

interface MemoryCard {
  question: string;
  answer: string;
  difficulty: number;
  type: string;
}

class AIContentAnalyzer {
  private apiKey: string;
  private baseUrl: string = 'https://api.deepseek.com/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Deepseek API key not configured. AI features will use fallback methods.');
    }
  }

  /**
   * Analyze course content and extract key learning concepts
   */
  async analyzeContent(content: string, title: string): Promise<ContentAnalysisResult> {
    if (!this.apiKey) {
      return this.fallbackContentAnalysis(content, title);
    }

    const prompt = `You are an educational content analyst. Analyze the following course material and extract key learning elements.

Course Content:
Title: "${title}"
Content: "${content.substring(0, 3000)}"

Please analyze and return a JSON object with:
1. concepts: Array of main concepts covered (max 8)
2. keyPoints: Array of most important points (max 6) 
3. suggestedQuestions: Array of study questions with answers (max 5)
4. summary: Brief summary of the content (2-3 sentences)

For suggestedQuestions, include:
- question: The study question
- answer: Comprehensive answer
- difficulty: "easy", "medium", or "hard"
- type: "definition", "concept", "application", or "analysis"

Return ONLY valid JSON in this format:
{
  "concepts": ["concept1", "concept2"],
  "keyPoints": ["point1", "point2"],
  "suggestedQuestions": [
    {
      "question": "What is...",
      "answer": "It is...",
      "difficulty": "medium",
      "type": "definition"
    }
  ],
  "summary": "This content covers..."
}`;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content analyzer. Respond with valid JSON only.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.6,
          max_tokens: 1500,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      const responseText = response.data.choices[0]?.message?.content?.trim();
      if (!responseText) {
        throw new Error('Empty response from AI');
      }

      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      const result = JSON.parse(jsonString);
      
      // Validate the structure
      if (!result.concepts || !result.keyPoints || !result.suggestedQuestions || !result.summary) {
        throw new Error('Invalid response structure');
      }

      return result;

    } catch (error: any) {
      console.error('Error in AI content analysis:', error.message);
      return this.fallbackContentAnalysis(content, title);
    }
  }

  /**
   * Generate intelligent memory cards based on question-answer pair
   */
  async generateAlternativeCards(
    originalQuestion: string, 
    originalAnswer: string, 
    count: number = 3
  ): Promise<MemoryCard[]> {
    if (!this.apiKey) {
      return this.fallbackCardGeneration(originalQuestion, originalAnswer, count);
    }

    const prompt = `You are an expert educator creating study materials. Given this flashcard, create ${count} intelligent alternative versions that test the same knowledge from different angles.

Original Card:
Question: "${originalQuestion}"
Answer: "${originalAnswer}"

Create ${count} alternatives that:
1. Test the same core knowledge but with different question formats
2. Include varied cognitive levels (recall, understanding, application)
3. Use different question types (definition, explanation, comparison, example, etc.)
4. Maintain educational accuracy and clarity
5. Avoid direct repetition of the original

Return ONLY a JSON array:
[
  {
    "question": "alternative question",
    "answer": "comprehensive answer",
    "difficulty": 2,
    "type": "concept"
  }
]

Use difficulty: 1=easy, 2=medium, 3=hard
Use type: "definition", "concept", "application", "analysis"`;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator. Always respond with valid JSON arrays only.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.8,
          max_tokens: 1200,
          top_p: 0.95,
          frequency_penalty: 0.3,
          presence_penalty: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 25000
        }
      );

      const responseText = response.data.choices[0]?.message?.content?.trim();
      if (!responseText) {
        throw new Error('Empty response from AI');
      }

      // Extract and parse JSON
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      const alternatives = JSON.parse(jsonString);
      
      if (!Array.isArray(alternatives)) {
        throw new Error('Response is not an array');
      }

      // Validate and filter results
      return alternatives
        .filter(card => card && card.question && card.answer)
        .map(card => ({
          question: String(card.question).trim(),
          answer: String(card.answer).trim(),
          difficulty: parseInt(card.difficulty) || 2,
          type: String(card.type) || 'concept'
        }))
        .slice(0, count);

    } catch (error: any) {
      console.error('Error generating alternative cards:', error.message);
      return this.fallbackCardGeneration(originalQuestion, originalAnswer, count);
    }
  }

  /**
   * Generate cards from course content intelligently
   */
  async generateCardsFromContent(
    content: string, 
    title: string, 
    maxCards: number = 5
  ): Promise<MemoryCard[]> {
    if (!this.apiKey) {
      return this.fallbackContentCardGeneration(content, title, maxCards);
    }

    const prompt = `You are an expert educator creating study flashcards from course material.

Course Material:
Title: "${title}"
Content: "${content.substring(0, 2500)}"

Generate ${maxCards} high-quality flashcards that:
1. Focus on the most important concepts and facts
2. Include different types of questions (definitions, explanations, applications)
3. Vary in difficulty level to challenge different learning stages
4. Use clear, specific questions that have definitive answers
5. Cover the breadth of the material effectively

Return ONLY a JSON array:
[
  {
    "question": "specific question about the content",
    "answer": "detailed, accurate answer",
    "difficulty": 2,
    "type": "concept"
  }
]

Use difficulty: 1=basic facts, 2=understanding concepts, 3=applying knowledge
Use type: "definition", "concept", "application", "analysis"`;

    try {
      const response = await axios.post(
        this.baseUrl,
        {
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert educational content creator specializing in flashcard generation. Always return valid JSON arrays.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const responseText = response.data.choices[0]?.message?.content?.trim();
      if (!responseText) {
        throw new Error('Empty response from AI');
      }

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      const cards = JSON.parse(jsonString);
      
      if (!Array.isArray(cards)) {
        throw new Error('Response is not an array');
      }

      return cards
        .filter(card => card && card.question && card.answer)
        .map(card => ({
          question: String(card.question).trim(),
          answer: String(card.answer).trim(),
          difficulty: parseInt(card.difficulty) || 2,
          type: String(card.type) || 'concept'
        }))
        .slice(0, maxCards);

    } catch (error: any) {
      console.error('Error generating cards from content:', error.message);
      return this.fallbackContentCardGeneration(content, title, maxCards);
    }
  }

  /**
   * Fallback content analysis when AI is not available
   */
  private fallbackContentAnalysis(content: string, title: string): ContentAnalysisResult {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    // Extract potential concepts (capitalized words, technical terms)
    const concepts = [...new Set(
      content.match(/\b[A-Z][a-z]{2,}\b/g) || []
    )].slice(0, 8);

    // Extract key sentences as points
    const keyPoints = sentences
      .filter(s => s.length > 20 && s.length < 150)
      .slice(0, 6)
      .map(s => s.trim());

    // Generate basic questions
    const suggestedQuestions = [
      {
        question: `What is the main topic discussed in "${title}"?`,
        answer: `The main topic is ${title.toLowerCase()}.`,
        difficulty: 'easy' as const,
        type: 'definition' as const
      },
      {
        question: `Explain the key concepts covered in ${title}`,
        answer: `The key concepts include: ${concepts.slice(0, 3).join(', ')}.`,
        difficulty: 'medium' as const,
        type: 'concept' as const
      }
    ];

    return {
      concepts,
      keyPoints,
      suggestedQuestions,
      summary: `This content about "${title}" covers ${concepts.length} main concepts and provides detailed information on the topic.`
    };
  }

  /**
   * Fallback card generation
   */
  private fallbackCardGeneration(question: string, answer: string, count: number): MemoryCard[] {
    const alternatives = [];
    
    const patterns = [
      {
        question: `Explain in detail: ${question.replace(/^(what|how|why)/i, '').trim()}`,
        answer: `In detail: ${answer}`,
        difficulty: 2,
        type: 'concept'
      },
      {
        question: `What is the significance of ${question.replace(/^(what|how) is /i, '').replace('?', '')}?`,
        answer: `The significance is that ${answer.toLowerCase()}. This is important for understanding the broader context.`,
        difficulty: 3,
        type: 'analysis'
      },
      {
        question: `Give an example related to: ${question.replace('?', '')}`,
        answer: `An example would be: ${answer}. This demonstrates the practical application.`,
        difficulty: 2,
        type: 'application'
      }
    ];

    for (let i = 0; i < Math.min(count, patterns.length); i++) {
      alternatives.push(patterns[i]);
    }

    return alternatives;
  }

  /**
   * Fallback content card generation
   */
  private fallbackContentCardGeneration(content: string, title: string, maxCards: number): MemoryCard[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const cards = [];

    // Generate basic cards from content
    cards.push({
      question: `What is the main subject of "${title}"?`,
      answer: `The main subject is ${title}`,
      difficulty: 1,
      type: 'definition'
    });

    if (sentences.length > 0) {
      cards.push({
        question: `Summarize the key points from ${title}`,
        answer: sentences.slice(0, 2).join('. ').trim(),
        difficulty: 2,
        type: 'concept'
      });
    }

    return cards.slice(0, maxCards);
  }
}

export default AIContentAnalyzer; 