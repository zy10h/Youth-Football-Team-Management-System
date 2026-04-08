import { Link, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PlayersPage from './pages/PlayersPage';
import PlayerFormPage from './pages/PlayerFormPage';
import TeamsPage from './pages/TeamsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';
import TeamDetailPage from './pages/TeamDetailPage';
import DashboardPage from './pages/DashboardPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import PlayerEditPage from './pages/PlayerEditPage';
import TeamFormPage from './pages/TeamFormPage';
import TeamEditPage from './pages/TeamEditPage';
import CoachesPage from './pages/CoachesPage';
import CoachDetailPage from './pages/CoachDetailPage';
import CoachFormPage from './pages/CoachFormPage';
import CoachEditPage from './pages/CoachEditPage';

export default function App() {
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <nav style={{ marginBottom: '20px', display: 'flex', gap: '12px' }}>
        <Link to="/players">Players</Link>
        <Link to="/players/new">Add Player</Link>
        <Link to="/teams">Teams</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/coaches">Coaches</Link>

        <div style={{ marginLeft: 'auto' }}>
          {isAuthenticated ? (
            <>
              <span style={{ marginRight: '12px' }}>
                {user?.username || 'Logged in'}
              </span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/players"
          element={
            <ProtectedRoute>
              <PlayersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/players/new"
          element={
            <ProtectedRoute>
              <PlayerFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <TeamsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/:id"
          element={
            <ProtectedRoute>
              <TeamDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            isAuthenticated ? <DashboardPage /> : <LoginPage />
          }
        />

        <Route
          path="/players/:id"
          element={
            <ProtectedRoute>
              <PlayerDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/players/:id/edit"
          element={
            <ProtectedRoute>
              <PlayerEditPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/new"
          element={
            <ProtectedRoute>
              <TeamFormPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/:id/edit"
          element={
            <ProtectedRoute>
              <TeamEditPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/coaches"
          element={
            <ProtectedRoute>
              <CoachesPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/coaches/new"
          element={
            <ProtectedRoute>
              <CoachFormPage />
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/coaches/:id"
          element={
            <ProtectedRoute>
              <CoachDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coaches/:id/edit"
          element={
            <ProtectedRoute>
              <CoachEditPage />
            </ProtectedRoute>
          }
        />
        
      </Routes>
    </div>
  );
}