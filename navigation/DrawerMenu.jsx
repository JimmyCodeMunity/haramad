import React, { useContext, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { AuthContext } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const DrawerMenu = (props) => {
  const [isOnline, setIsOnline] = useState(false);

  const { userToken, isLoggedIn, logout } = useContext(AuthContext);
  const [userdata, setUserdata] = useState(null);
  const [loading, setLoading] = useState(false);

  // handle logout
  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  useEffect(() => {
    const loadUserdata = async () => {
      try {
        // Fetch userdata from AsyncStorage
        const storedUserdata = await AsyncStorage.getItem("userdata");
        if (storedUserdata) {
          setUserdata(JSON.parse(storedUserdata));
        }
      } catch (error) {
        console.error("Failed to load user data from AsyncStorage", error);
      } finally {
        setLoading(false); // Stop loading once data is fetched
      }
    };

    loadUserdata();
  }, []);

  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.container}>
        {/* User Row */}
        <View style={styles.userRow}>
          <View style={styles.userIconContainer}>
            <Icon name="car" size={30} color="gray" />
          </View>

          <View style={styles.userInfo}>
            {userdata && (
              <Text style={styles.userName}>{userdata.userdata.name}</Text>
            )}
            {userdata && <Text className="text-md text-slate-500">User</Text>}
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider}></View>

        {/* Drawer Item List */}
        <DrawerItemList {...props} />

        {/* Make Money Section */}
        <View style={styles.logoutContainer}>
          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Icon name="logout" color="grey" size={20} />
            <Text style={styles.logoutText}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: "#f7f7f7",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 10,
    backgroundColor: "#ffffff",
    borderRadius: 10,
    marginBottom: 20,
  },
  userIconContainer: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  userInfo: {
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  userId: {
    fontSize: 14,
    color: "#ff4d4d",
    marginTop: 3,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 10,
  },
  logoutContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  logoutText: {
    fontSize: 16,
    color: "#555",
    marginLeft: 10,
    fontWeight: "600",
  },
});

export default DrawerMenu;
