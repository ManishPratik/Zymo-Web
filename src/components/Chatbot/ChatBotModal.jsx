import { GoogleGenerativeAI } from '@google/generative-ai';
import React, { useEffect, useRef, useState } from 'react';
import './ChatBot.css';
import { AiOutlineClose } from 'react-icons/ai';
import { TiWeatherSnow } from 'react-icons/ti';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router-dom';
import zymo3 from './images/zymo3.png';
import promptContent from './Prompt/botprompt';
import faqs from './FAQs'
const ChatBotModal = ({ forApp }) => {
    const [chatHistory, setChatHistory] = useState([]);
    const [showRelatedQuestions, setShowRelatedQuestions] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const [genAI, setGenAI] = useState(null);
    const endOfChatRef = useRef(null);
    const inputRef = useRef(null);
    const [show, setShow] = useState(false);
    const [userPerference, setUserPreference] = useState('');
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const getSimilarity = (a, b) => {
        a = a.toLowerCase();
        b = b.toLowerCase();
        const common = a.split(' ').filter(word => b.includes(word)).length;
        return common / Math.max(a.split(' ').length, b.split(' ').length);
    };
    
    const getMatchingFAQ = (userInput, threshold = 0.5) => {
        let bestMatch = null;
        let highestScore = 0;
        for (const faq of faqs) {
            const score = getSimilarity(userInput, faq.question);
            if (score > highestScore && score >= threshold) {
                bestMatch = faq;
                highestScore = score;
            }
        }
        return bestMatch;
    };

    useEffect(() => {
        if (apiKey) {
            setGenAI(new GoogleGenerativeAI(apiKey));
            setChatHistory([
                {
                    role: 'bot',
                    parts: [{ text: "Hey there! I'm ZAI, your car buddy, ask me anything, and let's roll!" }],
                },
            ]);
        }

        if (forApp === 'true') {
            handleShow();
        }
    }, [apiKey, forApp]);

    const handleInputChange = (event) => setUserInput(event.target.value);

    const handleSendMessage = async () => {
        // console.log("genAI:", genAI);

        if (!userInput.trim() || !genAI) return;

        const userMessage = { role: 'user', parts: [{ text: userInput }] };
        setChatHistory((prev) => [...prev, userMessage]);
        setLoading(true);

        const matchedFAQ = getMatchingFAQ(userInput);
        if(matchedFAQ) {
            const botResponse = {role: 'bot', parts:[{ text : matchedFAQ.answer}] };
            setChatHistory((prev) => [...prev, botResponse]);
            setUserInput('');
            setLoading(false);
            return;
        }

        try {
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                systemInstruction: `${promptContent}`
            });

            const chatSession = model.startChat({
                generationConfig: { temperature: 2, topP: 0.6, maxOutputTokens: 1000 },
                history: chatHistory.filter((entry) => entry.role === 'user').concat(userMessage),
            });

            const result = await chatSession.sendMessage(userInput);
            const botMessage = await result.response.text();
            const formattedResponse = formatResponse(botMessage);

            const botResponse = { role: 'bot', parts: [{ text: formattedResponse }] };
            setChatHistory((prev) => [...prev, botResponse]);

            await handleRelatedQuestions(chatSession, userInput);
        } catch (error) {
            console.error('Error occurred:', error);
            const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again later.';
            setChatHistory((prev) => [...prev, { role: 'bot', parts: [{ text: errorMessage }] }]);
        } finally {
            setLoading(false);
        }

        setUserInput('');
    };

    const formatResponse = (response) => {
        return response
            .replace(/\*\*(.*?)\*\*/g, (match, p1) => (
                `<br />
                <span style="color: red; font-weight: 500; font-size: 18px;">
                    ✦
                    <span style="color: black;">
                        ${p1}
                    </span>
                </span>`
            ))
            .replace(/\*/g, '')
            .trim();
    };

    const handleRelatedQuestions = async (chatSession, userInput) => {
        const relatedQuestionsPrompt = `Generate 3 car ${userPerference} related questions only. Avoid questions about cancellations, refunds, or personal inquiries. If input is unrelated to cars, respond: 'No questions found.' "${userInput}`;
        const relatedQuestionsResponse = await chatSession.sendMessage(relatedQuestionsPrompt);
        const relatedQuestionsText = await relatedQuestionsResponse.response.text();
        const relatedQuestions = relatedQuestionsText.replace(/\*/g, '').split('\n').filter((question) => question.trim() !== '');

        if (relatedQuestions.length > 0) {
            setChatHistory((prev) => [...prev, { role: 'bot', parts: [{ text: 'Here are some questions you might find helpful:' }] }]);
            relatedQuestions.forEach((question) => {
                setChatHistory((prev) => [...prev, { role: 'bot', parts: [{ text: `• ${question}` }] }]);
            });
        }
    };

    const handlePromptClick = (prompt) => {
        setUserInput(prompt);
        inputRef.current.focus();
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSendMessage();
        }
    };

    useEffect(() => {
        if (endOfChatRef.current) {
            endOfChatRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatHistory]);

    const handleCloseChat = () => {
        navigate('/');
    };

    return (
        <>
            <div className="chatbot-container fullscreen justify-center bg-[#212121]">
                <div className="chatbot-header pt-0 bg-[#212121]" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <img src={zymo3} alt="Zymo Logo" style={{ width: '150px' }} />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button className="close-btn" onClick={handleCloseChat} aria-label="Close chat">
                            <AiOutlineClose />
                        </button>
                    </div>
                </div>

                <div className="window-main-div">
                    <div className="header-title px-2 mb-8" style={{ textAlign: 'left' }}>
                        <span className="text-[#faffa4] font-semibold text-1xl"> Transforming the way India Drives.</span>
                    </div>
                    <div className="px-2 mt-3 head-title" style={{ textAlign: 'left' }}>
                        <span className="text-3xl font-bold text-white">Your Journey Starts Here <span className="text-[#faffa4]">✦</span></span>
                        <br />
                    </div>
                    <div style={{ textAlign: 'left' }} className="px-2 mt-2 uncover-title">
                        <span className="font-bold text-3xl pt-8 text-white animated-text">
                            {'Uncover the Ultimate Driving Experience with '.split('').map((char, index) => (
                                <span key={index} className="fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                                    {char === ' ' ? '\u00A0' : char}
                                </span>
                            ))}
                            <span className="text-[#faffa4]">
                                {'ZAI'.split('').map((char, index) => (
                                    <span key={index} className="fade-in" style={{ animationDelay: `${(index + 50) * 0.1}s` }}>
                                        {char === ' ' ? '\u00A0' : char}
                                    </span>
                                ))}
                            </span>
                        </span>
                    </div>

                    <div className="text-white font-bold text-1xl text-center mt-6 mb-1">Frequently asked Questions</div>

                    <div className="popular-prompts" style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'stretch', flexWrap: 'wrap' }}>
                        {['How can I book a car with Zymo?', 'What about the fuel?', 'What is your cancellation policy?'].map((prompt, index) => (
                            <button
                                className="popular-prompt-text"
                                key={index}
                                onClick={() => handlePromptClick(prompt)}
                                style={{
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '10px',
                                    padding: '12px 16px',
                                    border: '1px solid #faffa4',
                                    borderRadius: '5px',
                                    background: 'black',
                                    width: 'calc(33% - 10px)',
                                    minWidth: '200px',
                                    height: 'auto',
                                    textAlign: 'center',
                                    flexGrow: '1',
                                    whiteSpace: 'normal',
                                    wordWrap: 'break-word',
                                    marginBottom: '10px',
                                }}
                            >
                                <TiWeatherSnow className="text-[#faffa4] mr-2 text-xl" /> {prompt}
                            </button>
                        ))}
                    </div>

                    <div className="chat-history">
                        {chatHistory.map((entry, index) => {
                            const messageText = entry.parts[0].text;
                            const isRelatedQuestion = messageText.startsWith('•');

                            if (isRelatedQuestion && !showRelatedQuestions) {
                                return null;
                            }

                            return (
                                <div key={index} className={`chat-message ${entry.role}`}>
                                    {entry.role === 'bot' ? (
                                        isRelatedQuestion ? (
                                            showRelatedQuestions ? (
                                                <button
                                                    className="related-question-button"
                                                    onClick={() => handlePromptClick(messageText.replace('• ', ''))}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'black',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                    }}
                                                >
                                                    <p style={{ color: '[#faffa4]', fontSize: '1.4rem', marginBottom: '0px' }}>
                                                        ✦<span className="r-quest-output " style={{ color: 'black', fontSize: '1rem' }}>{messageText}</span>
                                                    </p>
                                                </button>
                                            ) : null
                                        ) : (
                                            // <span dangerouslySetInnerHTML={{ __html: messageText }} />
                                            <span 
                                                style={{ whiteSpace: 'pre-line' }}
                                                dangerouslySetInnerHTML={{__html: messageText.replace(/\[TAB\]/g, '<span style="display:inline-block;width:2em;"></span>')
                                                }}
                                            />
                                        )
                                    ) : (
                                        // <span dangerouslySetInnerHTML={{ __html: messageText }} />
                                        <span 
                                            style={{ whiteSpace: 'pre-line' }}
                                            dangerouslySetInnerHTML={{__html: messageText.replace(/\[TAB\]/g, '<span style="display:inline-block;width:2em;"></span>')
                                            }}
                                        />
                                        // <span style={{ whiteSpace: 'pre-line' }}>{messageText}</span>
                                    )}
                                </div>
                            );
                        })}

                        {chatHistory.some((entry) => entry.parts[0].text.startsWith('•')) && (
                            <button
                                onClick={() => setShowRelatedQuestions(!showRelatedQuestions)}
                                style={{ width: '100%', backgroundColor: '[#faffa4]' }}
                                className="btn text-light related-toggle-button bg-[#faffa4] text-black hover:bg-[#faffa4]"
                            >
                                {showRelatedQuestions ? 'Hide Related Questions' : 'Show Related Questions'}
                            </button>
                        )}

                        {loading && (
                            <div className="loading-placeholder">
                                <div className="spinner"></div>
                                Loading answers...
                            </div>
                        )}

                        <div ref={endOfChatRef} />
                    </div>

                    <div className="input-main shadow bg-[#212121]">
                        <div className="input-container">
                            <input
                                type="text"
                                ref={inputRef}
                                value={userInput}
                                onChange={handleInputChange}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your question here..."
                                className="chatbot-input"
                                aria-label="User input"
                            />
                            <button
                                onClick={handleSendMessage}
                                className="send-btn text-black"
                                style={{ display: userInput ? 'block' : 'none' }}
                                aria-label="Send message"
                            >
                                Ask Zai
                            </button>
                        </div>
                        <div className="disclaimer bg-[#212121] text-[#faffa4]">
                            <p className="text-[#faffa4] text-center"> Just remember, I'm not perfect, so be sure to double-check anything important!</p>
                        </div>
                    </div>
                </div>
            </div>

            <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
                <Modal.Header style={{ display: 'flex', justifyContent: 'center' }}>
                    <Modal.Title style={{ textAlign: 'center', width: '100%', fontFamily: 'font-family: Arial, Helvetica, sans-serif' }}>Should I help you with</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-flex justify-content-center flex-wrap">
                        <button
                            className="btn px-4 py-3 m-3"
                            style={{ backgroundColor: '#faffa4', color: 'black' }}
                            onClick={() => {
                                handleClose();
                                setUserPreference('Buying');
                            }}
                        >
                            Buying a Car
                        </button>
                        <button
                            className="btn btn-dark px-4 py-3 m-3 text-white"
                            onClick={() => {
                                handleClose();
                                setUserPreference('Renting');
                            }}
                        >
                            Renting a Car
                        </button>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
};

export default ChatBotModal;