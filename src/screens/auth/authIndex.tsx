import React, { useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { scale } from 'react-native-size-matters';
import { IMG_NAMES } from '../../constants/constants';
import { colors } from '../../styles/Colors';
import LoginFrom from './loginFrom';
import CustomText from '../../components/common/CustomText';
import NewAccountForm from './CreateAccForm';
import ForgotPasswordForm from './forgotPasswordForm';
import CreateAccForm from './CreateAccForm';

const AuthIndex = () => {
  const [screen, setScreen] = useState<'login' | 'forgot' | 'signUp'>('login');

  const renderForm = () => {
    switch (screen) {
      case 'forgot':
        return <ForgotPasswordForm onBack={() => setScreen('login')} />;
      case 'signUp':
        return <CreateAccForm onBack={() => setScreen('login')} />;
      case 'login':
      default:
        return <LoginFrom onNavigate={setScreen} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <LinearGradient colors={['#6A11CB', '#3262F3']} style={styles.header}>
          <Image source={IMG_NAMES.APP_LOGO} style={styles.logoStyle} />
        </LinearGradient>
        {renderForm()}
        <CustomText
          variant="h7"
          style={{
            color: colors.graytextColor,
            textAlign: 'center',
            top: scale(180),
          }}
        >
          © 2025 All rights reserved by mortgage tools
        </CustomText>
    </ScrollView>
      </SafeAreaView>
  );
};

export default AuthIndex;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.LoginScreenBg,
  },
  header: {
    height: scale(200),
    alignItems: 'center',
    paddingTop: scale(20),
  },
  logoStyle: {
    resizeMode: 'contain',
    height: scale(100),
    width: scale(240),
  },
});
