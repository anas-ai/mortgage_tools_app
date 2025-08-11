import React, { FC } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  ViewStyle,
  StyleProp,
  TextStyle,
  Text,
} from "react-native";
import { Colors } from "../../constants/constants";
import { CustomButtonProps } from "../../utils/types";
import { moderateScale } from "react-native-size-matters";

const CustomButton: FC<CustomButtonProps> = ({
  title,
  loading = false,
  disabled = false,
  onPress,
  style,
  textStyle,
  backgroundColor,
  fontColor,
  loaderColor,
  fontSize
}) => {
  const finalButtonStyle: StyleProp<ViewStyle> = {
    alignItems: "center",
    justifyContent: "center",
    height: moderateScale(40),
    width: "100%",
    borderRadius: moderateScale(8),
    marginVertical: moderateScale(10),
    backgroundColor: disabled
      ? Colors.secondary
      : backgroundColor || Colors.primary,
  };

  const finalTextStyle: StyleProp<TextStyle> = {
    color: disabled ? "#fff" : fontColor || Colors.text,
    fontWeight: "600",
    fontSize: moderateScale(fontSize || 20),
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[finalButtonStyle, style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={loaderColor || Colors.text}
        />
      ) : (
        <Text style={[finalTextStyle, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
