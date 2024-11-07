import React, { useState, useEffect, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import Icon from "react-native-vector-icons/Entypo";
import { useSocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../config";
import { StatusBar } from "expo-status-bar";

const ChatScreen = ({ navigation, route }) => {
  const { trip } = route.params;
  const { userdata } = useContext(AuthContext);
  const userId = userdata?.userdata?._id;
  const receiverId = trip?.driverId;
  const { socket } = useSocketContext();
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const scrollViewRef = useRef();

  const type = "UsersMessage";
  const tripId = trip?._id;

  // Load initial messages from the server
  const getMessages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/getmessages`, {
        params: { senderId: userId, receiverId },
      });
      const formattedMessages = response.data.map((msg) => ({
        _id: msg._id,
        text: msg.message,
        createdAt: new Date(msg.timeStamp),
        type:msg.type,
        user: msg.senderId._id === userId ? "user" : "driver", // Keep senderId instead of user
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to get messages", error.message);
    }
  };

  // Send message using socket
const sendMessage = async () => {
  if (!messageText.trim()) return; // prevent sending empty messages
  try {
    socket.emit("sendMessage", {
      senderId: userId,
      receiverId,
      message: messageText,
      tripId,
      type: "UsersMessage", // Ensure type is UsersMessage
    });
    
    // Add the newly sent message to the state
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        _id: Date.now().toString(),
        text: messageText,
        senderId: userId,   // Ensure the senderId is correct
        type: "UsersMessage" // Set the correct type
      },
    ]);
    
    // Clear the input field
    setMessageText("");
    
    socket.off("sendMessage");
  } catch (error) {
    console.error("Failed to send message", error.message);
  }
};

  // Send message using socket
  const sendMessages = async () => {
    if (!messageText.trim()) return; // prevent sending empty messages
    try {
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId,
        message: messageText,
        tripId,
        type: "UsersMessage", // Ensure type is UsersMessage
      });
      setMessages((prevMessages) => [
        ...prevMessages,
        { _id: Date.now().toString(), text: messageText, senderId: userId }, // Add senderId as userId
      ]);
      setMessageText("");
      socket.off("sendMessage");
    } catch (error) {
      console.error("Failed to send message", error.message);
    }
  };

  // Fetch initial messages on mount
  useEffect(() => {
    getMessages();
  }, []);

  // Listening to new messages from the socket
  useEffect(() => {
    socket?.on("newMessage", ({ newMessage }) => {
      console.log("new message", newMessage); // Log the structure of the new message
      const formattedMessage = {
        _id: newMessage._id,
        text: newMessage.message,
        user: newMessage.senderId === userId ? "user" : "driver", // Assign senderId properly
        type: newMessage.type,
      };
      setMessages((prevMessages) => [...prevMessages, formattedMessage]);
    });

    return () => {
      socket?.off("newMessage");
    };
  }, [socket, userId]);

  // Custom message component
  const renderMessage = (message) => {
    // console.log("type",message.type)
    const isUserMessage = message.type === "UsersMessage"; // Compare senderId with userId
    return (
      <View
        key={message._id}
        className={`w-full mb-3 flex-row ${
          isUserMessage ? "justify-end" : "justify-start"
        }`}
      >
        <View
          className={`${
            isUserMessage ? "bg-black" : "bg-gray-200"
          } max-w-3/4 p-3 rounded-lg`}
        >
          <Text
            className={`${isUserMessage ? "text-white" : "text-black"} text-base`}
          >
            {message.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark"/>
      {/* Header with navigation */}
      <View className="flex-row items-center p-3">
        <Pressable onPress={() => navigation.goBack()} className="mr-3">
          <Icon name="chevron-left" size={30} color="black" />
        </Pressable>
        <Text className="text-xl font-semibold">Chat</Text>
      </View>

      {/* Chat messages */}
      <ScrollView
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        className="flex-1 p-3"
      >
        {messages.map((message) => renderMessage(message))}
      </ScrollView>

      {/* Message input with KeyboardAvoidingView */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="border-t border-gray-200 p-3"
      >
        <View className="flex-row items-center">
          <TextInput
            className="flex-1 border border-gray-300 rounded-full px-4 py-2"
            placeholder="Type a message..."
            value={messageText}
            onChangeText={setMessageText}
          />
          <Pressable className="ml-3 bg-red-500 rounded-full p-3" onPress={sendMessage}>
            <Icon name="paper-plane" size={20} color="white" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
