import { useEffect, useRef, useState } from "react";
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
  View,
} from "react-native";
import {
  createCoach,
  getCoach,
  updateCoach,
} from "../services/coachService";

export default function CoachFormScreen({ navigation, route }) {
  const coachId = route.params?.coachId;
  const isEdit = Boolean(coachId);
  const scrollViewRef = useRef(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [introduction, setIntroduction] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    const loadCoach = async () => {
      try {
        setLoading(true);
        setError("");

        const coach = await getCoach(coachId);
        setFirstName(coach.firstName || "");
        setLastName(coach.lastName || "");
        setEmail(coach.email || "");
        setPhone(coach.phone || "");
        setIntroduction(coach.introduction || "");
      } catch (err) {
        console.log("LOAD COACH FORM ERROR:", err.response?.data || err);
        setError(err.response?.data?.message || "Failed to load coach.");
      } finally {
        setLoading(false);
      }
    };

    loadCoach();
  }, [coachId, isEdit]);

  const handleSubmit = async () => {
    setError("");

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    if (!email.trim() && !phone.trim()) {
      setError("Please provide either an email or a phone number.");
      return;
    }

    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      introduction: introduction.trim(),
    };

    try {
      setSubmitting(true);

      if (isEdit) {
        await updateCoach(coachId, payload);
        Alert.alert("Success", "Coach updated");
        navigation.navigate("CoachDetail", { coachId });
      } else {
        await createCoach(payload);
        Alert.alert("Success", "Coach created");
        navigation.navigate("CoachesList");
      }
    } catch (err) {
      console.log("SAVE COACH ERROR:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to save coach.");
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
        <Text>Loading coach...</Text>
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
          <Text style={styles.title}>
            {isEdit ? "Edit Coach" : "Add Coach"}
          </Text>
          <Text style={styles.subtitle}>
            {isEdit ? "Update coach information" : "Create a new coach profile"}
          </Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Coach Details</Text>
            <Text style={styles.muted}>Enter coach information below</Text>

            {error ? <Text style={styles.errorBox}>{error}</Text> : null}

            <Text style={styles.section}>Basic Info</Text>

            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />

            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
            />

            <Text style={styles.section}>
              Contact Info (Please enter one or both)
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => scrollFocusedInputIntoView(330)}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              onFocus={() => scrollFocusedInputIntoView(430)}
            />

            <Text style={styles.section}>Introduction</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              value={introduction}
              onChangeText={setIntroduction}
              placeholder="Enter coach introduction"
              multiline
              textAlignVertical="top"
              onFocus={() => scrollFocusedInputIntoView(530)}
            />

            <View style={styles.buttonArea}>
              <Button
                title={
                  submitting
                    ? "Saving..."
                    : isEdit
                      ? "Update Coach"
                      : "Create Coach"
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
  section: {
    fontWeight: "bold",
    color: "#666",
    marginTop: 8,
    marginBottom: 10,
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
  textArea: {
    minHeight: 110,
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
