import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "./screens/LoginScreen";
import PlayersScreen from "./screens/PlayersScreen";
import PlayerDetailScreen from "./screens/PlayerDetailScreen";
import AddPlayerScreen from "./screens/AddPlayerScreen";
import ChangeTeamScreen from "./screens/ChangeTeamScreen";
import TeamsScreen from "./screens/TeamsScreen";
import CoachesScreen from "./screens/CoachesScreen";

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

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Players" component={PlayersStack} />
      <Tab.Screen name="Teams" component={TeamsScreen} />
      <Tab.Screen name="Coaches" component={CoachesScreen} />
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