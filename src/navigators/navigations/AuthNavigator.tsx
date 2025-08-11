import { View, Text } from 'react-native';
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { AuthStack } from '../../routes/routes';

const Stack = createNativeStackNavigator();

const AuthNavigator = () => {
  return (
      <Stack.Navigator>
        {AuthStack.map((item, index) => (
          <Stack.Screen
            key={index}
            name={item?.name}
            component={item?.component}
            options={{
              headerShown: false,
              gestureEnabled: true,
              animation: 'slide_from_right',
              animationDuration: 500,
            }}
          />
        ))}
      </Stack.Navigator>
  );
};

export default AuthNavigator;