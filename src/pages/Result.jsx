import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAttemptResult } from '../api/result.api';
import { getSessionSummary } from '../api/result.api';
import './Result.css';

const Result = () => {
    const { attemptId } = useParams();
    const [result, setResult] = useState(null);
    const [sessionSummary, setSessionSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState('yours'); // 'yours' or 'all'

    useEffect(() => {
        fetchResult();
    }, [attemptId]);

    const fetchResult = async () => {
        try {
            const response = await getAttemptResult(attemptId);

            if (response.success) {
                setResult(response.data);

                // Fetch session summary for all participants view
                if (response.data.sessionId) {
                    const summaryResponse = await getSessionSummary(response.data.sessionId);
                    if (summaryResponse.success) {
                        setSessionSummary(summaryResponse.data);
                    }
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load result');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="result-page">
                <div className="container text-center">
                    <div className="spinner"></div>
                    <p className="mt-2">Loading result...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="result-page">
                <div className="container">
                    <div className="alert alert-error">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="result-page">
            <div className="container">
                <div className="result-header fade-in">
                    <h1>Test Results</h1>
                    <p className="text-secondary">{result?.test?.title}</p>
                </div>

                <div className="score-summary card-glass fade-in">
                    <div className="score-circle">
                        <div className="score-value">{result?.percentage}%</div>
                        <div className="score-label">Score</div>
                    </div>

                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value text-success">{result?.correctAnswers}</div>
                            <div className="stat-label">Correct</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value text-error">{result?.wrongAnswers}</div>
                            <div className="stat-label">Wrong</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value text-warning">{result?.unattempted || 0}</div>
                            <div className="stat-label">Unattempted</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-value">{result?.test?.totalQuestions}</div>
                            <div className="stat-label">Total</div>
                        </div>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="view-mode-toggle">
                    <button
                        className={`toggle-btn ${viewMode === 'yours' ? 'active' : ''}`}
                        onClick={() => setViewMode('yours')}
                    >
                        📝 Your Answers
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'all' ? 'active' : ''}`}
                        onClick={() => setViewMode('all')}
                    >
                        👥 All Participants ({sessionSummary?.participants?.length || 0})
                    </button>
                </div>

                {viewMode === 'yours' ? (
                    <div className="answers-section">
                        <h2>Your Detailed Answers</h2>

                        {result?.answers?.map((answer, index) => {
                            const cardClass = answer.isUnattempted ? 'unattempted' : (answer.isCorrect ? 'correct' : 'incorrect');

                            return (
                                <div key={answer.questionId} className={`card-glass answer-card ${cardClass}`}>
                                    <div className="answer-header">
                                        <span className="question-number">Question {index + 1}</span>
                                        <span className={`answer-badge ${cardClass}`}>
                                            {answer.isUnattempted ? '— Not Attempted' : (answer.isCorrect ? '✓ Correct' : '✗ Wrong')}
                                        </span>
                                    </div>

                                    <h3 className="question-text">{answer.questionText}</h3>

                                    <div className="answer-options">
                                        {answer.options.map((option, optIndex) => {
                                            const isSelected = optIndex === answer.selectedOption;
                                            const isCorrect = optIndex === answer.correctOption;

                                            let className = 'answer-option';
                                            if (isSelected && isCorrect) className += ' selected-correct';
                                            else if (isSelected) className += ' selected-wrong';
                                            else if (isCorrect) className += ' correct-answer';

                                            return (
                                                <div key={optIndex} className={className}>
                                                    <span className="option-letter">
                                                        {String.fromCharCode(65 + optIndex)}.
                                                    </span>
                                                    <span className="option-text">{option}</span>
                                                    {isSelected && <span className="badge">Your Answer</span>}
                                                    {isCorrect && !isSelected && <span className="badge correct">Correct Answer</span>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="answers-section">
                        <h2>All Participants' Answers</h2>
                        <p className="text-secondary">Compare how everyone answered each question</p>

                        {result?.answers?.map((answer, index) => (
                            <div key={answer.questionId} className="card-glass answer-card comparison">
                                <div className="answer-header">
                                    <span className="question-number">Question {index + 1}</span>
                                    <span className="answer-badge correct">
                                        ✓ Correct: {String.fromCharCode(65 + answer.correctOption)}
                                    </span>
                                </div>

                                <h3 className="question-text">{answer.questionText}</h3>

                                <div className="participants-answers">
                                    {sessionSummary?.participants?.map((participant) => {
                                        // Find this participant's answer for this question
                                        const participantAnswer = participant.answers?.find(
                                            a => a.questionId === answer.questionId
                                        );
                                        const selectedOpt = participantAnswer?.selectedOption;
                                        const isCorrect = selectedOpt === answer.correctOption;

                                        return (
                                            <div key={participant.userId} className="participant-answer-row">
                                                <div className="participant-name-col">
                                                    <span className="participant-name">{participant.name}</span>
                                                    {participant.userId === result.userId && (
                                                        <span className="badge-you">You</span>
                                                    )}
                                                </div>
                                                <div className="participant-choice">
                                                    {selectedOpt !== null && selectedOpt !== undefined ? (
                                                        <span className={`choice-badge ${isCorrect ? 'correct' : 'incorrect'}`}>
                                                            {String.fromCharCode(65 + selectedOpt)}
                                                            {isCorrect ? ' ✓' : ' ✗'}
                                                        </span>
                                                    ) : (
                                                        <span className="choice-badge unanswered">—</span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="answer-options">
                                    {answer.options.map((option, optIndex) => {
                                        const isCorrect = optIndex === answer.correctOption;
                                        const className = `answer-option ${isCorrect ? 'correct-answer' : ''}`;

                                        return (
                                            <div key={optIndex} className={className}>
                                                <span className="option-letter">
                                                    {String.fromCharCode(65 + optIndex)}.
                                                </span>
                                                <span className="option-text">{option}</span>
                                                {isCorrect && <span className="badge correct">Correct Answer</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="result-actions">
                    <Link to="/" className="btn btn-primary">
                        Back to Home
                    </Link>
                    {result?.sessionId && (
                        <Link to={`/session-detail/${result.sessionId}`} className="btn btn-outline">
                            View Session Details
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Result;
