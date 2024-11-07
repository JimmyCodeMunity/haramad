import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Dimensions,
  Platform,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { BASE_URL, SOCKET_URL } from "../config";
import { io } from "socket.io-client";
import axios from "axios";
import { Image } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, PROVIDER_GOOGLE } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import { useSocketContext } from "../context/SocketContext";


const GOOGLE_MAPS_API_KEY = "AIzaSyDdUQ1EIQJB46n2RSusQro1qP3Pd4mGZcA"; // Make sure you replace it with a valid API Key
const { height: screenHeight } = Dimensions.get("window");

const RideDecideScreen = ({ navigation, route }) => {
  const { trip } = route.params;
  const [driverdata, setDriverdata] = useState({});
  const [loading, setLoading] = useState(true);
  const [driverphone, setDriverphone] = useState("");
  const [carmodel, setCarmodel] = useState("");
  const [registration, setRegistration] = useState("");
  const mapRef = useRef(null);
  const {socket} = useSocketContext();

  const drop = trip.to;
  const pickup = trip.from;

  // Fetch driver info from the server
  const getDriverInfo = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/driverinfo/${trip.driverId}`
      );
      const dataloaded = response.data;
      setDriverdata(dataloaded);
      setDriverphone(dataloaded.driver.phone);
      setCarmodel(dataloaded.driver.carmodel);
      setRegistration(dataloaded.driver.registration);
      setLoading(false);
    } catch (error) {
      console.log("error getting driver", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getDriverInfo();
  }, [trip]);

  // Set the origin and destination for MapView
  const originloc = driverdata?.driver?.location?.coordinates
    ? {
        latitude: driverdata?.driver?.location?.coordinates[1],
        longitude: driverdata?.driver?.location?.coordinates[0],
      }
    : null;

  const destinationloc = trip?.destinationLocation?.coordinates
    ? {
        latitude: trip.destinationLocation.coordinates[0],
        longitude: trip.destinationLocation.coordinates[1],
      }
    : null;

  // Automatically zoom and focus on the origin and destination when the data is ready
  useEffect(() => {
    if (mapRef.current && originloc && destinationloc) {
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

  useEffect(() => {
    socket?.on("trip-has-started", (trip) => {
      console.log(trip);
      navigation.navigate("ridedecision", { trip: trip });
    });


    socket?.on("please-pay",(mytrip)=>{
      // console.log("paying for trip",mytrip)
      // Alert("please pay")
      navigation.navigate("payment",{trip:mytrip})
    })

    return () => {
      socket.off("trip-has-started");
      socket.off("please-pay");
    };
  }, []);

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        mapType={Platform.OS === "android" ? "mutedStandard" : "mutedStandard"}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        style={styles.map}
        showsUserLocation={true}
        initialRegion={{
          latitude: originloc?.latitude || 0,
          longitude: originloc?.longitude || 0,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Driver Location Marker */}
        {originloc && (
          <Marker coordinate={originloc} title="Pickup" description="Driver's Current Location">
            <Image source={require("../assets/loc1.png")} style={styles.markerIcon} />
          </Marker>
        )}

        {/* Destination Marker */}
        {destinationloc && (
          <Marker coordinate={destinationloc} title="Drop-off" description="Destination">
            <Image source={require("../assets/loc2.png")} style={styles.markerIcon} />
          </Marker>
        )}

        {/* Draw the route between driver and destination */}
        {originloc && destinationloc && (
          <MapViewDirections
            origin={originloc}
            destination={destinationloc}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={5}
            strokeColor="black"
          />
        )}
      </MapView>
      <View className="absolute top-10 justify-center items-center w-full">
        <View className="bg-black h-12 w-40 rounded-full justify-center items-center">
          <Text className="text-white font-bold text-xl">$ {trip.price}</Text>
        </View>
      </View>

      {/* Bottom Sheet View */}
      <View style={styles.bottomSheet}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <View>
            <Text className="font-semibold text-slate-900 text-xl">
              {driverdata.driver?.name} is driving to destination...
            </Text>
            <View className="space-y-2">
              <View className="flex-row space-x-2 items-center">
                <View className="rounded-full h-4 w-4 bg-slate-600"></View>
                <View>
                  <Text className="text-lg text-slate-600">{pickup}</Text>
                </View>
              </View>
              <View className="flex-row space-x-2 items-center">
                <View className="h-4 w-4 bg-slate-600"></View>
                <View>
                  <Text className="text-lg text-slate-600">{drop}</Text>
                </View>
              </View>
            </View>
            <View className="h-16 my-2 bg-slate-200 space-x-4 rounded-md px-4 flex-row items-center">
              <View>
                <Image
                  source={require("../assets/car.png")}
                  style={styles.markerIcon}
                />
              </View>
              <View>
                <Text className="text-slate-600 text-xl font-semibold">
                  {carmodel}
                </Text>
                <Text className="text-black text-xl font-semibold">
                  {registration}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* <TouchableOpacity
          className=""
          style={styles.messageButton}
          onPress={() =>
            Alert.alert("Message Driver", "This feature is not implemented yet")
          }
        >
          <Text style={styles.messageButtonText}>Message {driverdata.driver?.name}</Text>
        </TouchableOpacity> */}

        {/* <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel Ride</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  );
};

export default RideDecideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  map: {
    flex: 1,
  },
  markerIcon: {
    width: 40,
    height: 40,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  messageButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 10,
  },
  messageButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#f44336",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
