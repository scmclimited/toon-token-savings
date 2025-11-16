import React from 'react';

/**
 * DatasetDownload
 * 
 * Component that allows users to download JSON files from publicly available
 * datasets used for benchmarking. These datasets are stored in the data/ directory
 * and can be downloaded directly.
 */
function DatasetDownload({ onDatasetSelect }) {
  const datasets = [
    {
      name: 'Employee Records',
      filename: 'employee_records.json',
      description: '100 mock employee records with fields like id, name, department, salary, start_date, performance_score, and remote. Perfect for demonstrating TOON\'s tabular array syntax.',
      size: '~25 KB'
    },
    // Add more datasets here as they become available
  ];

  const handleDownload = async (filename) => {
    try {
      // Fetch the file and create a blob for download
      const response = await fetch(`/data/${filename}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
      // Fallback: try direct link
      const link = document.createElement('a');
      link.href = `/data/${filename}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Sample Datasets</h3>
        <p className="text-sm text-slate-600 mb-4">
          Download publicly available JSON datasets used for benchmarking. These datasets are designed to showcase TOON's efficiency with structured data.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {datasets.map((dataset) => (
          <div
            key={dataset.filename}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h4 className="font-medium text-slate-900">{dataset.name}</h4>
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{dataset.size}</span>
              </div>
              <p className="text-sm text-slate-600">{dataset.description}</p>
            </div>
            <button
              onClick={() => handleDownload(dataset.filename)}
              className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        ))}
      </div>
      
      {datasets.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>No sample datasets available yet.</p>
        </div>
      )}
    </div>
  );
}

export default DatasetDownload;

