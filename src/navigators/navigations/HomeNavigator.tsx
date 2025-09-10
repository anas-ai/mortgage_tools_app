import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { HomeStack } from '../../routes/routes';
import CustomDrawerContent from '../CustomDrawerContent/CustomDrawerContent';
import { SCREEN_NAMES } from '../../constants/screenNames';
import TabNavigator from './TabNavigator';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const HomeNavigatorStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'simple_push',
      }}
    >
      {/* Prioritize TabNavigator for the dashboard */}
      <Stack.Screen
        name={SCREEN_NAMES.DASHBOARD_SCREEN}
        component={TabNavigator}
        options={{
          animationDuration: 500,
        }}
      />
      {/* Other HomeStack screens */}
      {HomeStack.filter(
        item => item.name !== SCREEN_NAMES.DASHBOARD_SCREEN,
      ).map((item, index) => (
        <Stack.Screen
          key={index}
          name={item.name}
          component={item.component}
          options={{
            animationDuration: 500,
          }}
        />
      ))}
    </Stack.Navigator>
  );
};

const HomeNavigator = () => {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: { width: '85%', height: '100%' },
        headerShown: false,
        drawerPosition: 'left',
        drawerType: 'slide',
      }}
    >
      <Drawer.Screen
        name={SCREEN_NAMES.DASHBOARD_SCREEN}
        component={HomeNavigatorStack}
      />
    </Drawer.Navigator>
  );
};

export default HomeNavigator;
