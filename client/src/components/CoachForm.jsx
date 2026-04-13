import { useState } from "react";
import {
  Paper,
  Stack,
  Title,
  Text,
  Alert,
  TextInput,
  Button,
  Group,
  Divider,
} from "@mantine/core";

export default function CoachForm({
  initialValues,
  onSubmit,
  submitText = "Save Coach",
}) {
  const [form, setForm] = useState({
    firstName: initialValues?.firstName || "",
    lastName: initialValues?.lastName || "",
    email: initialValues?.email || "",
    phone: initialValues?.phone || "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    if (!form.email.trim() && !form.phone.trim()) {
      setError("Please provide either an email or a phone number.");
      return;
    }

    try {
      setSubmitting(true);

      await onSubmit({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save coach");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper withBorder shadow="sm" p="lg" radius="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <div>
            <Title order={3}>Coach Details</Title>
            <Text c="dimmed" size="sm">
              Enter coach information below
            </Text>
          </div>

          {error && <Alert color="red">{error}</Alert>}

          <Divider label="Basic Info" labelPosition="left" />

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

          <Divider label="Contact Info (Please enter one or both of the following)" labelPosition="left" />

          <TextInput
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <TextInput
            label="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
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