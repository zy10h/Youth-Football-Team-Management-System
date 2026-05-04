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
import {
  createTeam,
  getTeam,
  getTeams,
  updateTeam,
} from "../services/teamService";
import { getCoaches } from "../services/coachService";

const dayOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const getCoachName = (coach) =>
  coach ? `${coach.firstName || ""} ${coach.lastName || ""}`.trim() : "";

export default function TeamFormScreen({ navigation, route }) {
  const teamId = route.params?.teamId;
  const isEdit = Boolean(teamId);
  const scrollViewRef = useRef(null);

  const [maxAge, setMaxAge] = useState("");
  const [trainingDays, setTrainingDays] = useState([]);
  const [coach, setCoach] = useState("");
  const [coaches, setCoaches] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showCoachOptions, setShowCoachOptions] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setLoading(true);
        setError("");

        const [coachData, teamData, currentTeam] = await Promise.all([
          getCoaches(),
          getTeams(),
          isEdit ? getTeam(teamId) : Promise.resolve(null),
        ]);

        setCoaches(coachData.coaches || coachData);
        setAllTeams(teamData.teams || teamData);

        if (currentTeam) {
          setMaxAge(
            currentTeam.maxAge !== undefined && currentTeam.maxAge !== null
              ? String(currentTeam.maxAge)
              : ""
          );
          setTrainingDays(currentTeam.trainingDays || []);
          setCoach(currentTeam.coach?._id || currentTeam.coach || "");
        }
      } catch (err) {
        console.log("LOAD TEAM FORM ERROR:", err.response?.data || err.message);
        setError(err.response?.data?.message || "Failed to load team form.");
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [isEdit, teamId]);

  const coachConflicts = useMemo(() => {
    const result = {};

    if (trainingDays.length === 0) {
      return result;
    }

    for (const team of allTeams) {
      const coachId = team.coach?._id || team.coach;

      if (!coachId) continue;
      if (teamId && String(team._id) === String(teamId)) continue;

      const overlappingDays = (team.trainingDays || []).filter((day) =>
        trainingDays.includes(day)
      );

      if (overlappingDays.length > 0) {
        result[coachId] = {
          teamName: team.name,
          overlappingDays,
        };
      }
    }

    return result;
  }, [allTeams, trainingDays, teamId]);

  const selectedCoach = coaches.find(
    (item) => String(item._id || item.id) === String(coach)
  );
  const selectedCoachConflict = coach ? coachConflicts[coach] : null;
  const generatedName = maxAge ? `U${maxAge}` : "";

  const toggleTrainingDay = (day) => {
    setTrainingDays((current) =>
      current.includes(day)
        ? current.filter((item) => item !== day)
        : [...current, day]
    );
  };

  const handleSubmit = async () => {
    setError("");

    if (!maxAge) {
      setError("Maximum age is required.");
      return;
    }

    if (coach && selectedCoachConflict) {
      setError(
        `Coach is already assigned to ${
          selectedCoachConflict.teamName
        } on ${selectedCoachConflict.overlappingDays.join(", ")}.`
      );
      return;
    }

    const payload = {
      name: `U${maxAge}`,
      maxAge: Number(maxAge),
      trainingDays,
      coach: coach || null,
    };

    try {
      setSubmitting(true);

      if (isEdit) {
        await updateTeam(teamId, payload);
        Alert.alert("Success", "Team updated");
        navigation.navigate("TeamDetail", { teamId });
      } else {
        await createTeam(payload);
        Alert.alert("Success", "Team created");
        navigation.navigate("TeamsList");
      }
    } catch (err) {
      console.log("SAVE TEAM ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save team.");
    } finally {
      setSubmitting(false);
    }
  };

  const scrollFocusedInputIntoView = (y) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y,
        animated: true,
      });
    }, 120);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading team...</Text>
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
          <Text style={styles.title}>{isEdit ? "Edit Team" : "Add Team"}</Text>
          <Text style={styles.subtitle}>
            {isEdit ? "Update team details" : "Create a new team"}
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Team Details</Text>
            <Text style={styles.muted}>Enter team information</Text>

            {error ? <Text style={styles.errorBox}>{error}</Text> : null}

            <Text style={styles.label}>Team Name</Text>
            <TextInput
              style={[styles.input, styles.readOnlyInput]}
              value={generatedName}
              editable={false}
              placeholder="Will be generated from maximum age"
            />

            <Text style={styles.label}>Maximum Age *</Text>
            <TextInput
              style={styles.input}
              value={maxAge}
              onChangeText={(value) => setMaxAge(value.replace(/[^0-9]/g, ""))}
              placeholder="Enter maximum age"
              keyboardType="numeric"
              onFocus={() => scrollFocusedInputIntoView(80)}
            />

            <Text style={styles.label}>Training Days</Text>
            <View style={styles.chipWrap}>
              {dayOptions.map((day) => {
                const selected = trainingDays.includes(day);

                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.chip, selected && styles.chipSelected]}
                    onPress={() => toggleTrainingDay(day)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextSelected,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Coach</Text>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => setShowCoachOptions((current) => !current)}
            >
              <Text style={styles.dropdownValue}>
                {selectedCoach ? getCoachName(selectedCoach) : "Unassigned"}
              </Text>
              <Text style={styles.dropdownArrow}>
                {showCoachOptions ? "^" : "v"}
              </Text>
            </TouchableOpacity>

            {showCoachOptions && (
              <View style={styles.dropdownContent}>
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    setCoach("");
                    setShowCoachOptions(false);
                  }}
                >
                  <Text
                    style={!coach ? styles.optionSelected : styles.optionText}
                  >
                    Unassigned
                  </Text>
                </TouchableOpacity>

                {coaches.map((coachItem) => {
                  const coachId = coachItem._id || coachItem.id;
                  const conflict = coachConflicts[coachId];
                  const selected = String(coach) === String(coachId);

                  return (
                    <TouchableOpacity
                      key={coachId}
                      style={[
                        styles.optionRow,
                        conflict && styles.optionDisabled,
                      ]}
                      disabled={Boolean(conflict)}
                      onPress={() => {
                        setCoach(coachId);
                        setShowCoachOptions(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionSelected,
                          conflict && styles.optionTextDisabled,
                        ]}
                      >
                        {getCoachName(coachItem)}
                        {conflict
                          ? ` (unavailable: ${conflict.overlappingDays.join(
                              ", "
                            )})`
                          : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {selectedCoachConflict && (
              <Text style={styles.errorBox}>
                This coach is already assigned to{" "}
                {selectedCoachConflict.teamName} on{" "}
                {selectedCoachConflict.overlappingDays.join(", ")}.
              </Text>
            )}

            <View style={styles.buttonArea}>
              <Button
                title={
                  submitting
                    ? "Saving..."
                    : isEdit
                      ? "Update Team"
                      : "Create Team"
                }
                onPress={handleSubmit}
                disabled={submitting}
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
  content: {
    padding: 16,
    paddingBottom: 280,
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
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 14,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  muted: {
    color: "#666",
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 14,
    borderRadius: 6,
  },
  readOnlyInput: {
    backgroundColor: "#f6f6f6",
    color: "#666",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  chipSelected: {
    borderColor: "#2196f3",
    backgroundColor: "#e3f2fd",
  },
  chipText: {
    color: "#333",
  },
  chipTextSelected: {
    color: "#0d6ecf",
    fontWeight: "bold",
  },
  dropdownButton: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: {
    color: "#333",
  },
  dropdownArrow: {
    fontWeight: "bold",
    fontSize: 18,
  },
  dropdownContent: {
    borderWidth: 1,
    borderColor: "#cfd8dc",
    borderRadius: 6,
    marginTop: -8,
    marginBottom: 12,
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
  optionDisabled: {
    backgroundColor: "#f3f3f3",
  },
  optionTextDisabled: {
    color: "#999",
  },
  errorBox: {
    color: "#b00020",
    backgroundColor: "#fdecea",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  buttonArea: {
    marginTop: 12,
  },
});
