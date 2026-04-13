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
  Badge,
  TextInput,
} from "@mantine/core";
import api from "../api/api";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";
import LinkText from "../components/LinkText";

export default function TeamsPage() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/teams");
        setTeams(res.data || []);
      } catch (err) {
        setError("Failed to load teams.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleSortClick = () => {
    setSort((prev) => (prev === "name_asc" ? "name_desc" : "name_asc"));
  };

  const filteredAndSortedTeams = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let list = [...teams];

    if (keyword) {
      list = list.filter((team) => {
        const teamName = (team.name || "").toLowerCase();
        const trainingDays = (team.trainingDays || []).join(" ").toLowerCase();
        const coachName = team.coach
          ? `${team.coach.firstName || ""} ${team.coach.lastName || ""}`.toLowerCase()
          : "";

        return (
          teamName.includes(keyword) ||
          trainingDays.includes(keyword) ||
          coachName.includes(keyword)
        );
      });
    }

    list.sort((a, b) => {
      const aName = (a.name || "").toLowerCase();
      const bName = (b.name || "").toLowerCase();

      return sort === "name_asc"
        ? aName.localeCompare(bName)
        : bName.localeCompare(aName);
    });

    return list;
  }, [teams, search, sort]);

  return (
    <Container>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Teams</Title>
          <Text c="dimmed" size="sm">
            View and manage academy teams
          </Text>
        </div>

        <Button component={Link} to="/teams/new">
          Add Team
        </Button>
      </Group>

      <ErrorAlert message={error} />

      <Paper withBorder p="md" mb="md">
        <TextInput
          label="Search"
          placeholder="Search by team name, training day, or coach"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Paper>

      {loading ? (
        <LoadingState text="Loading teams..." />
      ) : filteredAndSortedTeams.length === 0 ? (
        <Paper withBorder p="xl">
          <Text ta="center" c="dimmed">
            No teams found.
          </Text>
        </Paper>
      ) : (
        <Paper withBorder p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  onClick={handleSortClick}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  Team Name{" "}
                  {sort === "name_asc" ? "↑" : "↓"}
                </Table.Th>
                <Table.Th>Training Days</Table.Th>
                <Table.Th>Coach</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filteredAndSortedTeams.map((team) => (
                <Table.Tr key={team._id}>
                  <Table.Td>
                    <LinkText to={`/teams/${team._id}`}>
                      {team.name}
                    </LinkText>
                  </Table.Td>
                  <Table.Td>
                    {team.trainingDays?.length
                      ? team.trainingDays.map((day) => (
                          <Badge key={day} mr={6} mb={4} variant="light">
                            {day}
                          </Badge>
                        ))
                      : "-"}
                  </Table.Td>

                  <Table.Td>
                    {team.coach
                      ? `${team.coach.firstName} ${team.coach.lastName}`
                      : "-"}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}