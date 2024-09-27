import {
    View,
    Text,
    SafeAreaView,
    Image,
    ImageBackground,
    TouchableOpacity,
  } from "react-native";
  import React from "react";
  
  const SplashScreen = ({ navigation }) => {
    return (
      <SafeAreaView className="flex-1 justify-center bg-white relative justify-center flex-col items-center">
        <View className="w-full justify-center items-center">
          <Image
            className="h-40 w-60 rounded-full"
            source={require("../assets/logo.png")}
          />
          <Text className="text-4xl font-bold tracking-wide">
            Ride with Haram'ad
          </Text>
          <Text className="text-4xl font-bold tracking-wide">
            today
          </Text>
        </View>
        <View className="space-y-5 absolute bottom-20 w-full justify-center items-center">
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            className="w-80 rounded-lg bg-white border border-red-500 justify-center items-center h-12"
          >
            <Text className="font-semibold text-red-500 text-xl">SignIn</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            className="w-80 rounded-lg bg-red-500 justify-center items-center h-12"
          >
            <Text className="text-xl text-white font-semibold">SignUp</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  };
  
  export default SplashScreen;
  