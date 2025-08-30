import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon, Link as LinkIcon, File as FileIcon, X } from 'lucide-react';
import { submitJob } from '../api/client';
import { useJobPolling } from '../hooks/useJobPolling';
// Single-line progress replaces ProgressStepper
import toast from 'react-hot-toast';

export function Upload() {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  // Advanced options
  const [enableLLM, setEnableLLM] = useState(false);
  const [narrativeLength, setNarrativeLength] = useState<number>(1000);
  const [fastMode, setFastMode] = useState(false);
  const navigate = useNavigate();

  const { jobStatus, isPolling } = useJobPolling(jobId);

  const handleFileChange = (selectedFile: File | null) => {
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
    } else if (selectedFile) {
      toast.error('Please select a video file');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFileChange(droppedFile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeTab === 'file' && !file) {
      toast.error('Please select a video file');
      return;
    }
    
    if (activeTab === 'url' && !url.trim()) {
      toast.error('Please enter a valid URL');
      return;
    }

    try {
      setSubmitError(null);
      setIsSubmitting(true);
      const response = await submitJob(
        activeTab === 'file' ? file! : undefined,
        activeTab === 'url' ? url.trim() : undefined,
        {
          fullLLM: enableLLM,
          narrativeLength: enableLLM ? narrativeLength : undefined,
          fastMode,
        }
      );
      setJobId(response.job_id);
      console.debug('[Upload] Job submitted', response.job_id);
      toast.success('Job submitted successfully!');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to submit job';
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Redirect to briefing when processing is complete
  React.useEffect(() => {
    if (jobStatus?.status === 'SUCCESS' && jobStatus.briefing_id) {
      setTimeout(() => {
        navigate(`/briefings/${jobStatus.briefing_id}`);
      }, 1500);
    }
  }, [jobStatus, navigate]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Upload Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload a video file or provide a URL for briefing analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Tab Headers */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('file')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'file'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <FileIcon className="inline mr-2 h-4 w-4" />
                Upload File
              </button>
              <button
                onClick={() => setActiveTab('url')}
                className={`flex-1 py-4 px-6 text-center text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'url'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
              >
                <LinkIcon className="inline mr-2 h-4 w-4" />
                Paste URL
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'file' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video File
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : file
                        ? 'border-green-300 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="text-center">
                      {file ? (
                        <div className="flex items-center justify-center space-x-2">
                          <FileIcon className="h-8 w-8 text-green-500" />
                          <div className="text-left">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {(file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            Video files (MP4, MOV, AVI, etc.)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                      disabled={isPolling}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://example.com/video.mp4"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isPolling}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Enter a direct URL to a video file or streaming service
                  </p>
                </div>
              )}

              {/* Advanced options */}
              <div className="space-y-3 border-t pt-4 border-gray-200 dark:border-gray-700">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={enableLLM}
                    onChange={(e) => setEnableLLM(e.target.checked)}
                    disabled={isPolling}
                  />
                  Enable LLM analysis (requires GEMINI_API_KEY on server)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Narrative length (words)</label>
                    <input
                      type="number"
                      min={300}
                      max={2500}
                      step={100}
                      value={narrativeLength}
                      onChange={(e) => setNarrativeLength(parseInt(e.target.value || '1000', 10))}
                      disabled={!enableLLM || isPolling}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Used for longform narratives in the PDF/report.</p>
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <input
                        type="checkbox"
                        checked={fastMode}
                        onChange={(e) => setFastMode(e.target.checked)}
                        disabled={isPolling}
                      />
                      Fast mode (skip heavy extras)
                    </label>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Speeds up processing (may reduce depth).</p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || isPolling || (activeTab === 'file' && !file) || (activeTab === 'url' && !url.trim())}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <UploadIcon className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Submitting...' : isPolling ? 'Processing...' : 'Start Analysis'}
              </button>
            </form>
          </div>
        </div>

        {/* Progress Tracking */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Processing Status</h2>
          </div>
          <div className="p-6">
            {jobId ? (
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Job ID</p>
                  <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                    {jobId}
                  </code>
                </div>

                {jobStatus ? (
                  <div>
                    <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span>
                        {jobStatus.status === 'PENDING'
                          ? 'Queued'
                          : jobStatus.status === 'PROCESSING'
                          ? 'Processing'
                          : jobStatus.status === 'SUCCESS'
                          ? 'Complete'
                          : 'Failed'}
                      </span>
                      <span>{Math.max(0, Math.min(100, jobStatus.progress))}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                      <div
                        className="h-2 bg-blue-600 dark:bg-blue-500 transition-all"
                        style={{ width: `${Math.max(0, Math.min(100, jobStatus.progress))}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                    <span>Waiting for status...</span>
                  </div>
                )}

                {jobStatus && jobStatus.status === 'FAILURE' && jobStatus.error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      <strong>Error:</strong> {jobStatus.error}
                    </p>
                  </div>
                )}

                {jobStatus && jobStatus.status === 'SUCCESS' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-200">
                      Processing completed! Redirecting to briefing details...
                    </p>
                  </div>
                )}
              </div>
            ) : isSubmitting ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
                  <span>Submitting job...</span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
                  <div className="h-2 w-1/3 bg-blue-600 dark:bg-blue-500 animate-pulse"></div>
                </div>
                {submitError && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200"><strong>Error:</strong> {submitError}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Submit a job to track processing status
                </p>
                {submitError && (
                  <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                    <p className="text-sm text-red-800 dark:text-red-200"><strong>Error:</strong> {submitError}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}