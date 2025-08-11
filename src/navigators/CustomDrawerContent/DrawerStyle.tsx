import { StyleSheet } from "react-native";
import { scale } from "react-native-size-matters";
import { colors } from "../../styles/Colors";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: scale(10),
    paddingBottom:scale(20)
  },
  logo: {
    resizeMode: 'contain',
    alignSelf: 'flex-start',
    height: scale(80),
    width: scale(160),
    marginTop: scale(50),
    marginLeft:scale(6)
  },
  drawerContent: {
  },
  listItemContainer: {
    paddingVertical: scale(8),
    backgroundColor: 'transparent',
  },
  listItemText: {
    fontSize: scale(14),
    color: colors.black,
    fontWeight: '400',
    marginLeft: scale(12),
  },
  subItemText: {
    fontSize: scale(14),
    color: colors.black,
    fontWeight: '400',
    paddingLeft: scale(35),
  },
  childItemContainer: {
    paddingVertical: scale(6),
    backgroundColor: 'transparent',
  },
  grandChildItem: {
    paddingVertical: scale(6),
    backgroundColor: 'transparent',
    paddingLeft: scale(30),
  },
  myIformationContainer: {
    paddingHorizontal: scale(10),
  },
  myIformationTxt: {
    padding: scale(14),
    paddingLeft: scale(16),
    color: colors.black,
    fontSize: scale(15),
    fontWeight: '400',
  },
  graytextColor: {
    color: colors.graytextColor,
    fontSize: scale(14),
    paddingVertical: scale(6),
  },
});