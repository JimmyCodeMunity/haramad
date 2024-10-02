import { StyleSheet, Text, View } from "react-native";
import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import LoginScreen from "../screens/LoginScreen";
// import DestinationSearch from "../screens/DestinationSearch";
// import SearchResults from "../screens/SearchResults";
import SplashScreen from "../screens/SplashScreen";
import SignUpScreen from "../screens/SignUpScreen";
import DestinationScreen from "../screens/DestinationScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SearchResultScreen from "../screens/SearchResultScreen";
import { AuthContext } from "../context/AuthContext";
import RideDecideScreen from "../screens/RideDecideScreen";
import AcceptedScreen from "../screens/AcceptedScreen";
import StartTrip from "../screens/StartTrip";
// import SearchingRide from "../screens/SearchingRide";

const Stack = createStackNavigator();

const StackNavigation = () => {
  const { isLoggedIn } = useContext(AuthContext);
  console.log("user login status",isLoggedIn)
  return (
    <Stack.Navigator>
      {!isLoggedIn ? (
        <>
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={SignUpScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="destinationsearch"
            component={DestinationScreen}
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="settings"
            component={SettingsScreen}
            options={{ headerShown: false, presentation: "modal" }}
          />
          <Stack.Screen
            name="search"
            component={SearchResultScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ridedecision"
            component={RideDecideScreen}
            options={{ headerShown: false }}
          />
          
          {/* <Stack.Screen
            name="accepted"
            component={AcceptedScreen}
            options={{ headerShown: false }}
          /> */}
          {/* <Stack.Screen
        name="search"
        component={SearchResults}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ridesearch"
        component={SearchingRide}
        options={{ headerShown: false,presentation:'modal' }}
      /> */}
        </>
      )}
    </Stack.Navigator>
  );
};

export default StackNavigation;

const styles = StyleSheet.create({});
