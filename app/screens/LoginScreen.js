import { useState } from "react";
import {
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
} from "react-native";
import { login } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function LoginScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const data = await login(username, password);

      console.log("LOGIN RESPONSE:", data);

      const token = data.token;

      await AsyncStorage.setItem("token", token);

      Alert.alert("Success", "Login successful");

      navigation.replace("Main");

    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Login failed");
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
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <Text>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button title="Login" onPress={handleLogin} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardAvoider: { flex: 1 },
  content: {
    padding: 16,
    paddingBottom: 220,
  },
  input: {
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
});
