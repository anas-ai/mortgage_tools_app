import React, { FC, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import VectorIcon, { IconType } from './CustomIcons';
import { Colors } from '../../constants/constants';
import { colors } from '../../styles/Colors';

interface CustomInputWithIconProps extends TextInputProps {
  iconName?: string;
  iconType?: IconType;
  iconColor?: string;
  iconSize?: number;
  isPassword?: boolean;
  size?: number;
  width?:any
  ref?:any,
  height?:any
}

const CustomInput: FC<CustomInputWithIconProps> = ({
  value,
  onChangeText,
  onBlur,
  onFocus,
  placeholder,
  iconName,
  iconType,
  iconColor = '#999',
  iconSize = 20,
  isPassword = false,
  size,
  width,
  ref,
  height=45,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container,{width:width,height:height}]}>
      {iconName && iconType && (
        <VectorIcon
          name={iconName}
          type={iconType}
          size={iconSize}
          color={iconColor}
          style={styles.leftIcon}
        />
      )}

      <TextInput
      ref={ref}
        {...rest}
        placeholder={placeholder}
        onBlur={onBlur}
        onFocus={onFocus}
        onChangeText={onChangeText}
        value={value}
        placeholderTextColor={'#4e4b51'}
        secureTextEntry={isPassword && !showPassword}
        style={[styles.input, isPassword && { width: '78%' }]}
      />

      {isPassword && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setShowPassword(prev => !prev)}
        >
          <VectorIcon
            name={showPassword ? 'eye' : 'eye-off'}
            type="Feather"
            size={size}
            color={colors.textSecondary}
            style={styles.rightIcon}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    fontSize: moderateScale(14),
    fontFamily: 'Regular',
    height: 45,
    width: '90%',
    marginLeft: 8,
    color: '#252525',
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    paddingHorizontal: 6,
  },
});
