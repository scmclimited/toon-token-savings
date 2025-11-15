import React from 'react';
import Plot from 'react-plotly.js';

/**
 * ContextRadar
 *
 * Visualises the maximum context window of various foundation and open‑source
 * language models using a polar (radar) chart.  Each axis represents a
 * different model and the radial coordinate represents the relative size of
 * its context window.  The values are normalised to the largest context
 * window (Grok 4 Fast at 2M tokens) so that all models appear on the same
 * scale.
 */
function ContextRadar() {
  // Define context windows for a selection of models.  These values mirror
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
  const maxContext = 2000000; // Grok 4 Fast is the largest in this list
  const theta = models.map((m) => m.name);
  const r = models.map((m) => m.context / maxContext);
  const data = [
    {
      type: 'scatterpolar',
      r,
      theta,
      fill: 'toself',
      name: 'Normalised context window',
      marker: { color: '#17becf' },
    },
  ];
  const layout = {
    title: 'Relative context window sizes of popular models',
    polar: {
      radialaxis: {
        visible: true,
        tickformat: '.0%',
        range: [0, 1],
      },
    },
    showlegend: false,
    margin: { t: 60, l: 60, r: 60, b: 60 },
  };
  return (
    <div style={{ marginTop: '2rem' }}>
      <Plot data={data} layout={layout} config={{ responsive: true }} />
    </div>
  );
}

export default ContextRadar;