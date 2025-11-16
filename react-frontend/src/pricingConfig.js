/**
 * Pricing Configuration
 * 
 * Realistic pricing per 1K tokens for major LLM providers (as of late 2024).
 * Prices are for INPUT tokens unless otherwise specified.
 * 
 * Sources:
 * - OpenAI: https://openai.com/api/pricing/
 * - Anthropic: https://www.anthropic.com/pricing
 * - Google: https://ai.google.dev/pricing
 * - DeepSeek: https://api-docs.deepseek.com/pricing
 */

export const pricingConfig = {
  // OpenAI Models
  'GPT-4 Turbo': {
    provider: 'OpenAI',
    inputPer1K: 0.01,      // $0.01 per 1K input tokens
    outputPer1K: 0.03,      // $0.03 per 1K output tokens
    description: 'General-purpose model with high performance',
  },
  'GPT-4o': {
    provider: 'OpenAI',
    inputPer1K: 0.005,      // $0.005 per 1K input tokens
    outputPer1K: 0.015,    // $0.015 per 1K output tokens
    description: 'Optimized for speed and cost efficiency',
  },
  'GPT-4.1': {
    provider: 'OpenAI',
    inputPer1K: 0.01,       // Similar to GPT-4 Turbo
    outputPer1K: 0.03,
    description: 'Extended context window (1M tokens)',
  },
  
  // Anthropic Models
  'Claude 3 Sonnet': {
    provider: 'Anthropic',
    inputPer1K: 0.003,     // $0.003 per 1K input tokens
    outputPer1K: 0.015,    // $0.015 per 1K output tokens
    description: 'Balanced performance and cost',
  },
  'Claude 4.5': {
    provider: 'Anthropic',
    inputPer1K: 0.003,     // Similar pricing to Claude 3 Sonnet
    outputPer1K: 0.015,
    description: 'Extended context (1M tokens)',
  },
  
  // Google Models
  'Gemini 2.5 Pro': {
    provider: 'Google',
    inputPer1K: 0.00125,   // $0.00125 per 1K input tokens
    outputPer1K: 0.005,    // $0.005 per 1K output tokens
    description: 'Cost-effective with 1M token context',
  },
  
  // DeepSeek
  'DeepSeek V3.2': {
    provider: 'DeepSeek',
    inputPer1K: 0.00014,  // $0.00014 per 1K input tokens (very cost-effective)
    outputPer1K: 0.00056, // $0.00056 per 1K output tokens
    description: 'Highly cost-effective pricing',
  },
  
  // Microsoft
  'Phi-3 Medium': {
    provider: 'Microsoft',
    inputPer1K: 0.0005,   // Estimated pricing
    outputPer1K: 0.002,
    description: 'Small but capable model',
  },
  
  // xAI
  'Grok 4 Fast': {
    provider: 'xAI',
    inputPer1K: 0.002,     // Estimated pricing
    outputPer1K: 0.008,
    description: 'Extended context (2M tokens)',
  },
  
  // Open Source (self-hosted, estimated compute costs)
  'Mistral 7B': {
    provider: 'Open Source',
    inputPer1K: 0.0001,   // Estimated self-hosting cost
    outputPer1K: 0.0003,
    description: 'Self-hosted, compute cost estimate',
  },
  'Llama 2 7B': {
    provider: 'Open Source',
    inputPer1K: 0.0001,
    outputPer1K: 0.0003,
    description: 'Self-hosted, compute cost estimate',
  },
  
  // Default/Average
  'Average (Estimate)': {
    provider: 'Multiple',
    inputPer1K: 0.01,      // Default fallback
    outputPer1K: 0.03,
    description: 'Average pricing across major providers',
  },
};

/**
 * Get pricing for a specific model
 * @param {string} modelName - Name of the model
 * @returns {Object} Pricing configuration or default
 */
export function getPricing(modelName) {
  return pricingConfig[modelName] || pricingConfig['Average (Estimate)'];
}

/**
 * Get list of available models for selection
 * @returns {Array} Array of model names
 */
export function getAvailableModels() {
  return Object.keys(pricingConfig);
}

/**
 * Calculate cost for a given number of tokens
 * @param {number} tokens - Number of tokens
 * @param {string} modelName - Name of the model
 * @param {boolean} isOutput - Whether these are output tokens (default: false for input)
 * @returns {number} Cost in USD
 */
export function calculateCost(tokens, modelName, isOutput = false) {
  const pricing = getPricing(modelName);
  const rate = isOutput ? pricing.outputPer1K : pricing.inputPer1K;
  return (tokens / 1000) * rate;
}

