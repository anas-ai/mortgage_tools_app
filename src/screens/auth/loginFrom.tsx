import React, { useState } from 'react';
import { Alert, TouchableOpacity, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import CustomButton from '../../components/common/CustomButton';
import CustomCheckBox from '../../components/common/CustomCheckBox';
import CustomInput from '../../components/common/CustomInput';
import CustomText from '../../components/common/CustomText';
import { Colors } from '../../constants/constants';
import { colors } from '../../styles/Colors';
import { styles } from './styles/FormStyles';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../../store/authStore';
import axiosInstance from '../../utils/axiosInstance';
import { ApiConfig } from '../../config/apiConfig';
import { useToast } from 'react-native-toast-notifications';
import { login } from '../../services/AuthServices';

const schema = z.object({
  username: z.string().min(1, 'Enter username'),
  password: z.string().min(1, 'Enter password'),
});

type FormData = z.infer<typeof schema>;

const LoginFrom = ({
  onNavigate,
}: {
  onNavigate: (screen: 'forgot' | 'signUp') => void;
}) => {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const success = await login(data);
      if (success) {
        toast.show('Login Successful', {
          type: 'success',
          placement: 'bottom',
          duration: 2000,
        });
      }
    } catch {
      toast.show('Login Failed. Please check your credentials.', {
        type: 'danger',
        placement: 'top',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
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
            Sign In
          </CustomText>
          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="username"
                value={value}
                onChangeText={onChange}
                iconName="user"
                iconType="FontAwesome"
                iconColor={colors.LoginIconColor}
                iconSize={20}
              />
            )}
          />
          {errors.username && (
            <CustomText variant="h7" style={{ color: colors.red }}>
              {errors.username.message}
            </CustomText>
          )}

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
                iconSize={20}
                size={20}
                isPassword
              />
            )}
          />

          {errors.password && (
            <CustomText variant="h7" style={{ color: colors.red }}>
              {errors.password.message}
            </CustomText>
          )}

          <CustomCheckBox
            title="Remember Me"
            color={colors.textSecondary}
            containerStyle={{ marginTop: 20 }}
          />

          <CustomButton
            title={'Submit'}
            onPress={handleSubmit(onSubmit)}
            backgroundColor={Colors.tertiary}
            fontColor="#fff"
            textStyle={{ fontSize: 16 }}
            style={{ marginTop: scale(16) }}
            loading={loading}
            loaderColor={colors.white}
          />
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginHorizontal: scale(20),
          bottom: scale(50),
        }}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onNavigate('forgot')}
        >
          <CustomText
            variant="h7"
            fontFamily="Regular"
            fontSize={12}
            style={{ color: colors.white, opacity: 0.6 }}
          >
            Forgot Password ?
          </CustomText>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onNavigate('signUp')}
        >
          <CustomText
            variant="h7"
            fontFamily="Regular"
            fontSize={12}
            style={{ color: colors.white, opacity: 0.6 }}
          >
            Create new account
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default LoginFrom;
