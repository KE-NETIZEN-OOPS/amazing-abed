import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useStore } from './store/store';
import LoginPage from './components/LoginPage';
import ChatterDashboard from './components/ChatterDashboard';
import ModelDashboard from './components/ModelDashboard';

function App() {
  const currentUser = useStore((state) => state.currentUser);
  const initializeDummyData = useStore((state) => state.initializeDummyData);

  useEffect(() => {
    // Initialize dummy data on app load
    initializeDummyData();
  }, [initializeDummyData]);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={
            currentUser ? (
              currentUser.role === 'chatter' ? (
                <ChatterDashboard />
              ) : (
                <ModelDashboard />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
