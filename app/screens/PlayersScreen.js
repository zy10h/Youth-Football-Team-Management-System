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
import { getPlayers, deletePlayer } from "../services/playerService";

const positionOptions = [
  "Goalkeeper",
  "Centre Back",
  "Fullback",
  "Defensive Midfielder",
  "Central Midfielder",
  "Attacking Midfielder",
  "Winger/Wide Midfielder",
  "Striker",
];

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

const sortOptions = [
  {
    field: "name",
    label: "Last Name",
    ascLabel: "A-Z",
    descLabel: "Z-A",
  },
  {
    field: "age",
    label: "Age",
    ascLabel: "Low-High",
    descLabel: "High-Low",
  },
  {
    field: "position",
    label: "Preferred Position",
    ascLabel: "GK-FW",
    descLabel: "FW-GK",
  },
];

const getPlayerName = (player) =>
  `${player.lastName || ""} ${player.firstName || ""}`.trim();

const compareNames = (a, b) =>
  getPlayerName(a).localeCompare(getPlayerName(b));

const PAGE_SIZE = 5;
const PLAYER_FETCH_LIMIT = 5000;

function DropdownSection({ title, value, isOpen, onToggle, children }) {
  return (
    <View style={styles.dropdown}>
      <TouchableOpacity style={styles.dropdownButton} onPress={onToggle}>
        <View>
          <Text style={styles.dropdownTitle}>{title}</Text>
          <Text style={styles.dropdownValue}>{value}</Text>
        </View>
        <Text style={styles.dropdownArrow}>{isOpen ? "^" : "v"}</Text>
      </TouchableOpacity>

      {isOpen && <View style={styles.dropdownContent}>{children}</View>}
    </View>
  );
}

export default function PlayersScreen({ navigation }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [preferredPositionFilter, setPreferredPositionFilter] = useState("");
  const [alternativePositionFilters, setAlternativePositionFilters] = useState(
    []
  );
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [sort, setSort] = useState("name_asc");
  const [openDropdown, setOpenDropdown] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [showPagePicker, setShowPagePicker] = useState(false);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError("");

      const firstPage = await getPlayers({
        page: 1,
        limit: PLAYER_FETCH_LIMIT,
      });
      const firstPlayers = firstPage.players || firstPage;
      const totalPlayers = Number(firstPage.total) || firstPlayers.length;
      const totalApiPages = Math.ceil(totalPlayers / PLAYER_FETCH_LIMIT);

      if (!firstPage.players || totalApiPages <= 1) {
        setPlayers(firstPlayers);
        return;
      }

      const remainingPages = await Promise.all(
        Array.from({ length: totalApiPages - 1 }, (_, index) =>
          getPlayers({
            page: index + 2,
            limit: PLAYER_FETCH_LIMIT,
          })
        )
      );

      setPlayers([
        ...firstPlayers,
        ...remainingPages.flatMap((pageData) => pageData.players || pageData),
      ]);
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
      ],
      {
        cancelable: true,
        onDismiss: () => {},
      }
    );
  };

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? "" : name));
  };

  const selectPreferredPosition = (position) => {
    setPreferredPositionFilter(position);
    setOpenDropdown("");
  };

  const toggleAlternativePosition = (position) => {
    setAlternativePositionFilters((current) =>
      current.includes(position)
        ? current.filter((item) => item !== position)
        : [...current, position]
    );
  };

  const selectSort = (nextSort) => {
    setSort(nextSort);
    setOpenDropdown("");
  };

  const clearFilters = () => {
    setSearchText("");
    setPreferredPositionFilter("");
    setAlternativePositionFilters([]);
    setMinAge("");
    setMaxAge("");
    setOpenDropdown("");
    setShowFilters(false);
    setPage(1);
  };

  const handleAgeChange = (setter) => (value) => {
    setter(value.replace(/[^0-9]/g, ""));
  };

  const minAgeNumber = minAge === "" ? null : Number(minAge);
  const maxAgeNumber = maxAge === "" ? null : Number(maxAge);
  const hasInvalidAgeRange =
    minAgeNumber !== null &&
    maxAgeNumber !== null &&
    !Number.isNaN(minAgeNumber) &&
    !Number.isNaN(maxAgeNumber) &&
    maxAgeNumber < minAgeNumber;

  const filteredPlayers = useMemo(() => {
    if (hasInvalidAgeRange) {
      return [];
    }

    const keyword = searchText.trim().toLowerCase();

    const filtered = players.filter((player) => {
      const fullName = `${player.firstName || ""} ${
        player.lastName || ""
      }`.toLowerCase();

      const teamName = (
        player.team?.name ||
        player.teamName ||
        ""
      ).toLowerCase();

      const preferredPosition = player.preferredPosition || "";
      const alternativePositions = player.alternativePositions || [];
      const searchablePositions = [
        preferredPosition,
        ...alternativePositions,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        keyword === "" ||
        fullName.includes(keyword) ||
        teamName.includes(keyword) ||
        searchablePositions.includes(keyword);

      const matchesPreferredPosition =
        !preferredPositionFilter ||
        preferredPosition === preferredPositionFilter;

      const matchesAlternativePositions =
        alternativePositionFilters.length === 0 ||
        alternativePositionFilters.some((position) =>
          alternativePositions.includes(position)
        );

      const playerAge = Number(player.age);
      const matchesMinAge =
        minAgeNumber === null ||
        Number.isNaN(minAgeNumber) ||
        (!Number.isNaN(playerAge) && playerAge >= minAgeNumber);
      const matchesMaxAge =
        maxAgeNumber === null ||
        Number.isNaN(maxAgeNumber) ||
        (!Number.isNaN(playerAge) && playerAge <= maxAgeNumber);

      return (
        matchesSearch &&
        matchesPreferredPosition &&
        matchesAlternativePositions &&
        matchesMinAge &&
        matchesMaxAge
      );
    });

    return filtered.sort((a, b) => {
      switch (sort) {
        case "name_desc":
          return compareNames(b, a);

        case "age_asc": {
          const diff = (a.age ?? 999) - (b.age ?? 999);
          return diff || compareNames(a, b);
        }

        case "age_desc": {
          const diff = (b.age ?? -1) - (a.age ?? -1);
          return diff || compareNames(a, b);
        }

        case "position_asc": {
          const diff =
            (positionOrder[a.preferredPosition] || 999) -
            (positionOrder[b.preferredPosition] || 999);
          return diff || compareNames(a, b);
        }

        case "position_desc": {
          const diff =
            (positionOrder[b.preferredPosition] || 999) -
            (positionOrder[a.preferredPosition] || 999);
          return diff || compareNames(a, b);
        }

        case "name_asc":
        default:
          return compareNames(a, b);
      }
    });
  }, [
    alternativePositionFilters,
    hasInvalidAgeRange,
    maxAgeNumber,
    minAgeNumber,
    players,
    preferredPositionFilter,
    searchText,
    sort,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredPlayers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedPlayers = filteredPlayers.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );
  const firstShown = filteredPlayers.length === 0 ? 0 : startIndex + 1;
  const lastShown = Math.min(startIndex + PAGE_SIZE, filteredPlayers.length);

  useEffect(() => {
    setPage(1);
  }, [
    alternativePositionFilters,
    maxAge,
    minAge,
    preferredPositionFilter,
    searchText,
    sort,
  ]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const openPagePicker = () => {
    setShowPagePicker((current) => !current);
  };

  const selectPage = (nextPage) => {
    setPage(nextPage);
    setShowPagePicker(false);
  };

  const sortLabel =
    sortOptions.find((option) => sort.startsWith(option.field))?.label ||
    "Last Name";
  const sortDirection =
    sortOptions.find((option) => sort.startsWith(option.field))?.[
      sort.endsWith("_asc") ? "ascLabel" : "descLabel"
    ] || "";
  const ageLabel =
    minAge || maxAge ? `${minAge || "Any"} - ${maxAge || "Any"}` : "Any age";
  const alternativeLabel =
    alternativePositionFilters.length > 0
      ? `${alternativePositionFilters.length} selected`
      : "All alternative positions";
  const activeFilterCount = [
    searchText.trim(),
    preferredPositionFilter,
    alternativePositionFilters.length > 0,
    minAge,
    maxAge,
  ].filter(Boolean).length;
  const filterSummary =
    activeFilterCount > 0
      ? `${activeFilterCount} active filter${
          activeFilterCount === 1 ? "" : "s"
        }`
      : "All players";

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
      <FlatList
        data={paginatedPlayers}
        keyExtractor={(item) => item._id || item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
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

            <View style={styles.panel}>
              <TouchableOpacity
                style={styles.filterToggle}
                onPress={() => {
                  setShowFilters((current) => !current);
                  setOpenDropdown("");
                }}
              >
                <View>
                  <Text style={styles.panelTitle}>Filters</Text>
                  <Text style={styles.dropdownValue}>{filterSummary}</Text>
                </View>
                <Text style={styles.dropdownArrow}>
                  {showFilters ? "^" : "v"}
                </Text>
              </TouchableOpacity>

              {showFilters && (
                <View style={styles.filterContent}>
                  <DropdownSection
                    title="Preferred Position"
                    value={preferredPositionFilter || "All preferred positions"}
                    isOpen={openDropdown === "preferred"}
                    onToggle={() => toggleDropdown("preferred")}
                  >
                    <TouchableOpacity
                      style={styles.optionRow}
                      onPress={() => selectPreferredPosition("")}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          !preferredPositionFilter && styles.optionTextSelected,
                        ]}
                      >
                        All preferred positions
                      </Text>
                    </TouchableOpacity>

                    {positionOptions.map((position) => (
                      <TouchableOpacity
                        key={position}
                        style={styles.optionRow}
                        onPress={() => selectPreferredPosition(position)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            preferredPositionFilter === position &&
                              styles.optionTextSelected,
                          ]}
                        >
                          {position}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </DropdownSection>

                  <DropdownSection
                    title="Alternative Positions"
                    value={alternativeLabel}
                    isOpen={openDropdown === "alternative"}
                    onToggle={() => toggleDropdown("alternative")}
                  >
                    {positionOptions.map((position) => {
                      const isSelected =
                        alternativePositionFilters.includes(position);

                      return (
                        <TouchableOpacity
                          key={position}
                          style={styles.optionRow}
                          onPress={() => toggleAlternativePosition(position)}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              isSelected && styles.checkboxSelected,
                            ]}
                          />
                          <Text
                            style={[
                              styles.optionText,
                              isSelected && styles.optionTextSelected,
                            ]}
                          >
                            {position}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}

                    <View style={styles.dropdownActionRow}>
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setAlternativePositionFilters([])}
                      >
                        <Text style={styles.secondaryButtonText}>Clear</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setOpenDropdown("")}
                      >
                        <Text style={styles.secondaryButtonText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  </DropdownSection>

                  <DropdownSection
                    title="Age"
                    value={ageLabel}
                    isOpen={openDropdown === "age"}
                    onToggle={() => toggleDropdown("age")}
                  >
                    <View style={styles.ageRow}>
                      <View style={styles.ageInputWrap}>
                        <Text style={styles.label}>Min Age</Text>
                        <TextInput
                          style={[
                            styles.ageInput,
                            hasInvalidAgeRange && styles.inputError,
                          ]}
                          value={minAge}
                          onChangeText={handleAgeChange(setMinAge)}
                          placeholder="Any"
                          keyboardType="numeric"
                        />
                      </View>

                      <View style={styles.ageInputWrap}>
                        <Text style={styles.label}>Max Age</Text>
                        <TextInput
                          style={[
                            styles.ageInput,
                            hasInvalidAgeRange && styles.inputError,
                          ]}
                          value={maxAge}
                          onChangeText={handleAgeChange(setMaxAge)}
                          placeholder="Any"
                          keyboardType="numeric"
                        />
                      </View>
                    </View>

                    {hasInvalidAgeRange && (
                      <Text style={styles.filterError}>
                        Max Age cannot be less than Min Age.
                      </Text>
                    )}
                  </DropdownSection>

                  <TouchableOpacity
                    style={styles.clearButton}
                    onPress={clearFilters}
                  >
                    <Text style={styles.clearButtonText}>Clear Filters</Text>
                  </TouchableOpacity>
                </View>
              )}

              <DropdownSection
                title="Sort"
                value={`${sortLabel} ${sortDirection}`}
                isOpen={openDropdown === "sort"}
                onToggle={() => toggleDropdown("sort")}
              >
                {sortOptions.map((option) => (
                  <View key={option.field}>
                    <TouchableOpacity
                      style={styles.optionRow}
                      onPress={() => selectSort(`${option.field}_asc`)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          sort === `${option.field}_asc` &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option.label} {option.ascLabel}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.optionRow}
                      onPress={() => selectSort(`${option.field}_desc`)}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          sort === `${option.field}_desc` &&
                            styles.optionTextSelected,
                        ]}
                      >
                        {option.label} {option.descLabel}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </DropdownSection>
            </View>

            <Text style={styles.hint}>
              Showing {firstShown}-{lastShown} of {filteredPlayers.length}{" "}
              players. Tap to view details. Long press for quick actions.
            </Text>
          </View>
        }
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
              <Text>Preferred Position: {item.preferredPosition || "N/A"}</Text>
              <Text>
                Alternative Positions:{" "}
                {item.alternativePositions?.length
                  ? item.alternativePositions.join(", ")
                  : "N/A"}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No players found.</Text>
        }
        ListFooterComponent={
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
                    currentPage === 1 && styles.pageButtonTextDisabled,
                  ]}
                >
                  Prev
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.pageSelector}
                onPress={openPagePicker}
              >
                <Text style={styles.pageText}>
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
                <Text style={styles.label}>Choose page</Text>
                <View style={styles.pageNumberGrid}>
                  {Array.from({ length: totalPages }, (_, index) => {
                    const pageNumber = index + 1;
                    const isSelected = pageNumber === currentPage;

                    return (
                      <TouchableOpacity
                        key={pageNumber}
                        style={[
                          styles.pageNumberButton,
                          isSelected && styles.pageNumberButtonSelected,
                        ]}
                        onPress={() => selectPage(pageNumber)}
                      >
                        <Text
                          style={[
                            styles.pageNumberText,
                            isSelected && styles.pageNumberTextSelected,
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
  panel: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  dropdown: {
    marginBottom: 10,
  },
  filterToggle: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  filterContent: {
    marginBottom: 4,
  },
  dropdownButton: {
    minHeight: 54,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  dropdownTitle: {
    fontWeight: "600",
    marginBottom: 2,
  },
  dropdownValue: {
    color: "#666",
  },
  dropdownArrow: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
    paddingLeft: 12,
  },
  dropdownContent: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderTopWidth: 0,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: "#fff",
    paddingVertical: 4,
  },
  optionRow: {
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    color: "#333",
    fontSize: 15,
  },
  optionTextSelected: {
    color: "#0d6ecf",
    fontWeight: "bold",
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#9eacb5",
    borderRadius: 4,
    marginRight: 10,
  },
  checkboxSelected: {
    borderColor: "#2196f3",
    backgroundColor: "#2196f3",
  },
  dropdownActionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    padding: 10,
    paddingTop: 4,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontWeight: "bold",
  },
  ageRow: {
    flexDirection: "row",
    gap: 10,
  },
  ageInputWrap: {
    flex: 1,
  },
  ageInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  inputError: {
    borderColor: "#d32f2f",
  },
  filterError: {
    color: "#d32f2f",
    marginBottom: 8,
  },
  clearButton: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#bbb",
    borderRadius: 6,
    padding: 10,
  },
  clearButtonText: {
    fontWeight: "bold",
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
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
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
});
