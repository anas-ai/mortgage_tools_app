import { View, Text, StyleSheet } from 'react-native';
import React, { FC } from 'react';
import { CustomTextProps } from '../../utils/types';
import { moderateScale } from 'react-native-size-matters';
import { Colors } from '../../constants/constants';

const fontSizes = {
  h1: 24,
  h2: 22,
  h3: 20,
  h4: 18,
  h5: 16,
  h6: 14,
  h7: 13,
  h8: 10,
};
const fontFamilyMap: Record<string, string> = {
  Regular: 'NotoSans-Regular',
  Bold: 'NotoSans-Bold',
  Light: 'NotoSans-Light',
  Medium: 'NotoSans-Medium',
  SemiBold: 'NotoSans-SemiBold',
};




const CustomText: FC<CustomTextProps> = ({
  variant = 'h1',
  style,
  fontSize,
  numberOfLines,
  children,
  fontFamily = 'Regular',
}) => {
  return (
    <Text
      numberOfLines={numberOfLines ? numberOfLines : undefined}
      style={[
        styles.text,
        style,
        {
          fontSize: moderateScale(fontSize ? fontSize : fontSizes[variant]),
      fontFamily: fontFamilyMap[fontFamily] || fontFamilyMap['Regular'],
        },
      ]}
    >
      {children}
    </Text>
  );
};

export default CustomText;

const styles = StyleSheet.create({
  text: {
    color: Colors.text,
  },
});
