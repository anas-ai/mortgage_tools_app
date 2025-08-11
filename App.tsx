import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './src/store/authStore';
import AuthNavigator from './src/navigators/navigations/AuthNavigator';
import HomeNavigator from './src/navigators/navigations/HomeNavigator';
import { Colors } from './src/constants/constants';
import { colors } from './src/styles/Colors';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const App = () => {
  const { userToken, loading, checkLoginState } = useAuthStore();

  useEffect(() => {
    checkLoginState();
  }, []);

  console.log('App loading:', loading, 'userToken:', userToken);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.white,
        }}
      >
        <ActivityIndicator size="large" color={Colors.tertiary} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        {userToken ? <HomeNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

export default App;
