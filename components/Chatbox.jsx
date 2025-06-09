import React, { useState } from 'react';

const Chatbox = () => {
  const selectedChat = localStorage.getItem('selectedChat') || '0';

  const [file, setFile] = useState(null);
  const [fileSubmitted, setFileSubmitted] = useState(
    localStorage.getItem(`fileSubmitted_${selectedChat}`) === 'true'
  );
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(
    localStorage.getItem(`response_${selectedChat}`) || ''
  );
  const [sources, setSources] = useState(
    localStorage.getItem(`sources_${selectedChat}`) || ''
  );
  const [api, setApi] = useState('');
  const [apiSubmitted, setApiSubmitted] = useState(
    localStorage.getItem(`apiSubmitted_${selectedChat}`) === 'true'
  );
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleApiSubmit = async () => {
    if (api.trim() !== '') {
      try {
        const res = await fetch('http://127.0.0.1:8000/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: api }),
        });
        const data = await res.json();
        alert(data.message || 'API key accepted.');
        setApiSubmitted(true);
        localStorage.setItem(`apiSubmitted_${selectedChat}`, 'true');
        setApi('');
      } catch (error) {
        console.error("API Error:", error);
        alert("Failed to submit API key.");
      }
    } else {
      alert("Please enter your API key.");
    }
  };

  const handleFileSubmit = async () => {
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      setIsUploading(true);

      try {
        const res = await fetch('http://127.0.0.1:8000/upload-file', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        alert(data.message);
        setFileSubmitted(true);
        localStorage.setItem(`fileSubmitted_${selectedChat}`, 'true');
      } catch (error) {
        console.error("File Upload Error:", error);
        alert("Failed to upload file.");
      } finally {
        setIsUploading(false);
      }
    } else {
      alert("Please select a file first.");
    }
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) {
      alert("Please enter a query.");
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      setResponse(data.answer || "No response received.");
      setSources(data.sources ? data.sources.join(', ') : "No sources available.");
      localStorage.setItem(`response_${selectedChat}`, data.answer || '');
      localStorage.setItem(`sources_${selectedChat}`, data.sources ? data.sources.join(', ') : '');
      setQuery('');
    } catch (error) {
      console.error("Query Error:", error);
      setResponse("Error: Could not get response.");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 font-sans">
      {/* Response Section */}
      <div className="flex-grow px-6 py-8 overflow-y-auto">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 tracking-tight">AI Response</h2>
        <div className="bg-white text-gray-900 text-lg rounded-2xl p-6 shadow-lg min-h-[160px] whitespace-pre-wrap transition-all">
          {response || "Hi. I am your assistant. Ask me a question after uploading a file."}
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Sources</h3>
          <p className="text-base text-gray-600">{sources || "Sources will appear here."}</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="flex flex-col items-center justify-end py-8 w-full bg-white/80 backdrop-blur shadow-inner rounded-t-3xl border-t border-gray-200">
        <h1 className="text-pink-600 text-2xl font-bold mb-6 text-center tracking-wide">
          Enter API Key, Upload File, and Ask Query
        </h1>

        <div className="flex flex-col gap-5 w-full max-w-2xl mx-auto">
          {/* Query Input */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Type your query here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!fileSubmitted || !apiSubmitted}
              className={`flex-1 px-4 h-12 text-lg rounded-xl border focus:outline-none transition shadow-sm ${
                fileSubmitted && apiSubmitted
                  ? 'bg-white border-gray-300 focus:ring-2 focus:ring-blue-400'
                  : 'bg-gray-200 border-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            />
            <button
              onClick={handleQuerySubmit}
              disabled={!fileSubmitted || !apiSubmitted}
              className={`px-6 h-12 rounded-xl text-lg font-semibold transition-all shadow ${
                fileSubmitted && apiSubmitted
                  ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Submit Query
            </button>
          </div>

          {/* API Key Input */}
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Enter your API key (groq or OpenAI only)"
              value={api}
              onChange={(e) => setApi(e.target.value)}
              className="flex-1 px-4 h-12 text-lg rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            />
            <button
              onClick={handleApiSubmit}
              className="px-6 h-12 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-lg font-semibold transition-all shadow"
            >
              Submit API Key
            </button>
          </div>

          {/* File Upload */}
          <div className="flex gap-3 items-center">
            <label className="flex-1 flex items-center justify-center h-12 bg-white border border-gray-300 text-gray-700 text-base rounded-xl shadow-sm cursor-pointer hover:bg-gray-50 transition">
              <span className="truncate">Upload File</span>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx,.doc,.md"
                className="hidden"
              />
            </label>
            {isUploading ? (
              <div className="flex items-center justify-center h-12 w-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-green-600"></div>
              </div>
            ) : (
              <button
                onClick={handleFileSubmit}
                className="px-6 h-12 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-semibold transition-all shadow"
              >
                Submit File
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
