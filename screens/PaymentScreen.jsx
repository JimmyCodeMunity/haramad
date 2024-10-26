// App.js
import React, { useEffect, useState } from "react";
import {
  View,
  Button,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Text,
} from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import axios from "axios";
import { useSocketContext } from "../context/SocketContext";

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

  console.log("paying for trip", trip);

  useEffect(() => {
    // Fetch the Payment Intent client secret from the backend
    initializePaymentSheet();
  }, []);

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      // Fetch payment intent from backend
      const { data } = await axios.post(
        "http://192.168.1.206:8000/create-payment-intent",
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
        merchantDisplayName: "Haramad",
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
      Alert.alert(`Error code: ${error.code}`, error.message);
      socket?.emit("trip-payment-cancelled", { tripId });
    } else {
      socket?.emit("trip-paid", { tripId });

      Alert.alert("Success", "Payment is confirmed!");
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <StripeProvider publishableKey="pk_test_51Oc4wRJE5eZbfcv0ZZg8sqwprkiBtm3lOAHIcRIkKFEUEAfmKa0F4uNIDc936uUwpxC6X8zIdE5TcUmoY58PFP2f00RLpIZc54">
      <View className="bg-white flex-1 justify-center items-center px-4 space-y-4">
        {
          !flowControllerInitialized &&
          <TouchableOpacity
          onPress={initializePaymentSheet}
          className="h-12 w-full rounded-md justify-center items-center bg-black"
        >
          <Text className="text-white text-xl tracking-wide">
            Initialize Payment
          </Text>
        </TouchableOpacity>
        }
        
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
