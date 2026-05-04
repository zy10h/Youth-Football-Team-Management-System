import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { getPlayers, deletePlayer } from "../services/playerService";

export default function PlayersScreen({ navigation }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getPlayers();
      setPlayers(data.players || data);
    } catch (err) {
      console.log("LOAD PLAYERS ERROR:", err.response?.data || err.message);
      setError("Failed to load players.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadPlayers();
    });

    return unsubscribe;
  }, [navigation]);

  const handleDeletePlayer = (player) => {
    Alert.alert(
      "Delete Player",
      `Are you sure you want to delete ${player.firstName} ${player.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlayer(player._id || player.id);
              await loadPlayers();
            } catch (err) {
              console.log(
                "DELETE PLAYER ERROR:",
                err.response?.data || err.message
              );
              Alert.alert("Error", "Failed to delete player");
            }
          },
        },
      ]
    );
  };

  const handleLongPressActions = (player) => {
    Alert.alert(
      "Player Actions",
      `${player.firstName} ${player.lastName}`,
      [
        {
          text: "View Details",
          onPress: () => navigation.navigate("PlayerDetail", { player }),
        },
        {
          text: "Change Team",
          onPress: () => navigation.navigate("ChangeTeam", { player }),
        },
        {
          text: "Delete Player",
          style: "destructive",
          onPress: () => handleDeletePlayer(player),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ]
    );
  };

  const filteredPlayers = players.filter((player) => {
    const keyword = searchText.toLowerCase();

    const fullName = `${player.firstName || ""} ${
      player.lastName || ""
    }`.toLowerCase();

    const teamName = (
      player.team?.name ||
      player.teamName ||
      ""
    ).toLowerCase();

    const position = (player.preferredPosition || "").toLowerCase();

    return (
      fullName.includes(keyword) ||
      teamName.includes(keyword) ||
      position.includes(keyword)
    );
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading players...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Text style={styles.retry} onPress={loadPlayers}>
          Retry
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Button
        title="Add Player"
        onPress={() => navigation.navigate("AddPlayer")}
      />

      <TextInput
        style={styles.searchInput}
        value={searchText}
        onChangeText={setSearchText}
        placeholder="Search by name, team, or position"
      />

      <Text style={styles.hint}>
        Tap to view details. Long press for quick actions.
      </Text>

      <FlatList
        data={filteredPlayers}
        keyExtractor={(item) => item._id || item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("PlayerDetail", { player: item })
            }
            onLongPress={() => handleLongPressActions(item)}
          >
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.firstName} {item.lastName}
              </Text>
              <Text>Age: {item.age || "N/A"}</Text>
              <Text>
                Team: {item.team?.name || item.teamName || "No team"}
              </Text>
              <Text>Position: {item.preferredPosition || "N/A"}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No players found.</Text>
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
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 6,
  },
  hint: {
    marginBottom: 8,
    color: "#666",
    fontSize: 13,
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