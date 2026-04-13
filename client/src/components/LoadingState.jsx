import { Center, Loader, Stack, Text } from "@mantine/core";

export default function LoadingState({ text = "Loading..." }) {
  return (
    <Center py="xl">
      <Stack align="center" gap="sm">
        <Loader />
        <Text c="dimmed">{text}</Text>
      </Stack>
    </Center>
  );
}