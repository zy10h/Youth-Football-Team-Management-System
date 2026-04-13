import { useNavigate } from "react-router-dom";
import { Container, Title, Text } from "@mantine/core";
import api from "../api/api";
import PlayerForm from "../components/PlayerForm";

export default function PlayerFormPage() {
  const navigate = useNavigate();

  const handleCreate = async (formData) => {
    await api.post("/players", formData);
    navigate("/players");
  };

  return (
    <Container>
      <Title order={2} mb="xs">
        Add Player
      </Title>

      <Text c="dimmed" size="sm" mb="md">
        Create a new player in the academy
      </Text>

      <PlayerForm
        onSubmit={handleCreate}
        submitText="Create Player"
      />
    </Container>
  );
}