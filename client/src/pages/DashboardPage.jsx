import { useEffect, useState } from 'react';
import {Container,Title,SimpleGrid,Card,Text,Button,Group,Stack} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import api from '../api/api';

export default function DashboardPage() {
  const [players, setPlayers] = useState(0);
  const [teams, setTeams] = useState(0);
  const [coaches, setCoaches] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const p = await api.get("/players");
        const t = await api.get("/teams");
        const c = await api.get("/coaches");

        setPlayers(p.data.total || p.data.length);
        setTeams(t.data.length);
        setCoaches(c.data.length);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();
  }, []);

  return (
    <Container>
      <Title mb="md">Dashboard</Title>

      <SimpleGrid cols={3} spacing="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack>
            <Text size="lg">Players</Text>
            <Title>{players}</Title>
            <Button onClick={() => navigate("/players")}>
              View Players
            </Button>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack>
            <Text size="lg">Teams</Text>
            <Title>{teams}</Title>
            <Button onClick={() => navigate("/teams")}>
              View Teams
            </Button>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack>
            <Text size="lg">Coaches</Text>
            <Title>{coaches}</Title>
            <Button onClick={() => navigate("/coaches")}>
              View Coaches
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>

      <Group mt="xl">
        <Button onClick={() => navigate("/players/new")}>
          Add Player
        </Button>
        <Button onClick={() => navigate("/teams/new")}>
          Add Team
        </Button>
        <Button onClick={() => navigate("/coaches/new")}>
          Add Coach
        </Button>
      </Group>
    </Container>
  );
}
