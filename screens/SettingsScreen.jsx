import { Pressable, SafeAreaView, StyleSheet, Text, View } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "../context/AuthContext";

const SettingsScreen = () => {
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
    <SafeAreaView className="flex-1">
      <View className="justify-center items-center space-y-1">
        <View className="rounded-full bg-slate-200 h-16 w-16 justify-center items-center">
        <Icon name="account" color="gray" size={30} />
        </View>

        {
          userdata &&
        
          <Text className="text-2xl text-black font-semibold">{userdata.userdata.name}</Text>
        }
        <View className="flex-row items-center space-x-1">
          <Icon name="star" color="green" size={25} />
          <Text className="text-lg font-semibold">5.00</Text>
          <Text className="text-lg text-slate-500 font-normal">Rating</Text>
        </View>
      </View>

      <View className="w-full px-4 bg-white rounded-xl my-12">
        <Pressable className="flex-row items-center justify-between border border-r-0 border-l-0 border-t-0 border-slate-300 py-3">
          <View className="flex-row space-x-2">
            <Icon name="map-marker" color="gray" size={25} />
            <Text className="text-slate-700 text-lg">Location</Text>
          </View>
          <View>
            <Icon name="chevron-right" color="grey" size={25} />
          </View>
        </Pressable>
        <Pressable className="flex-row items-center justify-between py-3">
          <View className="flex-row space-x-2">
            <Icon name="account" color="gray" size={25} />
            <Text className="text-slate-700 text-lg">About</Text>
          </View>
          <View>
            <Icon name="chevron-right" color="grey" size={25} />
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({});
