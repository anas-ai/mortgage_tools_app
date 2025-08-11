import React, { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { scale } from 'react-native-size-matters';
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/common/CustomInput';
import CustomText from '../../components/common/CustomText';
import { Colors } from '../../constants/constants';
import { colors } from '../../styles/Colors';
import { styles } from './styles/FormStyles';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

type ForgotPasswordFormProps = {
  onBack: () => void;
};

const schema = z.object({
  username: z.string().min(1, 'Enter username'),
});

type FormData = z.infer<typeof schema>;

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('formData', data);
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
            Reset Password
          </CustomText>

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Enter your username"
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

          <CustomButton
            title="Send Password Reset Link"
            onPress={handleSubmit(onSubmit)}
            backgroundColor={Colors.tertiary}
            fontColor="#fff"
            textStyle={{ fontSize: 16 }}
            style={{ marginTop: scale(16) }}
          />
        </View>
      </View>
    </View>
  );
};

export default ForgotPasswordForm;
function onBack() {
  throw new Error('Function not implemented.');
}
