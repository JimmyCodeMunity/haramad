import React, {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useContext,
} from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { GiftedChat, Bubble, InputToolbar } from "react-native-gifted-chat";
import Icon from "react-native-vector-icons/Entypo";
import { useSocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import axios from "axios";
import { BASE_URL } from "../config";

const ChatScreen = ({ navigation, route }) => {
  const {trip} = route.params;
  const { userdata } = useContext(AuthContext);
  const userId = trip?.userId;
  const receiverId = trip?.driverId;
  // const name = route?.params?.name;
  const { socket } = useSocketContext();
  const [messages, setMessages] = useState([]);

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
        user: {
          _id: msg.senderId._id,
          name: msg.senderId.name,
        },
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error("Failed to get messages", error.message);
    }
  };

  // Send message using socket
  const sendMessage = async (messagesToSend = []) => {
    const message = messagesToSend[0];
    try {
      socket.emit("sendMessage", {
        senderId: userId,
        receiverId,
        message: message.text,
      });
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messagesToSend)
      );
    } catch (error) {
      console.error("Failed to send message", error.message);
    }
  };

  // Listening to new messages from the socket
  useEffect(() => {
    socket?.on("newMessage", (newMessage) => {
      const formattedMessage = {
        _id: newMessage._id,
        text: newMessage.message,
        createdAt: new Date(newMessage.timeStamp),
        user: {
          _id: newMessage.senderId._id,
          name: newMessage.senderId.name,
        },
      };
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, [formattedMessage])
      );
    });

    return () => {
      socket?.off("newMessage");
    };
  }, [socket]);

  // Initial load of messages
  useEffect(() => {
    getMessages();
  }, []);

  // Customize chat bubbles
  const renderBubble = (props) => (
    <Bubble
      {...props}
      wrapperStyle={{
        right: {
          backgroundColor: "#007AFF",
        },
        left: {
          backgroundColor: "#F0F0F0",
        },
      }}
      textStyle={{
        right: { color: "#fff" },
        left: { color: "#000" },
      }}
    />
  );

  // Customize input toolbar
  const renderInputToolbar = (props) => (
    <InputToolbar
      {...props}
      containerStyle={{
        backgroundColor: "white",
        borderTopWidth: 1,
        borderTopColor: "#E8E8E8",
      }}
    />
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: "",
      headerLeft: () => (
        <View className="flex-row items-center justify-between space-x-5">
          <View>
            <Pressable onPress={() => navigation.goBack()}>
              <Icon name="chevron-left" size={30} color="black" />
            </Pressable>
          </View>
          <View>
            <Text className="text-xl font-semibold">{name}</Text>
          </View>
        </View>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        onSend={(messages) => sendMessage(messages)}
        user={{
          _id: userId,
        }}
        renderBubble={renderBubble}
        renderInputToolbar={renderInputToolbar}
        placeholder="Type a message..."
        showUserAvatar={true}
        alwaysShowSend={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});

export default ChatScreen;
