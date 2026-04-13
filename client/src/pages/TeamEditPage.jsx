import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Title, Text } from "@mantine/core";
import api from "../api/api";
import TeamForm from "../components/TeamForm";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";

export default function TeamEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [coaches, setCoaches] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      try {
        const [teamRes, coachRes] = await Promise.all([
          api.get(`/teams/${id}`),
          api.get("/coaches"),
        ]);

        setTeam(teamRes.data);
        setCoaches(coachRes.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load team");
      }
    }

    fetchData();
  }, [id]);

  const handleUpdate = async (formData) => {
    await api.put(`/teams/${id}`, formData);
    navigate(`/teams/${id}`);
  };

  if (error) {
    return (
      <Container>
        <ErrorAlert message={error} />
      </Container>
    );
  }

  if (!team) {
    return <LoadingState text="Loading team..." />;
  }

  return (
    <Container>
      <Title order={2} mb="xs">Edit Team</Title>

      <Text c="dimmed" size="sm" mb="md">
        Update team details
      </Text>

      <TeamForm
        initialValues={team}
        onSubmit={handleUpdate}
        submitText="Update Team"
        coaches={coaches}
      />
    </Container>
  );
}