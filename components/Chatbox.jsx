import React, { useState, useEffect } from 'react';

const BACKEND = import.meta.env.VITE_BACKEND_URL ||               // Vite env (prod)
                'http://127.0.0.1:8000/';               // fallback

const Chatbox = () => {
  const selectedChat = localStorage.getItem('selectedChat') || '0';

  /* ---------- state ---------- */
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [api, setApi] = useState(
    localStorage.getItem('userApiKey') || ''
  );
  const [apiSubmitted, setApiSubmitted] = useState(
    localStorage.getItem(`apiSubmitted_${selectedChat}`) === 'true'
  );

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

  /* ---------- helpers ---------- */
  const saveApiLocally = (key) => {
    localStorage.setItem('userApiKey', key);
    localStorage.setItem(`apiSubmitted_${selectedChat}`, 'true');
    setApiSubmitted(true);
  };

  /* ---------- handlers ---------- */
  const handleApiSubmit = async () => {
    const key = api.trim();
    if (!key) return alert('Please enter your API key.');

    try {
      const res = await fetch(`${BACKEND}/api`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ api_key: key }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail ?? data.message);

      alert(data.message || 'API key accepted.');
      saveApiLocally(key);
      setApi('');
    } catch (err) {
      console.error('API Error:', err);
      alert(`API submit failed: ${err.message}`);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleFileSubmit = async () => {
    if (!file) return alert('Please select a file first.');

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);

    try {
      const res = await fetch(`${BACKEND}/upload-file`, { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail ?? data.message);

      alert(data.message);
      localStorage.setItem(`fileSubmitted_${selectedChat}`, 'true');
      setFileSubmitted(true);
    } catch (err) {
      console.error('File Upload Error:', err);
      alert(`Failed to upload file: ${err.message}`);
    } finally {
      setIsUploading(false);
      setFile(null);
    }
  };

  const handleQuerySubmit = async () => {
    if (!query.trim()) return alert('Please enter a query.');

    try {
      const res = await fetch(`${BACKEND}/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, api_key: localStorage.getItem('userApiKey') }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.detail ?? data.error ?? 'Unknown server error');

      setResponse(data.answer || 'No response received.');
      setSources(data.sources?.join(', ') || 'No sources available.');

      localStorage.setItem(`response_${selectedChat}`, data.answer || '');
      localStorage.setItem(`sources_${selectedChat}`, data.sources?.join(', ') || '');
      setQuery('');
    } catch (err) {
      console.error('Query Error:', err);
      setResponse(`Error: ${err.message}`);
    }
  };

  /* ---------- render ---------- */
  return (
    <div className="flex flex-col h-screen w-full bg-[#c0c0c0] font-serif">
      {/* ---------- Response area ---------- */}
      <div className="flex-grow p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#000000] mb-4">AI Response:</h2>
        <div className="bg-white text-black text-lg rounded-xl p-4 shadow h-full whitespace-pre-wrap">
          {response || 'Hi. I am your assistant. Ask me a question after uploading a file.'}
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold text-[#333]">Sources:</h3>
          <p className="text-base text-gray-800">{sources || 'Sources will appear here.'}</p>
        </div>
      </div>

      {/* ---------- Controls ---------- */}
      <div className="flex flex-col items-center justify-end py-6 w-full bg-gray-100 text-white shadow-inner rounded-t-3xl">
        <h1 className="text-red-600 text-2xl font-semibold mb-4 text-center">
          Enter API Key, Upload File, and Ask Query:
        </h1>

        <div className="flex flex-col gap-4 w-[90%]">
          {/* ------ Query ------ */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Type your query here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!fileSubmitted || !apiSubmitted}
              className={`p-2 h-10 w-[80%] text-black text-lg rounded-xl shadow ${
                fileSubmitted && apiSubmitted ? 'bg-white' : 'bg-gray-400'
              }`}
            />
            <button
              onClick={handleQuerySubmit}
              disabled={!fileSubmitted || !apiSubmitted}
              className={`px-4 py-2 rounded-xl text-lg transition ${
                fileSubmitted && apiSubmitted
                  ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Submit Query
            </button>
          </div>

          {/* ------ API key ------ */}
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Enter your API key (Groq or OpenAI)"
              value={api}
              onChange={(e) => setApi(e.target.value)}
              className="p-2 h-10 w-[80%] text-black text-lg rounded-xl shadow bg-white"
            />
            <button
              onClick={handleApiSubmit}
              className="px-4 py-2 bg-[#ff3333] hover:bg-[#cc0000] text-white rounded-xl text-lg transition"
            >
              Submit API Key
            </button>
          </div>

          {/* ------ File upload ------ */}
          <div className="flex gap-4">
            <label className="p-2 h-10 w-[60%] bg-white text-black text-sm rounded-xl shadow flex items-center justify-center cursor-pointer">
              Upload File
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx,.md"
                className="hidden"
              />
            </label>
            {isUploading ? (
              <div className="flex items-center justify-center h-10 w-10">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-t-transparent border-green-600"></div>
              </div>
            ) : (
              <button
                onClick={handleFileSubmit}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg transition"
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
