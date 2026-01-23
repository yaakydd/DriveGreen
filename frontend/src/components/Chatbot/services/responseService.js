// src/components/Chatbot/services/responseService.js
import { knowledgeBase } from '../data/knowledgeBase';

/**
 * Get all knowledge base responses
 * @returns {Array} Knowledge base entries
 */
export const getResponses = () => {
  return knowledgeBase;
};

/**
 * Sanitize user input to prevent injection attacks
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .slice(0, 500); // Limit length
};

/**
 * Extract key information from user message
 * @param {string} input - User input
 * @returns {Object} Extracted information
 */
export const extractMessageContext = (input) => {
  const lowerInput = input.toLowerCase();
  
  return {
    isQuestion: /\?|how|what|when|where|why|who|which|can|could|would|should|is|are|do|does/.test(lowerInput),
    isGreeting: /hello|hi|hey|greetings/.test(lowerInput),
    isThanking: /thank|thanks|appreciate/.test(lowerInput),
    mentionsPrediction: /result|prediction|score|emission|vehicle/.test(lowerInput),
    mentionsImprovement: /improve|better|reduce|lower|decrease/.test(lowerInput),
    mentionsComparison: /compare|comparison|versus|vs|difference/.test(lowerInput),
    sentiment: determineSentiment(lowerInput)
  };
};

/**
 * Determine sentiment of user message
 * @param {string} text - Normalized text
 * @returns {string} Sentiment category
 */
const determineSentiment = (text) => {
  const positiveWords = ['good', 'great', 'excellent', 'happy', 'pleased', 'satisfied'];
  const negativeWords = ['bad', 'poor', 'terrible', 'worried', 'concerned', 'disappointed'];
  
  const hasPositive = positiveWords.some(word => text.includes(word));
  const hasNegative = negativeWords.some(word => text.includes(word));
  
  if (hasPositive && !hasNegative) return 'positive';
  if (hasNegative && !hasPositive) return 'negative';
  return 'neutral';
};

/**
 * Format response with proper structure
 * @param {string} response - Raw response
 * @param {Object} context - Message context
 * @returns {string} Formatted response
 */
export const formatResponse = (response, context = {}) => {
  // Add empathetic preamble for negative sentiment
  if (context.sentiment === 'negative') {
    return `I understand your concern. ${response}`;
  }
  
  return response;
};
