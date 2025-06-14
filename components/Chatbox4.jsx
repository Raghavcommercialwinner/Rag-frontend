//Chatbox with full screen load 
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
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

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
    <div className="flex flex-col h-screen w-full bg-[#c0c0c0] font-serif relative">
      {isUploading && (
        <div className="absolute top-0 left-0 w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-20 w-20 border-8 border-t-transparent border-white"></div>
        </div>
      )}

      <div className="flex-grow p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold text-[#000000] mb-4">AI Response:</h2>
        <div className="bg-white text-black text-lg rounded-xl p-4 shadow h-full whitespace-pre-wrap">
          {response || "Hi. I am your assistant. Ask me a question after uploading a file."}
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold text-[#333]">Sources:</h3>
          <p className="text-base text-gray-800">{sources || "Sources will appear here."}</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-end py-6 w-full bg-gray-100 text-white shadow-inner rounded-t-3xl">
        <h1 className="text-red-600 text-2xl font-semibold mb-4 text-center">
          Enter API Key, Upload File, and Ask Query:
        </h1>

        <div className="flex flex-col gap-4 w-[90%]">
          <div className='flex gap-4'>
            <input
              type="text"
              placeholder="Type your query here..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={!fileSubmitted || !apiSubmitted}
              className={`p-2 h-10 w-[80%] text-black text-lg rounded-xl shadow ${fileSubmitted && apiSubmitted ? 'bg-white' : 'bg-gray-400'}`}
            />
            <button
              onClick={handleQuerySubmit}
              disabled={!fileSubmitted || !apiSubmitted}
              className={`px-4 py-2 rounded-xl text-lg transition ${fileSubmitted && apiSubmitted ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-400 cursor-not-allowed'}`}
            >
              Submit Query
            </button>
          </div>

          <div className='flex gap-4'>
            <input
              type="text"
              placeholder="Enter your API key (Only accepts groq and openAI API-keys)"
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

          <div className='flex gap-4'>
            <label className="p-2 h-10 w-[60%] bg-white text-black text-sm rounded-xl shadow flex items-center justify-center cursor-pointer">
              Upload File
              <input
                type="file"
                onChange={handleFileChange}
                accept=".txt,.pdf,.docx,.doc,.md"
                className="hidden"
              />
            </label>
            <button
              onClick={handleFileSubmit}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg transition"
            >
              Submit File
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
