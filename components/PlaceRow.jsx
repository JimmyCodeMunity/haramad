import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const PlaceRow = ({data}) => {
  return (
    <View className="flex-row space-x-4 items-center w-full space-y-2">
        {
            data.description === "Home" ?
            <View className="bg-slate-400 rounded-full p-1">
                <Icon name="home" size={20} color="white"/>
            </View>
            :
            <View className="bg-slate-400 rounded-full p-1">
                <Icon name="map-marker-radius" size={20} color="white"/>
            </View>
            
        }
      <Text>{data.description || data.vicinity}</Text>
    </View>
  )
}

export default PlaceRow

const styles = StyleSheet.create({})