import {
  Alert,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import { deletePlayer } from "../services/playerService";

function formatDate(value) {
  if (!value) return "N/A";
  if (typeof value === "string") return value.slice(0, 10);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toISOString().slice(0, 10);
}

function buildPlayerShareMessage(player) {
  const alternativePositions = Array.isArray(player.alternativePositions)
    ? player.alternativePositions
    : [];
  const fullName = `${player.firstName || ""} ${
    player.lastName || ""
  }`.trim();

  return [
    `Player Summary: ${fullName || "N/A"}`,
    "",
    `Age: ${player.age || "N/A"}`,
    `Date of Birth: ${formatDate(player.dateOfBirth)}`,
    `Team: ${player.team?.name || player.teamName || "No team"}`,
    `Preferred Position: ${player.preferredPosition || "N/A"}`,
    `Alternative Positions: ${
      alternativePositions.length > 0 ? alternativePositions.join(", ") : "N/A"
    }`,
    "",
    "Guardian Contact",
    `Name: ${player.guardianName || "N/A"}`,
    `Phone: ${player.guardianPhone || "N/A"}`,
    `Email: ${player.email || "N/A"}`,
    "",
    "Player Contact",
    `Phone: ${player.playerPhone || "N/A"}`,
    `Email: ${player.playerEmail || "N/A"}`,
  ].join("\n");
}

export default function PlayerDetailScreen({ route, navigation }) {
  const { textStyles } = useSettings();
  const { player } = route.params;
  const alternativePositions = Array.isArray(player.alternativePositions)
    ? player.alternativePositions
    : [];

  const handleEdit = () => {
    navigation.navigate("EditPlayer", {
      player,
      returnRouteName: route.name,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${player.firstName || ""} ${player.lastName || ""}`.trim(),
        message: buildPlayerShareMessage(player),
      });
    } catch (err) {
      console.log("SHARE PLAYER ERROR:", err.message);
      Alert.alert("Error", "Failed to share player details.");
    }
  };

  const handleDelete = () => {
    Alert.alert("Confirm Delete", "Are you sure you want to delete this player?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deletePlayer(player._id || player.id);
            Alert.alert("Success", "Player deleted successfully");
            navigation.goBack();
          } catch (err) {
            console.log("DELETE PLAYER ERROR:", err.response?.data || err.message);
            Alert.alert("Error", "Failed to delete player");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={[styles.name, textStyles.title]}>
              {player.firstName} {player.lastName}
            </Text>

            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>SHARE</Text>
            </TouchableOpacity>
          </View>

          <Text style={textStyles.body}>Age: {player.age || "N/A"}</Text>
          <Text style={textStyles.body}>
            Team: {player.team?.name || player.teamName || "No team"}
          </Text>
          <Text style={textStyles.body}>
            Kit Number:{" "}
            {player.jerseyNumber !== undefined && player.jerseyNumber !== null
              ? player.jerseyNumber
              : "N/A"}
          </Text>

          <Text style={[styles.section, textStyles.body]}>
            Preferred Position:
          </Text>
          <Text style={textStyles.body}>{player.preferredPosition || "N/A"}</Text>

          <Text style={[styles.section, textStyles.body]}>
            Alternative Positions:
          </Text>
          <Text style={textStyles.body}>
            {alternativePositions.length > 0
              ? alternativePositions.join(", ")
              : "N/A"}
          </Text>

          <Text style={[styles.section, textStyles.body]}>Guardian:</Text>
          <Text style={textStyles.body}>{player.guardianName || "N/A"}</Text>
          <Text style={textStyles.body}>{player.guardianPhone || "N/A"}</Text>
          <Text style={textStyles.body}>{player.email || "N/A"}</Text>

          <Text style={[styles.section, textStyles.body]}>Player Contact:</Text>
          <Text style={textStyles.body}>{player.playerPhone || "N/A"}</Text>
          <Text style={textStyles.body}>{player.playerEmail || "N/A"}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editButtonText}>EDIT</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>DELETE</Text>
            </TouchableOpacity>
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
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
  },
  name: {
    flex: 1,
    fontSize: 22,
    fontWeight: "bold",
  },
  section: {
    marginTop: 12,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    backgroundColor: "#2196f3",
    borderRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "bold",
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
  deleteButton: {
    backgroundColor: "red",
    borderRadius: 4,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
