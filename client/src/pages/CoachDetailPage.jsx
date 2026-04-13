import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Container,
  Title,
  Text,
  Paper,
  Stack,
  Group,
  Button,
  Badge,
} from "@mantine/core";
import api from "../api/api";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";

export default function CoachDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coach, setCoach] = useState(null);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [coachRes, teamsRes] = await Promise.all([
          api.get(`/coaches/${id}`),
          api.get(`/teams/coach/${id}`),
        ]);

        setCoach(coachRes.data);
        setTeams(teamsRes.data || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load coach");
      }
    }

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this coach?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/coaches/${id}`);
      navigate("/coaches");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete coach");
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    return (
      <Container>
        <ErrorAlert message={error} />
      </Container>
    );
  }

  if (!coach) {
    return <LoadingState text="Loading coach..." />;
  }

  return (
    <Container>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>
            {coach.firstName} {coach.lastName}
          </Title>
          <Text c="dimmed" size="sm">
            Coach Details
          </Text>
        </div>

        <Group>
          <Button
            component={Link}
            to={`/coaches/${coach._id}/edit`}
            variant="outline"
          >
            Edit
          </Button>

          <Button
            color="red"
            onClick={handleDelete}
            loading={deleting}
          >
            Delete
          </Button>
        </Group>
      </Group>

      <Paper withBorder shadow="sm" p="lg" radius="md">
        <Stack gap="lg">
          <div>
            <Title order={3} mb="sm">
              Basic Info
            </Title>
            <Text>Email: {coach.email || "N/A"}</Text>
            <Text>Phone: {coach.phone || "N/A"}</Text>
          </div>

          <div>
            <Title order={3} mb="sm">
              Assigned Teams
            </Title>

            {teams.length === 0 ? (
              <Text c="dimmed">This coach is not assigned to any team.</Text>
            ) : (
              <Stack gap="xs">
                {teams.map((team) => (
                  <Group key={team._id} gap="xs">
                    <Badge color="blue">{team.name}</Badge>
                    <Text size="sm">
                      ({team.trainingDays?.join(", ") || "No training days"})
                    </Text>
                  </Group>
                ))}
              </Stack>
            )}
          </div>
        </Stack>
      </Paper>
    </Container>
  );
}