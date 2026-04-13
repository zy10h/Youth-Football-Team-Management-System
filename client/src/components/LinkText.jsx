import { Text } from "@mantine/core";
import { Link } from "react-router-dom";

export default function LinkText({ to, children }) {
  return (
    <Text
      component={Link}
      to={to}
      style={{
        textDecoration: "none",
        color: "#1971c2",
        fontWeight: 500,
      }}
      onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
      onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
    >
      {children}
    </Text>
  );
}