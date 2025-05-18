import React, { useState } from 'react';

const Chatbox = () => {
  const [file, setFile] = useState(null);
  const [fileSubmitted, setFileSubmitted] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [sources, setSources] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileSubmit = async () => {
    if (file) {
      setFileSubmitted(true);
      alert(`File "${file.name}" submitted.`);

      // Send the file to the backend
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://127.0.0.1:8000/upload-file', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        alert(data.message);  // Alert success message from backend
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      alert("Please select a file.");
    }
  };

  const handleQuerySubmit = async () => {
    if (query.trim() !== '') {
      const queryData = { query };
      try {
        // Send the query to the backend
        const response = await fetch('http://127.0.0.1:8000/query', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(queryData),
        });

        const data = await response.json();

        // Update the state with the response, prompt, and sources
        setResponse(data.answer);
        setSources(data.sources.join(', ')); // Join sources as a comma-separated string
        setQuery('');
      } catch (error) {
        console.error("Error submitting query:", error);
      }
    }
  };

  const handleGenerateVectorStore = async () => {
    // Trigger the vector store creation
    try {
      const response = await fetch('http://127.0.0.1:8000/generate-vector-store', {
        method: 'POST',
      });

      const data = await response.json();
      alert(data.message);  // Alert success message from backend
    } catch (error) {
      console.error("Error processing vector store:", error);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* AI Response Box */}
      <div className="flex-grow w-full p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">AI Response:</h2>
        <div className="bg-white p-4 rounded-lg shadow h-full text-lg text-gray-800 whitespace-pre-wrap">
          {response || "Hi. Response will appear here after submitting a query."}
        </div>
        <div className="mt-4">
          <h3 className="text-xl font-bold text-gray-600">Sources:</h3>
          <p className="text-lg text-gray-600">{sources || "Sources will be listed here."}</p>
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="flex flex-col items-center justify-end py-6 w-full bg-gray-100 shadow-inner">
        <h1 className="text-red-600 text-2xl font-serif mb-4">
          Upload your file and Enter your query:
        </h1>

        <div className="flex gap-4 w-[80%] justify-center">
          {/* Query Input box*/}
          <input
            type="text"
            placeholder="Type your query..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={!fileSubmitted}
            className={`p-2 h-10 w-[50%] text-black text-lg rounded-2xl shadow ${
              fileSubmitted ? 'bg-white' : 'bg-gray-300'
            }`}
          />

          {/*Button to submit query*/}
          <button
            onClick={handleQuerySubmit}
            disabled={!fileSubmitted}
            className={`px-4 py-2 rounded-2xl transition ${
              fileSubmitted
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            Submit Query
          </button>

          {/* File Input */}
          <label className="p-2 h-10 w-[30%] bg-white text-black text-sm rounded-2xl shadow flex items-center justify-center cursor-pointer">
            Upload File
            <input
              type="file"
              onChange={handleFileChange}
              accept=".txt, .pdf, .doc, .docx, .md"
              className="hidden"
            />
          </label>

          {/* button to submit file */}
          <button
            onClick={handleFileSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition"
          >
            Submit File
          </button>

          {/*button to store data in vector form */}
          <button
            onClick={handleGenerateVectorStore}
            className={`px-4 py-2 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition`}
          >
            Convert to Vector Store
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbox;
