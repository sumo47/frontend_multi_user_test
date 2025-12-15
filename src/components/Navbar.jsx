import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

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

                    <div className="navbar-user">
                        <Link to="/profile" className="user-profile-link">
                            👤 {user?.username ? `@${user.username}` : user?.name}
                        </Link>
                        <button onClick={handleLogout} className="btn btn-outline btn-sm">
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
