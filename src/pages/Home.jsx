import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { getActiveSession } from '../api/activeSession.api';
import './Home.css';

const Home = () => {
    const { user } = useAuth();
    const [activeSession, setActiveSession] = useState(null);
    const [loadingSession, setLoadingSession] = useState(true);

    useEffect(() => {
        checkActiveSession();
    }, []);

    const checkActiveSession = async () => {
        try {
            const response = await getActiveSession();
            if (response.success && response.data) {
                setActiveSession(response.data);
            }
        } catch (err) {
            console.error('Failed to check active session:', err);
        } finally {
            setLoadingSession(false);
        }
    };

    return (
        <div className="home-page">
            <div className="container">
                <div className="home-hero fade-in">
                    <h1 className="hero-title">Welcome, {user?.name}! 👋</h1>
                    <p className="hero-subtitle">
                        Create tests, join sessions, and collaborate with other students in real-time
                    </p>
                </div>

                {/* Active Session Banner */}
                {!loadingSession && activeSession && (
                    <div className="active-session-banner card-glass fade-in">
                        <div className="banner-icon">⚠️</div>
                        <div className="banner-content">
                            <h3>You have an active session!</h3>
                            <p>
                                <strong>{activeSession.test.title}</strong> - Status: {activeSession.status}
                            </p>
                            <p className="text-secondary">
                                {activeSession.test.questionCount} questions • {activeSession.test.duration} minutes
                            </p>
                        </div>
                        <Link
                            to={activeSession.status === 'WAITING'
                                ? `/waiting/${activeSession.sessionId}`
                                : `/test/${activeSession.sessionId}`}
                            className="btn btn-success btn-lg"
                        >
                            {activeSession.status === 'WAITING' ? 'Go to Waiting Room' : 'Continue Test'} →
                        </Link>
                    </div>
                )}

                <div className="action-grid">
                    <div className="action-card card-glass fade-in">
                        <div className="action-icon">✏️</div>
                        <h3>Create a Test</h3>
                        <p>Design your own MCQ test with custom questions and options</p>
                        <Link to="/create-test" className="btn btn-primary">
                            Create Test
                        </Link>
                    </div>

                    <div className="action-card card-glass fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="action-icon">🚀</div>
                        <h3>Start a Session</h3>
                        <p>Create a new test session and invite others to join</p>
                        <Link to="/session" className="btn btn-secondary">
                            Manage Sessions
                        </Link>
                    </div>

                    <div className="action-card card-glass fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="action-icon">🔗</div>
                        <h3>Join a Session</h3>
                        <p>Enter a session code to join an existing test</p>
                        <Link to="/session" className="btn btn-outline">
                            Join Session
                        </Link>
                    </div>

                    <div className="action-card card-glass fade-in" style={{ animationDelay: '0.3s' }}>
                        <div className="action-icon">📊</div>
                        <h3>Session History</h3>
                        <p>View all active and completed test sessions</p>
                        <Link to="/history" className="btn btn-secondary">
                            View History
                        </Link>
                    </div>
                </div>

                <div className="info-section mt-4">
                    <div className="card-glass">
                        <h2>🎯 How it Works</h2>
                        <div className="steps-grid">
                            <div className="step">
                                <div className="step-number">1</div>
                                <h4>Create or Join</h4>
                                <p>Any user can create a test or join an existing session</p>
                            </div>
                            <div className="step">
                                <div className="step-number">2</div>
                                <h4>Wait for All</h4>
                                <p>Test starts when ALL participants mark themselves ready</p>
                            </div>
                            <div className="step">
                                <div className="step-number">3</div>
                                <h4>Take the Test</h4>
                                <p>Answer questions with a synchronized timer</p>
                            </div>
                            <div className="step">
                                <div className="step-number">4</div>
                                <h4>View Results</h4>
                                <p>See your score and compare with other participants</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
