import React, { useState, useRef, useEffect } from "react";
import "./App.css";

export default function AdvisorTraining() {
  const [phase, setPhase] = useState("setup");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    let interval;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const handleStartChat = () => {
    setPhase("chat");
    setIsTimerRunning(true);
    setMessages([]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.concat({ role: "user", content: userMessage }),
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      const data = await response.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I had trouble responding. Try again?" }]);
    }
    setIsLoading(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const endSession = () => {
    setIsTimerRunning(false);
    setPhase("reflection");
  };

  const resetSession = () => {
    setPhase("setup");
    setMessages([]);
    setInput("");
    setTimeLeft(900);
    setIsTimerRunning(false);
  };

  if (phase === "setup") {
    return (
      <div className="container">
        <div className="setup-card">
          <h1>GT Advisor Training: Liam Avatar</h1>
          <p className="subtitle">Practice your discovery call skills. You have 15 minutes.</p>

          <div className="setup-info">
            <h2>About Liam</h2>
            <p><strong>Age:</strong> 6 years old</p>
            <p><strong>Grade:</strong> Kindergarten (working at 1st grade level)</p>
            <p><strong>Main Interest:</strong> Dinosaurs (he knows real facts!)</p>
            <p><strong>Personality:</strong> Enthusiastic, talkative, honest, curious</p>

            <h3>Your Job</h3>
            <ul>
              <li>Ask good questions to understand Liam</li>
              <li>Listen for signals about his learning and peers</li>
              <li>By the end, you should know if he's a fit for GT Anywhere</li>
            </ul>

            <h3>What to Listen For</h3>
            <ul>
              <li>Intrinsic motivation (does he love learning?)</li>
              <li>Peer fit (do other kids share his interests?)</li>
              <li>Learning style (how does he approach challenges?)</li>
              <li>Emotional markers (anxiety, confidence, curiosity)</li>
            </ul>
          </div>

          <button className="start-button" onClick={handleStartChat}>
            Start 15-Minute Practice
          </button>
        </div>
      </div>
    );
  }

  if (phase === "chat") {
    const progress = ((900 - timeLeft) / 900) * 100;

    return (
      <div className="container chat-container">
        <div className="chat-header">
          <div>
            <h2>Liam, age 6 | Kindergarten</h2>
            <p>Discovery call practice</p>
          </div>
          <div className="timer-section">
            <div className="timer">{formatTime(timeLeft)}</div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role === "user" ? "user-message" : "liam-message"}`}>
              <div className="message-bubble">{msg.content}</div>
            </div>
          ))}
          {isLoading && (
            <div className="message liam-message">
              <div className="message-bubble loading">Liam is thinking...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-section">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask Liam a question..."
            disabled={isLoading}
            className="chat-input"
          />
          <button onClick={sendMessage} disabled={isLoading || !input.trim()} className="send-button">
            Send
          </button>
          <button onClick={endSession} className="end-button">
            End Session
          </button>
        </div>
      </div>
    );
  }

  if (phase === "reflection") {
    const mentorMindsetItems = [
      { label: "Active Listening", guide: "Did you listen to Liam's full response before asking the next question?" },
      { label: "Powerful Questions", guide: "Did your questions go beyond surface-level?" },
      { label: "Reading the Room", guide: "Did you notice when Liam was engaged vs. hesitant?" },
      { label: "Building Rapport", guide: "Did Liam feel heard and valued?" },
      { label: "Signal Identification", guide: "Did you pick up on Liam's key signals?" },
      { label: "Honest Assessment", guide: "Did you think critically about fit?" },
    ];

    return (
      <div className="container reflection-container">
        <div className="reflection-card">
          <h2>Post-Session Reflection</h2>
          <p className="reflection-subtitle">Review the conversation above and score yourself on mentor mindset.</p>

          <div className="reflection-items">
            {mentorMindsetItems.map((item, idx) => (
              <div key={idx} className="reflection-item">
                <h3>{item.label}</h3>
                <p className="reflection-guide">{item.guide}</p>
                <div className="score-buttons">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button key={score} className="score-button">
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="reflection-actions">
            <button onClick={resetSession} className="reset-button">
              Practice Another Conversation
            </button>
          </div>
        </div>
      </div>
    );
  }
}
