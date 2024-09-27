import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
  Pressable,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, { useRef, useEffect, useState } from "react";
import RouteMap from "../components/RouteMap";
import { StatusBar } from "expo-status-bar";
import TripPath from "../components/TripPath";
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

// const socket = io.connect("https://sockettestserver.vercel.app/");
// const socket = io.connect("https://charmed-dog-marble.glitch.me/");
const socket = io.connect("http://192.168.1.130:8000");

const SearchResultScreen = ({ navigation, route }) => {
  const { origin, destination } = route.params;
  // console.warn("origin", origin, "destination", destination);

  const mapRef = useRef(null);

  const originloc = {
    latitude: origin.details.geometry.location.lat,
    longitude: origin.details.geometry.location.lng,
  };

  const destinationloc = {
    latitude: destination.details.geometry.location.lat,
    longitude: destination.details.geometry.location.lng,
  };

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

  console.log("my origin", originloc);
  console.log("my destination", destinationloc);



  const [driverLocation, setDriverLocation] = useState(null);
  const [tripDetails, setTripDetails] = useState(null);

  const findDriver = async()=>{
    socket.emit('find-driver', {
      userId: '66ee82d9fdf3ec1e60534927',
      startLocation: originloc,
      destinationLocation:destinationloc,
    });

    socket.on('trip-accepted', (trip) => {
      setTripDetails(trip);
      socket.on('driver-location-changed', (location) => {
        setDriverLocation(location);
      });
    });

    return () => {
      socket.off('trip-accepted');
      socket.off('driver-location-changed');
    };

  }

  useEffect(() => {
    // Request a driver
    
  }, []);


  const [message,setMessage] = useState("Jimmy")
  const sendMessage = () => {
    socket.emit("send_message", { message });
    // socket.emit("send_message", { message, room });
  };
  useEffect(() => {
    if (socket) {
      console.log("Socket connected");
    } else {
      console.log("Socket failed to connect");
    }
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

      <View className="w-full relative" style={{ height: wh - 300 }}>
        <MapView
          ref={mapRef}
          provider={
            Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT
          }
          className="h-full w-full"
          showsUserLocation={true}
          mapType="mutedStandard"
        >
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
      <ScrollView className="w-full pb-10 bg-white rounded-t-2xl h-full px-4 my-10 space-y-5">
        <View className="flex-row w-full justify-between px-5 py-5 border border-red-300 rounded-xl border-2">
          <View className="flex-row items-center space-x-4">
            <View>
              <Image
                source={require("../assets/images/top-UberX.png")}
                className="h-10 w-10"
              />
            </View>
            <View>
              <Text className="font-bold">HS</Text>
              <View className="flex-row items-center space-x-2">
                <Text className="font-normal text-slate-400">2 min</Text>
                <Icon name="seat" size={25} color="gray" />
              </View>
            </View>
          </View>
          <View>
            <Text className="font-bold text-xl">Ksh.700</Text>
          </View>
        </View>
        <View className="flex-row w-full justify-between px-5 py-5 border border-slate-400 rounded-xl border-2">
          <View className="flex-row items-center space-x-4">
            <View>
              <Image
                source={require("../assets/images/top-UberX.png")}
                className="h-10 w-10"
              />
            </View>
            <View>
              <Text className="font-bold">HS Boda</Text>
              <View className="flex-row items-center space-x-2">
                <Text className="font-normal text-slate-400">6 min</Text>
                <Icon name="seat" size={25} color="gray" />
              </View>
            </View>
          </View>
          <View>
            <Text className="font-bold text-xl">Ksh.700</Text>
          </View>
        </View>


        <View className="w-full py-5 justify-center items-center">
        <TouchableOpacity onPress={findDriver} className="bg-red-400 h-12 w-80 rounded-xl justify-center items-center">
          <Text className="text-white text-xl font-semibold">Confirm Ride</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      
    </View>
  );
};

export default SearchResultScreen;

const styles = StyleSheet.create({});
