import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { AppShell, Group, Button, Text } from "@mantine/core";
import { useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import PlayersPage from "./pages/PlayersPage";
import PlayerFormPage from "./pages/PlayerFormPage";
import TeamsPage from "./pages/TeamsPage";
import ProtectedRoute from "./components/ProtectedRoute";
import TeamDetailPage from "./pages/TeamDetailPage";
import DashboardPage from "./pages/DashboardPage";
import PlayerDetailPage from "./pages/PlayerDetailPage";
import PlayerEditPage from "./pages/PlayerEditPage";
import TeamFormPage from "./pages/TeamFormPage";
import TeamEditPage from "./pages/TeamEditPage";
import CoachesPage from "./pages/CoachesPage";
import CoachDetailPage from "./pages/CoachDetailPage";
import CoachFormPage from "./pages/CoachFormPage";
import CoachEditPage from "./pages/CoachEditPage";

export default function App() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <AppShell padding="md" header={{ height: 60 }}>
      <AppShell.Header>
        <Group justify="space-between" px="md" h="100%">
          <Group>
            <Button component={Link} to="/" variant="subtle">Dashboard</Button>
            <Button component={Link} to="/players" variant="subtle">Players</Button>
            <Button component={Link} to="/teams" variant="subtle">Teams</Button>
            <Button component={Link} to="/coaches" variant="subtle">Coaches</Button>
          </Group>

          <Group>
            {user && <Text size="sm">👤 {user.username}</Text>}
            {isAuthenticated ? (
              <Button
                color="red"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Logout
              </Button>
            ) : (
              <Button component={Link} to="/login">Login</Button>
            )}
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />

          <Route path="/players" element={
            <ProtectedRoute>
              <PlayersPage />
            </ProtectedRoute>
          } />

          <Route path="/players/new" element={
            <ProtectedRoute>
              <PlayerFormPage />
            </ProtectedRoute>
          } />

          <Route path="/players/:id" element={
            <ProtectedRoute>
              <PlayerDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/players/:id/edit" element={
            <ProtectedRoute>
              <PlayerEditPage />
            </ProtectedRoute>
          } />

          <Route path="/teams" element={
            <ProtectedRoute>
              <TeamsPage />
            </ProtectedRoute>
          } />

          <Route path="/teams/new" element={
            <ProtectedRoute>
              <TeamFormPage />
            </ProtectedRoute>
          } />

          <Route path="/teams/:id" element={
            <ProtectedRoute>
              <TeamDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/teams/:id/edit" element={
            <ProtectedRoute>
              <TeamEditPage />
            </ProtectedRoute>
          } />

          <Route path="/coaches" element={
            <ProtectedRoute>
              <CoachesPage />
            </ProtectedRoute>
          } />

          <Route path="/coaches/new" element={
            <ProtectedRoute>
              <CoachFormPage />
            </ProtectedRoute>
          } />

          <Route path="/coaches/:id" element={
            <ProtectedRoute>
              <CoachDetailPage />
            </ProtectedRoute>
          } />

          <Route path="/coaches/:id/edit" element={
            <ProtectedRoute>
              <CoachEditPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={
            isAuthenticated ? <DashboardPage /> : <LoginPage />
          } />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}