import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RiSendPlane2Fill, RiRobot2Line, RiCloseLine, RiUserLine } from 'react-icons/ri';
import './AIChatWindow.scss';
import { useGetSupportChatMutation } from './services/supportAiApi';

const AIChatWindow = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your Grewox CRM AI Assistant. How can I help you today?", sender: 'ai', timestamp: new Date() }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const [getSupportChat] = useGetSupportChatMutation();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            // Prepare history for API - filter out initial welcome message and ensure it starts with 'user'
            const history = messages
                .filter((msg, index) => !(index === 0 && msg.sender === 'ai')) // skip initial welcome
                .map(msg => ({
                    role: msg.sender === 'ai' ? 'assistant' : 'user',
                    content: msg.text
                }));

            const response = await getSupportChat({
                message: inputValue,
                history
            }).unwrap();

            const aiResponse = {
                id: Date.now() + 1,
                text: response.data.text,
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error("AI Error:", error);
            const errorMessage = {
                id: Date.now() + 1,
                text: "Sorry, I'm having trouble connecting to my brain right now. Please try again later.",
                sender: 'ai',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    className="ai-chat-window"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    transition={{ type: "spring", duration: 0.5 }}
                >
                    <div className="chat-header">
                        <div className="header-info">
                            <div className="ai-avatar">
                                <RiRobot2Line />
                                <span className="status-indicator"></span>
                            </div>
                            <div className="title-area">
                                <h3>Grewox CRM AI Assistant</h3>
                                <span>Online</span>
                            </div>
                        </div>
                        <button className="close-btn" onClick={onClose}>
                            <RiCloseLine size={24} />
                        </button>
                    </div>

                    <div className="messages-container">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                                <div className="message-icon">
                                    {msg.sender === 'ai' ? <RiRobot2Line /> : <RiUserLine />}
                                </div>
                                <div className="message-bubble">
                                    <p>{msg.text}</p>
                                    <span className="timestamp">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="message-wrapper ai">
                                <div className="message-icon">
                                    <RiRobot2Line />
                                </div>
                                <div className="typing-indicator">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="chat-input-area" onSubmit={handleSendMessage}>
                        <input 
                            type="text" 
                            placeholder="Type your message..." 
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <button type="submit" disabled={!inputValue.trim()}>
                            <RiSendPlane2Fill size={20} />
                        </button>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AIChatWindow;
