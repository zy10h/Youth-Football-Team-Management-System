import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import PlayersScreen from "./screens/PlayersScreen";
import PlayerDetailScreen from "./screens/PlayerDetailScreen";
import AddPlayerScreen from "./screens/AddPlayerScreen";
import ChangeTeamScreen from "./screens/ChangeTeamScreen";
import TeamsScreen from "./screens/TeamsScreen";
import TeamDetailScreen from "./screens/TeamDetailScreen";
import TeamFormScreen from "./screens/TeamFormScreen";
import CoachesScreen from "./screens/CoachesScreen";
import CoachDetailScreen from "./screens/CoachDetailScreen";
import CoachFormScreen from "./screens/CoachFormScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function PlayersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PlayersList" component={PlayersScreen} />
      <Stack.Screen name="PlayerDetail" component={PlayerDetailScreen} />
      <Stack.Screen name="AddPlayer" component={AddPlayerScreen} />
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
    <Tab.Navigator>
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
    </Tab.Navigator>
  );
}

export default function App() {
  return (
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
  );
}
