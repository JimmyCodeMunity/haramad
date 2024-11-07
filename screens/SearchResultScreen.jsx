import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useRef, useEffect, useState, useContext } from "react";
import RouteMap from "../components/RouteMap";
import { StatusBar } from "expo-status-bar";
import TripPath from "../components/TripPath";
import * as Location from "expo-location";
const wh = Dimensions.get("window").height;
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { Image } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const GOOGLE_MAPS_API_KEY = "AIzaSyDdUQ1EIQJB46n2RSusQro1qP3Pd4mGZcA";
import { io } from "socket.io-client";
import { BASE_URL, SOCKET_URL } from "../config";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { Alert } from "react-native";
import { useSocketContext } from "../context/SocketContext";
import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";
import { SafeAreaProvider } from "react-native-safe-area-context";

// const socket = io.connect("http://192.168.0.100:8000");
// const socket = io.connect("http://192.168.1.18:8000");
// const socket = io.connect("https://api.haramad.co.ke");
// const socket = io.connect(SOCKET_URL);

const SearchResultScreen = ({ navigation, route }) => {
  const { origin, destination } = route.params;
  const [drivers, setDrivers] = useState([]);
  const [finding, setFinding] = useState(true);
  const { userdata } = useContext(AuthContext);
  const [paymethod, setPaymethod] = useState(null);
  const { socket } = useSocketContext();

  const mapRef = useRef(null);

  const originloc = {
    latitude: origin.details.geometry.location.lat,
    longitude: origin.details.geometry.location.lng,
  };

  const destinationloc = {
    latitude: destination.details.geometry.location.lat,
    longitude: destination.details.geometry.location.lng,
  };

  // const originname = destination.description;
  // console.log("user coming to",origin?.data?.description)
  // console.log("user going to",destination?.data?.description)

  // Zoom and focus to the selected origin and destination coordinates
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates([originloc, destinationloc], {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  }, [originloc, destinationloc]);

  // console.log("destinationplace",originloc)
  // console.log("originplace",destinationloc)

  const [driverLocation, setDriverLocation] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [found, setFound] = useState([]);
  const [driverFound, setDriverFound] = useState(false);
  const [looking, setLooking] = useState(false);
  const userId = userdata?.userdata?._id;

  const findDriver = async () => {
    setLooking(true); // Start looking for a driver and show loader
    socket.emit("find-driver", {
      userId: userId,
      startLocation: originloc,
      destinationLocation: destinationloc,
      from: origin?.data?.description,
      to: destination?.data?.description,
    });

    Toast.show({
      type: ALERT_TYPE.SUCCESS,
      title: "Looking for drivers",
      textBody: "Please wait while we find you the best driver....",
    });

    // console.log("driver from trip",trip?.driverId)

    socket?.on("trip-accepted", (trip) => {
      // console.log("trip created", trip);
      setFound([trip]); // Set the found trip details
      setFinding(false); // Stop finding status
      setLooking(false); // Stop looking loader
      setTripDetails(trip); // Store the trip details
      setDriverFound(true);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Driver found",
        textBody: "Awaiting driver to accept request.",
      });
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Driver found",
        textBody: "Awaiting drivers to accept request.",
      });

      socket?.on("driver-declined-trip", async (trip) => {
        Toast.show({
          type: ALERT_TYPE.DANGER,
          title: "Driver rejected",
          textBody: "Driver rejected your request. Please try again later.",
        });
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: "Driver rejected",
          textBody: "Driver rejected your request. Please try again later.",
          button: "Try again",
        });
        setFound([]);
      });

      socket?.on("driver-location-changed", (location) => {
        setDriverLocation(location); // Update driver location if changed
      });
    });

    return () => {
      socket.off("trip-accepted");
      socket.off("driver-location-changed");
    };
  };

  const findDrivers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getonlinedrivers`);
      setDrivers(response.data);
    } catch (error) {
      console.log("error getting driver", error);
    }
  };

  useEffect(() => {
    getDrivers();
  }, []);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);

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

  const getDrivers = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getonlinedrivers`);
      setDrivers(response.data);
    } catch (error) {
      console.log("Error getting drivers", error);
    }
  };

  useEffect(() => {
    checkPermission();
    getLocation();
    getDrivers();
  }, []);

  const [driving, setDriving] = useState(false);

  useEffect(() => {
    // Initialize socket events
    const initializeSocket = () => {
      socket?.on("connect", () => {
        console.log("Connected to socket server with socket ID:", socket.id);
      });

      // Handle trip-has-started event
      socket?.on("trip-has-started", (trip) => {
        console.log("Trip started:", trip);
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: "Trip has Started",
          textBody: "Haramad wishes you a Safe Journey",
        });

        try {
          // Ensure the trip data is valid before navigating
          if (trip && trip._id) {
            setTripDetails(trip); // Store the trip details
            navigation.navigate("ridedecision", { trip: trip }); // Navigate to the ridedecision screen
          } else {
            console.error("Invalid trip data:", trip);
            Dialog.show({
              type: ALERT_TYPE.DANGER,
              title: "Error",
              textBody: "Failed to start the trip. Invalid trip data.",
              button: "Close",
            });
          }
        } catch (error) {
          console.error("Error navigating to ridedecision:", error);
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: "Error",
            textBody:
              "An error occurred while starting the trip. Please try again.",
            button: "Close",
          });
        }
      });

      socket?.on("driver-is-waiting", (trip) => {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Driver has Arrived",
          textBody: "Your driver is here to pick you up",
          button: "close",
        });
      });

      socket?.on("driving-to-destination", (trip) => {
        console.log("trip", trip);
        setDriving(true);
        setTripDetails(trip);
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

    return () => {
      socket.off("trip-has-started");
      socket.off("driver-is-waiting");
      // socket.off("connect");
      socket.off("driving-to-destination");
    };
  }, []);

  const CancelRide = () => {
    setDriverFound(false)
    socket.emit("user-cancel-ride", { tripId: tripDetails?._id });
    // navigation.navigate("Home");
    Toast.show({
      type: ALERT_TYPE.WARNING,
      title: "Ride Cancelled",
      textBody: "You cancelled the ride.",
    });
    setDriving(false);
  };

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />

        <View
          className="w-full relative"
          style={{ height: driving ? wh - 450 : wh - 300 }}
        >
          <MapView
            ref={mapRef}
            provider={
              Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
            }
            className="h-full w-full"
            showsUserLocation={true}
            mapType="mutedStandard"
          >
            {drivers.map((driver) => {
              return (
                <Marker
                  key={driver._id}
                  coordinate={{
                    latitude: driver.location.coordinates[1],
                    longitude: driver.location.coordinates[0],
                  }}
                  title={driver.name}
                  description={`Driver ID: ${driver._id}`}
                >
                  <Image
                    source={require("../assets/car.png")}
                    style={{ width: 30, height: 30 }}
                  />
                </Marker>
              );
            })}

            <MapViewDirections
              origin={originloc}
              destination={destinationloc}
              apikey={GOOGLE_MAPS_API_KEY}
              strokeWidth={5}
              strokeColor="black"
            />
            {originloc?.latitude != null && (
              <Marker coordinate={originloc} anchor={{ x: 0.5, y: 0.5 }}>
                <Image
                  source={require("../assets/loc1.png")}
                  className="object-contain h-12 w-12"
                  style={styles.markerDestination}
                  resizeMode="cover"
                />
              </Marker>
            )}
            {destinationloc?.latitude != null && (
              <Marker coordinate={destinationloc} anchor={{ x: 0.5, y: 0.5 }}>
                <Image
                  source={require("../assets/loc2.png")}
                  className="object-contain h-12 w-12"
                  style={styles.markerOrigin2}
                  resizeMode="cover"
                />
              </Marker>
            )}
          </MapView>
        </View>

        {/* click to confirm ride request */}
        <View className="absolute top-10 flex-row w-full justify-between px-4 items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="bg-black h-12 w-12 rounded-full justify-center items-center"
          >
            <Icon name="arrow-left" size={30} color="white" />
          </Pressable>
          {driverFound && (
            <Pressable className="bg-black h-12 w-32 rounded-full justify-center items-center">
              <Text className="text-white text-xl">${tripDetails?.price}</Text>
            </Pressable>
          )}
          <Pressable></Pressable>
        </View>
        <View className="w-full justify-center items-center rounded-t-xl">
          <ScrollView className="h-full">
            {!driving && (
              <View className="bg-white flex-row space-x-4 w-full p-1 justify-center items-center rounded-t-xl">
                <Icon name="arrow-left" color="gray" size={25} />
                <Text className="text-sm text-slate-500">
                  {destination.data.description.slice(0, 30) + "..."}
                </Text>
              </View>
            )}
            {driving && (
              <View className="w-full rounded-t-xl bg-black p-3">
                <Text className="text-white">
                  {tripDetails?.driverId?.name} is on the way..
                </Text>
              </View>
            )}
            {driving && (
              <View className="w-full px-4">
                <Text className="text-xl font-bold ">
                  {tripDetails?.driverId?.name}
                </Text>
                <Text>{tripDetails?.driverId?.registration}</Text>
                <Text>{tripDetails?.driverId?.phone}</Text>
                <Text>{tripDetails?.driverId?.carmodel}</Text>
              </View>
            )}
            <View className="w-full py-5 space-y-5 px-4">
              <View className="flex-row space-x-4 bg-slate-200 p-2 rounded-full h-12 items-center">
                <View className="h-6 w-6 rounded-full bg-black"></View>
                <View className="">
                  <Text>{origin.data.description.slice(0, 30) + "..."}</Text>
                </View>
              </View>
              <View className="flex-row space-x-4 bg-slate-200 rounded-full items-center h-12 p-2">
                <View className="h-6 w-6 bg-black"></View>
                <View>
                  <Text>
                    {destination.data.description.slice(0, 30) + "..."}
                  </Text>
                </View>
              </View>
            </View>

            {driving ? (
              <View className="w-full justify-center items-center text-center">
                <View className="flex-row items-center justify-between w-full px-4">
                  <Text className="text-xl font-bold">
                    Distance: {tripDetails?.distance || "Loading..."} KM
                  </Text>
                  <Text className="font-bold text-lg">
                    Price: ${tripDetails?.price || "Loading..."}
                  </Text>
                </View>
                <View className="justify-center flex-row w-full space-x-8 items-center">
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Chat", { trip: tripDetails })
                    }
                    className="bg-green-400 h-12 w-12 rounded-full justify-center items-center"
                  >
                    <Icon name="chat" color="white" size={30} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("Chat", { trip: tripDetails })
                    }
                    className="bg-red-500 h-12 w-12 rounded-full justify-center items-center"
                  >
                    <Icon name="phone" color="white" size={30} />
                  </TouchableOpacity>
                </View>
                <View className="w-full items-center justify-center px-4 py-3">
                  <TouchableOpacity
                    onPress={CancelRide}
                    className="bg-black h-12 w-full rounded-xl justify-center items-center"
                  >
                    <Text className="text-white text-xl font-semibold">
                      Cancel Ride
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                {driverFound ? (
                  <View className="w-full justify-center items-center">
                    <Text className="text-slate-600 text-xl text-center">
                      Driver has been found awaiting driver to accept your
                      request
                    </Text>
                    <Pressable
                      className="h-12 w-96 rounded-xl justify-center items-center bg-red-400"
                      onPress={CancelRide}
                    >
                      <Text className="text-white text-xl">Cancel Ride</Text>
                    </Pressable>
                  </View>
                ) : (
                  <>
                    {looking ? (
                      <TouchableOpacity
                        // onPress={CancelRide}
                        onPress={findDriver}
                        className="bg-red-400 h-12 w-80 rounded-xl justify-center items-center"
                      >
                        <Text className="text-white text-xl font-semibold">
                          Finding Driver...
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        // onPress={CancelRide}
                        onPress={findDriver}
                        className="bg-red-400 h-12 w-80 rounded-xl justify-center items-center"
                      >
                        <Text className="text-white text-xl font-semibold">
                          Confirm Ride
                        </Text>
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaProvider>
  );
};

export default SearchResultScreen;

const styles = StyleSheet.create({
  markerOrigin2: {
    width: 40,
    height: 40,
  },
  markerDestination: {
    width: 40,
    height: 40,
  },
});
