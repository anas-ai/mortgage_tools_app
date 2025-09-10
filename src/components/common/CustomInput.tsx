import React, { FC, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { moderateScale, scale } from 'react-native-size-matters';
import VectorIcon, { IconType } from './CustomIcons';
import { Colors } from '../../constants/constants';
import { colors } from '../../styles/Colors';
import CustomText from './CustomText';

import { DimensionValue } from 'react-native';

interface CustomInputWithIconProps extends TextInputProps {
  iconName?: string;
  iconType?: IconType;
  iconColor?: string;
  iconSize?: number;
  isPassword?: boolean;
  size?: number;
  width?: DimensionValue; // <-- FIXED
  ref?: any;
  height?: number;
  loading?: boolean;
  label?: string;
  lablePaddingTop?: number;
  lablePaddingVertical?: number;
  required?: boolean;
  keyboardType?: any;
  editable?: boolean;
  lableFontSize?: number;
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
  width = '100%',
  ref,
  height = 45,
  label,
  loading = false,
  lablePaddingTop = 14,
  lablePaddingVertical,
  required,
  keyboardType,
  editable = true,
  lableFontSize = 13,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{ width }}>
      {label && (
        <View
          style={[
            styles.labelWrapper,
            {
              paddingTop: scale(lablePaddingTop),
              paddingVertical: lablePaddingVertical,
            },
          ]}
        >
          <CustomText
            variant="h6"
            fontFamily="Bold"
            fontSize={lableFontSize}
            style={styles.label}
          >
            {label}
            {required && (
              <CustomText variant="h7" style={styles.required}>
                *
              </CustomText>
            )}
          </CustomText>
        </View>
      )}

      <View style={[styles.container, { height }]}>
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
          style={styles.input}
          keyboardType={keyboardType || 'ascii-capable'}
          editable={editable}
        />

        {loading ? (
          <ActivityIndicator
            size="small"
            color={Colors.tertiary}
            style={styles.loader}
          />
        ) : (
          isPassword && (
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
          )
        )}
      </View>
    </View>
  );
};

export default CustomInput;

const styles = StyleSheet.create({
  container: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: moderateScale(14),
    fontFamily: 'Regular',
    height: '100%',
    marginLeft: 8,
    color: '#252525',
  },
  leftIcon: {
    marginRight: 6,
  },
  rightIcon: {
    paddingHorizontal: 6,
  },
  required: {
    color: colors.red,
  },
  label: {
    fontWeight: '500',
    color: colors.bgBlack,
  },
  labelWrapper: {
    marginBottom: 4,
  },
  loader: {
    marginRight: scale(6),
  },
});
