import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import UploadForm from './components/UploadForm';
import ResultCharts from './components/ResultCharts';
import ContextRadar from './components/ContextRadar';
import InfrastructureMetrics from './components/InfrastructureMetrics';
import DatasetDownload from './components/DatasetDownload';
import axios from 'axios';
import config from './config';
import {
  setComparisonData,
  setDecodedJson,
  setShowJson,
  setIsDecoding,
  setLoadingSample,
} from './store/appSlice';

// Root component for the React frontend.  It provides a simple UI for
// uploading a JSON file, calling the FastAPI backend to convert it to
// TOON and compare token counts, and then visualising the results.  It
// also renders a radar chart comparing context windows for common
// foundation models.
function App() {
  const dispatch = useDispatch();
  const {
    comparison,
    toon,
    toonError,
    originalJson,
    showJson,
    decodedJson,
    isDecoding,
    loadingSample,
  } = useSelector((state) => state.app);

  /**
   * Handler invoked when a file is uploaded via the UploadForm.
   * It expects the backend API to return a JSON object with the
   * TOON string under `toon`, a comparison object under
   * `comparison`, and optionally a `toon_error` message.
   */
  const handleUpload = (result) => {
    const prettyJson = result.original_json || '';
    dispatch(
      setComparisonData({
        comparison: result.comparison,
        toon: result.toon || '',
        toonError: result.toon_error || null,
        originalJson: prettyJson,
        decodedJson: '', // Do NOT set decodedJson here - let it be decoded on demand
      })
    );
    dispatch(setShowJson(false));
    dispatch(setIsDecoding(false));
    dispatch(setLoadingSample(false));
  };

  /**
   * Load and process the sample dataset on component mount.
   * This allows users to see the comparison immediately on page load.
   */
  useEffect(() => {
    const loadSampleData = async () => {
      try {
        // Fetch the sample JSON file
        const response = await fetch('/data/employee_records.json');
        if (!response.ok) {
          throw new Error('Failed to load sample data');
        }
        const jsonData = await response.json();
        
        // Convert JSON to a File object that can be uploaded
        const jsonString = JSON.stringify(jsonData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const file = new File([blob], 'employee_records.json', { type: 'application/json' });
        
        // Create FormData and upload to the API
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadResponse = await axios.post(`${config.API_BASE_URL}/upload`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        // Process the result just like a user upload
        handleUpload(uploadResponse.data);
      } catch (error) {
        console.error('Error loading sample data:', error);
        dispatch(setLoadingSample(false));
        // Don't show error to user - just silently fail and let them upload their own file
      }
    };

    loadSampleData();
  }, [dispatch]); // Empty dependency array - only run on mount

  const handleDecodeJson = async () => {
    if (!toon) return;

    // If we already have decoded JSON, just show it
    if (decodedJson) {
      dispatch(setShowJson(true));
      return;
    }

    // If we have the original JSON from the upload, use that
    if (originalJson) {
      dispatch(setDecodedJson(originalJson));
      dispatch(setShowJson(true));
      return;
    }

    // Otherwise, decode from TOON via API
    dispatch(setIsDecoding(true));
    try {
      const response = await axios.post(`${config.API_BASE_URL}/decode`, {
        toon: toon,
      });
      const formatted = JSON.stringify(response.data.data, null, 2);
      dispatch(setDecodedJson(formatted));
      dispatch(setShowJson(true));
    } catch (err) {
      const errorMessage = `Error: ${err.response?.data?.detail || err.message}`;
      dispatch(setDecodedJson(errorMessage));
      dispatch(setShowJson(true));
    } finally {
      dispatch(setIsDecoding(false));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">TOON Token Savings Demo</h1>
          <p className="text-slate-600 text-lg leading-relaxed">
            {loadingSample ? (
              <>
                Loading sample data...
              </>
            ) : (
              <>
                The charts below show a comparison of token usage between JSON and TOON formats using sample employee data. 
                Upload your own JSON file to see how many tokens its representation uses, or download the sample dataset below.
              </>
            )}
          </p>
        </div>
        
        {/* Dataset Download Component */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <DatasetDownload />
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <UploadForm onUpload={handleUpload} />
        </div>

        {/* How It Works and Context Window Comparison - Side by Side */}
        <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Pipeline Flow Diagram */}
            <div className="min-w-0 flex flex-col">
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 mb-4 lg:mb-6">How It Works</h2>
              <p className="text-sm lg:text-base text-slate-600 mb-4 lg:mb-6">
                The data processing pipeline converts JSON to TOON format, reducing token usage while maintaining data integrity.
              </p>
              <div className="bg-slate-50 rounded-lg p-3 lg:p-4 border border-slate-200 flex-1 flex items-center justify-center min-h-[300px] lg:min-h-[400px]">
                <img 
                  src="/pipeline_flow.png" 
                  alt="Data processing pipeline flow" 
                  className="w-full h-auto rounded-lg max-w-full"
                  onError={(e) => {
                    // Fallback if image not found in public folder
                    e.target.src = '../docs/pipeline_flow.png';
                  }}
                />
              </div>
            </div>

            {/* Context Window Comparison */}
            <div className="min-w-0 flex flex-col">
              <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 mb-4 lg:mb-6">Model Context Windows</h2>
              <ContextRadar comparison={comparison} />
            </div>
          </div>
        </div>

        {comparison && (
          <div className="space-y-8">

            {/* Results, Infrastructure Metrics, and Token Comparison - Side by Side */}
            <div className="bg-white rounded-2xl shadow-lg p-6 lg:p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {/* Results Section */}
                <div className="min-w-0 flex flex-col">
                  <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 mb-4 lg:mb-6">Results</h2>
                  {toonError && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h3 className="text-sm font-semibold text-amber-800 mb-1">TOON Encoding Unavailable</h3>
                          <p className="text-sm text-amber-700">{toonError}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Format Representations */}
                  <div className="space-y-4">
                    {toon && (
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">TOON Representation</h3>
                          {!showJson && (
                            <button
                              type="button"
                              onClick={handleDecodeJson}
                              disabled={isDecoding}
                              aria-busy={isDecoding}
                              className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors whitespace-nowrap ${
                                isDecoding
                                  ? 'bg-blue-300 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700'
                              }`}
                            >
                              {isDecoding ? 'Decoding...' : 'Decode to JSON'}
                            </button>
                          )}
                        </div>
                        <pre className="whitespace-pre-wrap text-xs text-slate-800 font-mono overflow-x-auto max-h-96 overflow-y-auto">
                          {toon}
                        </pre>
                      </div>
                    )}
                    
                    {showJson && (
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Decoded JSON</h3>
                          <button
                            type="button"
                            onClick={() => dispatch(setShowJson(false))}
                            className="px-3 py-1.5 text-white text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors whitespace-nowrap"
                          >
                            Hide JSON
                          </button>
                        </div>
                        <pre className="whitespace-pre-wrap text-xs text-slate-800 font-mono overflow-x-auto max-h-96 overflow-y-auto">
                          {decodedJson || originalJson}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>

                {/* Infrastructure Metrics */}
                <div className="min-w-0 flex flex-col">
                  <InfrastructureMetrics comparison={comparison} />
                </div>

                {/* Token Comparison Charts */}
                <div className="min-w-0 flex flex-col lg:col-span-2 xl:col-span-1">
                  <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 mb-4 lg:mb-6">Token Comparison</h2>
                  <ResultCharts comparison={comparison} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;