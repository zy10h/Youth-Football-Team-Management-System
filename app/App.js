import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StyleSheet, View } from "react-native";

import LoginScreen from "./screens/LoginScreen";
import PlayersScreen from "./screens/PlayersScreen";
import PlayerDetailScreen from "./screens/PlayerDetailScreen";
import AddPlayerScreen from "./screens/AddPlayerScreen";
import EditPlayerScreen from "./screens/EditPlayerScreen";
import ChangeTeamScreen from "./screens/ChangeTeamScreen";
import TeamsScreen from "./screens/TeamsScreen";
import TeamDetailScreen from "./screens/TeamDetailScreen";
import TeamFormScreen from "./screens/TeamFormScreen";
import CoachesScreen from "./screens/CoachesScreen";
import CoachDetailScreen from "./screens/CoachDetailScreen";
import CoachFormScreen from "./screens/CoachFormScreen";
import SettingsScreen from "./screens/SettingsScreen";
import { SettingsProvider } from "./context/SettingsContext";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function PlayersTabIcon({ color }) {
  return (
    <View style={styles.playersIcon}>
      <View style={[styles.smallHead, { backgroundColor: color }]} />
      <View style={[styles.largeHead, { backgroundColor: color }]} />
      <View style={[styles.smallHead, { backgroundColor: color }]} />
      <View style={styles.playersBodyRow}>
        <View style={[styles.smallBody, { backgroundColor: color }]} />
        <View style={[styles.largeBody, { backgroundColor: color }]} />
        <View style={[styles.smallBody, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function TeamsTabIcon({ color }) {
  return (
    <View style={[styles.teamIcon, { borderColor: color }]}>
      <View style={styles.teamIconRow}>
        <View style={[styles.teamDot, { backgroundColor: color }]} />
        <View style={[styles.teamLine, { backgroundColor: color }]} />
      </View>
      <View style={styles.teamIconRow}>
        <View style={[styles.teamDot, { backgroundColor: color }]} />
        <View style={[styles.teamLine, { backgroundColor: color }]} />
      </View>
      <View style={styles.teamIconRow}>
        <View style={[styles.teamDot, { backgroundColor: color }]} />
        <View style={[styles.teamLine, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function CoachesTabIcon({ color }) {
  return (
    <View style={[styles.coachIcon, { borderColor: color }]}>
      <View style={[styles.coachClip, { borderColor: color }]} />
      <View style={[styles.coachLine, { backgroundColor: color }]} />
      <View style={[styles.coachLine, { backgroundColor: color }]} />
      <View style={[styles.coachShortLine, { backgroundColor: color }]} />
    </View>
  );
}

function SettingsTabIcon({ color }) {
  return (
    <View style={styles.settingsIcon}>
      <View style={[styles.settingsOuter, { borderColor: color }]}>
        <View style={[styles.settingsInner, { backgroundColor: color }]} />
      </View>
      <View style={[styles.settingsTickTop, { backgroundColor: color }]} />
      <View style={[styles.settingsTickRight, { backgroundColor: color }]} />
      <View style={[styles.settingsTickBottom, { backgroundColor: color }]} />
      <View style={[styles.settingsTickLeft, { backgroundColor: color }]} />
    </View>
  );
}

function getTabIcon(routeName, color) {
  if (routeName === "Players") {
    return <PlayersTabIcon color={color} />;
  }

  if (routeName === "Teams") {
    return <TeamsTabIcon color={color} />;
  }

  if (routeName === "Coaches") {
    return <CoachesTabIcon color={color} />;
  }

  return <SettingsTabIcon color={color} />;
}

function PlayersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PlayersList" component={PlayersScreen} />
      <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} />
      <Stack.Screen name="AddPlayer" component={AddPlayerScreen} />
      <Stack.Screen
        name="EditPlayer"
        component={EditPlayerScreen}
        options={{ title: "Edit Player" }}
      />
      <Stack.Screen name="ChangeTeam" component={ChangeTeamScreen} />
    </Stack.Navigator>
  );
}

function TeamsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TeamsList"
        component={TeamsScreen}
        options={{ title: "Teams" }}
      />
      <Stack.Screen
        name="TeamDetail"
        component={TeamDetailScreen}
        options={{ title: "Team Detail" }}
      />
      <Stack.Screen
        name="TeamForm"
        component={TeamFormScreen}
        options={({ route }) => ({
          title: route.params?.teamId ? "Edit Team" : "Add Team",
        })}
      />
      <Stack.Screen
        name="TeamPlayerDetail"
        component={PlayerDetailScreen}
        options={{ title: "Player Detail" }}
      />
      <Stack.Screen
        name="EditPlayer"
        component={EditPlayerScreen}
        options={{ title: "Edit Player" }}
      />
    </Stack.Navigator>
  );
}

function CoachesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CoachesList"
        component={CoachesScreen}
        options={{ title: "Coaches" }}
      />
      <Stack.Screen
        name="CoachDetail"
        component={CoachDetailScreen}
        options={{ title: "Coach Detail" }}
      />
      <Stack.Screen
        name="CoachForm"
        component={CoachFormScreen}
        options={({ route }) => ({
          title: route.params?.coachId ? "Edit Coach" : "Add Coach",
        })}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color }) => getTabIcon(route.name, color),
        tabBarActiveTintColor: "#007aff",
        tabBarInactiveTintColor: "#8e8e93",
      })}
    >
      <Tab.Screen
        name="Players"
        component={PlayersStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Teams"
        component={TeamsStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Coaches"
        component={CoachesStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <NavigationContainer>
        <RootStack.Navigator>
          <RootStack.Screen name="Login" component={LoginScreen} />
          <RootStack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        </RootStack.Navigator>
      </NavigationContainer>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  playersIcon: {
    width: 26,
    height: 24,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    flexWrap: "wrap",
  },
  smallHead: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 1,
    marginTop: 2,
  },
  largeHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 1,
  },
  playersBodyRow: {
    width: 26,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    marginTop: 2,
  },
  smallBody: {
    width: 7,
    height: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginHorizontal: 1,
  },
  largeBody: {
    width: 9,
    height: 10,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginHorizontal: 1,
  },
  teamIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 4,
    paddingVertical: 4,
    justifyContent: "space-between",
  },
  teamIconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  teamDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginRight: 4,
  },
  teamLine: {
    width: 10,
    height: 2,
    borderRadius: 1,
  },
  coachIcon: {
    width: 22,
    height: 24,
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingTop: 7,
  },
  coachClip: {
    position: "absolute",
    top: -4,
    alignSelf: "center",
    width: 10,
    height: 6,
    borderWidth: 2,
    borderRadius: 3,
    backgroundColor: "#fff",
  },
  coachLine: {
    height: 2,
    borderRadius: 1,
    marginBottom: 4,
  },
  coachShortLine: {
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  settingsIcon: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsOuter: {
    width: 17,
    height: 17,
    borderWidth: 2,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsInner: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  settingsTickTop: {
    position: "absolute",
    top: 0,
    width: 3,
    height: 5,
    borderRadius: 2,
  },
  settingsTickRight: {
    position: "absolute",
    right: 0,
    width: 5,
    height: 3,
    borderRadius: 2,
  },
  settingsTickBottom: {
    position: "absolute",
    bottom: 0,
    width: 3,
    height: 5,
    borderRadius: 2,
  },
  settingsTickLeft: {
    position: "absolute",
    left: 0,
    width: 5,
    height: 3,
    borderRadius: 2,
  },
});
