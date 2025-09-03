import { View, Text, StatusBar, Platform } from 'react-native';
import React from 'react';
import { moderateScale, scale } from 'react-native-size-matters';
import IconBars from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../styles/Colors';

const HeaderComponent = ({
  navigation,
  title,
  IconName,
  IconSize,
  backgroundColor = colors.white,
  titleColor = colors.bgBlack,
  IconColor = colors.bgBlack,
}: any) => {
  const handleNavigatoin = () => {
    if (IconName === 'angle-left') {
      navigation.goBack();
    } else {
      navigation.openDrawer();
    }
  };

  const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 0;

  return (
    <View
      style={{
        backgroundColor: backgroundColor,
        paddingTop: statusBarHeight,
        height: scale(60) + statusBarHeight,
        width: '100%',
        elevation: scale(5),
        borderBottomColor:colors.white,
        borderBottomWidth:.2
      }}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={'light-content'}
      />
      <View
        style={{
          flex: 1,
          paddingHorizontal: scale(16),
          flexDirection: 'row',
          alignItems: 'center',
          gap: scale(10),
        }}
      >
        <IconBars
          name={IconName}
          size={IconSize}
          color={IconColor}
          onPress={handleNavigatoin}
        />
        <Text
          style={{
            fontSize: moderateScale(17),
            color: titleColor,
            fontWeight: '500',
          }}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

export default HeaderComponent;
