import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Title,
  Group,
  Button,
  Paper,
  Table,
  Text,
  TextInput,
} from "@mantine/core";
import api from "../api/api";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";
import LinkText from "../components/LinkText";

export default function CoachesPage() {
  const [coaches, setCoaches] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/coaches");
        setCoaches(res.data || []);
      } catch (err) {
        setError("Failed to load coaches.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  const filteredCoaches = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return coaches;

    return coaches.filter((coach) => {
      const fullName = `${coach.firstName || ""} ${coach.lastName || ""}`.toLowerCase();
      const email = (coach.email || "").toLowerCase();
      const phone = (coach.phone || "").toLowerCase();

      return (
        fullName.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword)
      );
    });
  }, [coaches, search]);

  return (
    <Container>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Coaches</Title>
          <Text c="dimmed" size="sm">
            View and manage academy coaches
          </Text>
        </div>

        <Button component={Link} to="/coaches/new">
          Add Coach
        </Button>
      </Group>

      <ErrorAlert message={error} />

      <Paper withBorder p="md" mb="md">
        <TextInput
          label="Search"
          placeholder="Search by name, email, or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>

      {loading ? (
        <LoadingState text="Loading coaches..." />
      ) : filteredCoaches.length === 0 ? (
        <Paper withBorder p="xl">
          <Text ta="center" c="dimmed">
            No coaches found.
          </Text>
        </Paper>
      ) : (
        <Paper withBorder p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Phone</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredCoaches.map((coach) => (
                <Table.Tr key={coach._id}>
                  <Table.Td>
                    <LinkText to={`/coaches/${coach._id}`}>
                      {coach.firstName} {coach.lastName}
                    </LinkText>
                  </Table.Td>
                  <Table.Td>{coach.email || "-"}</Table.Td>
                  <Table.Td>{coach.phone || "-"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}