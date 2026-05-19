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
import { useSettings } from "../context/SettingsContext";
import { deleteCoach, getCoaches } from "../services/coachService";
import { getTeams } from "../services/teamService";

const getCoachName = (coach) =>
  `${coach.firstName || ""} ${coach.lastName || ""}`.trim();

const getEntityId = (item) => item?._id || item?.id || item;

const getAssignedTeamNames = (coach) =>
  (coach.assignedTeams || [])
    .map((team) => team?.name)
    .filter(Boolean)
    .join(", ");

export default function CoachesScreen({ navigation }) {
  const { textStyles } = useSettings();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");

  const loadCoaches = async () => {
    try {
      setLoading(true);
      setError("");

      const [coachData, teamData] = await Promise.all([
        getCoaches(),
        getTeams(),
      ]);

      const loadedCoaches = coachData.coaches || coachData;
      const loadedTeams = teamData.teams || teamData;
      const coachesWithTeams = loadedCoaches.map((coach) => {
        const coachId = String(getEntityId(coach));
        const assignedTeamsByTeamCoach = loadedTeams.filter(
          (team) => String(getEntityId(team.coach)) === coachId
        );
        const assignedTeamsByCoachField = (coach.assignedTeams || []).filter(
          (team) => team?.name
        );
        const assignedTeamMap = new Map();

        [...assignedTeamsByCoachField, ...assignedTeamsByTeamCoach].forEach(
          (team) => {
            assignedTeamMap.set(String(getEntityId(team)), team);
          }
        );

        return {
          ...coach,
          assignedTeams: Array.from(assignedTeamMap.values()),
        };
      });

      setCoaches(coachesWithTeams);
    } catch (err) {
      console.log("LOAD COACHES ERROR:", err.response?.data || err.message);
      setError("Failed to load coaches.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadCoaches();
    });

    return unsubscribe;
  }, [navigation]);

  const handleDeleteCoach = (coach) => {
    const coachId = coach._id || coach.id;
    const coachName = getCoachName(coach) || "this coach";

    Alert.alert(
      "Delete Coach",
      `Are you sure you want to delete ${coachName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCoach(coachId);
              await loadCoaches();
            } catch (err) {
              console.log(
                "DELETE COACH ERROR:",
                err.response?.data || err.message
              );
              Alert.alert(
                "Error",
                err.response?.data?.message || "Failed to delete coach."
              );
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleLongPressActions = (coach) => {
    const coachId = coach._id || coach.id;

    Alert.alert(
      "Coach Actions",
      getCoachName(coach) || "Coach",
      [
        {
          text: "Edit",
          onPress: () => navigation.navigate("CoachForm", { coachId }),
        },
        {
          text: "Delete Coach",
          style: "destructive",
          onPress: () => handleDeleteCoach(coach),
        },
      ],
      {
        cancelable: true,
        onDismiss: () => {},
      }
    );
  };

  const filteredCoaches = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) {
      return coaches;
    }

    return coaches.filter((coach) => {
      const fullName = getCoachName(coach).toLowerCase();
      const email = (coach.email || "").toLowerCase();
      const phone = (coach.phone || "").toLowerCase();
      const introduction = (coach.introduction || "").toLowerCase();

      return (
        fullName.includes(keyword) ||
        email.includes(keyword) ||
        phone.includes(keyword) ||
        introduction.includes(keyword)
      );
    });
  }, [coaches, searchText]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={textStyles.body}>Loading coaches...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={[styles.error, textStyles.body]}>{error}</Text>
        <Text style={[styles.retry, textStyles.body]} onPress={loadCoaches}>
          Retry
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredCoaches}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Button
              title="Add Coach"
              onPress={() => navigation.navigate("CoachForm")}
            />

            <TextInput
              style={[styles.searchInput, textStyles.input]}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search by name, email, or phone"
            />

            <Text style={[styles.hint, textStyles.small]}>
              {filteredCoaches.length} coach
              {filteredCoaches.length === 1 ? "" : "es"} shown. Tap a coach to
              view details. Long press for quick actions.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("CoachDetail", {
                coachId: item._id || item.id,
              })
            }
            onLongPress={() => handleLongPressActions(item)}
          >
            <View style={styles.card}>
              <Text style={[styles.name, textStyles.cardTitle]}>
                {getCoachName(item)}
              </Text>
              <Text style={textStyles.body}>Email: {item.email || "N/A"}</Text>
              <Text style={textStyles.body}>Phone: {item.phone || "N/A"}</Text>
              <Text style={textStyles.body}>
                Introduction: {item.introduction || "N/A"}
              </Text>
              <Text style={textStyles.body}>
                Assigned Teams:{" "}
                {getAssignedTeamNames(item) || "None"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={[styles.empty, textStyles.body]}>No coaches found.</Text>
        }
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
