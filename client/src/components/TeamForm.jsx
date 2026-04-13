import { useState } from "react";
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
} from "@mantine/core";

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

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const generatedName = form.maxAge ? `U${form.maxAge}` : "";

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.maxAge) {
      setError("Maximum age is required.");
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

          <NumberInput
            label="Maximum Age"
            value={form.maxAge}
            onChange={(value) => handleChange("maxAge", value)}
            min={5}
            max={25}
            required
          />

          <TextInput
            label="Team Name"
            value={generatedName}
            readOnly
            placeholder="Will be generated from maximum age"
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
            data={[
              { value: "", label: "Unassigned (No coach)" },
              ...coaches.map((c) => ({
                value: c._id,
                label: `${c.firstName} ${c.lastName}`,
              })),
            ]}
            clearable
          />

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