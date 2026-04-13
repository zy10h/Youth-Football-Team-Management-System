import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Title, Text } from "@mantine/core";
import api from "../api/api";
import TeamForm from "../components/TeamForm";
import ErrorAlert from "../components/ErrorAlert";

export default function TeamFormPage() {
  const navigate = useNavigate();
  const [coaches, setCoaches] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCoaches() {
      try {
        const res = await api.get("/coaches");
        setCoaches(res.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load coaches");
      }
    }

    fetchCoaches();
  }, []);

  const handleCreate = async (formData) => {
    await api.post("/teams", formData);
    navigate("/teams");
  };

  return (
    <Container>
      <Title order={2} mb="xs">Add Team</Title>

      <Text c="dimmed" size="sm" mb="md">
        Create a new team
      </Text>

      <ErrorAlert message={error} />

      <TeamForm
        onSubmit={handleCreate}
        submitText="Create Team"
        coaches={coaches}
      />
    </Container>
  );
}