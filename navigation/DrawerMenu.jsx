import React, { useContext, useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { AuthContext } from "../context/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Auth } from 'aws-amplify';
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
        // console.log("stored", storedUserdata);
        if (storedUserdata) {
          setUserdata(JSON.parse(storedUserdata));
          // setDriverid(JSON.parse(storedUserdata.userdata._id));
          // console.log("driverid",storedUserdata.userdata._id)
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
    <DrawerContentScrollView {...props} className="">
      <View className="">
        {/* User Row */}
        <View className="flex-row items-center space-x-3 py-5 px-4">
          <View className="rounded-full h-12 w-12 bg-slate-300 justify-center items-center">
            <Icon name="car" size={30} color="gray" />
          </View>

          <View className="">
            {userdata && (
              <Text className="text-black font-semibold text-xl">
                {userdata.userdata.name}
              </Text>
            )}
            <Text className="text-red-400 font-semibold">My Account</Text>
          </View>
        </View>

        {/* Messages Row */}
        <View className="py-1 bg-slate-200 w-full p-1"></View>
      </View>

      <DrawerItemList {...props} />

      {/* Make money */}
      <View className="w-full px-4">
        <Pressable
          className="flex-row items-center space-x-1"
          onPress={handleLogout}
        >
          <Icon name="logout" color="grey" size={15} />
          <Text className="text-slate-600 font-semibold text-sm">Logout</Text>
        </Pressable>
      </View>
    </DrawerContentScrollView>
  );
};

export default DrawerMenu;
