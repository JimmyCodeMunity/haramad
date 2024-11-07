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
import React, { useContext, useEffect, useState } from "react";
import MapView, { PROVIDER_GOOGLE, PROVIDER_DEFAULT, Marker } from "react-native-maps";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as Location from "expo-location";
import axios from "axios";
import { io } from "socket.io-client";
import { PaperProvider } from "react-native-paper";
import { BASE_URL ,SOCKET_URL} from "../config";
import { AuthContext } from "../context/AuthContext";
import { useSocketContext } from "../context/SocketContext";

const GOOGLE_MAPS_API_KEY = "AIzaSyDdUQ1EIQJB46n2RSusQro1qP3Pd4mGZcA";
// const socket = io.connect("https://charmed-dog-marble.glitch.me/");
// const socket = io.connect("http://192.168.0.100:8000");
// const socket = io.connect("http://192.168.1.18:8000");

// const socket = io.connect("https://api.haramad.co.ke");
const wh = Dimensions.get("window").height;

const HomeScreen = ({ navigation }) => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [drivers, setDrivers] = useState([]);
  // const [userdata,setMyUserdata] = useState([]);
  const {userdata} = useContext(AuthContext);
  const {socket} = useSocketContext();

  if(userdata){
    // console.log("profile info",userdata)
  }


  // Request user location permission
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
      setLoadingLocation(false);
    }
  };

  // Get drivers' locations
  const getDrivers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getonlinedrivers`);
      setDrivers(response.data);
      
    } catch (error) {
      console.log("Error getting drivers");
    }
  };

  if(drivers){
    // console.log("drivers found",drivers)
  }

  useEffect(() => {
    checkPermission();
    getLocation();
    getDrivers();
  }, []);


  // get new location changes
  useEffect(() => {
    const initializeSocket = () => {
      socket?.on("driver-location-changed", (driver) => {
        const { _id, location } = driver;
        if (location && location.coordinates) {
          getDrivers();
          // console.warn("a driver just moved")
          setDrivers((prevDrivers) => {
            const existingDriverIndex = prevDrivers.findIndex(d => d.id === _id);
            if (existingDriverIndex !== -1) {
              // Update existing driver location
              const updatedDrivers = [...prevDrivers];
              updatedDrivers[existingDriverIndex].location.coordinates = location.coordinates;
              return updatedDrivers;
            } else {
              // Add new driver if not found
              return [...prevDrivers, { id: _id, location }];
            }
          });
        }
      });
    };

    const initialize = async () => {
      const permissionGranted = await checkPermission();
      if (permissionGranted) {
        await getLocation();
        await getDrivers();
        initializeSocket();
      }
    };

    initialize();

    // Cleanup socket connection on unmount
    return () => {
      socket?.off("driver-location-changed");
    };
  }, []);

  return (
    <PaperProvider>
      <View className="bg-white flex-1">
        <MapView
          mapType={Platform.OS === "android" ? "mutedStandard" : "mutedStandard"}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
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
        >
          {
          drivers.map((driver)=>{
            return(
              <Marker
            key={driver._id} // Use a unique key for each driver
            coordinate={{
              latitude: driver.location.coordinates[1],
              longitude: driver.location.coordinates[0],
            }}
            title={driver.name} // Use driver's name as the title
            description={`Driver ID: ${driver._id}`} // Description can be customized
          >
            <Image
              source={require("../assets/car.png")} // Use a custom image for driver markers
              style={{ width: 30, height: 30 }} // Customize marker size
            />
          </Marker>
            )
          })
        }

        </MapView>

        {loadingLocation && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Fetching current location...</Text>
          </View>
        )}

        {/* Render driver markers */}
        {/*  */}

        <TouchableOpacity
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
          <View className="p-1 text-center justify-center items-center w-full">
            <Text className="text-white font-semibold text-lg">Ride Today!!</Text>
          </View>
          <View className="h-full rounded-t-3xl bottom-0 w-full px-5 bg-white py-4 shadow shadow-xl items-center">
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
            <View className="w-full py-8 space-y-3">
              <Pressable
                onPress={() => navigation.navigate("destinationsearch", { locationname: locationName, initialLocation: currentLocation })}
                className="w-full flex-row items-center space-x-5"
              >
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
                onPress={() => navigation.navigate("destinationsearch", { initialLocation: currentLocation })}
                className="w-full flex-row items-center space-x-5"
              >
                <View className="h-12 w-full flex-row space-x-4 rounded-full bg-slate-200 items-center px-4">
                  <Icon name="magnify" size={30} color="gray" />
                  <Text className="text-slate-400 text-xl">To ?</Text>
                </View>
              </Pressable>
            </View>
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
