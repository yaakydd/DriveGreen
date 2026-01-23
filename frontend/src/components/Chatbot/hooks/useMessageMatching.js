import { useCallback, useMemo } from 'react';
import { getResponses } from '../services/responseService';
import { generatePredictionResponse } from '../services/predictionContextService';

const useMessageMatching = (predictionData) => {
  
  // Normalize text for better matching (handles plurals, typos)
  const normalizeText = useCallback((text) => {
    return text
      .toLowerCase()
      .trim()
      // Remove punctuation
      .replace(/[.,!?;:]/g, ' ')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Handle common plurals
      .replace(/ies\b/g, 'y')
      .replace(/s\b/g, '')
      // Handle common verb forms
      .replace(/ing\b/g, '')
      .replace(/ed\b/g, '');
  }, []);

  // Calculate similarity between two strings (Levenshtein distance)
  const calculateSimilarity = useCallback((str1, str2) => {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  }, []);

  // Detect multiple intents in user input
  const detectIntents = useCallback((input) => {
    const normalized = normalizeText(input);
    const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // If multiple sentences or questions, treat as multi-intent
    if (sentences.length > 1) {
      return sentences.map(s => s.trim());
    }
    
    // Check for coordinating conjunctions that signal multiple intents
    const multiIntentIndicators = ['and', 'but', 'also', 'plus', 'additionally'];
    for (const indicator of multiIntentIndicators) {
      if (normalized.includes(` ${indicator} `)) {
        return input.split(new RegExp(`\\s+${indicator}\\s+`, 'i')).map(s => s.trim());
      }
    }
    
    return [input];
  }, [normalizeText]);

  // Main matching function with fuzzy matching
  const findBestMatch = useCallback((input) => {
    // Validate prediction data requirement
    if (!predictionData) {
      const requiresPrediction = ['my result', 'my prediction', 'my score', 'my emission', 'my vehicle'];
      const normalized = normalizeText(input);
      if (requiresPrediction.some(phrase => normalized.includes(normalizeText(phrase)))) {
        return ["Please run a prediction first to see your vehicle's emissions. Click the 'Predict Emissions' button above!"];
      }
    }

    // Split input into multiple intents if needed
    const intents = detectIntents(input);
    const responses = [];

    for (const intent of intents) {
      const normalized = normalizeText(intent);
      const words = normalized.split(/\s+/).filter(w => w.length > 2);
      
      // Check for prediction-specific responses first
      if (predictionData) {
        const contextResponse = generatePredictionResponse(intent, predictionData);
        if (contextResponse) {
          responses.push(contextResponse);
          continue;
        }
      }
      
      let bestMatch = null;
      let highestScore = 0;
      const knowledgeBase = getResponses();
      
      for (const entry of knowledgeBase) {
        // Skip prediction-required entries if no prediction
        if (entry.requiresPrediction && !predictionData) continue;
        
        let score = 0;
        let matchedKeywords = 0;
        
        for (const keyword of entry.keywords) {
          const normalizedKeyword = normalizeText(keyword);
          
          // Exact match in normalized text
          if (normalized.includes(normalizedKeyword)) {
            matchedKeywords++;
            
            // Bonus for word boundary match
            if (words.includes(normalizedKeyword)) {
              score += 3;
            } else {
              score += 1.5;
            }
          } else {
            // Fuzzy match for typos (allow 80% similarity)
            for (const word of words) {
              const similarity = calculateSimilarity(word, normalizedKeyword);
              if (similarity >= 0.8) {
                matchedKeywords++;
                score += similarity * 2;
                break;
              }
            }
          }
        }
        
        // Apply priority multiplier
        score *= (entry.priority || 1);
        
        // Bonus for multiple keyword matches
        if (matchedKeywords > 1) {
          score += matchedKeywords * 2;
        }
        
        if (score > highestScore) {
          highestScore = score;
          bestMatch = entry;
        }
      }
      
      // Determine if match is strong enough
      if (highestScore < 5) {
        if (predictionData) {
          responses.push("I can help explain your prediction result! Try asking: 'Explain my result', 'How do I improve?', or 'Is my score good?'");
        } else {
          responses.push("That's a great question. To give you the most accurate answer, could you rephrase it with more detail? For example, 'How do electric cars work?' or 'What's the greenest car for a family?'");
        }
      } else {
        responses.push(bestMatch.response);
      }
    }
    
    // Return unique responses only
    return [...new Set(responses)];
  }, [predictionData, normalizeText, calculateSimilarity, detectIntents]);

  return { findBestMatch };
};

export default useMessageMatching;
