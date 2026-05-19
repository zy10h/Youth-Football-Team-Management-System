import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSettings } from "../context/SettingsContext";
import { getCacheMeta } from "../services/cacheService";
import { deleteTeam, getTeam } from "../services/teamService";

const positionOrder = {
  Goalkeeper: 1,
  "Centre Back": 2,
  Fullback: 3,
  "Defensive Midfielder": 4,
  "Central Midfielder": 5,
  "Attacking Midfielder": 6,
  "Winger/Wide Midfielder": 7,
  Striker: 8,
};

const playerSortOptions = [
  { value: "position_asc", label: "Preferred Position GK-FW" },
  { value: "position_desc", label: "Preferred Position FW-GK" },
  { value: "name_asc", label: "Last Name A-Z" },
  { value: "name_desc", label: "Last Name Z-A" },
  { value: "age_asc", label: "Age Low-High" },
  { value: "age_desc", label: "Age High-Low" },
  { value: "jersey_asc", label: "Kit Number Low-High" },
  { value: "jersey_desc", label: "Kit Number High-Low" },
];

const PAGE_SIZE = 10;

const getCoachName = (coach) =>
  coach ? `${coach.firstName || ""} ${coach.lastName || ""}`.trim() : "";

const getPlayerName = (player) =>
  `${player.lastName || ""} ${player.firstName || ""}`.trim();

const compareNames = (a, b) =>
  getPlayerName(a).localeCompare(getPlayerName(b));

export default function TeamDetailScreen({ navigation, route }) {
  const { textStyles } = useSettings();
  const teamId = route.params?.teamId;

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [offlineMessage, setOfflineMessage] = useState("");
  const [sort, setSort] = useState("position_asc");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [page, setPage] = useState(1);
  const [showPagePicker, setShowPagePicker] = useState(false);

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getTeam(teamId);
      setTeam(data);
      setOfflineMessage(
        getCacheMeta(data).fromCache
          ? "Showing saved team details. API is offline."
          : ""
      );
    } catch (err) {
      console.log("LOAD TEAM ERROR:", err.response?.data || err.message);
      setOfflineMessage("");
      setError(err.response?.data?.message || "Failed to load team.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadTeam();
    });

    return unsubscribe;
  }, [navigation, teamId]);

  const sortedPlayers = useMemo(() => {
    const list = [...(team?.players || [])];

    switch (sort) {
      case "name_desc":
        return list.sort((a, b) => compareNames(b, a));

      case "age_asc":
        return list.sort((a, b) => {
          const diff = (a.age ?? 999) - (b.age ?? 999);
          return diff || compareNames(a, b);
        });

      case "age_desc":
        return list.sort((a, b) => {
          const diff = (b.age ?? -1) - (a.age ?? -1);
          return diff || compareNames(a, b);
        });

      case "position_asc":
        return list.sort((a, b) => {
          const diff =
            (positionOrder[a.preferredPosition] || 999) -
            (positionOrder[b.preferredPosition] || 999);
          return diff || compareNames(a, b);
        });

      case "position_desc":
        return list.sort((a, b) => {
          const diff =
            (positionOrder[b.preferredPosition] || 999) -
            (positionOrder[a.preferredPosition] || 999);
          return diff || compareNames(a, b);
        });

      case "jersey_asc":
        return list.sort((a, b) => {
          const diff = (a.jerseyNumber ?? 999) - (b.jerseyNumber ?? 999);
          return diff || compareNames(a, b);
        });

      case "jersey_desc":
        return list.sort((a, b) => {
          const diff = (b.jerseyNumber ?? -1) - (a.jerseyNumber ?? -1);
          return diff || compareNames(a, b);
        });

      case "name_asc":
      default:
        return list.sort(compareNames);
    }
  }, [team, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedPlayers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedPlayers = sortedPlayers.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );
  const selectedSortLabel =
    playerSortOptions.find((option) => option.value === sort)?.label ||
    "Preferred Position GK-FW";

  useEffect(() => {
    setPage(1);
    setShowPagePicker(false);
  }, [sort]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleDelete = () => {
    Alert.alert("Delete Team", "Are you sure you want to delete this team?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTeam(teamId);
            Alert.alert("Success", "Team deleted");
            navigation.navigate("TeamsList");
          } catch (err) {
            console.log("DELETE TEAM ERROR:", err.response?.data || err);
            Alert.alert(
              "Error",
              err.response?.data?.message || "Failed to delete team."
            );
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={textStyles.body}>Loading team...</Text>
      </SafeAreaView>
    );
  }

  if (error || !team) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={[styles.error, textStyles.body]}>
          {error || "Team not found."}
        </Text>
        <Text style={[styles.retry, textStyles.body]} onPress={loadTeam}>
          Retry
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={paginatedPlayers}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.headerText}>
                  <Text style={[styles.title, textStyles.title]}>
                    {team.name}
                  </Text>
                  <Text style={[styles.subtitle, textStyles.body]}>
                    Team Info
                  </Text>
                </View>
              </View>

              <Text style={[styles.infoText, textStyles.body]}>
                Maximum Age: {team.maxAge}
              </Text>

              <View style={styles.badgeRow}>
                <Text style={[styles.infoText, textStyles.body]}>
                  Training Day(s):{" "}
                </Text>
                {team.trainingDays?.length ? (
                  team.trainingDays.map((day) => (
                    <Text key={day} style={[styles.badge, textStyles.small]}>
                      {day.toUpperCase()}
                    </Text>
                  ))
                ) : (
                  <Text style={textStyles.body}>None</Text>
                )}
              </View>

              <Text style={[styles.infoText, textStyles.body]}>
                Coach: {getCoachName(team.coach) || "Unassigned"}
              </Text>

              <View style={styles.headerButtons}>
                <Button
                  title="Edit"
                  onPress={() =>
                    navigation.navigate("TeamForm", {
                      teamId: team._id || team.id,
                    })
                  }
                />
                <Button title="Delete" color="red" onPress={handleDelete} />
              </View>
            </View>

            <Text style={[styles.playersTitle, textStyles.title]}>Players</Text>

            {offlineMessage ? (
              <Text style={[styles.offlineNotice, textStyles.small]}>
                {offlineMessage}
              </Text>
            ) : null}

            <TouchableOpacity
              style={styles.sortButton}
              onPress={() => setShowSortOptions((current) => !current)}
            >
              <View>
                <Text style={[styles.sortTitle, textStyles.body]}>
                  Sort Players
                </Text>
                <Text style={[styles.sortValue, textStyles.body]}>
                  {selectedSortLabel}
                </Text>
              </View>
              <Text style={styles.dropdownArrow}>
                {showSortOptions ? "^" : "v"}
              </Text>
            </TouchableOpacity>

            {showSortOptions && (
              <View style={styles.optionPanel}>
                {playerSortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.optionRow}
                    onPress={() => {
                      setSort(option.value);
                      setShowSortOptions(false);
                    }}
                  >
                      <Text
                        style={[
                          styles.optionText,
                          textStyles.body,
                          sort === option.value && styles.optionSelected,
                        ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <Text style={[styles.hint, textStyles.small]}>
              {sortedPlayers.length === 0
                ? "No players registered in this team."
                : `Showing ${startIndex + 1}-${Math.min(
                    startIndex + PAGE_SIZE,
                    sortedPlayers.length
                  )} of ${sortedPlayers.length} players.`}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("TeamPlayerDetail", { player: item })
            }
          >
            <View style={styles.playerCard}>
              <Text style={[styles.playerName, textStyles.cardTitle]}>
                {item.firstName} {item.lastName}
              </Text>
              <Text style={textStyles.body}>Age: {item.age ?? "-"}</Text>
              <Text style={textStyles.body}>
                Preferred Position: {item.preferredPosition || "-"}
              </Text>
              <Text style={textStyles.body}>
                Alternative Positions:{" "}
                {item.alternativePositions?.length
                  ? item.alternativePositions.join(", ")
                  : "None"}
              </Text>
              <Text style={textStyles.body}>
                Kit Number: {item.jerseyNumber ?? "-"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListFooterComponent={
          sortedPlayers.length > 0 ? (
            <View>
              <View style={styles.pagination}>
                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    currentPage === 1 && styles.pageButtonDisabled,
                  ]}
                  disabled={currentPage === 1}
                  onPress={() => setPage((current) => Math.max(1, current - 1))}
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      textStyles.body,
                      currentPage === 1 && styles.pageButtonTextDisabled,
                    ]}
                  >
                    Prev
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.pageSelector}
                  onPress={() => setShowPagePicker((current) => !current)}
                >
                  <Text style={[styles.pageText, textStyles.body]}>
                    Page {currentPage} of {totalPages}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.pageButton,
                    currentPage === totalPages && styles.pageButtonDisabled,
                  ]}
                  disabled={currentPage === totalPages}
                  onPress={() =>
                    setPage((current) => Math.min(totalPages, current + 1))
                  }
                >
                  <Text
                    style={[
                      styles.pageButtonText,
                      textStyles.body,
                      currentPage === totalPages &&
                        styles.pageButtonTextDisabled,
                    ]}
                  >
                    Next
                  </Text>
                </TouchableOpacity>
              </View>

              {showPagePicker && (
                <View style={styles.pagePicker}>
                  <Text style={[styles.sectionLabel, textStyles.body]}>
                    Choose page
                  </Text>
                  <View style={styles.pageNumberGrid}>
                    {Array.from({ length: totalPages }, (_, index) => {
                      const pageNumber = index + 1;
                      const selected = pageNumber === currentPage;

                      return (
                        <TouchableOpacity
                          key={pageNumber}
                          style={[
                            styles.pageNumberButton,
                            selected && styles.pageNumberButtonSelected,
                          ]}
                          onPress={() => {
                            setPage(pageNumber);
                            setShowPagePicker(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.pageNumberText,
                              textStyles.body,
                              selected && styles.pageNumberTextSelected,
                            ]}
                          >
                            {pageNumber}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          ) : null
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  subtitle: {
    color: "#666",
    marginTop: 2,
  },
  card: {
    padding: 14,
    marginBottom: 12,
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
  headerText: {
    flex: 1,
  },
  headerButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  sectionLabel: {
    fontWeight: "bold",
    marginBottom: 8,
  },
  infoText: {
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 8,
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
  playersTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sortButton: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sortTitle: {
    fontWeight: "bold",
    marginBottom: 2,
  },
  sortValue: {
    color: "#666",
  },
  dropdownArrow: {
    fontSize: 18,
    fontWeight: "bold",
  },
  optionPanel: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  optionRow: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: "center",
  },
  optionText: {
    color: "#333",
  },
  optionSelected: {
    color: "#0d6ecf",
    fontWeight: "bold",
  },
  hint: {
    marginBottom: 8,
    color: "#666",
    fontSize: 13,
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
  playerCard: {
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  playerName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingTop: 10,
  },
  pageButton: {
    minWidth: 72,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2196f3",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  pageButtonDisabled: {
    borderColor: "#d0d0d0",
  },
  pageButtonText: {
    color: "#0d6ecf",
    fontWeight: "bold",
  },
  pageButtonTextDisabled: {
    color: "#999",
  },
  pageText: {
    fontWeight: "bold",
  },
  pageSelector: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },
  pagePicker: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    backgroundColor: "#fff",
  },
  pageNumberGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pageNumberButton: {
    minWidth: 42,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },
  pageNumberButtonSelected: {
    borderColor: "#2196f3",
    backgroundColor: "#2196f3",
  },
  pageNumberText: {
    color: "#333",
    fontWeight: "bold",
  },
  pageNumberTextSelected: {
    color: "#fff",
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
