import { SafeAreaView, Text, StyleSheet, View, Button, Alert } from "react-native";
import { deletePlayer } from "../services/playerService";

export default function PlayerDetailScreen({ route, navigation }) {
  const { player } = route.params;

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
      <View style={styles.card}>
        <Text style={styles.name}>
          {player.firstName} {player.lastName}
        </Text>

        <Text>Age: {player.age || "N/A"}</Text>
        <Text>Team: {player.team?.name || player.teamName || "No team"}</Text>

        <Text style={styles.section}>Preferred Position:</Text>
        <Text>{player.preferredPosition || "N/A"}</Text>

        <Text style={styles.section}>Guardian:</Text>
        <Text>{player.guardianName || "N/A"}</Text>
        <Text>{player.guardianPhone || "N/A"}</Text>
        <Text>{player.email || "N/A"}</Text>

        <View style={styles.buttonArea}>
          <Button title="Delete Player" color="red" onPress={handleDelete} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  section: {
    marginTop: 12,
    fontWeight: "bold",
  },
  buttonArea: {
    marginTop: 24,
  },
});