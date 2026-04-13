import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Container,
  Paper,
  Title,
  Text,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
} from "@mantine/core";
import api from "../api/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
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

    if (!form.username.trim() || !form.password.trim()) {
      setError("Username and password are required.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setSubmitting(true);

      await api.post("/auth/register", {
        username: form.username.trim(),
        password: form.password,
      });

      navigate("/login");
    } catch (err) {
      const responseData = err.response?.data;

      if (
        responseData?.errors &&
        Array.isArray(responseData.errors) &&
        responseData.errors.length > 0
      ) {
        setError(responseData.errors[0].msg);
      } else {
        setError(responseData?.message || "Failed to register user.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container size={420} my={80}>
      <Title ta="center">Create Account</Title>
      <Text ta="center" c="dimmed" size="sm" mb="md">
        Register to access the system
      </Text>

      <Paper withBorder shadow="md" p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}

            <TextInput
              label="Username"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
            />

            <PasswordInput
              label="Password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />

            <PasswordInput
              label="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              required
            />

            <Button type="submit" loading={submitting} fullWidth>
              Register
            </Button>

            <Text ta="center" size="sm">
              Already have an account?{" "}
              <Text component={Link} to="/login" span c="blue">
                Login
              </Text>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}