import {
  StyleSheet,
  Text,
  View,
  Platform,
  Dimensions,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  TouchableOpacity,
} from "react-native";
import React, { useEffect, useState } from "react";
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location"; // Import Location API from Expo
import axios from "axios"; // Import Axios for API requests
//   import { GGOGLE_MAPS_API_KEY } from "../constants";
const GOOGLE_MAPS_API_KEY = "AIzaSyDdUQ1EIQJB46n2RSusQro1qP3Pd4mGZcA";
import { io } from "socket.io-client";
import { PaperProvider, Modal, Portal, Button } from "react-native-paper";
import { BASE_URL } from "../config";
// const socket = io.connect("https://sockettestserver.vercel.app/");
const socket = io.connect("https://charmed-dog-marble.glitch.me/");
// const socket = io.connect("http://192.168.1.130:5000");

const wh = Dimensions.get("window").height;

const HomeScreen = ({ navigation }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);

  // handle modal

  // request
  const [message, setMessage] = useState("");
  const [messageReceived, setMessageReceived] = useState("");

  const [userid, setUserid] = useState("");

  // Add your Google Maps API key here

  const checkPermission = async () => {
    const hasPermission = await Location.requestForegroundPermissionsAsync();
    if (hasPermission.status === "granted") {
      return true;
    }
    return false;
  };

  const getLocation = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;

      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync();

      setCurrentLocation({ latitude, longitude });
      getLocationName(latitude, longitude);
    } catch (error) {
      console.error(error);
    }
  };

  // Get location name using Google Maps Reverse Geocoding API
  const getLocationName = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
    //   console.log("response", response);

      if (response.data.results.length > 0) {
        const address = response.data.results[0].formatted_address;
        setLocationName(address);
      } else {
        setLocationName("Unknown Location");
      }
    } catch (error) {
      console.error("Error fetching location name:", error);
      setLocationName("Error fetching location");
    } finally {
      setLoadingLocation(false); // Stop the loader
    }
  };

  useEffect(() => {
    checkPermission();
    getLocation();
  }, []);

  // Toggle online/offline

//   console.log("current", currentLocation);


const getDrivers = async()=>{
  try {
    const response = await axios.get(`${BASE_URL}/getonlinedrivers`);
    console.log("drivers", response.data);
    
  } catch (error) {
    console.log("error getting drivers")
    
  }
}

useEffect(()=>{
  getDrivers()
},[])

  return (
    <PaperProvider>
      {/* modal */}
      {/* <Portal className="bg-white">
          <Modal
            visible={visible}
            className="justify-center px-5"
            onDismiss={hideModal}
            contentContainerStyle={containerStyle}
          >
            <View className="w-full space-y-3 justify-center items-center">
              <Image
                source={require("../assets/taxi.png")}
                className="h-32 w-32 object-cover"
              />
              <Text className="text-slate-500">
                You have a new ride request from {userid}
              </Text>
  
              <TouchableOpacity className="bg-black h-10 w-60 justify-center items-center rounded-xl">
                <Text className="text-white text-lg">Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => hideModal()}
                className="bg-red-500 h-10 w-60 justify-center items-center rounded-xl"
              >
                <Text className="text-white text-lg">Decline</Text>
              </TouchableOpacity>
            </View>
          </Modal>
        </Portal> */}

      {/* modal end */}
      <View className="bg-white flex-1">
        <MapView
          mapType={Platform.OS == "android" ? "none" : "mutedStandard"}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          className="w-full"
          style={{ height: wh - 300 }}
          showsUserLocation={true}
          followsUserLocation={true}
          showsBuildings={true}
          initialRegion={{
            latitude: currentLocation?.latitude || 28.450627,
            longitude: currentLocation?.longitude || -16.263045,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
          zoomEnabled={true}
        />

        {/* Loader for fetching current location */}
        {loadingLocation && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Fetching current location...</Text>
          </View>
        )}

        {/* Location Name */}
        {/* {!loadingLocation && (
          <View className="absolute top-10 w-full justify-center items-center">
            <Text className="text-lg font-bold">
              {locationName || "Fetching location..."}
            </Text>
          </View>
        )} */}

        <TouchableOpacity
          // onPress={goOnline}
          onPress={() => navigation.openDrawer()}
          className="top-16 left-5 absolute rounded-full bg-white justify-center items-center h-12 w-12"
        >
          <Icon name="menu" color="black" size={30} />
        </TouchableOpacity>
        <Pressable className="top-16 right-5 absolute rounded-full bg-white justify-center items-center h-12 w-12">
          <Icon name="share" color="black" size={25} />
        </Pressable>

        {/* Online/Offline Status */}
        <View className="bg-black rounded-t-3xl">
            <View className=" p-1 text-center justify-center items-center w-full">
                <Text className="text-white font-semibold text-lg">Ride Today!!</Text>
            </View>
        <View className="h-full rounded-t-3xl bottom-0 w-full px-5 bg-white py-4 shadow shadow-xl items-center">
          {/* types */}
          <View className="flex-row items-center justify-between w-full space-x-4">
            <View className="w-[45%] bg-slate-200 rounded-xl justify-center items-center">
              <Image
                className="w-10 h-10 object-cover"
                source={require("../assets/car.png")}
              />
              <Text className="text-xl">Ride</Text>
            </View>
            <View className="w-[45%] bg-slate-200 rounded-xl justify-center items-center">
              <Image
                className="h-10 w-10 object-cover"
                source={require("../assets/motorbike.png")}
              />
              <Text className="text-xl">Boda</Text>
            </View>
          </View>
          {/* end types */}

          {/* start */}

          <View className="w-full py-8 space-y-8">
            <Pressable
            onPress={()=>navigation.navigate("destinationsearch",{locationname:locationName,initialLocation:currentLocation})}
            className="w-full flex-row items-center space-x-5">
              <View>
                <Image
                  className="h-10 w-10"
                  source={require("../assets/crosshair.png")}
                />
              </View>
              <View>
                <Text className="text-slate-500">{locationName}</Text>
              </View>
            </Pressable>
            <Pressable
            onPress={()=>navigation.navigate("destinationsearch",{initialLocation:currentLocation})}
            className="w-full flex-row items-center space-x-5">
              <View className="h-12 w-full flex-row space-x-4 rounded-md bg-slate-200 items-center px-4">
                <Icon name="magnify" size={30} color="gray" />
                <Text className="text-slate-400 text-xl">To ?</Text>
              </View>
            </Pressable>
          </View>

          {/* end */}
        </View>
        </View>
      </View>
    </PaperProvider>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  loaderContainer: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
    justifyContent: "center",
  },
});
