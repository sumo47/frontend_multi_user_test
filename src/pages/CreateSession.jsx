import { Link } from 'react-router-dom';
import './CreateSession.css';

const CreateSession = () => {
    return (
        <div className="create-session-page">
            <div className="container">
                <div className="page-header fade-in">
                    <h1>🚀 Create Session</h1>
                    <p className="text-secondary">Start a new test session and invite others</p>
                </div>

                <div className="card-glass session-content fade-in">
                    <div className="info-banner">
                        <h3>📌 How to Create a Session:</h3>
                        <ol>
                            <li>Select a test from the dropdown below</li>
                            <li>Click "Create Session" to generate a unique code</li>
                            <li>Share the code with other users</li>
                            <li>Wait in the waiting room until everyone is ready</li>
                            <li>Test starts automatically when ALL participants click "Ready"</li>
                        </ol>
                    </div>

                    <Link to="/session/new" className="btn btn-primary btn-lg btn-block">
                        <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>+</span>
                        Create New Session
                    </Link>

                    <div className="divider">
                        <span>OR</span>
                    </div>

                    <Link to="/session/join" className="btn btn-outline btn-lg btn-block">
                        🔗 Join Existing Session
                    </Link>

                    <Link to="/" className="btn btn-secondary mt-3">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default CreateSession;
