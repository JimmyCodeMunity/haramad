import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useContext, useLayoutEffect } from "react";
import { useSocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { Image } from "react-native";

const TripDetails = ({ navigation, route }) => {
  const { userdata } = useContext(AuthContext);
  const { socket } = useSocketContext();
  const { trip } = route.params;

  useLayoutEffect(() => {
    return navigation.setOptions({
      headerTitle: trip?.date,
      headerLeft: () => {
        return (
          <View className="flex-row items-center justify-between space-x-5 px-2">
            <View>
              <Pressable onPress={() => navigation.goBack()}>
                <Icon name="chevron-left" size={30} color="black" />
              </Pressable>
            </View>
            {/* <View>
              <Text className="text-xl font-semibold">Trip Details</Text>
            </View> */}
          </View>
        );
      },
    });
  });
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView vertical={true}>
        <View className="flex-1 bg-white px-4 py-5 space-y-8">
          <View className="bg-slate-200 h-40 w-full rounded-xl overflow-hidden">
            <MapView
              provider={
                Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
              }
              className="h-full w-full"
              mapType="mutedStandard"
              zoomEnabled={true}
            >
              <Marker
                key={trip._id}
                coordinate={{
                  latitude: trip.startLocation.coordinates[1],
                  longitude: trip.startLocation.coordinates[0],
                }}
                title="A"
              >
                <Image
                  source={require("../assets/car.png")}
                  style={{ width: 30, height: 30 }}
                />
              </Marker>
            </MapView>
          </View>

          <View className="flex-row items-center space-x-5">
            <View>
              <Image
                source={require("../assets/startend.png")}
                className="h-12 w-12"
              />
            </View>
            <View className="flex-col space-y-4">
              <Text className="text-md text-slate-600 font-semibold">
                {trip?.from}
              </Text>
              <Text className="text-md text-slate-600 font-semibold">
                {trip?.to}
              </Text>
            </View>
          </View>

          <View className="flex-row w-full justify-between items-center">
            <View className="flex-row items-center space-x-4">
              <View>
                <Icon size={40} color="gray" name="watch" />
              </View>
              <View>
                <Text className="text-lg text-slate-500">Duration</Text>
                <Text className="text-xl text-slate-600 font-bold">
                  {parseInt(trip?.timeEstimate)} mins
                </Text>
              </View>
            </View>
            <View className="flex-row items-center space-x-4">
              <View>
                <Icon size={40} color="gray" name="road" />
              </View>
              <View>
                <Text className="text-lg text-slate-500">Distance</Text>
                <Text className="text-xl text-slate-600 font-bold">
                  {parseInt(trip?.distance)} Km
                </Text>
              </View>
            </View>
          </View>

          {/* driver info */}
          <View className="w-full flex-row space-x-4 py-5">
            <View>
              <Image
                source={require("../assets/icon.png")}
                className="border h-12 w-12 rounded-full border-1 border-slate-500"
              />
            </View>
            <View className="space-y-1">
              <Text className="text-xl">{trip?.driverId?.name}</Text>
              <Text className="text-md text-slate-500">
                {trip?.driverId?.carmodel},{trip?.driverId?.registration}
              </Text>
            </View>
          </View>

          {/* fare details */}
          <View className="space-y-3 w-full">
            <Text className="text-xl font-semibold">You Paid</Text>

            <View className="flex-row justify-between items-center">
              <Text className="text-2xl text-slate-500 font-bold">Fare</Text>
              <Text className="text-2xl text-black font-bold">
                ${trip?.price}
              </Text>
            </View>
            <View className="flex-row justify-between items-center">
              <Text className="text-2xl text-slate-500 font-bold">
                Total Paid
              </Text>
              <Text className="text-2xl text-black font-bold">
                ${trip?.price}
              </Text>
            </View>

            <View className="w-full justify-center items-center py-5">
              <TouchableOpacity className="h-12 w-full bg-red-500 rounded-xl justify-center items-center">
                <Text className="text-white text-xl">Delete From History</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TripDetails;

const styles = StyleSheet.create({});
