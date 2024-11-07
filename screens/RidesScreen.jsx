import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { BASE_URL } from "../config";
import axios from "axios";
import { format } from "date-fns";

const RidesScreen = ({ navigation, route }) => {
  const { userdata } = useContext(AuthContext);
  const { socket } = useSocketContext();
  const userId = userdata?.userdata?._id;
  const [loading, setLoading] = useState(false);

  const [rides, setRides] = useState([]);

  const getRides = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/usertrips/${userId}`);
      const gottrip = response.data;
      setRides(gottrip);
      setLoading(false);
      // console.log("rides collected", gottrip);
    } catch (error) {
      console.log("Error getting rides");
      setLoading(false);
    }
  };

  useEffect(() => {
    getRides();
  }, []);

  useLayoutEffect(() => {
    return navigation.setOptions({
      headerTitle: "Rides",
      headerLeft: () => {
        return (
          <View className="flex-row items-center justify-between space-x-5 px-2">
            <View>
              <Pressable onPress={() => navigation.goBack()}>
                <Icon name="chevron-left" size={30} color="black" />
              </Pressable>
            </View>
            <View>
              <Text className="text-xl font-semibold">Rides</Text>
            </View>
          </View>
        );
      },
    });
  });

  const DATA = [
    {
      id: "bd7acbea-c1b1-46c2-aed5-3ad53abb28ba",
      from: "Nairobi",
      to: "Kiambu",
      price: "300",
      date: "13 Oct at 17:51",
    },
    {
      id: "2",
      from: "Juja",
      to: "Junkyard",
      price: "340",
      date: "17 Oct at 17:51",
    },
    {
      id: "3",
      from: "Hazina",
      to: "Mwendas",
      price: "600",
      date: "5 Oct at 17:51",
    },
  ];

  const Item = ({ myitem }) => (
    <Pressable
      onPress={() => navigation.navigate("tripdetails", { trip: myitem })}
      className="w-full px-4 h-32 rounded-md bg-white space-y-2 border items-center border-t-0 py-5 border-[0.3] border-slate-300"
    >
      <View className="w-full px-4 flex-row justify-between items-center">
        <View>
          <Text className="text-xl font-semibold">{format(new Date(myitem?.createdAt),"dd MMM 'at' hh:mm:a")}</Text>
        </View>
        <View>
          <Text className="text-xl font-semibold">USD {myitem?.price}</Text>
          <Text className="text-sm text-green-400">{myitem?.status}</Text>
        </View>
      </View>
      <View className="flex-row justify-between items-center w-full px-4">
        <View className="flex-row items-center space-x-3">
          <View>
            <Image
              className="h-12 w-12"
              source={require("../assets/startend.png")}
            />
          </View>
          <View className="space-y-3">
            <Text className="text-slate-600 font-semibold text-md">
              {myitem.from}
            </Text>
            <Text className="text-slate-600 font-semibold text-md">
              {myitem.to}
            </Text>
          </View>
        </View>
        <View>
          <Icon name="chevron-right" color="gray" size={30} />
        </View>
      </View>
    </Pressable>
  );
  return (
    <SafeAreaProvider>
      <SafeAreaView className="w-full flex-1">
        {rides <= 0 ? (
          <>
            <View className="w-full justify-center items-center">
              <Text>No rides yet</Text>
            </View>
          </>
        ) : (
          <>
            
            <FlatList
              data={rides}
              renderItem={({ item }) => <Item myitem={item} />}
              keyExtractor={(item) => item.id}
            />
            {loading && (
              <View className="w-full justify-center items-center">
                <Text>Loading...</Text>
              </View>
            )}
          </>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default RidesScreen;

const styles = StyleSheet.create({});
