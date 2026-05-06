import { useEffect, useMemo, useState } from "react";
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
import { deleteTeam, getTeams } from "../services/teamService";

const getCoachName = (coach) =>
  coach ? `${coach.firstName || ""} ${coach.lastName || ""}`.trim() : "";

export default function TeamsScreen({ navigation }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sort, setSort] = useState("name_asc");

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
    const unsubscribe = navigation.addListener("focus", () => {
      loadTeams();
    });

    return unsubscribe;
  }, [navigation]);

  const handleDeleteTeam = (team) => {
    const teamId = team._id || team.id;
    const teamName = team.name || team.teamName || "this team";

    Alert.alert(
      "Delete Team",
      `Are you sure you want to delete ${teamName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTeam(teamId);
              await loadTeams();
            } catch (err) {
              console.log(
                "DELETE TEAM ERROR:",
                err.response?.data || err.message
              );
              Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to delete team."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleLongPressActions = (team) => {
    const teamId = team._id || team.id;

    Alert.alert(
      "Team Actions",
      team.name || team.teamName || "Team",
      [
        {
          text: "Edit",
          onPress: () => navigation.navigate("TeamForm", { teamId }),
        },
        {
          text: "Assign Coach",
          onPress: () =>
            navigation.navigate("TeamForm", { teamId, focusCoach: true }),
        },
        {
          text: "Delete Team",
          style: "destructive",
          onPress: () => handleDeleteTeam(team),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {},
      }
    );
  };

  const filteredTeams = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    const list = teams.filter((team) => {
      if (!keyword) return true;

      const teamName = (team.name || team.teamName || "").toLowerCase();
      const trainingDays = (team.trainingDays || []).join(" ").toLowerCase();
      const coachName = getCoachName(team.coach).toLowerCase();

      return (
        teamName.includes(keyword) ||
        trainingDays.includes(keyword) ||
        coachName.includes(keyword)
      );
    });

    return list.sort((a, b) => {
      const aAge = Number(a.maxAge || a.ageGroup || 0);
      const bAge = Number(b.maxAge || b.ageGroup || 0);
      return sort === "name_asc" ? aAge - bAge : bAge - aAge;
    });
  }, [teams, searchText, sort]);

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
        data={filteredTeams}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Button
              title="Add Team"
              onPress={() => navigation.navigate("TeamForm")}
            />

            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by team name, training day, or coach"
            />

            <TouchableOpacity
              style={styles.sortButton}
              onPress={() =>
                setSort((current) =>
                  current === "name_asc" ? "name_desc" : "name_asc"
                )
              }
            >
              <Text style={styles.sortTitle}>Team Name</Text>
              <Text style={styles.sortValue}>
                {sort === "name_asc" ? "U6 - U18" : "U18 - U6"}
              </Text>
            </TouchableOpacity>

            <Text style={styles.hint}>
              {filteredTeams.length} team
              {filteredTeams.length === 1 ? "" : "s"} shown. Tap a team to view
              details. Long press for quick actions.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("TeamDetail", { teamId: item._id || item.id })
            }
            onLongPress={() => handleLongPressActions(item)}
          >
            <View style={styles.card}>
              <Text style={styles.name}>{item.name || item.teamName}</Text>

              <Text>Maximum Age: {item.maxAge || item.ageGroup || "N/A"}</Text>

              <View style={styles.badgeRow}>
                <Text>Training Days: </Text>
                {item.trainingDays?.length ? (
                  item.trainingDays.map((day) => (
                    <Text key={day} style={styles.badge}>
                      {day.toUpperCase()}
                    </Text>
                  ))
                ) : (
                  <Text>N/A</Text>
                )}
              </View>

              <Text>Coach: {getCoachName(item.coach) || "Unassigned"}</Text>
              <Text>Players: {item.players?.length || 0}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No teams found.</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 12,
    paddingBottom: 90,
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
    marginBottom: 10,
    borderRadius: 6,
  },
  sortButton: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  sortTitle: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  sortValue: {
    color: "#666",
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
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginVertical: 4,
  },
  badge: {
    color: "#0d6ecf",
    fontWeight: "bold",
    backgroundColor: "#d7ecff",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 6,
    marginBottom: 4,
    overflow: "hidden",
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
