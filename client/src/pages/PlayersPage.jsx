import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Title,
  Group,
  Button,
  Paper,
  TextInput,
  Select,
  MultiSelect,
  Table,
  Badge,
  Pagination,
  Text,
  NumberInput,
} from "@mantine/core";
import api from "../api/api";
import LoadingState from "../components/LoadingState";
import ErrorAlert from "../components/ErrorAlert";
import LinkText from "../components/LinkText";

const positionOptions = [
  "Goalkeeper",
  "Centre Back",
  "Fullback",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Winger/Wide Midfielder",
  "Striker",
];

export default function PlayersPage() {
  const [players, setPlayers] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("name_asc");
  const [page, setPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const limit = 20;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [preferredPositionFilter, setPreferredPositionFilter] = useState("");
  const [positionFilter, setPositionFilter] = useState([]);
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [filterError, setFilterError] = useState("");

  const positionOrder = {
    Goalkeeper: 1,
    "Centre Back": 2,
    Fullback: 3,
    "Defensive Midfielder": 4,
    "Central Midfielder": 5,
    "Attacking Midfielder": 6,
    "Winger/Wide Midfielder": 7,
    Striker: 8,
  };

  const handleSortClick = (field) => {
    if (sort === `${field}_asc`) {
      setSort(`${field}_desc`);
    } else {
      setSort(`${field}_asc`);
    }
    setPage(1);
  };

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await api.get("/players", {
          params: { search, page: 1, limit: 2000 },
        });

        setPlayers(res.data.players || []);
      } catch (err) {
        setError("Failed to load players.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [search]);

  useEffect(() => {
    if (minAge !== "" && maxAge !== "" && Number(minAge) > Number(maxAge)) {
      setFilterError("Min Age cannot be greater than Max Age.");
    } else {
      setFilterError("");
    }
  }, [minAge, maxAge]);

  const filteredAndSortedPlayers = useMemo(() => {
    const hasInvalidAgeRange =
      minAge !== "" &&
      maxAge !== "" &&
      Number(minAge) > Number(maxAge);

    if (hasInvalidAgeRange) {
      return [];
    }

    let list = [...players];

    if (preferredPositionFilter) {
      list = list.filter(
        (player) => player.preferredPosition === preferredPositionFilter
      );
    }

    if (positionFilter.length > 0) {
      list = list.filter((player) => {
        const preferred = player.preferredPosition || "";
        const alternatives = player.alternativePositions || [];

        return positionFilter.some(
          (position) =>
            preferred === position || alternatives.includes(position)
        );
      });
    }

    if (minAge !== "" && minAge !== null && minAge !== undefined) {
      list = list.filter((player) => (player.age ?? -1) >= Number(minAge));
    }

    if (maxAge !== "" && maxAge !== null && maxAge !== undefined) {
      list = list.filter((player) => (player.age ?? 999) <= Number(maxAge));
    }

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
        return list.sort((a, b) => {
          const diff = (a.age ?? 999) - (b.age ?? 999);
          if (diff !== 0) return diff;

          return `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`
          );
        });

      case "age_desc":
        return list.sort((a, b) => {
          const diff = (b.age ?? -1) - (a.age ?? -1);
          if (diff !== 0) return diff;

          return `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`
          );
        });

      case "jersey_asc":
        return list.sort((a, b) => {
          const diff = (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999);
          if (diff !== 0) return diff;

          return `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`
          );
        });

      case "jersey_desc":
        return list.sort((a, b) => {
          const diff = (b.jerseyNumber ?? -1) - (a.jerseyNumber ?? -1);
          if (diff !== 0) return diff;

          return `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`
          );
        });

      case "position_asc":
        return list.sort((a, b) => {
          const aPos = positionOrder[a.preferredPosition] || 999;
          const bPos = positionOrder[b.preferredPosition] || 999;

          if (aPos !== bPos) return aPos - bPos;

          return `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`
          );
        });

      case "position_desc":
        return list.sort((a, b) => {
          const aPos = positionOrder[a.preferredPosition] || 999;
          const bPos = positionOrder[b.preferredPosition] || 999;

          if (aPos !== bPos) return bPos - aPos;

          return `${a.lastName} ${a.firstName}`.localeCompare(
            `${b.lastName} ${b.firstName}`
          );
        });

      default:
        return list;
    }
  }, [
    players,
    sort,
    preferredPositionFilter,
    positionFilter,
    minAge,
    maxAge,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSortedPlayers.length / limit)
  );

  const paginatedPlayers = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredAndSortedPlayers.slice(start, start + limit);
  }, [filteredAndSortedPlayers, page, limit]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
      return;
    }
    setPageInput(String(page));
  }, [page, totalPages]);

  const applyPageInput = () => {
    if (!pageInput) {
      setPageInput(String(page));
      return;
    }

    const parsed = Number(pageInput);

    if (!Number.isInteger(parsed)) {
      setPageInput(String(page));
      return;
    }

    const nextPage = Math.min(Math.max(parsed, 1), totalPages);
    setPage(nextPage);
    setPageInput(String(nextPage));
  };

  return (
    <Container>
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Players</Title>
          <Text c="dimmed" size="sm">
            View and manage academy players
          </Text>
        </div>

        <Button component={Link} to="/players/new">
          Add Player
        </Button>
      </Group>

      <ErrorAlert message={error} />

      <Paper withBorder p="md" mb="md">
        <Group grow align="flex-end">
          <TextInput
            label="Search"
            placeholder="Search by name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <Select
            label="Preferred Position"
            placeholder="All preferred positions"
            value={preferredPositionFilter}
            onChange={(value) => {
              setPreferredPositionFilter(value || "");
              setPage(1);
            }}
            data={positionOptions}
            clearable
          />

          <MultiSelect
            label="Positions"
            placeholder="All positions"
            value={positionFilter}
            onChange={(value) => {
              setPositionFilter(value);
              setPage(1);
            }}
            data={positionOptions}
            clearable
            searchable
          />

          <NumberInput
            label="Min Age"
            placeholder="Any"
            value={minAge}
            onChange={(value) => {
              setMinAge(value ?? "");
              setPage(1);
            }}
            min={0}
            max={30}
          />

          <NumberInput
            label="Max Age"
            placeholder="Any"
            value={maxAge}
            onChange={(value) => {
              setMaxAge(value ?? "");
              setPage(1);
            }}
            min={0}
            max={30}
          />

          <Button
            variant="default"
            onClick={() => {
              setSearch("");
              setPreferredPositionFilter("");
              setPositionFilter([]);
              setMinAge("");
              setMaxAge("");
              setPage(1);
              setFilterError("");
            }}
          >
            Clear Filters
          </Button>
        </Group>
      </Paper>

      {filterError && <ErrorAlert message={filterError} />}

      {loading ? (
        <LoadingState text="Loading players..." />
      ) : filteredAndSortedPlayers.length === 0 ? (
        <Paper withBorder p="xl">
          <Text ta="center" c="dimmed">
            No players found.
          </Text>
        </Paper>
      ) : (
        <>
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

                  <Table.Th>Team</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>
                {paginatedPlayers.map((player) => (
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
                        : "-"}
                    </Table.Td>

                    <Table.Td>
                      {player.team?.name ? (
                        <Badge variant="light">{player.team.name}</Badge>
                      ) : (
                        <Badge color="gray" variant="light">
                          Unassigned
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>

          <Group justify="center" mt="md" gap="sm">
            <Pagination value={page} onChange={setPage} total={totalPages} />

            <NumberInput
              value={pageInput}
              onChange={(value) => setPageInput(value ? String(value) : "")}
              onBlur={applyPageInput}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyPageInput();
                }
              }}
              min={1}
              max={totalPages}
              clampBehavior="none"
              placeholder="Page"
              w={110}
            />
          </Group>
        </>
      )}
    </Container>
  );
}