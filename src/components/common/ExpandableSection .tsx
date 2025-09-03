import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated } from 'react-native';
import { scale } from 'react-native-size-matters';
import { colors } from '../../styles/Colors';
import CustomText from '../common/CustomText';
import VectorIcon from '../common/CustomIcons';

type ExpandableSectionProps = {
  title: string;
  children: React.ReactNode;
  outputRange?:any;
  marginTop?:any;
  marginBottom?:any
};

const ExpandableSection = ({ title, children ,outputRange,marginTop,marginBottom}: ExpandableSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleExpand = () => {
    const toValue = isExpanded ? 0 : 1;
    Animated.timing(animation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  const heightInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, scale(outputRange)], // adjust max height
  });

  const opacityInterpolation = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View style={{ marginTop: scale(marginTop) ,marginBottom:scale(marginBottom)}}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={toggleExpand}
        style={{
          backgroundColor: colors.black,
          paddingVertical: scale(6),
          paddingHorizontal: scale(12),
          borderRadius: scale(5),
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <CustomText
          variant="h6"
          fontFamily="Medium"
          fontSize={13}
          style={{ color: colors.white }}
        >
          {title}
        </CustomText>
        <VectorIcon
          type="MaterialIcons"
          name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
          size={30}
          color={colors.white}
        />
      </TouchableOpacity>

      <Animated.View
        style={{
          height: heightInterpolation,
          opacity: opacityInterpolation,
          overflow: 'hidden',
          marginTop: scale(10),
        }}
      >
        {children}
      </Animated.View>
    </View>
  );
};

export default ExpandableSection;
