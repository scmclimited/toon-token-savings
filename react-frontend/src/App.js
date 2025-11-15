import React, { useState } from 'react';
import UploadForm from './components/UploadForm';
import ResultCharts from './components/ResultCharts';
import ContextRadar from './components/ContextRadar';

// Root component for the React frontend.  It provides a simple UI for
// uploading a JSON file, calling the FastAPI backend to convert it to
// TOON and compare token counts, and then visualising the results.  It
// also renders a radar chart comparing context windows for common
// foundation models.
function App() {
  const [comparison, setComparison] = useState(null);
  const [toon, setToon] = useState('');

  /**
   * Handler invoked when a file is uploaded via the UploadForm.
   * It expects the backend API to return a JSON object with the
   * TOON string under `toon` and a comparison object under
   * `comparison`.
   */
  const handleUpload = (result) => {
    setToon(result.toon);
    setComparison(result.comparison);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem' }}>
      <h1>TOON Token Savings Demo</h1>
      <p>
        Upload a JSON file to see how many tokens its representation uses in
        JSON format compared with the compact TOON format.  The charts below
        illustrate the absolute token counts and the percentage savings.  A
        radar plot compares the relative sizes of context windows for popular
        foundation models so you can gauge how your data fits into different
        models.
      </p>
      <UploadForm onUpload={handleUpload} />
      {comparison && (
        <>
          <h2>Results</h2>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#f6f8fa', padding: '1rem', borderRadius: '4px' }}>
            <strong>TOON representation:</strong>\n{toon}
          </pre>
          <ResultCharts comparison={comparison} />
          <ContextRadar />
        </>
      )}
    </div>
  );
}

export default App;