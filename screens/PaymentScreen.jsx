// App.js
import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  View,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Text,
  Image,
  Pressable,
  ScrollView,
  Platform,
} from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import axios from "axios";
import { useSocketContext } from "../context/SocketContext";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MapView, {
  Marker,
  PROVIDER_DEFAULT,
  PROVIDER_GOOGLE,
} from "react-native-maps";
import { CommonActions } from "@react-navigation/native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";

export default function PaymentScreen({ navigation, route }) {
  const { trip } = route.params;
  const stripe = useStripe();
  const [loading, setLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [flowControllerInitialized, setFlowControllerInitialized] =
    useState(false);
  // const [amount,setAmount] = useState(500);
  const amount = parseInt(trip?.price);
  const { socket } = useSocketContext();
  const tripId = trip?._id;

  useLayoutEffect(() => {
    return navigation.setOptions({
      headerTitle: "pay",
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
  // console.log(tr)

  console.log("paying for trip", trip);
  // console.log("receiving driver", trip?.driverId?.name);

  useEffect(() => {
    // Fetch the Payment Intent client secret from the backend
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      // Fetch payment intent from backend
      const { data } = await axios.post(
        `https://server.haramad.co.ke/create-payment-intent`,
        {
          amount: amount, // $50 in cents
          currency: "usd",
        }
      );
      const { paymentIntent, ephemeralKey, customer } = data;

      const { error } = await stripe.initPaymentSheet({
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        allowsDelayedPaymentMethods: true,
        merchantDisplayName: "Haram'ad",
      });

      if (!error) {
        setClientSecret(paymentIntent);
        setFlowControllerInitialized(true);
      } else {
        Alert.alert("Error", error.message);
      }
    } catch (error) {
      console.error("Failed to initialize payment sheet:", error);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await stripe.presentPaymentSheet();

    if (error) {
      // Alert.alert(`Error code: ${error.code}`, error.message);
      Dialog.show({
        type: ALERT_TYPE.DANGER,
        title: "Payment Cancelled!!",
        textBody: "You cncelled the trip.",
        button: "continue",
      });
      socket?.emit("trip-payment-cancelled", { tripId });
    } else {
      socket?.emit("trip-paid", { tripId });
      Dialog.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Trip Paid Successfully",
        textBody: "Awaiting drivers to accept request.",
        button: "continue",
      });

      // Alert.alert("Success", "Payment is confirmed!");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: "Home" }, // Replace 'HomeScreen' with the name of your first screen
          ],
        })
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Image spurce={require("../assets/logo.png")} className="h-24 w-24" />
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Please Wait while we initialize your payment...</Text>
      </View>
    );
  }

  return (
    <StripeProvider publishableKey="pk_test_51Oc4wRJE5eZbfcv0ZZg8sqwprkiBtm3lOAHIcRIkKFEUEAfmKa0F4uNIDc936uUwpxC6X8zIdE5TcUmoY58PFP2f00RLpIZc54">
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

            <View className="bg-white flex-1 justify-center items-center px-4 space-y-4">
              {!flowControllerInitialized && (
                <TouchableOpacity
                  onPress={initializePaymentSheet}
                  className="h-12 w-full rounded-md justify-center items-center bg-black"
                >
                  <Text className="text-white text-xl tracking-wide">
                    Initialize Payment
                  </Text>
                </TouchableOpacity>
              )}

              {flowControllerInitialized && (
                <TouchableOpacity
                  onPress={openPaymentSheet}
                  className="h-12 w-full rounded-md justify-center items-center bg-green-500"
                >
                  <Text className="text-white text-xl tracking-wide">
                    Pay Now
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 40,
    width: "100%",
    margin: 10,
    borderWidth: 1,
    padding: 10,
  },
});
