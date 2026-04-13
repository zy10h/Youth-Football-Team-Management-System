import { useEffect, useMemo, useState } from "react";
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
  Table,
} from "@mantine/core";
import api from "../api/api";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";
import LinkText from "../components/LinkText";

export default function TeamDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [sort, setSort] = useState("position_asc");

  useEffect(() => {
    async function fetchTeam() {
      try {
        const res = await api.get(`/teams/${id}`);
        setTeam(res.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load team");
      }
    }

    fetchTeam();
  }, [id]);

  const positionOrder = {
    Goalkeeper: 1,
    "Centre Back": 2,
    Fullback: 2,
    "Defensive Midfielder": 3,
    "Central Midfielder": 3,
    "Attacking Midfielder": 3,
    "Winger/Wide Midfielder": 4,
    Striker: 4,
  };

  const handleSortClick = (field) => {
    if (sort === `${field}_asc`) {
      setSort(`${field}_desc`);
    } else {
      setSort(`${field}_asc`);
    }
  };

  const sortedPlayers = useMemo(() => {
    if (!team?.players) return [];

    const list = [...team.players];

    switch (sort) {
      case "name_asc":
        return list.sort((a, b) =>
          `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`
          )
        );

      case "name_desc":
        return list.sort((a, b) =>
          `${b.lastName} ${b.firstName}`.localeCompare(
            `${a.lastName} ${a.firstName}`
          )
        );

      case "age_asc":
        return list.sort((a, b) => (a.age ?? 999) - (b.age ?? 999));

      case "age_desc":
        return list.sort((a, b) => (b.age ?? -1) - (a.age ?? -1));

      case "position_asc":
        return list.sort((a, b) => {
          const aPos = positionOrder[a.preferredPosition] || 999;
          const bPos = positionOrder[b.preferredPosition] || 999;

          if (aPos !== bPos) return aPos - bPos;

          const aNum = a.jerseyNumber ?? 999;
          const bNum = b.jerseyNumber ?? 999;
          return aNum - bNum;
        });

      case "position_desc":
        return list.sort((a, b) => {
          const aPos = positionOrder[a.preferredPosition] || 0;
          const bPos = positionOrder[b.preferredPosition] || 0;

          if (aPos !== bPos) return bPos - aPos;

          const aNum = a.jerseyNumber ?? -1;
          const bNum = b.jerseyNumber ?? -1;
          return bNum - aNum;
        });

      case "jersey_asc":
        return list.sort(
          (a, b) => (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999)
        );

      case "jersey_desc":
        return list.sort(
          (a, b) => (b.jerseyNumber ?? -1) - (a.jerseyNumber ?? -1)
        );

      default:
        return list;
    }
  }, [team, sort]);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this team?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      await api.delete(`/teams/${id}`);
      navigate("/teams");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete team");
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

  if (!team) {
    return <LoadingState text="Loading team..." />;
  }

  return (
    <Container>
      <Group justify="space-between" mb="md">
        <Title order={2}>{team.name}</Title>

        <Group>
          <Button
            component={Link}
            to={`/teams/${team._id}/edit`}
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

      <Paper withBorder p="lg" mb="md">
        <Stack gap="sm">
          <Divider label="Team Info" labelPosition="left" />

          <Text>
            <strong>Maximum Age:</strong> {team.maxAge}
          </Text>

          <Text>
            <strong>Training Day(s):</strong>{" "}
            {team.trainingDays?.length
              ? team.trainingDays.map((day) => (
                  <Badge key={day} mr={6} mb={4}>
                    {day}
                  </Badge>
                ))
              : "None"}
          </Text>

          <Text>
            <strong>Coach:</strong>{" "}
            {team.coach
              ? `${team.coach.firstName} ${team.coach.lastName}`
              : "Unassigned"}
          </Text>
        </Stack>
      </Paper>

      <Title order={3} mb="sm">
        Players
      </Title>

      {sortedPlayers.length === 0 ? (
        <Paper withBorder p="xl">
          <Text ta="center" c="dimmed">
            No players registered in this team.
          </Text>
        </Paper>
      ) : (
        <Paper withBorder p="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th
                  onClick={() => handleSortClick("name")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  Name{" "}
                  {sort.includes("name")
                    ? sort === "name_asc"
                      ? "(Last Name A-Z)"
                      : "(Last Name Z-A)"
                    : ""}
                </Table.Th>

                <Table.Th
                  onClick={() => handleSortClick("age")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  Age{" "}
                  {sort.includes("age")
                    ? sort === "age_asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </Table.Th>

                <Table.Th
                  onClick={() => handleSortClick("position")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  Preferred Position{" "}
                  {sort.includes("position")
                    ? sort === "position_asc"
                      ? "(GK - FW)"
                      : "(FW - GK)"
                    : ""}
                </Table.Th>

                <Table.Th>Alternative Positions</Table.Th>

                <Table.Th
                  onClick={() => handleSortClick("jersey")}
                  style={{ cursor: "pointer", userSelect: "none" }}
                >
                  Kit Number{" "}
                  {sort.includes("jersey")
                    ? sort === "jersey_asc"
                      ? "↑"
                      : "↓"
                    : ""}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {sortedPlayers.map((player) => (
                <Table.Tr key={player._id}>
                  <Table.Td>
                    <LinkText to={`/players/${player._id}`}>
                      {player.firstName} {player.lastName}
                    </LinkText>
                  </Table.Td>

                  <Table.Td>{player.age ?? "-"}</Table.Td>

                  <Table.Td>{player.preferredPosition || "-"}</Table.Td>

                  <Table.Td>
                    {player.alternativePositions?.length
                      ? player.alternativePositions.join(", ")
                      : "None"}
                  </Table.Td>

                  <Table.Td>{player.jerseyNumber ?? "-"}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Container>
  );
}