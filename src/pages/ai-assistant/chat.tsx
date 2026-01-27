import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import AppHeader from "@/components/layout/AppHeader";
import AppSidebar from "@/components/layout/AppSidebar";
import { aiAssistantApi, ChatResponse } from "@/services/aiAssistantService";
import { showError, showSuccess, showWarning } from "@/utils/toast";
import styles from "@/styles/dashboard.module.css";

const REDIRECT_DELAY_MS = 2000;

export default function AIChatPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState<'daily' | 'weekly' | 'relationships' | 'career' | 'wellness' | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<Array<{ question: string; response: ChatResponse; timestamp: string }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token")?.trim();
    if (!token || token.split(".").length !== 3) {
      router.replace("/auth/login");
    }
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [responses]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      showWarning("Please enter a question");
      return;
    }

    if (question.length > 500) {
      showWarning("Question is too long. Maximum 500 characters.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token")?.trim();
      if (!token) {
        router.push("/auth/login");
        return;
      }

      const response = await aiAssistantApi.chat(token, {
        question: question.trim(),
        context,
      });

      setResponses([
        ...responses,
        {
          question: question.trim(),
          response,
          timestamp: new Date().toISOString(),
        },
      ]);

      setQuestion("");
      setContext(undefined);
      showSuccess("Response received!");
    } catch (err) {
      const error = err as { message?: string };
      const errorMessage = error.message || "Failed to get AI response";
      showError(errorMessage);
      console.error("Error getting AI response:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <AppHeader />
      <div className={styles.dashboardContent}>
        <AppSidebar />
        <main className={styles.mainContent}>
          <div className={styles.pageHeader}>
            <button onClick={() => router.back()} className={styles.backButton}>
              ← Back
            </button>
          </div>

          <div className={styles.kundliContainer}>
            <h1 className={styles.sectionTitle}>AI Astrology Assistant</h1>
            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
              Ask any astrology-related questions and get personalized insights based on your birth chart.
            </p>

            <div className={styles.chatContainer}>
              <div className={styles.chatMessages}>
                {responses.length === 0 ? (
                  <div className={styles.emptyChat}>
                    <div className={styles.emptyChatIcon}>💬</div>
                    <h3>Start a conversation</h3>
                    <p>Ask questions like:</p>
                    <ul className={styles.suggestedQuestions}>
                      <li onClick={() => {
                        setQuestion("Why is today important for me?");
                        setTimeout(() => inputRef.current?.focus(), 100);
                      }}>
                        "Why is today important for me?"
                      </li>
                      <li onClick={() => {
                        setQuestion("What should I focus on this week?");
                        setTimeout(() => inputRef.current?.focus(), 100);
                      }}>
                        "What should I focus on this week?"
                      </li>
                      <li onClick={() => {
                        setQuestion("How do current transits affect my relationships?");
                        setTimeout(() => inputRef.current?.focus(), 100);
                      }}>
                        "How do current transits affect my relationships?"
                      </li>
                      <li onClick={() => {
                        setQuestion("What are the best days for career decisions?");
                        setTimeout(() => inputRef.current?.focus(), 100);
                      }}>
                        "What are the best days for career decisions?"
                      </li>
                    </ul>
                  </div>
                ) : (
                  responses.map((item, index) => (
                    <div key={index} className={styles.chatMessageGroup}>
                      <div className={styles.userMessage}>
                        <div className={styles.messageHeader}>
                          <strong>You</strong>
                          <span className={styles.messageTime}>{formatTime(item.timestamp)}</span>
                        </div>
                        <div className={styles.messageContent}>{item.question}</div>
                      </div>
                      <div className={styles.aiMessage}>
                        <div className={styles.messageHeader}>
                          <strong>🤖 AI Assistant</strong>
                          <span className={styles.messageTime}>{formatTime(item.response.timestamp)}</span>
                        </div>
                        <div className={styles.messageContent}>{item.response.answer}</div>
                        {item.response.relatedTransits && item.response.relatedTransits.length > 0 && (
                          <div className={styles.relatedTransits}>
                            <strong>Related Transits:</strong>
                            <div className={styles.transitsList}>
                              {item.response.relatedTransits.map((transit, idx) => (
                                <span key={idx} className={styles.transitBadge}>
                                  {transit.planet} in {transit.sign}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {loading && (
                  <div className={styles.aiMessage}>
                    <div className={styles.messageContent}>
                      <div className={styles.loadingDots}>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSubmit} className={styles.chatForm}>
                <div className={styles.contextSelector}>
                  <label>Context (Optional):</label>
                  <select
                    value={context || ''}
                    onChange={(e) => setContext(e.target.value as any || undefined)}
                    className={styles.contextSelect}
                  >
                    <option value="">None</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="relationships">Relationships</option>
                    <option value="career">Career</option>
                    <option value="wellness">Wellness</option>
                  </select>
                </div>
                <div className={styles.chatInputGroup}>
                  <input
                    ref={inputRef}
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask your astrology question..."
                    className={styles.chatInput}
                    disabled={loading}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={loading || !question.trim()}
                    className={styles.chatSendButton}
                  >
                    {loading ? '⏳' : '📤'}
                  </button>
                </div>
                <div className={styles.charCount}>
                  {question.length} / 500 characters
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
