import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import './EmojiGame.css';

const EmojiGame = () => {
    const emojiList = ['👑', '👾', '🫰🏻', '🐬', '💣', '🌹', '🐈‍⬛', '👻', '🔮', '🐦‍⬛'];

    const difficultySettings = {
        Easy: { spawnRate: 1000, lifetime: 1500, winScore: 25 },
        Medium: { spawnRate: 600, lifetime: 1200, winScore: 40 },
        Hard: { spawnRate: 400, lifetime: 1000, winScore: 60 }
    };

    const [emojis, setEmojis] = useState([]);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [highScore, setHighScore] = useState({ Easy: 0, Medium: 0, Hard: 0 });
    const [showInstructions, setShowInstructions] = useState(true);
    const [difficulty, setDifficulty] = useState('Medium');
    const [showWinMessage, setShowWinMessage] = useState(false);
    const [message, setMessage] = useState('');
    const [isGameOver, setIsGameOver] = useState(false);

    useEffect(() => {
        if (showInstructions || isGameOver) return;
        if (timeLeft <= 0 && !showWinMessage) {
            setIsGameOver(true);
            setMessage(<span style={{ color: 'red' }}>Time's Up! Try Again!</span>);
            return;
        }

        if (score >= difficultySettings[difficulty].winScore && !showWinMessage) {
            setShowWinMessage(true);
            setIsGameOver(true);
            setMessage(
                <span style={{ color: 'green' }}>
                    You Won! You scored {score} points!
                </span>
            );

            if (score > highScore[difficulty]) {
                const newHighScore = { ...highScore, [difficulty]: score };
                setHighScore(newHighScore);
            }
            return;
        }

        const { spawnRate, lifetime } = difficultySettings[difficulty];

        const emojiSpawner = setInterval(() => {
            const isSpecial = Math.random() < 0.1;
            const newEmoji = {
                id: Date.now(),
                symbol: isSpecial ? '👑' : emojiList[Math.floor(Math.random() * emojiList.length)],
                x: Math.random() * 95,
                y: Math.random() * 85,
                points: isSpecial ? 5 : 1,
                caught: false
            };
            setEmojis((prev) => [...prev, newEmoji]);

            setTimeout(() => {
                setEmojis((prev) => prev.filter((emoji) => emoji.id !== newEmoji.id));
            }, lifetime);
        }, spawnRate);

        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            clearInterval(emojiSpawner);
            clearInterval(timer);
        };
    }, [timeLeft, difficulty, score, showWinMessage, highScore, showInstructions, isGameOver]);

    const handleEmojiClick = (id, symbol) => {
        if (symbol === '💣') {
            setIsGameOver(true);
            setMessage(<span style={{ color: 'red' }}>You Lose! Try Again!</span>);
            return;
        }
        setScore((prevScore) => prevScore + (symbol === '👑' ? 5 : 1));
        setEmojis((prev) => prev.filter((emoji) => emoji.id !== id));
    };

    const restartGame = () => {
        setTimeLeft(30);
        setIsGameOver(false);
        setEmojis([]);
        setShowInstructions(false);
        setScore(0);
        setMessage('');
        setShowWinMessage(false);
    };

    return (
        <div className="game-container">
            {showInstructions && (
                <div className='instructions'>
                    <h2>Welcome to Emoji Catcher Game!</h2>
                    <ul>
                        <li>Catch emojis to earn points!</li>
                        <li>Avoid clicking the Bomb Emoji or you lose!</li>
                        <li>Win by scoring the required points before time runs out:</li>
                        <li>Easy: 25 points | Medium: 40 points | Hard: 60 Points</li>
                    </ul>
                    
                    <button onClick={restartGame}>Start Game</button>
                </div>
            )}
            {!showInstructions && (
                <>
                    <h1 className='game-title'>🎮 Emoji Catcher Game 🎮</h1>
                    <div className='score-time'>
                        <p>Score: {score}</p>
                        <p>High Score ({difficulty}): {highScore[difficulty]}</p>
                        <p>Time Left: {timeLeft}s</p>
                        <div>
                            <label>Difficulty: </label>
                            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                                <option value='Easy'>Easy</option>
                                <option value='Medium'>Medium</option>
                                <option value='Hard'>Hard</option>
                            </select>
                        </div>
                    </div>
                    <div className='game-area'>
                        <AnimatePresence>
                            {emojis.map((emoji) => (
                                <motion.div
                                    key={emoji.id}
                                    className='emoji'
                                    style={{ top: `${emoji.y}%`, left: `${emoji.x}%` }}
                                    onClick={() => handleEmojiClick(emoji.id, emoji.symbol)}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ duration: 0.5, ease: 'easeOut' }}
                                >
                                    {emoji.symbol}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    {isGameOver && (
                        <div className='game-message center'>
                            <h2>{message}</h2>
                            <button onClick={restartGame}>Play Again</button>
                        </div>
                    )}
                    {showWinMessage && <Confetti width={window.innerWidth} height={window.innerHeight} />}
                </>
            )}
        </div>
    );
};

export default EmojiGame;
