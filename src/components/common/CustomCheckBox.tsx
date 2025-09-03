import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import VectorIcon from './CustomIcons';
import { Colors } from '../../constants/constants';
import { colors } from '../../styles/Colors';

interface CustomCheckBoxProps {
  title?: string;
  fontSize?: number;
  color?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isChecked?: boolean; // <- controlled
  onPress?: () => void; // <- callback
}

const CustomCheckBox = ({
  title,
  fontSize = 16,
  color,
  containerStyle,
  isChecked,
  onPress,
}: CustomCheckBoxProps) => {
  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[styles.checkboxBase, isChecked && styles.checkboxChecked]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {isChecked && (
          <VectorIcon
            type="AntDesign"
            name="check"
            size={16}
            color={colors.white}
          />
        )}
      </TouchableOpacity>
      {title ? (
        <Text style={{ fontSize: fontSize, color: color, fontWeight: '600' }}>
          {title}
        </Text>
      ) : null}
    </View>
  );
};

export default CustomCheckBox;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkboxBase: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#888',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: Colors.tertiary,
    borderColor: '#333',
  },
});
