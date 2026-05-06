import { useRef, useState } from "react";
import {
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

function getTeamId(team) {
  if (!team) return "";
  if (typeof team === "string") return team;
  return team._id || team.id || "";
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
  const teamId = getTeamId(player.team);

  const [form, setForm] = useState({
    firstName: player.firstName || "",
    lastName: player.lastName || "",
    dateOfBirth: formatDateForInput(player.dateOfBirth),
    preferredPosition: player.preferredPosition || "",
    alternativePositions: Array.isArray(player.alternativePositions)
      ? player.alternativePositions
      : [],
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
  const [openDropdown, setOpenDropdown] = useState("");
  const [saving, setSaving] = useState(false);

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

  const sanitizeNumber = (value, maxLength) =>
    value.replace(/[^0-9]/g, "").slice(0, maxLength);

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

    if (!guardianPhone && !email) {
      Alert.alert("Error", "Guardian phone or email is required.");
      return;
    }

    if (jerseyNumber && (Number(jerseyNumber) < 1 || Number(jerseyNumber) > 99)) {
      Alert.alert("Error", "Kit number must be between 1 and 99.");
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
        assignmentMode: teamId ? "manual" : "auto",
        team: teamId || undefined,
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

            <Text style={styles.label}>Kit Number</Text>
            <TextInput
              style={styles.input}
              value={form.jerseyNumber}
              onChangeText={(value) =>
                updateField("jerseyNumber", sanitizeNumber(value, 2))
              }
              keyboardType="numeric"
              onFocus={() => scrollFocusedInputIntoView(360)}
              placeholder="1-99"
            />

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
  buttonArea: {
    marginTop: 14,
  },
});
