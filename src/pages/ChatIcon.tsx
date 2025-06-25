import { motion, useMotionValue } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaTrash } from "react-icons/fa";

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const ChatIcon = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Animation values
  const x = useMotionValue(20);
  const y = useMotionValue(20);

  // Send message to chat API
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('https://smart-pharma-net.vercel.app/chat/ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // استخراج الرد من الحقل 'reply' كما في نموذج Postman
      const aiResponse = data.reply || "I couldn't understand that. Please try again.";
      
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai'
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'ai'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
  };

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
  };

  const toggleChat = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
      if (!isOpen && messages.length === 0) {
        setMessages([{
          id: 1,
          text: "Hello! I'm your pharmacy assistant. How can I help you today?",
          sender: 'ai'
        }]);
      }
    }
  };

  return (
    <>
      {/* Floating Chat Icon */}
      <motion.div
        drag
        dragConstraints={{
          left: 0,
          right: window.innerWidth - 60,
          top: 0,
          bottom: window.innerHeight - 60
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(_, info) => {
          setIsDragging(false);
          x.set(x.get() + info.offset.x);
          y.set(y.get() + info.offset.y);
        }}
        onClick={toggleChat}
        className="fixed z-50 cursor-pointer"
        style={{
          x,
          y,
          width: "60px",
          height: "60px"
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <div className="bg-indigo-600 rounded-full w-full h-full flex items-center justify-center shadow-xl">
          {isOpen ? (
            <FaTimes className="text-white text-2xl" />
          ) : (
            <FaRobot className="text-white text-2xl" />
          )}
        </div>
      </motion.div>

      {/* Chat Window */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed z-40 bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            left: `clamp(0px, ${x.get() + 70}px, calc(100vw - 350px))`,
            top: `clamp(0px, ${y.get()}px, calc(100vh - 500px))`,
            width: "350px",
            height: "500px"
          }}
        >
          {/* Chat Header */}
          <div className="bg-indigo-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center">
              <FaRobot className="mr-2" />
              <h3 className="font-semibold">Pharmacy Assistant</h3>
            </div>
            <div className="flex items-center">
              <button 
                onClick={clearMessages}
                className="text-white hover:text-gray-200 focus:outline-none mr-3"
                title="Clear all messages"
              >
                <FaTrash />
              </button>
              <button 
                onClick={toggleChat}
                className="text-white hover:text-gray-200 focus:outline-none"
              >
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                No messages yet. Start a conversation!
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs rounded-lg px-4 py-2 ${message.sender === 'user' 
                      ? 'bg-indigo-100 text-gray-800 border border-indigo-300 rounded-br-none' 
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'}`}
                  >
                    {message.text}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white text-gray-800 border border-gray-200 rounded-lg rounded-bl-none px-4 py-2 shadow-sm">
                  <FaSpinner className="animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-center">
              <input
                type="text"
                ref={inputRef}
                value={inputMessage}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {isLoading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPaperPlane />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
};

export default ChatIcon;