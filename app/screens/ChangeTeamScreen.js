import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getTeams } from "../services/teamService";
import { updatePlayer } from "../services/playerService";

export default function ChangeTeamScreen({ route, navigation }) {
  const { player } = route.params;

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTeams();
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

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;

    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const playerAge = player.age || calculateAge(player.dateOfBirth);

  const isEligibleTeam = (team) => {
    const maxAge = team.maxAge || team.ageGroup;

    if (!playerAge || !maxAge) return true;

    return playerAge <= Number(maxAge);
  };

  const handleSelectTeam = async (team) => {
    try {
      const playerId = player._id || player.id;
      const teamId = team._id || team.id;

      await updatePlayer(playerId, {
        team: teamId,
        assignmentMode: "manual",
      });

      Alert.alert("Success", "Player team updated successfully.");
      navigation.goBack();
    } catch (err) {
      console.log("CHANGE TEAM ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to change team.");
    }
  };

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
      <Text style={styles.title}>
        Change Team for {player.firstName} {player.lastName}
      </Text>

      <Text style={styles.subtitle}>
        Player age: {playerAge || "N/A"}. Ineligible teams are greyed out.
      </Text>

      <FlatList
        data={teams}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => {
          const eligible = isEligibleTeam(item);

          return (
            <TouchableOpacity
              disabled={!eligible}
              onPress={() => handleSelectTeam(item)}
            >
              <View style={[styles.card, !eligible && styles.disabledCard]}>
                <Text
                  style={[
                    styles.teamName,
                    !eligible && styles.disabledText,
                  ]}
                >
                  {item.name || item.teamName}
                </Text>

                <Text style={!eligible && styles.disabledText}>
                  Age Group: {item.ageGroup || item.maxAge || "N/A"}
                </Text>

                <Text style={!eligible && styles.disabledText}>
                  Training Days:{" "}
                  {Array.isArray(item.trainingDays)
                    ? item.trainingDays.join(", ")
                    : item.trainingDays || "N/A"}
                </Text>

                {!eligible && (
                  <Text style={styles.notEligibleText}>
                    Not eligible for this age group
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.empty}>No teams found.</Text>}
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
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    marginBottom: 12,
    color: "#666",
  },
  card: {
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  disabledCard: {
    backgroundColor: "#eee",
    borderColor: "#ccc",
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledText: {
    color: "#999",
  },
  notEligibleText: {
    color: "#999",
    marginTop: 6,
    fontSize: 12,
    fontStyle: "italic",
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