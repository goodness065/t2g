"use client"
import { useState } from 'react';

export default function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const generateVideo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter video prompt..."
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={generateVideo} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Video'}
      </button>
      
      {result && (
        <div>
          {/* @ts-expect-error Async Server Component */}
          <p>{result.message}</p>
          {/* @ts-expect-error Async Server Component */}
          {result.videoPath && <p>Video saved to: {result.videoPath}</p>}
        </div>
      )}
    </div>
  );
}