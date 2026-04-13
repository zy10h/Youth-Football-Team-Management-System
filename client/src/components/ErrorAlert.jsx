import { Alert } from "@mantine/core";

export default function ErrorAlert({ message }) {
  if (!message) return null;
  return <Alert color="red" mb="md">{message}</Alert>;
}