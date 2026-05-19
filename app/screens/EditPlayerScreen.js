import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import DatePickerField from "../components/DatePickerField";
import { updatePlayer } from "../services/playerService";
import { getTeam, getTeams } from "../services/teamService";

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

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

function getTeamId(team) {
  if (!team) return "";
  if (typeof team === "string") return team;
  return team._id || team.id || "";
}

function getPlayerId(player) {
  return player?._id || player?.id || "";
}

function formatDateForInput(value) {
  if (!value) return "";
  if (typeof value === "string") return value.slice(0, 10);

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function getErrorMessage(err) {
  const responseData = err.response?.data;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0].msg;
  }

  return responseData?.message || "Failed to update player";
}

function DropdownSection({ title, value, isOpen, onToggle, children }) {
  return (
    <View style={styles.dropdown}>
      <TouchableOpacity style={styles.dropdownButton} onPress={onToggle}>
        <View style={styles.dropdownTextWrap}>
          <Text style={styles.label}>{title}</Text>
          <Text style={styles.dropdownValue}>{value}</Text>
        </View>
        <Text style={styles.dropdownArrow}>{isOpen ? "^" : "v"}</Text>
      </TouchableOpacity>

      {isOpen && <View style={styles.dropdownContent}>{children}</View>}
    </View>
  );
}

export default function EditPlayerScreen({ route, navigation }) {
  const { player, returnRouteName = "PlayerDetail" } = route.params;
  const scrollViewRef = useRef(null);
  const initialTeamId = getTeamId(player.team);
  const playerId = getPlayerId(player);

  const [form, setForm] = useState({
    firstName: player.firstName || "",
    lastName: player.lastName || "",
    dateOfBirth: formatDateForInput(player.dateOfBirth),
    preferredPosition: player.preferredPosition || "",
    alternativePositions: Array.isArray(player.alternativePositions)
      ? player.alternativePositions
      : [],
    assignmentMode: initialTeamId ? "manual" : "auto",
    team: initialTeamId,
    jerseyNumber:
      player.jerseyNumber !== undefined && player.jerseyNumber !== null
        ? String(player.jerseyNumber)
        : "",
    guardianName: player.guardianName || "",
    guardianPhone: player.guardianPhone || "",
    email: player.email || "",
    playerPhone: player.playerPhone || "",
    playerEmail: player.playerEmail || "",
  });
  const [teams, setTeams] = useState([]);
  const [teamPlayers, setTeamPlayers] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [teamError, setTeamError] = useState("");
  const [openDropdown, setOpenDropdown] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        setLoadingTeams(true);
        setTeamError("");

        const data = await getTeams();
        setTeams(data.teams || data);
      } catch (err) {
        console.log("LOAD TEAMS ERROR:", err.response?.data || err.message);
        setTeamError("Failed to load teams.");
      } finally {
        setLoadingTeams(false);
      }
    };

    loadTeams();
  }, []);

  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);

  const sortedTeams = useMemo(
    () =>
      teams
        .slice()
        .sort((a, b) => Number(a.maxAge || 999) - Number(b.maxAge || 999)),
    [teams]
  );

  const recommendedTeam = useMemo(() => {
    if (age === null) return null;

    return (
      sortedTeams.find((team) => age <= Number(team.maxAge || team.ageGroup)) ||
      null
    );
  }, [age, sortedTeams]);

  const selectedTeam = useMemo(
    () =>
      teams.find(
        (team) => String(team._id || team.id) === String(form.team)
      ) || null,
    [form.team, teams]
  );

  const effectiveTeamId =
    form.assignmentMode === "manual"
      ? form.team
      : getTeamId(recommendedTeam);

  const effectiveTeam = useMemo(
    () =>
      teams.find(
        (team) => String(team._id || team.id) === String(effectiveTeamId)
      ) || null,
    [effectiveTeamId, teams]
  );

  useEffect(() => {
    if (!form.team || age === null) return;

    const team = teams.find(
      (item) => String(item._id || item.id) === String(form.team)
    );

    if (team && age > Number(team.maxAge || team.ageGroup)) {
      setForm((current) => ({
        ...current,
        team: "",
        jerseyNumber: "",
      }));
    }
  }, [age, form.team, teams]);

  useEffect(() => {
    const loadTeamPlayers = async () => {
      if (!effectiveTeamId) {
        setTeamPlayers([]);
        return;
      }

      try {
        const data = await getTeam(effectiveTeamId);
        setTeamPlayers(data.players || []);
      } catch (err) {
        console.log(
          "LOAD TEAM PLAYERS ERROR:",
          err.response?.data || err.message
        );
        setTeamPlayers([]);
      }
    };

    loadTeamPlayers();
  }, [effectiveTeamId]);

  const takenJerseyNumbers = useMemo(
    () =>
      new Set(
        teamPlayers
          .filter(
            (teamPlayer) => String(getPlayerId(teamPlayer)) !== String(playerId)
          )
          .map((teamPlayer) => Number(teamPlayer.jerseyNumber))
          .filter((number) => !Number.isNaN(number))
      ),
    [playerId, teamPlayers]
  );

  const availableJerseyNumbers = useMemo(
    () =>
      Array.from({ length: 99 }, (_, index) => index + 1).filter(
        (number) => !takenJerseyNumbers.has(number)
      ),
    [takenJerseyNumbers]
  );

  useEffect(() => {
    if (!form.jerseyNumber) return;

    if (takenJerseyNumbers.has(Number(form.jerseyNumber))) {
      setForm((current) => ({
        ...current,
        jerseyNumber: "",
      }));
    }
  }, [form.jerseyNumber, takenJerseyNumbers]);

  const updateField = (field, value) => {
    setForm((current) => {
      const updated = {
        ...current,
        [field]: value,
      };

      if (field === "preferredPosition") {
        updated.alternativePositions = current.alternativePositions.filter(
          (position) => position !== value
        );
      }

      if (field === "assignmentMode") {
        updated.team = value === "auto" ? "" : current.team;
        updated.jerseyNumber = "";
      }

      if (field === "team" || field === "dateOfBirth") {
        updated.jerseyNumber = "";
      }

      return updated;
    });
  };

  const toggleDropdown = (name) => {
    setOpenDropdown((current) => (current === name ? "" : name));
  };

  const selectPreferredPosition = (position) => {
    updateField("preferredPosition", position);
    setOpenDropdown("");
  };

  const toggleAlternativePosition = (position) => {
    setForm((current) => {
      const exists = current.alternativePositions.includes(position);

      return {
        ...current,
        alternativePositions: exists
          ? current.alternativePositions.filter((item) => item !== position)
          : [...current.alternativePositions, position],
      };
    });
  };

  const selectTeam = (teamId) => {
    updateField("team", teamId);
    setOpenDropdown("");
  };

  const selectJerseyNumber = (number) => {
    updateField("jerseyNumber", String(number));
    setOpenDropdown("");
  };

  const scrollFocusedInputIntoView = (y) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y,
        animated: true,
      });
    }, 120);
  };

  const handleSave = async () => {
    const firstName = form.firstName.trim();
    const lastName = form.lastName.trim();
    const guardianName = form.guardianName.trim();
    const guardianPhone = form.guardianPhone.trim();
    const email = form.email.trim();
    const playerPhone = form.playerPhone.trim();
    const playerEmail = form.playerEmail.trim();
    const jerseyNumber = form.jerseyNumber.trim();

    if (!firstName || !lastName || !form.dateOfBirth || !guardianName) {
      Alert.alert(
        "Error",
        "First name, last name, date of birth, and guardian name are required."
      );
      return;
    }

    if (age === null) {
      Alert.alert("Error", "Please enter a valid date of birth.");
      return;
    }

    if (!guardianPhone && !email) {
      Alert.alert("Error", "Guardian phone or email is required.");
      return;
    }

    if (form.assignmentMode === "manual" && !form.team) {
      Alert.alert("Error", "Please select a team for manual assignment.");
      return;
    }

    if (
      form.assignmentMode === "manual" &&
      selectedTeam &&
      age > Number(selectedTeam.maxAge || selectedTeam.ageGroup)
    ) {
      Alert.alert("Error", "Player is too old for the selected team.");
      return;
    }

    if (jerseyNumber && (Number(jerseyNumber) < 1 || Number(jerseyNumber) > 99)) {
      Alert.alert("Error", "Kit number must be between 1 and 99.");
      return;
    }

    if (jerseyNumber && takenJerseyNumbers.has(Number(jerseyNumber))) {
      Alert.alert("Error", "The selected kit number is already taken.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        firstName,
        lastName,
        dateOfBirth: form.dateOfBirth,
        preferredPosition: form.preferredPosition,
        alternativePositions: form.alternativePositions.filter(
          (position) => position !== form.preferredPosition
        ),
        jerseyNumber: jerseyNumber ? Number(jerseyNumber) : null,
        guardianName,
        guardianPhone,
        email,
        playerPhone,
        playerEmail,
        assignmentMode: form.assignmentMode,
        team: effectiveTeamId || undefined,
      };

      const updatedPlayer = await updatePlayer(player._id || player.id, payload);

      Alert.alert("Success", "Player updated successfully.");
      navigation.navigate({
        name: returnRouteName,
        params: {
          player: updatedPlayer || {
            ...player,
            ...payload,
          },
        },
        merge: true,
      });
    } catch (err) {
      console.log("UPDATE PLAYER ERROR:", err.response?.data || err.message);
      Alert.alert("Error", getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const recommendedTeamText = recommendedTeam
    ? recommendedTeam.name
    : "No suitable team found";
  const selectedTeamText = selectedTeam
    ? selectedTeam.name
    : "Select a team";
  const jerseyText = form.jerseyNumber
    ? String(form.jerseyNumber)
    : effectiveTeam
    ? "Select a kit number"
    : "Select a team first";
  const manualOverrideWarning =
    form.assignmentMode === "manual" &&
    selectedTeam &&
    recommendedTeam &&
    String(selectedTeam._id || selectedTeam.id) !==
      String(recommendedTeam._id || recommendedTeam.id);

  if (loadingTeams) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading player form...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoider}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 88 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Edit Player</Text>
          <Text style={styles.subtitle}>Update player information</Text>

          {teamError ? <Text style={styles.error}>{teamError}</Text> : null}

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Player Details</Text>

            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={form.firstName}
              onChangeText={(value) => updateField("firstName", value)}
            />

            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={form.lastName}
              onChangeText={(value) => updateField("lastName", value)}
            />

            <DatePickerField
              label="Date of Birth *"
              value={form.dateOfBirth}
              onChange={(value) => updateField("dateOfBirth", value)}
              onOpen={() => scrollFocusedInputIntoView(80)}
            />

            <Text style={styles.readOnlyValue}>
              Calculated Age: {age === null ? "N/A" : age}
            </Text>

            <DropdownSection
              title="Preferred Position"
              value={form.preferredPosition || "No preferred position"}
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
                    !form.preferredPosition && styles.optionTextSelected,
                  ]}
                >
                  No preferred position
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
                      form.preferredPosition === position &&
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
              value={
                form.alternativePositions.length > 0
                  ? `${form.alternativePositions.length} selected`
                  : "No alternative positions"
              }
              isOpen={openDropdown === "alternative"}
              onToggle={() => toggleDropdown("alternative")}
            >
              {positionOptions
                .filter((position) => position !== form.preferredPosition)
                .map((position) => {
                  const isSelected =
                    form.alternativePositions.includes(position);

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
                  onPress={() => updateField("alternativePositions", [])}
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

            <Text style={styles.sectionLabel}>Team Assignment</Text>

            <Text style={styles.label}>Assignment Mode</Text>
            <View style={styles.segmented}>
              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  form.assignmentMode === "auto" && styles.segmentButtonActive,
                ]}
                onPress={() => updateField("assignmentMode", "auto")}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    form.assignmentMode === "auto" &&
                      styles.segmentButtonTextActive,
                  ]}
                >
                  Auto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.segmentButton,
                  form.assignmentMode === "manual" &&
                    styles.segmentButtonActive,
                ]}
                onPress={() => updateField("assignmentMode", "manual")}
              >
                <Text
                  style={[
                    styles.segmentButtonText,
                    form.assignmentMode === "manual" &&
                      styles.segmentButtonTextActive,
                  ]}
                >
                  Manual
                </Text>
              </TouchableOpacity>
            </View>

            {form.assignmentMode === "auto" && (
              <Text style={styles.helperText}>
                Recommended Team: {recommendedTeamText}
              </Text>
            )}

            {form.assignmentMode === "manual" && (
              <>
                <DropdownSection
                  title="Team"
                  value={selectedTeamText}
                  isOpen={openDropdown === "team"}
                  onToggle={() => toggleDropdown("team")}
                >
                  {sortedTeams.map((team) => {
                    const teamId = team._id || team.id;
                    const isTooOld =
                      age !== null &&
                      age > Number(team.maxAge || team.ageGroup);
                    const isSelected = String(form.team) === String(teamId);

                    return (
                      <TouchableOpacity
                        key={teamId}
                        style={[
                          styles.optionRow,
                          isTooOld && styles.optionRowDisabled,
                        ]}
                        disabled={isTooOld}
                        onPress={() => selectTeam(teamId)}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextSelected,
                            isTooOld && styles.optionTextDisabled,
                          ]}
                        >
                          {team.name} (U{team.maxAge})
                          {isTooOld ? " - unavailable" : ""}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </DropdownSection>

                {selectedTeam && (
                  <Text
                    style={[
                      styles.helperText,
                      manualOverrideWarning && styles.warningText,
                    ]}
                  >
                    Selected Team: {selectedTeam.name}
                    {recommendedTeam
                      ? ` | Recommended: ${recommendedTeam.name}`
                      : ""}
                  </Text>
                )}
              </>
            )}

            {effectiveTeam ? (
              <>
                <DropdownSection
                  title="Kit Number"
                  value={jerseyText}
                  isOpen={openDropdown === "jersey"}
                  onToggle={() => toggleDropdown("jersey")}
                >
                  <View style={styles.jerseyGrid}>
                    {availableJerseyNumbers.map((number) => {
                      const isSelected =
                        String(form.jerseyNumber) === String(number);

                      return (
                        <TouchableOpacity
                          key={number}
                          style={[
                            styles.jerseyButton,
                            isSelected && styles.jerseyButtonSelected,
                          ]}
                          onPress={() => selectJerseyNumber(number)}
                        >
                          <Text
                            style={[
                              styles.jerseyButtonText,
                              isSelected && styles.jerseyButtonTextSelected,
                            ]}
                          >
                            {number}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </DropdownSection>

                <Text style={styles.helperText}>
                  Available kit numbers are based on team {effectiveTeam.name}.
                </Text>
              </>
            ) : (
              <Text style={styles.helperText}>
                Select a suitable team before choosing a kit number.
              </Text>
            )}

            <Text style={styles.sectionLabel}>Guardian Contact</Text>

            <Text style={styles.label}>Guardian Name *</Text>
            <TextInput
              style={styles.input}
              value={form.guardianName}
              onChangeText={(value) => updateField("guardianName", value)}
              onFocus={() => scrollFocusedInputIntoView(430)}
            />

            <Text style={styles.label}>Guardian Phone</Text>
            <TextInput
              style={styles.input}
              value={form.guardianPhone}
              onChangeText={(value) => updateField("guardianPhone", value)}
              keyboardType="phone-pad"
              onFocus={() => scrollFocusedInputIntoView(510)}
            />

            <Text style={styles.label}>Guardian Email</Text>
            <TextInput
              style={styles.input}
              value={form.email}
              onChangeText={(value) => updateField("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => scrollFocusedInputIntoView(590)}
            />

            <Text style={styles.sectionLabel}>Player Contact</Text>

            <Text style={styles.label}>Player Phone</Text>
            <TextInput
              style={styles.input}
              value={form.playerPhone}
              onChangeText={(value) => updateField("playerPhone", value)}
              keyboardType="phone-pad"
              onFocus={() => scrollFocusedInputIntoView(680)}
            />

            <Text style={styles.label}>Player Email</Text>
            <TextInput
              style={styles.input}
              value={form.playerEmail}
              onChangeText={(value) => updateField("playerEmail", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => scrollFocusedInputIntoView(760)}
            />

            <View style={styles.buttonArea}>
              <Button
                title={saving ? "SAVING..." : "UPDATE PLAYER"}
                disabled={saving}
                onPress={handleSave}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoider: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  content: {
    padding: 12,
    paddingBottom: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 14,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 14,
  },
  sectionLabel: {
    color: "#666",
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 10,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  readOnlyValue: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    color: "#666",
    padding: 12,
    marginBottom: 14,
    backgroundColor: "#f7f7f7",
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  helperText: {
    color: "#666",
    marginBottom: 12,
  },
  warningText: {
    color: "#b26a00",
  },
  dropdown: {
    marginBottom: 14,
  },
  dropdownButton: {
    minHeight: 58,
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
  dropdownTextWrap: {
    flex: 1,
    paddingRight: 8,
  },
  dropdownValue: {
    color: "#666",
  },
  dropdownArrow: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
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
  optionRowDisabled: {
    backgroundColor: "#f3f3f3",
  },
  optionText: {
    color: "#333",
    fontSize: 15,
  },
  optionTextSelected: {
    color: "#0d6ecf",
    fontWeight: "bold",
  },
  optionTextDisabled: {
    color: "#999",
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
  segmented: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  segmentButton: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    paddingVertical: 10,
  },
  segmentButtonActive: {
    borderColor: "#2196f3",
    backgroundColor: "#2196f3",
  },
  segmentButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  segmentButtonTextActive: {
    color: "#fff",
  },
  jerseyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    padding: 10,
  },
  jerseyButton: {
    minWidth: 42,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },
  jerseyButtonSelected: {
    borderColor: "#2196f3",
    backgroundColor: "#2196f3",
  },
  jerseyButtonText: {
    color: "#333",
    fontWeight: "bold",
  },
  jerseyButtonTextSelected: {
    color: "#fff",
  },
  buttonArea: {
    marginTop: 14,
  },
});
