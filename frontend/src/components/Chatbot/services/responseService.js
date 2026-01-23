import { knowledgeBase } from '../data/knowledgeBase';
import { generatePredictionResponse } from './predictionContextService';

// FUZZY MATCHING UTILITIES
const levenshteinDistance = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = Array(b.length + 1).fill(null).map(() => 
    Array(a.length + 1).fill(null)
  );

  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + cost
      );
    }
  }

  return matrix[b.length][a.length];
};

const getFuzzyMatch = (word, keyword) => {
  if (word.length < 3) return 0;
  
  const distance = levenshteinDistance(word, keyword);
  const maxLength = Math.max(word.length, keyword.length);
  const similarity = 1 - (distance / maxLength);
  
  return similarity > 0.7 ? similarity : 0;
};

// PLURAL HANDLING
const stemWord = (word) => {
  if (word.length < 4) return word;
  
  // Simple stemming rules
  if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && ['ss', 'sh', 'ch', 'x', 'z']
    .some(suffix => word.endsWith(suffix + 'es'))) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss')) {
    return word.slice(0, -1);
  }
  return word;
};

// SYNONYM EXPANSION
const synonymMap = {
  'car': ['vehicle', 'auto', 'automobile'],
  'reduce': ['lower', 'decrease', 'minimize', 'lessen'],
  'save': ['saving', 'economize', 'conserve'],
  'emission': ['emissions', 'pollution', 'carbon', 'co2'],
  'fuel': ['gas', 'petrol', 'diesel'],
  'electric': ['ev', 'tesla', 'battery'],
  'hybrid': ['prius', 'plug-in'],
  'expensive': ['costly', 'pricey'],
  'cheap': ['inexpensive', 'affordable'],
  'good': ['excellent', 'great', 'awesome'],
  'bad': ['poor', 'terrible', 'awful']
};

// SANITIZATION
const sanitizeInput = (input) => {
  // Remove script tags and malicious content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

// INTENT DETECTION
const detectIntents = (input, predictionData) => {
  const intents = [];
  const lowerInput = input.toLowerCase();
  
  // Check for prediction-specific intents
  if (predictionData) {
    if (lowerInput.includes('my result') || lowerInput.includes('my prediction') || 
        lowerInput.includes('my score') || lowerInput.includes('explain')) {
      intents.push('EXPLAIN_RESULT');
    }
    if (lowerInput.includes('improve') || lowerInput.includes('reduce') || 
        lowerInput.includes('lower') || lowerInput.includes('better')) {
      intents.push('IMPROVE');
    }
    if (lowerInput.includes('compare') || lowerInput.includes('vs') || 
        lowerInput.includes('versus')) {
      intents.push('COMPARE');
    }
    if (lowerInput.includes('good') || lowerInput.includes('bad') || 
        lowerInput.includes('average') || lowerInput.includes('rating')) {
      intents.push('RATING');
    }
  }
  
  // Check for general knowledge intents
  knowledgeBase.forEach(entry => {
    if (calculateMatchScore(entry, lowerInput, []).score > 5) {
      intents.push(entry.keywords[0] + '_TOPIC');
    }
  });
  
  return intents;
};

// ENHANCED MATCH SCORING
const calculateMatchScore = (entry, input, words) => {
  let score = 0;
  let matchedKeywords = new Set();
  const stemmedWords = words.map(w => stemWord(w));
  
  // Check each keyword
  entry.keywords.forEach(keyword => {
    // Exact match
    if (input.includes(keyword)) {
      score += words.includes(keyword) ? 3 : 1.5;
      matchedKeywords.add(keyword);
    }
    
    // Fuzzy match
    words.forEach(word => {
      const fuzzyScore = getFuzzyMatch(word, keyword);
      if (fuzzyScore > 0) {
        score += fuzzyScore * 2;
        matchedKeywords.add(keyword);
      }
    });
    
    // Stemmed match
    const stemmedKeyword = stemWord(keyword);
    if (stemmedWords.includes(stemmedKeyword)) {
      score += 2;
      matchedKeywords.add(keyword);
    }
    
    // Synonym match
    if (synonymMap[keyword]) {
      synonymMap[keyword].forEach(synonym => {
        if (input.includes(synonym)) {
          score += 1.5;
          matchedKeywords.add(keyword);
        }
      });
    }
  });
  
  // Bonus for multiple keyword matches
  if (matchedKeywords.size > 1) {
    score += matchedKeywords.size * 2;
  }
  
  // Apply priority
  score *= (entry.priority || 1);
  
  return { score, matchedKeywords: Array.from(matchedKeywords) };
};

// HANDLE LONG INPUTS
const processLongInput = (input) => {
  if (input.length > 200) {
    // Split into sentences and take first 3
    const sentences = input.split(/[.!?]+/).slice(0, 3);
    return sentences.join('. ');
  }
  return input;
};

// Main matching function with multi-intent support
export const findBestMatch = (input, predictionData) => {
  // Sanitize input first
  const sanitizedInput = sanitizeInput(input);
  if (!sanitizedInput) {
    return "I didn't understand that. Could you rephrase?";
  }
  
  // Check if prediction data is required but missing
  const requiresPrediction = sanitizedInput.toLowerCase().includes('my ') && 
    ['result', 'score', 'prediction', 'emission', 'vehicle']
      .some(word => sanitizedInput.toLowerCase().includes(word));
  
  if (requiresPrediction && !predictionData) {
    return "Please run a prediction first to get your vehicle's emissions score. Then I can help you understand and improve it!";
  }
  
  // Handle long inputs
  const processedInput = processLongInput(sanitizedInput);
  const lowerInput = processedInput.toLowerCase();
  const words = lowerInput.split(/\s+/).filter(w => w.length > 2);
  
  // Check for prediction-specific responses first
  if (predictionData) {
    const contextResponse = generatePredictionResponse(processedInput, predictionData);
    if (contextResponse) return contextResponse;
  }
  
  // Detect multiple intents
  const intents = detectIntents(processedInput, predictionData);
  
  // Handle multi-intent queries
  if (intents.length > 1) {
    return handleMultiIntentQuery(intents, processedInput, predictionData);
  }
  
  let bestMatch = null;
  let highestScore = 0;
  let bestMatchDetails = null;
  
  for (const entry of knowledgeBase) {
    const { score, matchedKeywords } = calculateMatchScore(entry, lowerInput, words);
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
      bestMatchDetails = { matchedKeywords };
    }
  }
  
  return getFinalResponse(highestScore, bestMatch, bestMatchDetails, predictionData);
};

// Handle multi-intent queries
const handleMultiIntentQuery = (intents, input, predictionData) => {
  const responses = [];
  
  if (intents.includes('EXPLAIN_RESULT') && predictionData) {
    const explainResponse = generatePredictionResponse('explain my result', predictionData);
    if (explainResponse) responses.push(`**Understanding Your Result:**\n${explainResponse}`);
  }
  
  if (intents.includes('IMPROVE') && predictionData) {
    const improveResponse = generatePredictionResponse('how do I improve', predictionData);
    if (improveResponse) responses.push(`\n**How to Improve:**\n${improveResponse}`);
  }
  
  if (responses.length > 0) {
    return responses.join('\n\n---\n\n');
  }
  
  // Fall back to regular matching
  const words = input.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  
  let bestMatch = null;
  let highestScore = 0;
  
  for (const entry of knowledgeBase) {
    const { score } = calculateMatchScore(entry, input.toLowerCase(), words);
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }
  
  return getFinalResponse(highestScore, bestMatch, null, predictionData);
};

// Determine final response with fallbacks
const getFinalResponse = (score, bestMatch, matchDetails, predictionData) => {
  if (score < 3) {
    if (predictionData) {
      return "I can help explain your prediction result! Try asking:\n• \"Explain my result\"\n• \"How do I improve?\"\n• \"Is this good?\"\n• \"Compare to other vehicles\"";
    }
    return "I want to give you the best answer. Could you be more specific? For example:\n• \"How do electric cars work?\"\n• \"What's the best fuel type?\"\n• \"How can I reduce my emissions?\"";
  }
  
  if (score < 5) {
    // Low confidence response
    const suggestions = predictionData ? [
      "Would you like to know about your prediction result?",
      "Are you asking about how to reduce emissions?",
      "Need help understanding your vehicle's impact?"
    ] : [
      "Are you asking about vehicle emissions?",
      "Do you want to know about electric vehicles?",
      "Looking for ways to reduce your carbon footprint?"
    ];
    
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    return `I'm not sure I understood completely. ${randomSuggestion}`;
  }
  
  // High confidence - return the matched response
  let response = bestMatch.response;
  
  // Add follow-up questions based on match
  if (matchDetails && matchDetails.matchedKeywords) {
    const followUps = generateFollowUps(matchDetails.matchedKeywords, predictionData);
    if (followUps) {
      response += `\n\n**Related questions you might have:**\n${followUps}`;
    }
  }
  
  return response;
};

// Generate context-aware follow-up questions
const generateFollowUps = (matchedKeywords, predictionData) => {
  const followUps = [];
  
  if (matchedKeywords.includes('electric') || matchedKeywords.includes('ev')) {
    followUps.push("• How do EV batteries impact the environment?");
    followUps.push("• What's the cost comparison between EV and gas?");
  }
  
  if (matchedKeywords.includes('hybrid')) {
    followUps.push("• What's the difference between hybrid and plug-in hybrid?");
    followUps.push("• Are hybrids really better for the environment?");
  }
  
  if (matchedKeywords.includes('reduce') || matchedKeywords.includes('improve')) {
    if (predictionData) {
      followUps.push("• What specific actions can I take based on my result?");
    } else {
      followUps.push("• What are the quickest ways to reduce emissions?");
    }
  }
  
  if (matchedKeywords.includes('cost') || matchedKeywords.includes('money')) {
    followUps.push("• What are the tax incentives for green vehicles?");
    followUps.push("• How much can I save with an efficient vehicle?");
  }
  
  return followUps.length > 0 ? followUps.slice(0, 3).join('\n') : null;
};
