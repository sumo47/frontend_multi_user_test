import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu when route changes
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) return null;

    return (
        <nav className="navbar">
            <div className="container">
                <div className="navbar-content">
                    <Link to="/" className="navbar-brand">
                        <span className="logo-icon">📝</span>
                        MCQ Test System
                    </Link>

                    <button
                        className="navbar-toggle"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        aria-label="Toggle navigation"
                    >
                        <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
                    </button>

                    <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                        <div className="navbar-user">
                            <span className="user-greeting mobile-only">
                                Hello, {user?.name?.split(' ')[0]}
                            </span>
                            <Link to="/profile" className="user-profile-link">
                                👤 Profile
                            </Link>
                            <button onClick={handleLogout} className="btn btn-outline btn-sm">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
