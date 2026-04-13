import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  TextInput,
  PasswordInput,
  Button,
  Stack,
  Alert,
  Text
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <Container size={420} my={80}>
      <Title ta="center">Youth Academy System</Title>
      <Text ta="center" c="dimmed" size="sm" mb="md">
        Sign in to continue
      </Text>

      <Paper withBorder shadow="md" p="lg" radius="md">
        <form onSubmit={handleSubmit}>
          <Stack>
            {error && <Alert color="red">{error}</Alert>}

            <TextInput
              label="Username"
              placeholder="Enter username"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              required
            />

            <PasswordInput
              label="Password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              required
            />

            <Button type="submit" fullWidth>
              Login
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}