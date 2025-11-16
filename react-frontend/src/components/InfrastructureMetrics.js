import React from 'react';

/**
 * InfrastructureMetrics
 * 
 * Displays infrastructure-related metrics that demonstrate the real-world
 * impact of token savings: cost savings, memory usage, and context window improvements.
 */
function InfrastructureMetrics({ comparison }) {
  // Calculate cost savings (assuming $0.01 per 1K tokens for input)
  const costPer1KTokens = 0.01;
  const jsonCost = (comparison.json_tokens / 1000) * costPer1KTokens;
  const toonCost = (comparison.toon_tokens / 1000) * costPer1KTokens;
  const costSavings = jsonCost - toonCost;

  // Calculate memory savings (rough estimate: 1 token ≈ 4 bytes)
  const jsonMemoryKB = (comparison.json_tokens * 4) / 1024;
  const toonMemoryKB = (comparison.toon_tokens * 4) / 1024;
  const memorySavingsKB = jsonMemoryKB - toonMemoryKB;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-900 mb-4">Infrastructure Impact</h3>
      
      {/* Cost Savings */}
      <div className="grid grid-cols-1 gap-3">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-green-700">Cost Savings</span>
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xl font-bold text-green-900">${costSavings.toFixed(4)}</div>
          <div className="text-xs text-green-700 mt-1">per 1K requests</div>
          <div className="text-xs text-green-800 mt-2">
            JSON: ${jsonCost.toFixed(4)} → TOON: ${toonCost.toFixed(4)}
          </div>
        </div>

        {/* Memory Savings */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-blue-700">Memory Savings</span>
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
            </svg>
          </div>
          <div className="text-xl font-bold text-blue-900">{memorySavingsKB.toFixed(2)} KB</div>
          <div className="text-xs text-blue-700 mt-1">reduced storage</div>
          <div className="text-xs text-blue-800 mt-2">
            JSON: {jsonMemoryKB.toFixed(2)} KB → TOON: {toonMemoryKB.toFixed(2)} KB
          </div>
        </div>

        {/* Token Reduction */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-purple-700">Token Reduction</span>
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="text-xl font-bold text-purple-900">{comparison.savings.toFixed(1)}%</div>
          <div className="text-xs text-purple-700 mt-1">fewer tokens</div>
          <div className="text-xs text-purple-800 mt-2">
            {comparison.json_tokens.toLocaleString()} → {comparison.toon_tokens.toLocaleString()} tokens
          </div>
        </div>
      </div>

      {/* Context Window Capacity - Removed to avoid overlap with ContextRadar */}
      {/* The ContextRadar component above provides comprehensive context window visualization */}
    </div>
  );
}

export default InfrastructureMetrics;

