import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RiRobot2Line, RiCloseLine } from 'react-icons/ri';
import './FloatingAIBtn.scss';
import AIChatWindow from './AIChatWindow';

const FloatingAIBtn = () => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <>
            <motion.div 
                className="floating-ai-btn-container"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 1 
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
            >
                <div className="glow-effect"></div>
                <button className="floating-ai-btn" onClick={() => setIsChatOpen(!isChatOpen)}>
                    <RiRobot2Line size={28} />
                    <span className="pulse-ring"></span>
                </button>
                {!isChatOpen && <div className="btn-tooltip">AI Support</div>}
            </motion.div>

            <AIChatWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </>
    );
};

export default FloatingAIBtn;
