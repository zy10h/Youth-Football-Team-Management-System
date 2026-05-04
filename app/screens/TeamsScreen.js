import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getTeams } from "../services/teamService";

export default function TeamsScreen() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTeams();
      console.log("TEAMS DATA:", data);

      setTeams(data.teams || data);
    } catch (err) {
      console.log("LOAD TEAMS ERROR:", err.response?.data || err.message);
      setError("Failed to load teams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeams();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading teams...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.retry} onPress={loadTeams}>
          Retry
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={teams}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name || item.teamName}</Text>
            <Text>Age Group: {item.ageGroup || item.maxAge || "N/A"}</Text>
            <Text>
              Training Days:{" "}
              {Array.isArray(item.trainingDays)
                ? item.trainingDays.join(", ")
                : item.trainingDays || "N/A"}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No teams found.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  error: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
  retry: {
    color: "blue",
    fontWeight: "bold",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
  },
});