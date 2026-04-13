import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Title, Text } from "@mantine/core";
import api from "../api/api";
import PlayerForm from "../components/PlayerForm";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";

export default function PlayerEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [player, setPlayer] = useState(null);
  const [error, setError] = useState("");

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

  const handleUpdate = async (formData) => {
    await api.put(`/players/${id}`, formData);
    navigate(`/players/${id}`);
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
      <Title order={2} mb="xs">
        Edit Player
      </Title>

      <Text c="dimmed" size="sm" mb="md">
        Update player information
      </Text>

      <PlayerForm
        initialValues={player}
        onSubmit={handleUpdate}
        submitText="Update Player"
      />
    </Container>
  );
}