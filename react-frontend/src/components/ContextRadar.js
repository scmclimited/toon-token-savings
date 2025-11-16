import React from 'react';
import Plot from 'react-plotly.js';

/**
 * ContextRadar
 *
 * Visualises how much of each model's context window is consumed by the uploaded
 * data when encoded in JSON vs TOON format. Each axis represents a different model
 * and the radial coordinate represents the percentage of the context window used.
 * Shows both JSON and TOON usage for comparison.
 */
function ContextRadar({ comparison }) {
  // Define context windows for a selection of models. These values mirror
  // the information from the `models_info.py` module in the backend.
  const models = [
    { name: 'Mistral 7B', context: 8000 },
    { name: 'XGen 7B 8K', context: 8192 },
    { name: 'Llama 2 7B', context: 4096 },
    { name: 'GPT‑4 Turbo', context: 128000 },
    { name: 'GPT‑4.1 (1M)', context: 1000000 },
    { name: 'Claude Sonnet', context: 200000 },
    { name: 'Claude 4.5', context: 1000000 },
    { name: 'Gemini 2.5 Pro', context: 1000000 },
    { name: 'DeepSeek V3.2', context: 128000 },
    { name: 'Phi‑3 Medium', context: 128000 },
    { name: 'Grok 4 Fast', context: 2000000 },
    { name: 'Llama 3.1', context: 128000 },
    { name: 'Mixtral/DBRX', context: 32000 },
  ];

  const theta = models.map((m) => m.name);

  // If comparison data is available, show actual usage; otherwise don't show chart
  let jsonUsage = [];
  let toonUsage = [];
  let title = 'Context window usage: JSON vs TOON';
  let showLegend = false;
  let showChart = false;

  if (comparison && comparison.json_tokens && comparison.toon_tokens) {
    showChart = true;
    // Calculate percentage of context window used for each model
    jsonUsage = models.map((m) => {
      const rawUsage = (comparison.json_tokens / m.context) * 100;
      // Cap at 100% for models where data exceeds context
      const usage = Math.min(rawUsage, 100);
      return usage;
    });
    
    toonUsage = models.map((m) => {
      const rawUsage = (comparison.toon_tokens / m.context) * 100;
      const usage = Math.min(rawUsage, 100);
      return usage;
    });
    
    title = 'Context window usage: JSON vs TOON';
    showLegend = true;
  }

  const data = [];
  
  if (showChart && toonUsage.length > 0) {
    // Show both JSON and TOON usage
    data.push({
      type: 'scatterpolar',
      r: jsonUsage,
      theta,
      fill: 'toself',
      name: 'JSON',
      marker: { color: '#1f77b4' },
      line: { color: '#1f77b4', width: 2 },
    });
    data.push({
      type: 'scatterpolar',
      r: toonUsage,
      theta,
      fill: 'toself',
      name: 'TOON',
      marker: { color: '#ff7f0e' },
      line: { color: '#ff7f0e', width: 2 },
      fillcolor: 'rgba(255, 127, 14, 0.3)',
    });
  }

  // Determine appropriate scale based on data
  let maxRange = 100;
  let tickFormat = '.1f';
  let tickSuffix = '%';
  
  if (comparison && comparison.json_tokens && comparison.toon_tokens) {
    const maxUsage = Math.max(...jsonUsage, ...toonUsage);
    // If max usage is very low (< 10%), use a smaller scale for better visibility
    // Otherwise use full 0-100% scale
    if (maxUsage < 10) {
      // Use a scale that goes slightly above max usage for better visibility
      maxRange = Math.ceil(maxUsage * 1.2 / 10) * 10; // Round up to nearest 10
      if (maxRange < 5) maxRange = 5; // Minimum scale of 5%
    }
  }

  const layout = {
    title: title,
    polar: {
      radialaxis: {
        visible: true,
        tickformat: comparison ? tickFormat : '.0%',
        ticksuffix: comparison ? tickSuffix : '',
        range: comparison ? [0, maxRange] : [0, 100],
      },
    },
    showlegend: showLegend,
    legend: showLegend ? {
      orientation: 'h',
      y: -0.1,
      x: 0.5,
      xanchor: 'center',
    } : undefined,
    margin: { t: 60, l: 60, r: 60, b: showLegend ? 120 : 60 },
    autosize: true,
  };

  // Calculate some stats for the info text
  let infoText = '';
  let additionalNote = '';
  if (comparison && comparison.json_tokens && comparison.toon_tokens) {
    const maxUsage = Math.max(...jsonUsage, ...toonUsage);
    const modelsWithSignificantUsage = jsonUsage.filter((u, i) => u > 5 || toonUsage[i] > 5).length;
    const largeContextModels = models.filter((m, i) => m.context >= 128000 && (jsonUsage[i] < 1 || toonUsage[i] < 1));
    
    infoText = 'Percentage of each model\'s context window consumed by your data. Lower values mean more room for additional content.';
    
    if (maxUsage < 10 && largeContextModels.length > 0) {
      additionalNote = `Note: Models with large context windows (128K+ tokens) show very low usage (< 1%) because your dataset is small relative to their capacity. The visible differences are most apparent for models with smaller context windows (4K-32K). For large-context models, TOON savings allow fitting ${Math.round(comparison.json_tokens / comparison.toon_tokens)}x more datasets.`;
    }
  }

  return (
    <div className="bg-slate-50 rounded-lg p-3 lg:p-4 pb-4 lg:pb-6 mb-0 h-full flex flex-col">
      {showChart ? (
        <>
          <div className="mb-3 lg:mb-4 flex-shrink-0">
            <p className="text-xs lg:text-sm text-slate-600 mb-2">
              {infoText}
            </p>
            {additionalNote && (
              <div className="mb-2 p-2 lg:p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  {additionalNote}
                </p>
              </div>
            )}
            {comparison && comparison.json_tokens && comparison.toon_tokens && (
              <p className="text-xs text-slate-500 italic">
                JSON: {comparison.json_tokens.toLocaleString()} tokens | TOON: {comparison.toon_tokens.toLocaleString()} tokens
              </p>
            )}
          </div>
          <div className="w-full overflow-hidden flex-1" style={{ minHeight: '300px', paddingBottom: showLegend ? '40px' : '0' }}>
            <Plot data={data} layout={layout} config={{ responsive: true, displayModeBar: false }} style={{ width: '100%', height: '100%' }} />
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center flex-1" style={{ minHeight: '300px' }}>
          <p className="text-xs lg:text-sm text-slate-600 text-center px-4">
            Upload a file to see how much of each model's context window your data consumes. The chart will show JSON vs TOON usage for comparison.
          </p>
        </div>
      )}
    </div>
  );
}

export default ContextRadar;