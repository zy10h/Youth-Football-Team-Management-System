import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { useSettings } from "../context/SettingsContext";

export default function SettingsScreen() {
  const { isLargeText, setLargeText, textStyles } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, textStyles.title]}>Settings</Text>
        <Text style={[styles.subtitle, textStyles.body]}>
          Adjust app display preferences.
        </Text>

        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingText}>
              <Text style={[styles.settingTitle, textStyles.cardTitle]}>
                Large Text
              </Text>
              <Text style={[styles.settingDescription, textStyles.small]}>
                Increase the size of list and detail text across the app.
              </Text>
            </View>

            <Switch
              value={isLargeText}
              onValueChange={setLargeText}
              trackColor={{ false: "#b0b0b0", true: "#81b0ff" }}
              thumbColor={isLargeText ? "#007aff" : "#f4f3f4"}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 90,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
    color: "#666",
    marginBottom: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
    padding: 16,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  settingDescription: {
    color: "#666",
  },
});
