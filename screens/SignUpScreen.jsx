import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    Image,
    TouchableOpacity,
  } from "react-native";
  import React from "react";
  import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
  
  const RegisterScreen = ({navigation}) => {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <View className="absolute top-5 left-5">
          <TouchableOpacity onPress={()=>navigation.goBack()} className="bg-red-500 justify-center items-center h-12 w-12 rounded-full">
            <Icon name="chevron-left" color="white"size={30}/>
          </TouchableOpacity>
        </View>
        <View className="w-full px-4 space-y-4">
          <Text className="text-3xl font-semibold">Create Account</Text>
  
          <TextInput
            className="border border-t-0 h-12 border-l-0 border-r-0 border-red-300"
            placeholder="enter Username"
            placeholderTextColor="#868686"
          />
          <TextInput
            className="border border-t-0 h-12 border-l-0 border-r-0 border-red-300"
            placeholder="enter email"
            placeholderTextColor="#868686"
          />
          <TextInput
            className="border border-t-0 h-12 border-l-0 border-r-0 border-red-300"
            placeholder="enter phone"
            placeholderTextColor="#868686"
          />
          <TextInput
            className="border border-t-0 h-12 border-l-0 border-r-0 border-red-300"
            placeholder="enter password"
            placeholderTextColor="#868686"
          />
  
          <TouchableOpacity className="bg-red-500 h-12 rounded-2xl justify-center items-center">
            <Text className="text-white text-xl font-semibold">Submit</Text>
          </TouchableOpacity>
  
          <View className="w-full">
            <Text className="text-slate-600">Already have an account?
              <Text className="text-red-400">{" "}Create Account</Text>
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  };
  
  export default RegisterScreen;
  