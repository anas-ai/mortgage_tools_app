import { StyleProp, TextStyle, ViewStyle } from 'react-native';

interface CustomTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7' | 'h8';
  style?: any;
  fontSize?: number;
  children: React.ReactNode;
  fontFamily?: string;
  numberOfLines?: number;
}

interface CustomInpurProps {
  value?: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
}

interface CustomButtonProps {
  title?: string;
  loading?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  backgroundColor?: string;
  fontColor?: string;
  loaderColor?: string;
  variant?: string;
  fontSize?: number;
}
export type { CustomTextProps, CustomInpurProps, CustomButtonProps };
