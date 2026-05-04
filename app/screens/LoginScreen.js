import { useState } from "react";
import {
  SafeAreaView,
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
      <Text>Username</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text>Password</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button title="Login" onPress={handleLogin} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: {
    borderWidth: 1,
    marginBottom: 12,
    padding: 8,
  },
});