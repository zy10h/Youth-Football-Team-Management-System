import { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import {
  Alert,
  Badge,
  Button,
  FileInput,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import api from '../api/api';

const HEADERS = [
  'firstName', 'lastName', 'dateOfBirth', 'preferredPosition',
  'guardianName', 'guardianPhone', 'email',
];

function ageFromDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const birth = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(birth.getTime()) || birth.toISOString().slice(0, 10) !== value) {
    return null;
  }
  const today = new Date();
  if (birth > today) return null;
  let age = today.getUTCFullYear() - birth.getUTCFullYear();
  if (
    today.getUTCMonth() < birth.getUTCMonth() ||
    (today.getUTCMonth() === birth.getUTCMonth() && today.getUTCDate() < birth.getUTCDate())
  ) {
    age -= 1;
  }
  return age;
}

function rowError(player) {
  if (!player.firstName || !player.lastName) return 'Missing player name';
  if (!player.guardianName) return 'Missing guardian name';
  if (!player.guardianPhone && !player.email) return 'Missing guardian contact';
  if (ageFromDate(player.dateOfBirth) === null) return 'Invalid date of birth';
  return '';
}

export default function BulkImportPlayersModal({ opened, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [fileError, setFileError] = useState('');
  const [requestError, setRequestError] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!opened) return;
    let active = true;
    api.get('/teams')
      .then((response) => {
        if (active) {
          setTeams([...response.data].sort((a, b) => a.maxAge - b.maxAge));
        }
      })
      .catch(() => {
        if (active) setTeams([]);
      });
    return () => { active = false; };
  }, [opened]);

  const invalidCount = useMemo(() => players.filter((p) => rowError(p)).length, [players]);

  const downloadTemplate = () => {
    const csv = [
      HEADERS.join(','),
      'Jack,Example,2017-03-12,Striker,John Example,0400000001,',
      'Oliver,Example,2015-08-20,Goalkeeper,Alex Example,,alex@example.com',
    ].join('\r\n');
    const blob = new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'academy-players-template.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleFile = async (selectedFile) => {
    setFile(selectedFile);
    setPlayers([]);
    setFileError('');
    setRequestError('');
    setResult(null);

    if (!selectedFile) return;
    if (selectedFile.size > 1024 * 1024) {
      setFileError('File is too large. Please use a CSV smaller than 1 MB.');
      return;
    }
    try {
      const csv = await selectedFile.text();
      const parsed = Papa.parse(csv, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header) => header.replace(/^\uFEFF/, '').trim(),
      });
      if (parsed.errors.length > 0) {
        setFileError(`CSV parsing error: ${parsed.errors[0].message}`);
        return;
      }
      const fields = parsed.meta.fields || [];
      const missing = ['firstName', 'lastName', 'dateOfBirth', 'guardianName']
        .filter((key) => !fields.includes(key));
      if (missing.length || (!fields.includes('guardianPhone') && !fields.includes('email'))) {
        setFileError(`Missing CSV columns: ${[
          ...missing,
          ...(!fields.includes('guardianPhone') && !fields.includes('email')
            ? ['guardianPhone or email'] : []),
        ].join(', ')}`);
        return;
      }
      if (parsed.data.length === 0 || parsed.data.length > 100) {
        setFileError('CSV must contain between 1 and 100 players.');
        return;
      }
      const cleanPlayers = parsed.data.map((row) => Object.fromEntries(
        HEADERS.map((key) => [key, String(row[key] ?? '').trim()])
      ));
      setPlayers(cleanPlayers);
    } catch (error) {
      setFileError(error.message || 'Could not read this CSV file.');
    }
  };

  const confirmImport = async () => {
    if (!players.length || result || importing) return;
    setImporting(true);
    setRequestError('');
    try {
      const response = await api.post('/players/bulk', { players });
      setResult(response.data);
      if (response.data.imported > 0) onImported?.();
    } catch (error) {
      setRequestError(error.response?.data?.message || 'Bulk import request failed.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Import Players from CSV"
      size="xl"
      closeOnClickOutside={!importing}
      closeOnEscape={!importing}
      withCloseButton={!importing}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Upload up to 100 players. The server assigns each player to the youngest
          eligible team based on age. Jersey numbers are not assigned.
        </Text>
        <Group justify="space-between" align="end">
          <FileInput
            label="CSV file"
            placeholder="Choose a .csv file"
            accept=".csv,text/csv"
            value={file}
            onChange={handleFile}
            clearable
            style={{ flex: 1 }}
            disabled={importing}
          />
          <Button variant="light" onClick={downloadTemplate}>
            Download CSV Template
          </Button>
        </Group>
        {fileError && <Alert color="red" title="Invalid CSV">{fileError}</Alert>}
        {requestError && <Alert color="red" title="Import error">{requestError}</Alert>}

        {players.length > 0 && (
          <>
            <Group gap="sm">
              <Badge color="blue">{players.length} rows</Badge>
              <Badge color="green">{players.length - invalidCount} valid</Badge>
              <Badge color={invalidCount ? 'red' : 'gray'}>{invalidCount} invalid</Badge>
            </Group>
            {invalidCount > 0 && (
              <Alert color="yellow" title="Some rows need correction">
                You can import now; the server will reject invalid rows and report
                individual failures. For cleaner results, correct the CSV first.
              </Alert>
            )}
            <Text size="xs" c="dimmed">
              Team suggestions are for preview only. Final assignments are calculated by the server.
            </Text>
            <ScrollArea type="auto" h={280}>
              <Table striped highlightOnHover withTableBorder>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Row</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Age</Table.Th>
                    <Table.Th>Position</Table.Th>
                    <Table.Th>Suggested team</Table.Th>
                    <Table.Th>Validation</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {players.map((player, index) => {
                    const age = ageFromDate(player.dateOfBirth);
                    const team = age === null ? null : teams.find((t) => t.maxAge >= age);
                    const error = rowError(player);
                    return (
                      <Table.Tr key={index}>
                        <Table.Td>{index + 1}</Table.Td>
                        <Table.Td>{player.firstName} {player.lastName}</Table.Td>
                        <Table.Td>{age ?? '-'}</Table.Td>
                        <Table.Td>{player.preferredPosition || '-'}</Table.Td>
                        <Table.Td>{age === null ? '-' : (team?.name || 'Unassigned')}</Table.Td>
                        <Table.Td>
                          <Badge color={error ? 'red' : 'green'}>{error || 'Valid'}</Badge>
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            {!result && (
              <Group justify="flex-end">
                <Button loading={importing} onClick={confirmImport}>
                  Confirm Import ({players.length})
                </Button>
              </Group>
            )}
          </>
        )}

        {result && (
          <Paper withBorder p="md">
            <Stack gap="sm">
              <Title order={4}>Import Results</Title>
              <Group gap="sm">
                <Badge color="blue">Total: {result.total}</Badge>
                <Badge color="green">Imported: {result.imported}</Badge>
                <Badge color={result.failed ? 'red' : 'gray'}>Failed: {result.failed}</Badge>
              </Group>
              <Text fw={600}>Team assignments</Text>
              {Object.entries(result.teamAssignments || {}).length > 0 ? (
                <Group gap="xs">
                  {Object.entries(result.teamAssignments).map(([name, count]) => (
                    <Badge variant="light" key={name}>{name}: {count}</Badge>
                  ))}
                </Group>
              ) : <Text size="sm">No players were imported.</Text>}
              <ScrollArea h={220} type="auto">
                <Table striped withTableBorder>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Row</Table.Th>
                      <Table.Th>Player</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Team / error</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {(result.results || []).map((item) => (
                      <Table.Tr key={item.row}>
                        <Table.Td>{item.row}</Table.Td>
                        <Table.Td>{item.name}</Table.Td>
                        <Table.Td>
                          <Badge color={item.status === 'SUCCESS' ? 'green' : 'red'}>
                            {item.status}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{item.team || item.error || '-'}</Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>
              <Alert color="blue" title="Import submitted">
                Do not submit the same file again without reviewing the results;
                repeated imports can create duplicate players.
              </Alert>
            </Stack>
          </Paper>
        )}
      </Stack>
    </Modal>
  );
}