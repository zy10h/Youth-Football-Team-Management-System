import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import { getCacheMeta } from "../services/cacheService";
import { deleteCoach, getCoach } from "../services/coachService";
import { getTeamsByCoach } from "../services/teamService";

const getCoachName = (coach) =>
  `${coach.firstName || ""} ${coach.lastName || ""}`.trim();

function buildCoachShareMessage(coach, teams) {
  const assignedTeams =
    teams.length === 0
      ? "None"
      : teams
          .map(
            (team) =>
              `${team.name || "Unnamed team"} (${
                team.trainingDays?.join(", ") || "No training days"
              })`
          )
          .join("\n");

  return [
    `Coach Summary: ${getCoachName(coach) || "N/A"}`,
    "",
    `Email: ${coach.email || "N/A"}`,
    `Phone: ${coach.phone || "N/A"}`,
    `Introduction: ${coach.introduction || "N/A"}`,
    "",
    "Assigned Teams",
    assignedTeams,
  ].join("\n");
}

export default function CoachDetailScreen({ navigation, route }) {
  const { textStyles } = useSettings();
  const coachId = route.params?.coachId;

  const [coach, setCoach] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineMessage, setOfflineMessage] = useState("");

  const loadCoach = async () => {
    try {
      setLoading(true);
      setError("");

      const [coachData, teamData] = await Promise.all([
        getCoach(coachId),
        getTeamsByCoach(coachId),
      ]);

      setCoach(coachData);
      setTeams(teamData.teams || teamData);
      setOfflineMessage(
        getCacheMeta(coachData).fromCache || getCacheMeta(teamData).fromCache
          ? "Showing saved coach details. API is offline."
          : ""
      );
    } catch (err) {
      console.log("LOAD COACH ERROR:", err.response?.data || err.message);
      setOfflineMessage("");
      setError(err.response?.data?.message || "Failed to load coach.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadCoach();
    });

    return unsubscribe;
  }, [navigation, coachId]);

  const handleDelete = () => {
    Alert.alert("Delete Coach", "Delete this coach?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCoach(coachId);
            Alert.alert("Success", "Coach deleted");
            navigation.navigate("CoachesList");
          } catch (err) {
            console.log("DELETE COACH ERROR:", err.response?.data || err);
            Alert.alert(
              "Error",
              err.response?.data?.message || "Failed to delete coach."
            );
          }
        },
      },
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: getCoachName(coach) || "Coach Details",
        message: buildCoachShareMessage(coach, teams),
      });
    } catch (err) {
      console.log("SHARE COACH ERROR:", err.message);
      Alert.alert("Error", "Failed to share coach details.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={textStyles.body}>Loading coach...</Text>
      </SafeAreaView>
    );
  }

  if (error || !coach) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={[styles.error, textStyles.body]}>
          {error || "Coach not found."}
        </Text>
        <Text style={[styles.retry, textStyles.body]} onPress={loadCoach}>
          Retry
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.headerText}>
              <Text style={[styles.title, textStyles.title]}>
                {getCoachName(coach)}
              </Text>
              <Text style={[styles.subtitle, textStyles.body]}>
                Coach Details
              </Text>
            </View>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>SHARE</Text>
            </TouchableOpacity>
          </View>

          {offlineMessage ? (
            <Text style={[styles.offlineNotice, textStyles.small]}>
              {offlineMessage}
            </Text>
          ) : null}

          <Text style={[styles.sectionTitle, textStyles.sectionTitle]}>
            Basic Info
          </Text>
          <Text style={[styles.infoText, textStyles.body]}>
            Email: {coach.email || "N/A"}
          </Text>
          <Text style={[styles.infoText, textStyles.body]}>
            Phone: {coach.phone || "N/A"}
          </Text>
          <Text style={[styles.infoText, textStyles.body]}>
            Introduction: {coach.introduction || "N/A"}
          </Text>

          <Text style={[styles.sectionTitle, textStyles.sectionTitle]}>
            Assigned Teams
          </Text>

          {teams.length === 0 ? (
            <Text style={[styles.muted, textStyles.body]}>
              This coach is not assigned to any team.
            </Text>
          ) : (
            teams.map((team) => (
              <View key={team._id || team.id} style={styles.teamRow}>
                <Text style={[styles.badge, textStyles.small]}>{team.name}</Text>
                <Text style={[styles.teamDays, textStyles.body]}>
                  ({team.trainingDays?.join(", ") || "No training days"})
                </Text>
              </View>
            ))
          )}

          <View style={styles.headerButtons}>
            <Button
              title="Edit"
              onPress={() => navigation.navigate("CoachForm", { coachId })}
            />
            <Button title="Delete" color="red" onPress={handleDelete} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    marginTop: 2,
  },
  headerButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  shareButton: {
    backgroundColor: "#2e7d32",
    borderRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  shareButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 10,
  },
  infoText: {
    marginBottom: 8,
  },
  offlineNotice: {
    color: "#7a4f00",
    backgroundColor: "#fff4cc",
    borderWidth: 1,
    borderColor: "#f2d27a",
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
  },
  muted: {
    color: "#666",
  },
  teamRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    color: "#fff",
    fontWeight: "bold",
    backgroundColor: "#2196f3",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 10,
    overflow: "hidden",
  },
  teamDays: {
    color: "#333",
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
});
