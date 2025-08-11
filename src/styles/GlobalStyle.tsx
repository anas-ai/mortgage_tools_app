// GlobalStyle.ts
import { Platform, StatusBar, StyleSheet } from "react-native";
import { colors } from "./Colors";
import { scale } from "react-native-size-matters";

export const globalStyles = StyleSheet.create({
  globalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  globalDimension:{
    paddingHorizontal:scale(12),
    paddingVertical:scale(12)
  }
});
