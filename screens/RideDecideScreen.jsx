import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import { BASE_URL } from "../config";
import axios from "axios";
import { Image } from "react-native";

const RideDecideScreen = ({ navigation, route }) => {
  const { trip } = route.params;
  const [driverdata, setDriverdata] = useState([]);
  const [loading, setLoading] = useState(false);
  const [driverphone, setDriverphone] = useState("");
  const [carmodel, setCarmodel] = useState("");
  const [name, setName] = useState("");
  const [registration, setRegistration] = useState("");
  const drop = trip.to;
  const pickup = trip.from;
  // const [registration,setRegistration] = useState("");

  const getDriverInfo = async () => {
    setLoading(true);
    try {
      // console.log(BASE_URL);
      const response = await axios.get(
        `${BASE_URL}/driverinfo/${trip.driverId}`
      );
      const dataloaded = response.data;
      setDriverdata(dataloaded);
      console.log("driver collcted", dataloaded.driver.phone);
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
  return (
    <View className="flex-1 justify-center items-center">
      <View className="justify-center items-center w-full">
        <Image className="h-32 w-32" source={require("../assets/logo.png")} />
      </View>
      <View className="w-full px-4">
        {loading ? (
          <>
            <View className="justify-center items-center w-full">
              <Text>Please wait while we get user info...</Text>
              <ActivityIndicator size="large" color="red" />
            </View>
          </>
        ) : (
          <>
            <View className="text-center justify-center items-center">
              {/* <Text>{trip.driverId}</Text> */}
              <View className="w-full px-5 bg-white rounded-md py-3 px-4">
                <View className="flex-row justify-between items-center border border-t-0 border-l-0 border-r-0 border-slate-400 py-3">
                  <Text>Phone</Text>
                  <Text>{driverphone}</Text>
                </View>
                <View className="flex-row justify-between items-center border border-t-0 border-l-0 border-r-0 border-slate-400 py-3">
                  <Text>Carmodel</Text>
                  <Text>{carmodel}</Text>
                </View>
                <View className="flex-row justify-between items-center border border-t-0 border-l-0 border-r-0 border-slate-400 py-3">
                  <Text>Pickup</Text>
                  <Text>{pickup}</Text>
                </View>
                <View className="flex-row justify-between items-center border border-t-0 border-l-0 border-r-0 border-slate-400 py-3">
                  <Text>Drop</Text>
                  <Text>{drop}</Text>
                </View>
                <View className="flex-row justify-between items-center border border-t-0 border-l-0 border-r-0 border-slate-400 border-b-0 py-3">
                  <Text>Registration</Text>
                  <Text>{registration}</Text>
                </View>
              </View>
              

              <View className="w-full justify-center items-center">
                <ActivityIndicator size="large" color="red"/>
                <Text>Driver driving to destination...</Text>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

export default RideDecideScreen;

const styles = StyleSheet.create({});
