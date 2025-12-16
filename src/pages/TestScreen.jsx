import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionStatus } from '../api/session.api';
import { saveAnswer, submitAttempt } from '../api/answer.api';
import './TestScreen.css';

const TestScreen = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [test, setTest] = useState(null);
    const [userAttempt, setUserAttempt] = useState(null);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [remainingTime, setRemainingTime] = useState(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const pollingRef = useRef(null);
    const hasSubmittedRef = useRef(false);

    useEffect(() => {
        fetchSessionStatus();

        // Poll every 3 seconds for timer sync
        pollingRef.current = setInterval(() => {
            fetchSessionStatus();
        }, 3000);

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [sessionId]);

    const fetchSessionStatus = async () => {
        try {
            const response = await getSessionStatus(sessionId);

            if (response.success) {
                const sessionData = response.data.session;
                const attemptData = response.data.userAttempt;

                setSession(sessionData);
                setTest(sessionData.test);
                setUserAttempt(attemptData);
                setRemainingTime(sessionData.remainingTime);
                setLoading(false);
                setError(''); // Clear any previous transient errors

                // Load existing answers
                if (attemptData && attemptData.answers) {
                    const answers = {};
                    attemptData.answers.forEach(ans => {
                        answers[ans.questionId] = ans.selectedOption;
                    });
                    setSelectedAnswers(answers);
                }

                // AUTO-SUBMIT if time expired or session completed
                if ((sessionData.remainingTime === 0 || sessionData.status === 'COMPLETED')
                    && !hasSubmittedRef.current && attemptData?.status !== 'SUBMITTED') {
                    hasSubmittedRef.current = true;
                    handleAutoSubmit();
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load test');
            setLoading(false);
        }
    };

    const handleAnswerSelect = async (questionId, optionIndex) => {
        // Update local state immediately
        setSelectedAnswers({
            ...selectedAnswers,
            [questionId]: optionIndex
        });

        // Save to backend
        try {
            await saveAnswer(sessionId, questionId, optionIndex);
        } catch (err) {
            console.error('Failed to save answer:', err);
            setError('Failed to save answer. Please try again.');
        }
    };

    const handleAutoSubmit = async () => {
        if (submitting || hasSubmittedRef.current) return;

        hasSubmittedRef.current = true;
        setSubmitting(true);
        clearInterval(pollingRef.current);

        try {
            const response = await submitAttempt(sessionId);

            if (response.success) {
                // Extract attempt from new response structure
                const attemptData = response.data.attempt || response.data;
                navigate(`/result/${attemptData._id}`);
            }
        } catch (err) {
            console.error('Auto-submit failed:', err);
        }
    };

    const handleManualSubmit = async () => {
        if (window.confirm('Are you sure you want to submit? You cannot change answers after submission.')) {
            await handleAutoSubmit();
        }
    };

    if (loading) {
        return (
            <div className="test-screen-page">
                <div className="container text-center">
                    <div className="spinner"></div>
                    <p className="mt-2">Loading test...</p>
                </div>
            </div>
        );
    }

    if (error && !test) {
        return (
            <div className="test-screen-page">
                <div className="container">
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }

    const formatTime = (seconds) => {
        if (seconds === null) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const answeredCount = Object.keys(selectedAnswers).length;
    const totalQuestions = test?.questions?.length || 0;

    return (
        <div className="test-screen-page">
            <div className="test-header">
                <div className="container">
                    <div className="header-content">
                        <div className="test-title">
                            <h2>{test?.title}</h2>
                            <p className="text-secondary">
                                {answeredCount}/{totalQuestions} answered
                            </p>
                        </div>

                        <div className="timer-section">
                            <div className={`timer ${remainingTime <= 60 ? 'timer-warning' : ''}`}>
                                ⏱️ {formatTime(remainingTime)}
                            </div>
                            <button
                                onClick={handleManualSubmit}
                                className="btn btn-success"
                                disabled={submitting}
                            >
                                {submitting ? 'Submitting...' : 'Submit Test'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {error && (
                    <div className="alert alert-error">{error}</div>
                )}

                <div className="questions-container">
                    {test?.questions?.map((question, qIndex) => (
                        <div key={question._id} className="card-glass question-box fade-in">
                            <div className="question-number">Question {qIndex + 1}</div>
                            <h3 className="question-text">{question.questionText}</h3>

                            <div className="options-list">
                                {question.options.map((option, optIndex) => (
                                    <label
                                        key={optIndex}
                                        className={`option-label ${selectedAnswers[question._id] === optIndex ? 'selected' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question._id}`}
                                            checked={selectedAnswers[question._id] === optIndex}
                                            onChange={() => handleAnswerSelect(question._id, optIndex)}
                                        />
                                        <span className="option-text">
                                            <span className="option-letter">
                                                {String.fromCharCode(65 + optIndex)}.
                                            </span>
                                            {option}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="submit-section">
                    <button
                        onClick={handleManualSubmit}
                        className="btn btn-primary btn-lg btn-block"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Submit Test'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TestScreen;
