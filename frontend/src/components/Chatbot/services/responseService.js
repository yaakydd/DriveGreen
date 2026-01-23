import { knowledgeBase } from '../data/knowledgeBase';
import generatePredictionResponse from './predictionContextService';

// Main matching function - SIMPLIFIED & WORKING
export const findBestMatch = (input, predictionData) => {
  const lowerInput = input.toLowerCase().trim();
  
  // **CRITICAL FIX 1: Check prediction-specific responses FIRST**
  if (predictionData) {
    console.log('Checking prediction-specific responses...');
    const predictionResponse = generatePredictionResponse(input, predictionData);
    if (predictionResponse) {
      console.log('USING PREDICTION-SPECIFIC RESPONSE');
      console.log('Response preview:', predictionResponse.substring(0, 80) + '...');
      return predictionResponse;
    }
    console.log('No prediction-specific match found');
  }
  
  // **CRITICAL FIX 2: Simple knowledge base matching**
  console.log('Checking knowledge base...');
  let bestMatch = null;
  let highestScore = 0;
  
  for (const entry of knowledgeBase) {
    let score = 0;
    let matchedKeywords = [];
    
    // Simple exact keyword matching
    for (const keyword of entry.keywords) {
      if (lowerInput.includes(keyword)) {
        score += 3;
        matchedKeywords.push(keyword);
      }
    }
    
    if (matchedKeywords.length > 0) {
      console.log(`  Entry "${entry.keywords[0]}": score=${score}, matched=${matchedKeywords}`);
    }
    
    // Apply priority multiplier
    score *= (entry.priority || 1);
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }
  
  console.log('Best match:', bestMatch?.keywords[0]);
  console.log('Highest score:', highestScore);
  
  // **CRITICAL FIX 3: Handle getResponse function properly**
  if (bestMatch && highestScore > 0) {
    if (bestMatch.getResponse) {
      console.log('Using getResponse function');
      return bestMatch.getResponse(predictionData);
    }
    console.log('Using static response');
    return bestMatch.response;
  }
  
  // **CRITICAL FIX 4: Smart fallback responses**
  console.log('Using fallback response');
  if (predictionData) {
    return `I can help explain your ${predictionData.predicted_co2_emissions} g/km result! Try asking me:
• "Explain my result"
• "How do I improve?"
• "Is my score good?"
• "Compare to other vehicles"

Or ask about:
• Fuel types • Electric cars • Cost savings • Health impacts`;
  }
  
  return `I want to help you understand vehicle emissions. Could you be more specific? For example:
• "How do electric cars work?"
• "What's the best fuel type for the environment?"
• "How can I reduce my carbon footprint?"
• "Tell me about hybrids vs EVs"`;
};

