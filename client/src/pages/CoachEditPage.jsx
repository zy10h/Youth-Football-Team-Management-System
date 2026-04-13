import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Title, Text } from "@mantine/core";
import api from "../api/api";
import CoachForm from "../components/CoachForm";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";

export default function CoachEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coach, setCoach] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCoach() {
      try {
        const res = await api.get(`/coaches/${id}`);
        setCoach(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load coach");
      }
    }

    fetchCoach();
  }, [id]);

  const handleUpdate = async (data) => {
    await api.put(`/coaches/${id}`, data);
    navigate(`/coaches/${id}`);
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
      <Title order={2} mb="xs">Edit Coach</Title>
      <Text c="dimmed" size="sm" mb="md">
        Update coach information
      </Text>

      <CoachForm
        initialValues={coach}
        onSubmit={handleUpdate}
        submitText="Update Coach"
      />
    </Container>
  );
}

