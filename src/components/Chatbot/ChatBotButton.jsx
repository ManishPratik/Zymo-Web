import React, { useState, useEffect } from 'react';
import chatBotIcon from './images/assistant.png';
import { useNavigate } from 'react-router-dom';

const ChatBotButton = () => {
    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const intervalId = setInterval(() => {
            setMessage('Ask me!');
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
            }, 1000);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    const handleClick = (e) => {
        e.preventDefault();
        navigate('/ZymoAI');
    };

    return (
        <div className='icon-main'>
            <button
                className="chatbot-toggle-button"
                onClick={handleClick}
                aria-label="Toggle chat"
                style={{ display: 'flex', alignItems: 'center' }}
            >
                <img className="bot-icon" style={{ width: '20px' }} src={chatBotIcon} alt="Chatbot icon" />
            </button>
            {showMessage && <span className="ask-me-message text-[#faffa4]">Hey there👋</span>}
        </div>
    );
};

export default ChatBotButton;