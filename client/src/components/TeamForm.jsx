import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Stack,
  Title,
  Text,
  Alert,
  TextInput,
  NumberInput,
  MultiSelect,
  Select,
  Button,
  Group,
  Badge,
} from "@mantine/core";
import api from "../api/api";

const daysOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function TeamForm({
  initialValues,
  onSubmit,
  submitText = "Save Team",
  coaches = [],
}) {
  const [form, setForm] = useState({
    maxAge: initialValues?.maxAge || "",
    trainingDays: initialValues?.trainingDays || [],
    coach: initialValues?.coach?._id || initialValues?.coach || "",
  });

  const [allTeams, setAllTeams] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const generatedName = form.maxAge ? `U${form.maxAge}` : "";
  const currentTeamId = initialValues?._id || initialValues?.id || null;

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await api.get("/teams");
        setAllTeams(response.data || []);
      } catch (err) {
        console.error("Failed to load teams", err);
      }
    }

    fetchTeams();
  }, []);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const coachConflicts = useMemo(() => {
    const result = {};

    if (!form.trainingDays || form.trainingDays.length === 0) {
      return result;
    }

    for (const team of allTeams) {
      const coachId = team.coach?._id || team.coach;

      if (!coachId) continue;
      if (currentTeamId && String(team._id) === String(currentTeamId)) continue;

      const overlappingDays = (team.trainingDays || []).filter((day) =>
        form.trainingDays.includes(day)
      );

      if (overlappingDays.length > 0) {
        result[coachId] = {
          teamName: team.name,
          overlappingDays,
        };
      }
    }

    return result;
  }, [allTeams, form.trainingDays, currentTeamId]);

  const selectedCoachConflict = form.coach ? coachConflicts[form.coach] : null;

  const coachOptions = useMemo(() => {
    return [
      { value: "", label: "Unassigned" },
      ...coaches.map((coach) => {
        const conflict = coachConflicts[coach._id];

        if (conflict) {
          return {
            value: coach._id,
            label: `${coach.firstName} ${coach.lastName} (unavailable: ${conflict.overlappingDays.join(", ")})`,
            disabled: true,
          };
        }

        return {
          value: coach._id,
          label: `${coach.firstName} ${coach.lastName}`,
        };
      }),
    ];
  }, [coaches, coachConflicts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.maxAge) {
      setError("Maximum age is required.");
      return;
    }

    if (form.coach && coachConflicts[form.coach]) {
      const conflict = coachConflicts[form.coach];
      setError(
        `Coach is already assigned to ${conflict.teamName} on ${conflict.overlappingDays.join(", ")}.`
      );
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        name: `U${form.maxAge}`,
        maxAge: Number(form.maxAge),
        trainingDays: form.trainingDays,
        coach: form.coach || null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save team");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper withBorder shadow="sm" p="lg" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack>
          <div>
            <Title order={3}>Team Details</Title>
            <Text c="dimmed" size="sm">
              Enter team information
            </Text>
          </div>

          {error && <Alert color="red">{error}</Alert>}

          <TextInput
            label="Team Name"
            value={generatedName}
            readOnly
            placeholder="Will be generated from maximum age"
          />

          <NumberInput
            label="Maximum Age"
            value={form.maxAge}
            onChange={(value) => handleChange("maxAge", value)}
            min={5}
            max={25}
            required
          />

          <MultiSelect
            label="Training Days"
            data={daysOptions}
            value={form.trainingDays}
            onChange={(value) => handleChange("trainingDays", value)}
            placeholder="Select training days"
          />

          <Select
            label="Coach"
            value={form.coach}
            onChange={(value) => handleChange("coach", value || "")}
            data={coachOptions}
            clearable
          />

          {selectedCoachConflict && (
            <Alert color="red">
              This coach is already assigned to{" "}
              <strong>{selectedCoachConflict.teamName}</strong> on{" "}
              {selectedCoachConflict.overlappingDays.join(", ")}.
            </Alert>
          )}

          {form.trainingDays.length > 0 && Object.keys(coachConflicts).length > 0 && (
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                Conflicting coaches:
              </Text>
              {coaches
                .filter((coach) => coachConflicts[coach._id])
                .map((coach) => (
                  <Badge key={coach._id} color="red" variant="light">
                    {coach.firstName} {coach.lastName}
                  </Badge>
                ))}
            </Group>
          )}

          <Group justify="flex-end">
            <Button type="submit" loading={submitting}>
              {submitText}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}