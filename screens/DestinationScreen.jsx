import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import * as Location from "expo-location";
import PlaceRow from "../components/PlaceRow";
import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";

const DestinationSearch = ({navigation,route}) => {
  // const navigation = useNavigation();
  const [from, setFrom] = useState("");
  const [destination, setDestination] = useState("");
  const [originPlace, setOriginPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);

  const homeplace = {
    description: "Home",
    geometry: { location: { lat: 37.7749, lng: -122.4194 } },
  };
  const workplace = {
    description: "Workplace",
    geometry: { location: { lat: 37.7771, lng: -122.4196 } },
  };
  

  const checkNavigation = () => {
    console.warn("navigation called");
    if (originPlace && destinationPlace) {
      // console.log("origin",originPlace,"destination", destinationPlace);
      console.warn("redirect to resluts page");
      navigation.navigate("search", {
        origin: originPlace,
        destination: destinationPlace,
        currentLocation: currentLocation,
      });
    }
  };

  useEffect(() => {
    checkNavigation();
  }, [originPlace, destinationPlace]);

  const checkPermision = async () => {
    const hasPermission = await Location.requestForegroundPermissionsAsync();
    if (hasPermission.status === "granted") {
      const permission = await askPermision();
      return permission;
    }
    return true;
  };

  const askPermision = async () => {
    const permission = await Location.requestForegroundPermissionsAsync();
    return permission.status === "granted";
  };

  const getLocation = async () => {
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) return;
      const {
        coords: { latitude, longitude },
      } = await Location.getCurrentPositionAsync();

      setCurrentLocation({ latitude: latitude, longitude: longitude });
      setLatlng({ latitude: latitude, longitude: longitude });
      // console.log("cordis",{ latitude: latitude, longitude: longitude })
    } catch (error) {}
  };

  //current location
  console.log("current location at", currentLocation);

  if (currentLocation) {
    const current = {
      description: "Current",
      geometry: {
        location: {
          lat: currentLocation.latitude,
          lng: currentLocation.longitude,
        },
      },
    };
  }
  useEffect(() => {
    checkPermision();
    getLocation();
    // console.log(latlng)
  }, []);
  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="dark" />
      <View className="w-full px-5 my-8 h-full">
        {/* <TextInput
            className="w-full bg-slate-200 p-3 rounded-md"
            placeholder="From"
            placeholderTextColor="gray"
            value={from}
            onChangeText={(text) => setFrom(text)}
          />
          <TextInput
            className="w-full bg-slate-200 p-3 rounded-md"
            placeholder="Where to?"
            placeholderTextColor="gray"
            value={destination}
            onChangeText={(text) => setDestination(text)}
          /> */}

        <GooglePlacesAutocomplete
          placeholder="Coming from"
          onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            console.log(data, details);
            setOriginPlace({ data, details });
            // checkNavigation();
          }}
          currentLocation={true}
          currentLocationLabel="Current"
          userLocation={true}
          fetchDetails={true}
          query={{
            key: "AIzaSyDdUQ1EIQJB46n2RSusQro1qP3Pd4mGZcA",
            language: "en",
            //   location: currentLocation ? `${currentLocation.latitude},${currentLocation.longitude}` : null,
            // radius: 50000,
          }}
          styles={{
            textInput: styles.textInput,
            container: styles.autocompleteContainer,
            listView: styles.listView,
            separator: styles.separator,
          }}
          renderRow={(data) => <PlaceRow data={data} />}
          predefinedPlacesAlwaysVisible={true}
          predefinedPlaces={[homeplace, workplace]}
        />
        <GooglePlacesAutocomplete
          placeholder="Going to?"
          onPress={(data, details = null) => {
            setDestinationPlace({ data, details });
            // checkNavigation();
          }}
          enablePoweredByContainer={false}
          // suppressDefaultStyles
          styles={{
            textInput: styles.textInput,
            container: {
              ...styles.autocompleteContainer,
              top: 55,
            },
            separator: styles.separator,
          }}
          fetchDetails={true}
          query={{
            key: "AIzaSyDdUQ1EIQJB46n2RSusQro1qP3Pd4mGZcA",
            language: "en",
          }}
          // predefinedPlacesAlwaysVisible={true}
          //   predefinedPlaces={[homeplace,workplace]}
          renderRow={(data) => <PlaceRow data={data} />}
        />

        {/* Circle near Origin input */}
        <View style={styles.circle} />

        {/* Line between dots */}
        <View style={styles.line} />

        {/* Square near Destination input */}
        <View style={styles.square} />
      </View>
    </SafeAreaView>
  );
};

export default DestinationSearch;

const styles = StyleSheet.create({
  container: {
    padding: 10,
    height: "100%",
  },
  textInput: {
    padding: 10,
    backgroundColor: "#eee",
    marginVertical: 5,
    marginLeft: 20,
  },

  separator: {
    backgroundColor: "#efefef",
    height: 1,
  },
  listView: {
    position: "absolute",
    top: 105,
  },

  autocompleteContainer: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  iconContainer: {
    backgroundColor: "#a2a2a2",
    padding: 5,
    borderRadius: 50,
    marginRight: 15,
  },
  locationText: {},

  circle: {
    width: 5,
    height: 5,
    backgroundColor: "black",
    position: "absolute",
    top: 20,
    left: 15,
    borderRadius: 5,
  },
  line: {
    width: 1,
    height: 50,
    backgroundColor: "#c4c4c4",
    position: "absolute",
    top: 28,
    left: 17,
  },
  square: {
    width: 5,
    height: 5,
    backgroundColor: "black",
    position: "absolute",
    top: 80,
    left: 15,
  },
});
