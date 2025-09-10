import {
  BackHandler,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import LinearGradient from 'react-native-linear-gradient';
import { scale } from 'react-native-size-matters';
import { colors } from '../../styles/Colors';
import CustomText from '../../components/common/CustomText';
import CustomInput from '../../components/common/CustomInput';
import CustomCheckBox from '../../components/common/CustomCheckBox';
import CustomButton from '../../components/common/CustomButton';
import { Colors, IMG_NAMES } from '../../constants/constants';
import { styles } from './styles/FormStyles';
import { useForm, Controller } from 'react-hook-form';
import { email, z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type NewAccountFormProps = {
  onBack: () => void;
};

const schema = z
  .object({
    code: z.string().min(1, 'Enter authorization code'),
    name: z.string().min(1, 'Enter your name'),
    email: z.string().min(1, 'Enter a valid email'),
    password: z.string().min(1, 'Enter password'),
    confirmpassword: z.string().min(1, ' Confirm your password'),
  })
  .refine(data => data.password === data.confirmpassword, {
    path: ['confirmpassword'],
    message: 'Password do not match',
  });

type FormData = z.infer<typeof schema>;

const CreateAccForm = ({ onBack }: NewAccountFormProps) => {
  const [user, setUser] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      code: '',
      name: '',
      email: '',
      password: '',
      confirmpassword: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('form subbmiting...', data);
  };

  useEffect(() => {
    const backAction = () => {
      onBack();
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? scale(20) : 0}
    >
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <CustomText
            variant="h5"
            fontFamily="Regular"
            fontSize={17}
            style={{
              fontWeight: '800',
              color: colors.textSecondary,
            }}
          >
            Sign Up
          </CustomText>
<View style={{paddingVertical:scale(12)}}>

          <Controller
            control={control}
            name="code"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Authorization code"
                value={value}
                onChangeText={onChange}
                iconName="code"
                iconType="Entypo"
                iconColor={colors.LoginIconColor}
                iconSize={20}
              />
            )}
          />
          {errors.code && (
            <CustomText variant="h7" style={{ color: colors.red }}>
              {errors.code.message}
            </CustomText>
          )}
</View>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  placeholder="Name"
                  value={value}
                  onChangeText={onChange}
                  iconName="user"
                  iconType="FontAwesome"
                  iconColor={colors.LoginIconColor}
                  iconSize={20}
                />
              )}
            />
            {errors.name && (
              <CustomText variant="h7" style={{ color: colors.red }}>
                {errors.name.message}
              </CustomText>
            )}
<View style={{paddingVertical:scale(12)}}>

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Email"
                value={value}
                onChangeText={onChange}
                iconName="email"
                iconType="MaterialIcons"
                iconColor={colors.LoginIconColor}
                iconSize={20}
              />
            )}
          />
          {errors.email && (
            <CustomText variant="h7" style={{ color: colors.red }}>
              {errors.email.message}
            </CustomText>
          )}
</View>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Password"
                value={value}
                onChangeText={onChange}
                iconName="lock"
                iconType="Entypo"
                iconColor={colors.LoginIconColor}
                iconSize={20}
              />
            )}
          />
          {errors.password && (
            <CustomText variant="h7" style={{ color: colors.red }}>
              {errors.password.message}
            </CustomText>
          )}
<View style={{paddingVertical:scale(12)}}>

          <Controller
            control={control}
            name="confirmpassword"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Confirm Password"
                value={value}
                onChangeText={onChange}
                iconName="lock"
                iconType="Entypo"
                iconColor={colors.LoginIconColor}
                iconSize={20}
              />
            )}
          />
          {errors.confirmpassword && (
            <CustomText variant="h7" style={{ color: colors.red }}>
              {errors.confirmpassword.message}
            </CustomText>
          )}
</View>


          <CustomButton
            title="Create account"
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}
            backgroundColor={Colors.tertiary}
            fontColor="#fff"
            textStyle={{ fontSize: 16 }}
            style={{ marginTop: scale(16) }}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default CreateAccForm;
