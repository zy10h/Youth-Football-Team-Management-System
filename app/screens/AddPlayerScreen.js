import { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  Alert,
} from "react-native";
import * as Notifications from "expo-notifications";

import { createPlayer } from "../services/playerService";

export default function AddPlayerScreen({ navigation }) {
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Add Player</Text>

      <Text>First Name *</Text>
      <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

      <Text>Last Name *</Text>
      <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

      <Text>Date of Birth (YYYY-MM-DD) *</Text>
      <TextInput style={styles.input} value={dateOfBirth} onChangeText={setDateOfBirth} />

      <Text>Guardian Name *</Text>
      <TextInput style={styles.input} value={guardianName} onChangeText={setGuardianName} />

      <Text>Guardian Phone</Text>
      <TextInput style={styles.input} value={guardianPhone} onChangeText={setGuardianPhone} />

      <Text>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} />

      <View style={{ marginTop: 20 }}>
        <Button title="CREATE PLAYER" onPress={handleCreatePlayer} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
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
});