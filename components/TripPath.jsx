import {
    StyleSheet,
    Text,
    View,
    Platform,
    Image,
    FlatList,
  } from "react-native";
  import React, { useEffect, useState } from "react";
  import MapView, {
    PROVIDER_GOOGLE,
    PROVIDER_DEFAULT,
    Marker,
  } from "react-native-maps";
  import cars from "../assets/data/cars";
  import * as Location from "expo-location";
  
  const TripPath = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
  
   
    const homeplace = {
      description: "Home",
      geometry: { location: { lat: 37.7749, lng: -122.4194 } },
    }
    const workplace = {
      description: "Workplace",
      geometry: { location: { lat: 37.7771, lng: -122.4196 } },
    }
  
  
    
  
    
  
  
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
    console.log("current location at",currentLocation);
  
    
    useEffect(() => {
      checkPermision();
      getLocation();
      // console.log(latlng)
    }, []);
    const getImage = (type)=>{
      if(type === 'UberX'){
        return require('../assets/images/top-UberX.png');
      }
      if(type === 'Comfort'){
        return require('../assets/images/top-Comfort.png');
      }
      return require('../assets/images/top-UberXL.png');
    }
    return (
      
      <MapView
      mapType={Platform.OS == "android" ? "none" : "mutedStandard"}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : PROVIDER_DEFAULT}
        className="h-full w-full"
        showsUserLocation={true}
        showsBuildings={true}
        // followsUserLocation={true}
        initialRegion={{
          latitude: 28.450627,
          longitude: -16.263045,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        zoomEnabled="true"
        // followsUserLocation={true}
        // fitToCoordinates
      >
        
      </MapView>
    );
  };
  
  export default TripPath;
  
  const styles = StyleSheet.create({});
  