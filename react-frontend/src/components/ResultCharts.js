import React from 'react';
import Plot from 'react-plotly.js';

/**
 * ResultCharts
 *
 * Renders a pair of charts that visualise the token counts of JSON and TOON
 * representations along with the relative savings.  A bar chart compares
 * absolute token counts, and a line chart (with a marker) illustrates the
 * percentage savings.  Using Plotly allows interactive exploration.
 */
function ResultCharts({ comparison }) {
  const barData = [
    {
      x: ['JSON', 'TOON'],
      y: [comparison.json_tokens, comparison.toon_tokens],
      type: 'bar',
      marker: { color: ['#1f77b4', '#ff7f0e'] },
    },
  ];
  const barLayout = {
    title: 'Token counts by format',
    yaxis: { title: 'Tokens' },
    xaxis: { title: 'Format' },
    margin: { t: 35, l: 50, r: 15, b: 35 },
    font: { size: 11 },
  };

  const lineData = [
    {
      x: ['Savings'],
      y: [comparison.savings],
      type: 'bar',
      marker: { color: '#2ca02c' },
    },
  ];
  const lineLayout = {
    title: 'Relative savings (%)',
    yaxis: { title: 'Percentage', ticksuffix: '%', range: [0, 100] },
    xaxis: { title: '' },
    margin: { t: 35, l: 50, r: 15, b: 35 },
    font: { size: 11 },
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-3">
        <Plot data={barData} layout={barLayout} config={{ responsive: true, displayModeBar: false }} style={{ width: '100%', height: '250px' }} />
      </div>
      <div className="bg-slate-50 rounded-lg p-3">
        <Plot data={lineData} layout={lineLayout} config={{ responsive: true, displayModeBar: false }} style={{ width: '100%', height: '250px' }} />
      </div>
    </div>
  );
}

export default ResultCharts;