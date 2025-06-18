import { createChatBotMessage } from 'react-chatbot-kit';

const config = {
  // @ts-ignore

  
  initialMessages: [createChatBotMessage("Hello! How can I assist you?")],
  botName: "Smart PharmaNet",
  customStyles: {
    userAvatar: {
      display: 'none',
    },
    botAvatar: {
      display: 'none',
    },
    userMessageBox: {
      backgroundColor: '#4F46E5', 
      color: '#FFFFFF',
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '12px 12px 0 12px', 
      padding: '10px 16px',
      margin: '8px 0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
    },
   botMessageBox: {
      backgroundColor: '#E0E7FF', 
      color: '#1E1E1E', 
      fontSize: '14px',
      fontWeight: '500',
      borderRadius: '12px 12px 12px 0', 
      padding: '10px 16px',
      margin: '8px 0',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
    },
    text: {
      fontSize: '14px',
      color: '#1E1E1E', 
    },
    chatInput: {
      backgroundColor: '#FFFFFF', 
      border: '1px solid #E0E7FF', 
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px',
      color: '#1E1E1E', 
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
    },
    sendButton: {
      backgroundColor: '#4F46E5', 
      color: '#FFFFFF', 
      borderRadius: '8px',
      padding: '10px 16px',
      fontSize: '14px',
      fontWeight: '500',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', 
    },
  },
};

export default config;