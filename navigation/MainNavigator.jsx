import { StyleSheet, Text, View } from "react-native";
import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import StackNavigation from "./StackNavigation";
import DrawerMenu from "./DrawerMenu";
import SettingsScreen from "../screens/SettingsScreen";
import { AuthProvider } from "../context/AuthContext";
import { Settings } from "react-native-feather";

const Drawer = createDrawerNavigator();

const MainNavigator = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Drawer.Navigator drawerContent={(props) => <DrawerMenu {...props} />}>
          <Drawer.Screen
            name="Home"
            component={StackNavigation}
            options={{ headerShown: false }}
          />

          <Drawer.Screen name="Payments">
            {() => <DummyScreen name={"Your Trips"} />}
          </Drawer.Screen>

          <Drawer.Screen name="Help">
            {() => <DummyScreen name={"Help"} />}
          </Drawer.Screen>

          

          <Drawer.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          
          <Drawer.Screen name="About">
            {() => <DummyScreen name={"Wallet"} />}
          </Drawer.Screen>
        </Drawer.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({});
