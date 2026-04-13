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
  Divider,
} from "@mantine/core";
import api from "../api/api";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";

export default function CoachDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [coach, setCoach] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function fetchCoach() {
      try {
        const res = await api.get(`/coaches/${id}`);
        setCoach(res.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load coach");
      }
    }

    fetchCoach();
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
        <Title order={2}>
          {coach.firstName} {coach.lastName}
        </Title>

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

      <Paper withBorder p="lg">
        <Stack gap="sm">
          <Divider label="Basic Info" labelPosition="left" />

          <Text>
            <strong>First Name:</strong> {coach.firstName || "N/A"}
          </Text>
          <Text>
            <strong>Last Name:</strong> {coach.lastName || "N/A"}
          </Text>

          <Divider label="Contact Info" labelPosition="left" />

          <Text>
            <strong>Email:</strong> {coach.email || "N/A"}
          </Text>
          <Text>
            <strong>Phone:</strong> {coach.phone || "N/A"}
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}