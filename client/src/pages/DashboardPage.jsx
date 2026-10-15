import { useEffect, useState } from 'react';

import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  Alert,
  Divider,
  Loader
} from '@mantine/core';

import { useNavigate } from 'react-router-dom';
import api from '../api/api';

const ageGroupOrder = [
  'Under 10',
  '10-12',
  '13-15',
  '16-18',
  '19+',
  'Unknown'
];

const positionOrder = [
  'Goalkeeper',
  'Fullback',
  'Centre Back',
  'Defensive Midfielder',
  'Central Midfielder',
  'Attacking Midfielder',
  'Winger/Wide Midfielder',
  'Striker',
  'Unknown'
];

export default function DashboardPage() {
  const [players, setPlayers] = useState(0);
  const [teams, setTeams] = useState(0);
  const [coaches, setCoaches] = useState(0);

  // Academy report state
  const [jobId, setJobId] = useState(null);
  const [reportStatus, setReportStatus] = useState('IDLE');
  const [reportResult, setReportResult] = useState(null);
  const [reportError, setReportError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Load dashboard statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [p, t, c] = await Promise.all([
          api.get('/players'),
          api.get('/teams'),
          api.get('/coaches')
        ]);

        setPlayers(p.data.total ?? p.data.length ?? 0);
        setTeams(t.data.length);
        setCoaches(c.data.length);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      }
    };

    fetchData();
  }, []);

  // Submit a new asynchronous report job
  const generateReport = async () => {
    setSubmitting(true);
    setReportError('');
    setReportResult(null);
    setJobId(null);
    setReportStatus('SUBMITTING');

    try {
      const response = await api.post('/reports', {});

      if (!response.data.jobId) {
        throw new Error('No Job ID was returned by the API.');
      }

      setReportStatus(response.data.status || 'QUEUED');
      setJobId(response.data.jobId);

    } catch (err) {
      console.error('Report submission failed:', err);

      setReportError(
        err.response?.data?.message ||
        err.message ||
        'Failed to submit report.'
      );

      setReportStatus('ERROR');

    } finally {
      setSubmitting(false);
    }
  };

  // Poll the API until the report is completed
  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    let timer;
    let attempts = 0;

    const checkReport = async () => {
      try {
        const response = await api.get(
          `/reports/${encodeURIComponent(jobId)}`
        );

        if (cancelled) return;

        const report = response.data;

        setReportStatus(report.status);

        if (report.status === 'COMPLETED') {
          setReportResult(report.result);
          return;
        }

        if (report.status === 'FAILED') {
          setReportError('Report processing failed.');
          return;
        }

        attempts += 1;

        if (attempts >= 30) {
          setReportStatus('TIMEOUT');
          setReportError(
            'The report is taking longer than expected. ' +
            'The background job may still be running.'
          );
          return;
        }

        // Check again after 2 seconds
        timer = setTimeout(checkReport, 2000);

      } catch (err) {
        if (cancelled) return;

        console.error('Failed to check report:', err);

        setReportError(
          err.response?.data?.message ||
          'Failed to retrieve report status.'
        );

        setReportStatus('ERROR');
      }
    };

    // Allow time for SQS and Lambda to process the message
    timer = setTimeout(checkReport, 2000);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [jobId]);

  const reportLoading =
    submitting ||
    reportStatus === 'QUEUED' ||
    reportStatus === 'PROCESSING';

  const statusColor =
    reportStatus === 'COMPLETED'
      ? 'green'
      : reportStatus === 'FAILED' ||
        reportStatus === 'ERROR' ||
        reportStatus === 'TIMEOUT'
      ? 'red'
      : 'blue';

  return (
    <Container size="lg">
      <Title mb="md">Dashboard</Title>

      {/* Existing dashboard cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack>
            <Text size="lg">Players</Text>
            <Title>{players}</Title>

            <Button onClick={() => navigate('/players')}>
              View Players
            </Button>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack>
            <Text size="lg">Teams</Text>
            <Title>{teams}</Title>

            <Button onClick={() => navigate('/teams')}>
              View Teams
            </Button>
          </Stack>
        </Card>

        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Stack>
            <Text size="lg">Coaches</Text>
            <Title>{coaches}</Title>

            <Button onClick={() => navigate('/coaches')}>
              View Coaches
            </Button>
          </Stack>
        </Card>
      </SimpleGrid>

      {/* Existing navigation buttons */}
      <Group mt="xl">
        <Button onClick={() => navigate('/players/new')}>
          Add Player
        </Button>

        <Button onClick={() => navigate('/teams/new')}>
          Add Team
        </Button>

        <Button onClick={() => navigate('/coaches/new')}>
          Add Coach
        </Button>
      </Group>

      {/* New asynchronous report section */}
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        mt="xl"
      >
        <Stack gap="md">
          <Title order={2}>Academy Report</Title>

          <Text c="dimmed">
            Generate a statistical report of the academy's
            players, teams, coaches, age groups and preferred
            playing positions.
          </Text>

          <Group>
            <Button
              onClick={generateReport}
              loading={submitting}
              disabled={reportLoading}
            >
              Generate Academy Report
            </Button>

            {reportStatus !== 'IDLE' && (
              <Badge color={statusColor} size="lg">
                {reportStatus}
              </Badge>
            )}

            {reportLoading && (
              <Loader size="sm" />
            )}
          </Group>

          {reportStatus === 'QUEUED' && (
            <Text size="sm" c="dimmed">
              Report queued. Waiting for background processing...
            </Text>
          )}

          {reportStatus === 'PROCESSING' && (
            <Text size="sm" c="dimmed">
              Lambda is processing the report...
            </Text>
          )}

          {reportError && (
            <Alert color="red" title="Report error">
              {reportError}
            </Alert>
          )}

          {jobId && (
            <Text size="xs" c="dimmed">
              Job ID: {jobId}
            </Text>
          )}

          {/* Completed report */}
          {reportStatus === 'COMPLETED' && reportResult && (
            <>
              <Divider />

              <Alert color="green" title="Report completed">
                The academy report was generated successfully
                using asynchronous background processing.
              </Alert>

              <Text size="sm" c="dimmed">
                Generated at:{' '}
                {reportResult.generatedAt
                  ? new Date(
                      reportResult.generatedAt
                    ).toLocaleString()
                  : 'Unknown'}
              </Text>

              {/* Report summary */}
              <SimpleGrid
                cols={{ base: 1, sm: 3 }}
                spacing="md"
              >
                <Card withBorder radius="md" padding="md">
                  <Text c="dimmed">Total Players</Text>
                  <Title order={2}>
                    {reportResult.totalPlayers}
                  </Title>
                </Card>

                <Card withBorder radius="md" padding="md">
                  <Text c="dimmed">Total Teams</Text>
                  <Title order={2}>
                    {reportResult.totalTeams}
                  </Title>
                </Card>

                <Card withBorder radius="md" padding="md">
                  <Text c="dimmed">Total Coaches</Text>
                  <Title order={2}>
                    {reportResult.totalCoaches}
                  </Title>
                </Card>
              </SimpleGrid>

              {/* Report distributions */}
              <SimpleGrid
                cols={{ base: 1, sm: 2 }}
                spacing="lg"
              >
                <Card withBorder radius="md" padding="lg">
                  <Title order={3} mb="md">
                    Age Distribution
                  </Title>

                  <Stack gap="xs">
                    {Object.entries(reportResult.ageGroups || {})
                      .sort(([a], [b]) => {
                        const indexA = ageGroupOrder.indexOf(a);
                        const indexB = ageGroupOrder.indexOf(b);

                        return (indexA === -1 ? 999 : indexA) -
                               (indexB === -1 ? 999 : indexB);
                      })
                      .map(([group, count]) => (
                        <Group justify="space-between" key={group}>
                          <Text>{group}</Text>
                          <Badge variant="light">{count}</Badge>
                        </Group>
                      ))}
                  </Stack>
                </Card>

                <Card withBorder radius="md" padding="lg">
                  <Title order={3} mb="md">
                    Position Distribution
                  </Title>

                  <Stack gap="xs">
                    {Object.entries(reportResult.positions || {})
                      .sort(([a], [b]) => {
                        const indexA = positionOrder.indexOf(a);
                        const indexB = positionOrder.indexOf(b);

                        return (indexA === -1 ? 999 : indexA) -
                               (indexB === -1 ? 999 : indexB);
                      })
                      .map(([position, count]) => (
                        <Group justify="space-between" key={position}>
                          <Text>{position}</Text>
                          <Badge variant="light">{count}</Badge>
                        </Group>
                      ))}
                  </Stack>
                </Card>
              </SimpleGrid>
            </>
          )}
        </Stack>
      </Card>
    </Container>
  );
}