import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { scale } from 'react-native-size-matters';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SCREEN_NAMES, TAB_SCREEN_NAMES } from '../../constants/screenNames';
import { colors } from '../../styles/Colors';
import DashboardScreen from '../../screens/Dashboard';
import TodoScreen from '../../screens/TabsScreen/TodoScreen';
import CalendarScreen from '../../screens/TabsScreen/CalendarScreen';
import ProfileScreen from '../../screens/TabsScreen/ProfileScreen';
import { Colors } from '../../constants/constants';
import { Animated, Text, View, Easing, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const opacity = new Animated.Value(0);
  const scaleValue = new Animated.Value(1);
  const rotateValue = new Animated.Value(0); 
  const bgOpacity = new Animated.Value(1); 

  const animateTab = isFocused => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: isFocused ? 1 : 0.5,
        duration: 250,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: isFocused ? 1.2 : 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(rotateValue, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: isFocused ? 1 : 0.8,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: {
          height: scale(60),
          width: '90%',
          borderRadius: scale(30),
          backgroundColor: 'transparent',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          alignSelf: 'center',
          marginBottom: scale(10),
          overflow: 'hidden',
        },
        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <Animated.View
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: Colors.tertiary,
                opacity: bgOpacity,
              }}
            />
            <LinearGradient
              colors={['#4A90E2', '#4f6fbdff']}
              style={StyleSheet.absoluteFillObject}
            />
          </View>
        ),
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === SCREEN_NAMES.DASHBOARD_SCREEN) {
            iconName = focused ? 'chart-bar' : 'chart-bar-stacked';
          } else if (route.name === TAB_SCREEN_NAMES.TODO_SCREEN) {
            iconName = focused ? 'check-circle' : 'check-circle-outline';
          } else if (route.name === TAB_SCREEN_NAMES.CALENDAR_SCREEN) {
            iconName = focused ? 'calendar-check' : 'calendar-check-outline';
          } else if (route.name === TAB_SCREEN_NAMES.PROFILE_SCREEN) {
            iconName = focused ? 'account-circle' : 'account-circle-outline';
          }

          if (focused) {
            animateTab(true);
          } else {
            animateTab(false);
          }

          return (
            <Animated.View
              style={{
                transform: [
                  { scale: scaleValue },
                  { rotate: rotateInterpolate },
                ],
              }}
            >
              <Icon name={iconName} size={scale(24)} color={color} />
            </Animated.View>
          );
        },
        tabBarLabel: ({ focused }) => {
          let label;
          if (route.name === SCREEN_NAMES.DASHBOARD_SCREEN) {
            label = 'Table';
          } else if (route.name === TAB_SCREEN_NAMES.TODO_SCREEN) {
            label = 'Todo';
          } else if (route.name === TAB_SCREEN_NAMES.CALENDAR_SCREEN) {
            label = 'Calendar';
          } else if (route.name === TAB_SCREEN_NAMES.PROFILE_SCREEN) {
            label = 'Profile';
          }
          return (
            <Animated.Text
              style={{
                color: focused ? colors.white : colors.white,
                fontSize: scale(12),
                fontWeight: '600',
                textAlign: 'center',
                transform: [
                  {
                    translateY: scaleValue.interpolate({
                      inputRange: [1, 1.2],
                      outputRange: [0, -5],
                    }),
                  },
                ],
              }}
            >
              {label}
            </Animated.Text>
          );
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.secondaryBg,
        tabBarInactiveTintColor: colors.white,
        tabBarItemStyle: {
          paddingVertical: scale(4),
          paddingHorizontal: scale(8),
        },
      })}
    >
      <Tab.Screen
        name={SCREEN_NAMES.DASHBOARD_SCREEN}
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name={TAB_SCREEN_NAMES.TODO_SCREEN}
        component={TodoScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name={TAB_SCREEN_NAMES.CALENDAR_SCREEN}
        component={CalendarScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name={TAB_SCREEN_NAMES.PROFILE_SCREEN}
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;
