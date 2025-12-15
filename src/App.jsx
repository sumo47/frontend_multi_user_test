import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import CreateTest from './pages/CreateTest';
import SessionManage from './pages/SessionManage';
import CreateSession from './pages/CreateSession';
import NewSession from './pages/NewSession';
import JoinSession from './pages/JoinSession';
import WaitingRoom from './pages/WaitingRoom';
import TestScreen from './pages/TestScreen';
import Result from './pages/Result';
import SessionSummary from './pages/SessionSummary';
import SessionHistory from './pages/SessionHistory';
import Profile from './pages/Profile';
import SessionDetail from './pages/SessionDetail';

function AppRoutes() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            <Navbar />
            <Routes>
                {/* Public routes */}
                <Route
                    path="/register"
                    element={isAuthenticated ? <Navigate to="/" /> : <Register />}
                />
                <Route
                    path="/login"
                    element={isAuthenticated ? <Navigate to="/" /> : <Login />}
                />

                {/* Protected routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/create-test"
                    element={
                        <ProtectedRoute>
                            <CreateTest />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/session"
                    element={
                        <ProtectedRoute>
                            <CreateSession />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/session/new"
                    element={
                        <ProtectedRoute>
                            <NewSession />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/session/join"
                    element={
                        <ProtectedRoute>
                            <JoinSession />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <SessionHistory />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/session-detail/:sessionId"
                    element={
                        <ProtectedRoute>
                            <SessionDetail />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/waiting/:sessionId"
                    element={
                        <ProtectedRoute>
                            <WaitingRoom />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/test/:sessionId"
                    element={
                        <ProtectedRoute>
                            <TestScreen />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/result/:attemptId"
                    element={
                        <ProtectedRoute>
                            <Result />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/summary/:sessionId"
                    element={
                        <ProtectedRoute>
                            <SessionSummary />
                        </ProtectedRoute>
                    }
                />

                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
