import { useNavigate } from "react-router-dom";
import { Container, Title, Text } from "@mantine/core";
import api from "../api/api";
import CoachForm from "../components/CoachForm";

export default function CoachFormPage() {
  const navigate = useNavigate();

  const handleCreate = async (data) => {
    await api.post("/coaches", data);
    navigate("/coaches");
  };

  return (
    <Container>
      <Title order={2} mb="xs">Add Coach</Title>
      <Text c="dimmed" size="sm" mb="md">
        Create a new coach profile
      </Text>

      <CoachForm
        onSubmit={handleCreate}
        submitText="Create Coach"
      />
    </Container>
  );
}