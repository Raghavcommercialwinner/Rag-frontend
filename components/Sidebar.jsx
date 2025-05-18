import React, { useState } from 'react';

const Sidebar = () => {
  const [chats, setChats] = useState(
    parseInt(localStorage.getItem('totalChats') || '5')
  );

  const selectedChat = parseInt(localStorage.getItem('selectedChat') || '0');

  const handleChatClick = (chatIndex) => {
    localStorage.setItem('selectedChat', chatIndex);
    window.location.reload();
  };

  const handleAddChat = () => {
    const newChatCount = chats + 1;
    setChats(newChatCount);
    localStorage.setItem('totalChats', newChatCount);
  };

  return (
    <div className="bg-neutral-500 overflow-y-scroll rounded-r-2xl h-screen w-[200px]">
      <div className="flex justify-end">
        <div className="text-red-500 text-fill font-serif">click + for new chat</div>
        <button
          className="bg-white px-4 py-2 cursor-pointer hover:bg-neutral-300 transition-all duration-300 text-3xl"
          onClick={handleAddChat}
        >
          +
        </button>
      </div>
      <div className="flex flex-col gap-[2px]">
        {Array.from({ length: chats }, (_, i) => (
          <div
            key={i}
            onClick={() => handleChatClick(i)}
            className={`text-white cursor-pointer w-full self-center transition duration-300 px-3 py-2
              ${i === selectedChat ? 'bg-black hover:bg-gray-800' : 'bg-neutral-600 hover:bg-black'}
            `}
          >
            chat {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
