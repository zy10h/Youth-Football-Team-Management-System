import { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Notifications from "expo-notifications";

import { createPlayer } from "../services/playerService";

export default function AddPlayerScreen({ navigation }) {
  const scrollViewRef = useRef(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  const [guardianName, setGuardianName] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [email, setEmail] = useState("");

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Notifications not allowed");
    }
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const sendNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Success",
        body: "Player created successfully",
      },
      trigger: null,
    });
  };

  const handleCreatePlayer = async () => {
    if (!firstName || !lastName || !dateOfBirth || !guardianName) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    if (!guardianPhone && !email) {
      Alert.alert(
        "Error",
        "Guardian phone or email is required"
      );
      return;
    }

    try {
      await createPlayer({
        firstName,
        lastName,
        dateOfBirth,
        guardianName,
        guardianPhone,
        email,
      });

      await sendNotification();

      Alert.alert("Success", "Player created");

      navigation.goBack();
    } catch (err) {
      console.log("CREATE PLAYER ERROR:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to create player");
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
          <Text style={styles.title}>Add Player</Text>

          <Text>First Name *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />

          <Text>Last Name *</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />

          <Text>Date of Birth (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            value={dateOfBirth}
            onChangeText={setDateOfBirth}
            onFocus={() => scrollFocusedInputIntoView(80)}
          />

          <Text>Guardian Name *</Text>
          <TextInput
            style={styles.input}
            value={guardianName}
            onChangeText={setGuardianName}
            onFocus={() => scrollFocusedInputIntoView(150)}
          />

          <Text>Guardian Phone</Text>
          <TextInput
            style={styles.input}
            value={guardianPhone}
            onChangeText={setGuardianPhone}
            keyboardType="phone-pad"
            onFocus={() => scrollFocusedInputIntoView(230)}
          />

          <Text>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => scrollFocusedInputIntoView(310)}
          />

          <View style={styles.buttonArea}>
            <Button title="CREATE PLAYER" onPress={handleCreatePlayer} />
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
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
  buttonArea: {
    marginTop: 20,
  },
});
