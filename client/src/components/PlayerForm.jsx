import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Stack,
  Title,
  Text,
  Alert,
  Group,
  TextInput,
  Select,
  Button,
  Radio,
  Checkbox,
  Divider,
} from "@mantine/core";
import api from "../api/api";

const positions = [
  "Goalkeeper",
  "Centre Back",
  "Fullback",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Winger/Wide Midfielder",
  "Striker",
];

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const today = new Date();
  const dob = new Date(dateOfBirth);

  let age = today.getFullYear() - dob.getFullYear();
  const monthDifference = today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
}

export default function PlayerForm({
  initialValues,
  onSubmit,
  submitText = "Save Player",
}) {
  const [form, setForm] = useState({
    firstName: initialValues?.firstName || "",
    lastName: initialValues?.lastName || "",
    dateOfBirth: initialValues?.dateOfBirth
      ? initialValues.dateOfBirth.slice(0, 10)
      : "",
    preferredPosition: initialValues?.preferredPosition || "",
    alternativePositions: initialValues?.alternativePositions || [],
    jerseyNumber:
      initialValues?.jerseyNumber !== undefined &&
      initialValues?.jerseyNumber !== null
        ? Number(initialValues.jerseyNumber)
        : "",

    guardianName: initialValues?.guardianName || "",
    guardianPhone: initialValues?.guardianPhone || "",
    email: initialValues?.email || "",

    playerPhone: initialValues?.playerPhone || "",
    playerEmail: initialValues?.playerEmail || "",

    assignmentMode: initialValues?.team ? "manual" : "auto",
    team: initialValues?.team?._id || initialValues?.team || "",
  });

  const [teams, setTeams] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchTeams() {
      try {
        const response = await api.get("/teams");
        setTeams(response.data || []);
      } catch (err) {
        console.error("Failed to load teams", err);
      }
    }

    fetchTeams();
  }, []);

  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);

  const recommendedTeam = useMemo(() => {
    if (age === null) return null;

    return (
      teams
        .filter((team) => age <= team.maxAge)
        .sort((a, b) => a.maxAge - b.maxAge)[0] || null
    );
  }, [age, teams]);

  const effectiveTeamId =
    form.assignmentMode === "manual" ? form.team : recommendedTeam?._id || "";

  const selectedTeam = useMemo(() => {
    return teams.find((team) => team._id === form.team) || null;
  }, [form.team, teams]);

  const effectiveTeam = useMemo(() => {
    return teams.find((team) => team._id === effectiveTeamId) || null;
  }, [effectiveTeamId, teams]);

  const isOverridingRecommendedTeam =
    form.assignmentMode === "manual" &&
    selectedTeam &&
    recommendedTeam &&
    selectedTeam._id !== recommendedTeam._id;

  const teamOptions = useMemo(() => {
    return teams
      .slice()
      .sort((a, b) => a.maxAge - b.maxAge)
      .map((team) => {
        const tooOld = age !== null && age > team.maxAge;

        if (tooOld) {
          return {
            value: team._id,
            label: `${team.name} (Unavailable - player is too old)`,
            disabled: true,
          };
        }

        return {
          value: team._id,
          label: `${team.name} (U${team.maxAge})`,
        };
      });
  }, [teams, age]);

  useEffect(() => {
    if (!form.team) return;

    const selected = teams.find((team) => team._id === form.team);
    if (!selected) return;

    const tooOld = age !== null && age > selected.maxAge;

    if (tooOld) {
      setForm((prev) => ({
        ...prev,
        team: "",
        jerseyNumber: "",
      }));
    }
  }, [age, form.team, teams]);

  useEffect(() => {
    async function fetchTeamPlayers() {
      if (!effectiveTeamId) {
        setTeamPlayers([]);
        return;
      }

      try {
        const response = await api.get(`/teams/${effectiveTeamId}`);
        setTeamPlayers(response.data.players || []);
      } catch (err) {
        console.error("Failed to load team players", err);
        setTeamPlayers([]);
      }
    }

    fetchTeamPlayers();
  }, [effectiveTeamId]);

  const currentPlayerId = initialValues?._id || initialValues?.id || null;

  const jerseyOptions = useMemo(() => {
    return Array.from({ length: 99 }, (_, index) => {
      const number = index + 1;

      const takenBy = teamPlayers.find(
        (player) =>
          Number(player.jerseyNumber) === number &&
          String(player._id) !== String(currentPlayerId)
      );

      if (takenBy) {
        return {
          value: String(number),
          label: `${number} - Taken by ${takenBy.firstName} ${takenBy.lastName}`,
          disabled: true,
        };
      }

      return {
        value: String(number),
        label: String(number),
      };
    });
  }, [teamPlayers, currentPlayerId]);

  useEffect(() => {
    if (
      form.jerseyNumber === "" ||
      form.jerseyNumber === null ||
      form.jerseyNumber === undefined
    ) {
      return;
    }

    const selectedValue = String(form.jerseyNumber);
    const option = jerseyOptions.find((item) => item.value === selectedValue);

    if (!option || option.disabled) {
      setForm((prev) => ({
        ...prev,
        jerseyNumber: "",
      }));
    }
  }, [effectiveTeamId, jerseyOptions, form.jerseyNumber]);

  const handleChange = (field, value) => {
    setForm((prev) => {
      const updatedForm = {
        ...prev,
        [field]: value,
        ...(field === "assignmentMode" && value === "auto"
          ? { team: "" }
          : {}),
      };

      if (field === "preferredPosition") {
        updatedForm.alternativePositions = prev.alternativePositions.filter(
          (position) => position !== value
        );
      }

      if (field === "team" || field === "assignmentMode" || field === "dateOfBirth") {
        updatedForm.jerseyNumber = "";
      }

      return updatedForm;
    });
  };

  const handleAlternativePositionChange = (position) => {
    const exists = form.alternativePositions.includes(position);

    setForm((prev) => ({
      ...prev,
      alternativePositions: exists
        ? prev.alternativePositions.filter((item) => item !== position)
        : [...prev.alternativePositions, position],
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.dateOfBirth ||
      !form.preferredPosition
    ) {
      setError(
        "First name, last name, date of birth, and preferred position are required."
      );
      return;
    }

    if (!form.guardianName.trim()) {
      setError("Guardian name is required.");
      return;
    }

    if (!form.email.trim() && !form.guardianPhone.trim()) {
      setError("Please provide at least one guardian contact method.");
      return;
    }

    if (form.assignmentMode === "manual" && !form.team) {
      setError("Please select a team when using manual assignment.");
      return;
    }

    if (form.assignmentMode === "manual") {
      const chosenTeam = teams.find((team) => team._id === form.team);

      if (!chosenTeam) {
        setError("Selected team was not found.");
        return;
      }

      if (age !== null && age > chosenTeam.maxAge) {
        setError("Player is too old for the selected team.");
        return;
      }
    }

    if (effectiveTeamId && form.jerseyNumber) {
      const selectedOption = jerseyOptions.find(
        (option) => option.value === String(form.jerseyNumber)
      );

      if (!selectedOption || selectedOption.disabled) {
        setError("The selected kit number is not available for this team.");
        return;
      }
    }

    try {
      setSubmitting(true);

      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        dateOfBirth: form.dateOfBirth,
        preferredPosition: form.preferredPosition,
        alternativePositions: form.alternativePositions,
        jerseyNumber:
          form.jerseyNumber !== undefined &&
          form.jerseyNumber !== null &&
          form.jerseyNumber !== ""
            ? Number(form.jerseyNumber)
            : undefined,

        guardianName: form.guardianName.trim(),
        guardianPhone: form.guardianPhone.trim(),
        email: form.email.trim(),

        playerPhone: form.playerPhone.trim(),
        playerEmail: form.playerEmail.trim(),

        assignmentMode: form.assignmentMode,
        team: effectiveTeamId || undefined,
      });
    } catch (err) {
      console.log("save player error:", err.response?.data || err);

      const responseData = err.response?.data;

      if (
        responseData?.errors &&
        Array.isArray(responseData.errors) &&
        responseData.errors.length > 0
      ) {
        setError(responseData.errors[0].msg);
      } else {
        setError(responseData?.message || "Failed to save player");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper withBorder shadow="sm" p="lg" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <div>
            <Title order={3}>Player Details</Title>
            <Text c="dimmed" size="sm">
              Enter the player information below
            </Text>
          </div>

          {error && <Alert color="red">{error}</Alert>}

          <Divider label="Personal Information" labelPosition="left" />

          <Group grow>
            <TextInput
              label="First Name"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              required
            />
            <TextInput
              label="Last Name"
              value={form.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              required
            />
          </Group>

          <Group grow align="flex-start">
            <TextInput
              label="Date of Birth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              required
            />
            <TextInput label="Calculated Age" value={age ?? ""} readOnly />
          </Group>

          <Divider label="Position Information" labelPosition="left" />

          <Select
            label="Preferred Position"
            value={form.preferredPosition}
            onChange={(value) => handleChange("preferredPosition", value || "")}
            data={positions}
            required
          />

          <div>
            <Text fw={500} size="sm" mb="xs">
              Alternative Positions
            </Text>
            <Group gap="md">
              {positions
                .filter((position) => position !== form.preferredPosition)
                .map((position) => (
                  <Checkbox
                    key={position}
                    label={position}
                    checked={form.alternativePositions.includes(position)}
                    onChange={() => handleAlternativePositionChange(position)}
                  />
                ))}
            </Group>
          </div>

          <Divider label="Team Assignment" labelPosition="left" />

          <Radio.Group
            label="Assignment Mode"
            value={form.assignmentMode}
            onChange={(value) => handleChange("assignmentMode", value)}
          >
            <Group mt="xs">
              <Radio value="auto" label="Auto assign recommended team" />
              <Radio value="manual" label="Manually choose a team" />
            </Group>
          </Radio.Group>

          {form.assignmentMode === "auto" && (
            <>
              <Text size="sm" c="dimmed">
                Recommended Team:{" "}
                {recommendedTeam ? recommendedTeam.name : "No suitable team found"}
              </Text>

              {recommendedTeam && (
                <Select
                  label="Kit Number"
                  placeholder="Select a kit number"
                  value={
                    form.jerseyNumber !== undefined &&
                    form.jerseyNumber !== null &&
                    form.jerseyNumber !== ""
                      ? String(form.jerseyNumber)
                      : null
                  }
                  onChange={(value) =>
                    handleChange("jerseyNumber", value ? Number(value) : "")
                  }
                  data={jerseyOptions}
                  searchable
                  clearable
                />
              )}
            </>
          )}

          {form.assignmentMode === "manual" && (
            <>
              <Select
                label="Team"
                placeholder="Select a team"
                value={form.team}
                onChange={(value) => handleChange("team", value || "")}
                data={teamOptions}
                searchable
                clearable
              />

              {selectedTeam && (
                <Text
                  size="sm"
                  c={isOverridingRecommendedTeam ? "orange" : "dimmed"}
                >
                  Selected Team: {selectedTeam.name}
                  {recommendedTeam && ` | Recommended: ${recommendedTeam.name}`}
                </Text>
              )}

              <Select
                label="Kit Number"
                placeholder={form.team ? "Select a kit number" : "Select a team first"}
                value={
                  form.jerseyNumber !== undefined &&
                  form.jerseyNumber !== null &&
                  form.jerseyNumber !== ""
                    ? String(form.jerseyNumber)
                    : null
                }
                onChange={(value) =>
                  handleChange("jerseyNumber", value ? Number(value) : "")
                }
                data={jerseyOptions}
                searchable
                clearable
                disabled={!form.team}
              />
            </>
          )}

          {effectiveTeam && (
            <Text size="sm" c="dimmed">
              Available kit numbers are updated based on team {effectiveTeam.name}.
            </Text>
          )}

          <Divider
            label="Guardian Contact Information (please provide at least one of the contact methods)"
            labelPosition="left"
          />

          <Group grow>
            <TextInput
              label="Guardian Name"
              value={form.guardianName}
              onChange={(e) => handleChange("guardianName", e.target.value)}
              required
            />
            <TextInput
              label="Guardian Phone Number"
              value={form.guardianPhone}
              onChange={(e) => handleChange("guardianPhone", e.target.value)}
            />
          </Group>

          <TextInput
            label="Guardian Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <Divider
            label="Additional Contact Information (optional)"
            labelPosition="left"
          />

          <Group grow>
            <TextInput
              label="Player Phone Number"
              value={form.playerPhone}
              onChange={(e) => handleChange("playerPhone", e.target.value)}
            />
            <TextInput
              label="Player Email"
              value={form.playerEmail}
              onChange={(e) => handleChange("playerEmail", e.target.value)}
            />
          </Group>

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