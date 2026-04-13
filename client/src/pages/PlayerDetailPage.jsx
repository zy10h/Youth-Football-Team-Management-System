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
  Divider,
} from "@mantine/core";
import api from "../api/api";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";

export default function PlayerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const response = await api.get(`/players/${id}`);
        setPlayer(response.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load player");
      }
    }

    fetchPlayer();
  }, [id]);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this player?"
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/players/${id}`);
      navigate("/players");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete player");
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

  if (!player) {
    return <LoadingState text="Loading player..." />;
  }

  return (
    <Container>
      <Group justify="space-between" mb="md">
        <Title order={2}>
          {player.firstName} {player.lastName}
        </Title>

        <Group>
          <Button
            component={Link}
            to={`/players/${player._id}/edit`}
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

      <Paper withBorder p="lg">
        <Stack gap="sm">
          <Divider label="Basic Info" labelPosition="left" />

          <Text><strong>Age:</strong> {player.age}</Text>
          <Text><strong>Date of Birth:</strong> {player.dateOfBirth?.slice(0, 10)}</Text>

          <Divider label="Position" labelPosition="left" />

          <Text><strong>Preferred:</strong> {player.preferredPosition || "N/A"}</Text>
          <Text>
            <strong>Alternative:</strong>{" "}
            {player.alternativePositions?.length
              ? player.alternativePositions.join(", ")
              : "None"}
          </Text>

          <Divider label="Team" labelPosition="left" />

          <Text>
            <strong>Team:</strong>{" "}
            {player.team?.name ? (
              <Badge>{player.team.name}</Badge>
            ) : (
              <Badge color="gray">Unassigned</Badge>
            )}
          </Text>

          <Text><strong>Kit Number:</strong> {player.jerseyNumber ?? "N/A"}</Text>

          <Divider label="Guardian Contact Info" labelPosition="left" />

          <Text><strong>Name:</strong> {player.guardianName || "N/A"}</Text>
          <Text><strong>Phone:</strong> {player.guardianPhone || "N/A"}</Text>
          <Text><strong>Email:</strong> {player.email || "N/A"}</Text>
          <Divider label="Player Contact Info" labelPosition="left" />

          <Text><strong>Phone:</strong> {player.playerPhone || "N/A"}</Text>
          <Text><strong>Email:</strong> {player.playerEmail || "N/A"}</Text>
        </Stack>
      </Paper>
    </Container>
  );
}