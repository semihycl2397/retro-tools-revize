import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import styles from './index.module.scss'; 

const Timer: React.FC = () => {
  const [seconds, setSeconds] = useState<number>(300);
  const [inputValue, setInputValue] = useState<string>('5');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;

    if (isRunning && !isPaused && seconds > 0) {
      timerInterval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    }

    if (seconds === 0 && isRunning) {
      Swal.fire({
        title: 'Time is up!',
        icon: 'info',
        confirmButtonText: 'OK',
      }).then(() => {
        setIsRunning(false); 
      });
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isRunning, isPaused, seconds]);

  const handleStartTimer = () => {
    if (!isRunning) {
      const countdownTime = parseInt(inputValue, 10) * 60;
      setSeconds(countdownTime);
    }
    setIsRunning(true);
    setIsPaused(false); 
  };

  const handlePauseTimer = () => {
    setIsPaused(true); 
  };

  const handleResumeTimer = () => {
    setIsPaused(false); 
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    if (isPaused) {
     
      const newSeconds = parseInt(e.target.value, 10) * 60;
      setSeconds(newSeconds);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className={styles.timerContainer}>
      <div className={styles.inputWrapper}>
        <input
          type="number"
          className={styles.timerInput}
          value={inputValue}
          onChange={handleInputChange}
          disabled={isRunning && !isPaused}
          min="1"
          placeholder="Dakika girin"
        />
        <button 
          className={styles.timerButton}
          onClick={handleStartTimer} 
          disabled={isRunning && !isPaused}
        >
          {isRunning && !isPaused ? 'Running' : 'Start'}
        </button>

        {isRunning && !isPaused && (
          <button className={styles.timerButton} onClick={handlePauseTimer}>
            Pause
          </button>
        )}

        {isRunning && isPaused && (
          <button className={styles.timerButton} onClick={handleResumeTimer}>
            Resume
          </button>
        )}
      </div>
      <div className={styles.timerDisplay}>Time Left: {formatTime(seconds)}</div>
    </div>
  );
};

export default Timer;
