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

// const socket = io.connect("http://192.168.0.100:8000");
// const socket = io.connect("http://192.168.1.18:8000");
// const socket = io.connect("https://api.haramad.co.ke");
const socket = io.connect(SOCKET_URL);

const SearchResultScreen = ({ navigation, route }) => {
  const { origin, destination } = route.params;
  const [drivers, setDrivers] = useState([]);
  const [finding, setFinding] = useState(true);
  const { userdata } = useContext(AuthContext);
  const [paymethod, setPaymethod] = useState(null);

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
  console.log("user coming to",origin?.data?.description)
  console.log("user going to",destination?.data?.description)

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

  console.log("destinationplace",originloc)
  console.log("originplace",destinationloc)

  const [driverLocation, setDriverLocation] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);
  const [found, setFound] = useState([]);
  const [looking, setLooking] = useState(false);

  const findDriver = async () => {
    setLooking(true);
    socket.emit("find-driver", {
      userId: userdata?.userdata?._id,
      startLocation: originloc,
      destinationLocation: destinationloc,
      from:origin?.data?.description,
      to:destination?.data?.description
    });

    socket.on("trip-accepted", (trip) => {
      console.log("trip created", trip);
      setFound([trip]);
      setFinding(false);
      setTripDetails(trip);
      socket.on("driver-location-changed", (location) => {
        setDriverLocation(location);
      });
    });

    socket.on("trip-acceptedbydriver", (trip) => {
      console.log(trip);
      navigation.navigate("ridedecision",{trip:trip})

      // Alert.alert("Trip Accepted", `Driver is on the way: ${trip._id}`);
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

  useEffect(() => {
    const initializeSocket = () => {
      socket.on("driver-location-changed", (driver) => {
        const { _id, location } = driver;
        if (location && location.coordinates) {
          setDrivers((prevDrivers) => {
            const existingDriverIndex = prevDrivers.findIndex(
              (d) => d.id === _id
            );
            if (existingDriverIndex !== -1) {
              const updatedDrivers = [...prevDrivers];
              updatedDrivers[existingDriverIndex].location.coordinates =
                location.coordinates;
              return updatedDrivers;
            } else {
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

    return () => {
      socket.off("driver-location-changed");
    };
  }, []);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />

      <View className="absolute z-[20] mt-12 w-full px-8 top-10 justify-center items-center">
        <View className="bg-white px-4 flex-row items-center justify-between rounded-3xl w-full h-12">
          <View>
            <Icon name="chevron-left" color="black" size={30} />
          </View>
          <View>
            <Pressable
              onPress={() => navigation.goBack()}
              className="bg-slate-300 h-8 rounded-xl w-60 justify-center items-center"
            >
              <Text>{destination.data.description.slice(0, 30) + "..."}</Text>
            </Pressable>
          </View>
          <View></View>
        </View>
      </View>

      <View
        className="w-full relative"
        style={{ height: looking ? wh - 300 : wh - 300 }}
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

      {!looking && (
        <View className="w-full py-5 justify-center items-center">
          <View className="w-full my-3 px-4 justify-center items-center space-y-3">
            <Pressable
              onPress={()=>setPaymethod("cash")}
              className={`w-full ${paymethod==="cash" ? 'border border-green-500 border-1':''} p-2 rounded-xl flex-row justify-between items-center`}
            >
              <Icon name="cash" size={40}/>
              <Text className="text-xl font-semibold text-slate-500">
                Cash
              </Text>
            </Pressable>
            <Pressable
              onPress={()=>setPaymethod("mpesa")}
              className={`w-full ${paymethod==="mpesa" ? 'border border-green-500 border-1':''} p-2 rounded-xl flex-row justify-between items-center`}
            >
              <Image source={require('../assets/mpesa.png')} className="h-10 w-24 rounded-full"/>
              <Text className="text-xl font-semibold text-slate-500">
                M-Pesa
              </Text>
            </Pressable>
            <Pressable
              onPress={()=>setPaymethod("visa")}
              className={`w-full ${paymethod==="visa" ? 'border rounded-2xl p-2 border-blue-500 border-1':''} flex-row justify-between items-center`}
            >
             <Image source={require('../assets/visa.png')} className="h-10 w-14 rounded-full"/>
              <Text className="text-xl font-semibold text-slate-500">
                Card
              </Text>
            </Pressable>
          </View>
          {paymethod === null ? (
            <TouchableOpacity className="bg-red-200 h-12 w-80 rounded-xl justify-center items-center">
              <Text className="text-white text-xl font-semibold">
                Confirm Ride
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={findDriver}
              className="bg-red-400 h-12 w-80 rounded-xl justify-center items-center"
            >
              <Text className="text-white text-xl font-semibold">
                Confirm Ride
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {looking && (
        <View className="w-full py-5 justify-center items-center">
          {found.length > 0 && (
            <ScrollView>
              {found.map((trip, index) => (
                <View
                  key={index}
                  className="w-full py-5 items-center justify-center px-5"
                >
                  <View className="rounded-full border border-slate-500 h-16 w-16 border-slate-400"></View>
                  <Text className="text-black text-xl font-semibold text-center">
                    Driver Found
                  </Text>
                  <Text className="text-black text-xl font-semibold text-center">
                    Jimmy
                  </Text>
                  <Text className="text-slate-500">
                    Awaiting driver to accept....
                  </Text>
                  <ActivityIndicator size="large" />

                  <TouchableOpacity
                  onPress={()=>setLooking(false)}
                   className="text-white h-12 rounded-lg w-60 bg-red-500 justify-center items-center">
                    <Text className="text-white">Cancel Ride</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}
    </View>
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
