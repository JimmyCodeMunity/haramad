import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState(null);
  const [userdata, setUserdata] = useState(null);

  // Function to get user data from the API using the token
  const getUserdata = async (token) => {
    try {
      if (token) {
        const response = await axios.post(`${BASE_URL}/getuserdata`, {
          token,
        });
        const userData = response.data;
        setUserdata(userData); // Save user data in state
        await AsyncStorage.setItem('userdata', JSON.stringify(userData)); // Persist user data
        console.log('userdata from the API', userData);
      }
    } catch (error) {
      console.error('Error fetching user data', error);
    }
  };

  // Check if the user is logged in when the app starts
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const loggedIn = await AsyncStorage.getItem('isLoggedin');
        
        if (token && JSON.parse(loggedIn)) {
          setUserToken(token);
          getUserdata(token); // Fetch and set userdata
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('Failed to fetch auth status', e);
      }
      setLoading(false);
    };
    
    checkLoginStatus();
  }, []);

  // Handle login
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${BASE_URL}/userlogin`, { email, password });
      const user = response.data;

      // Assuming the token is returned in user.data.token
      if (user.status === 'ok' && user.data) {
        // Save the token and login status to AsyncStorage
        await AsyncStorage.setItem('token', user.data);  // Store the actual token
        await AsyncStorage.setItem('isLoggedin', JSON.stringify(true));

        // Set state values for token and logged-in status
        setUserToken(user.data);

        // Fetch user data and set it in state
        await getUserdata(user.data); // Fetch user data after login
        
        setIsLoggedIn(true);
      } else {
        // Handle case when token is not present in the response
        throw new Error('Login failed, no token returned');
      }
    } catch (error) {
      console.error('Error during login', error);
      throw new Error('Login failed');
    }
  };

  // Handle logout
  const logout = async () => {
    setIsLoggedIn(false);
    setUserToken(null);
    setUserdata(null);
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('isLoggedin');
    await AsyncStorage.removeItem('userdata');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userdata, loading, userToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
