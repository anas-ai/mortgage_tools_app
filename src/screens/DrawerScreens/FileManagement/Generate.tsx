import { View, Text, SafeAreaView } from 'react-native';
import React from 'react';
import HeaderComponent from '../../../components/HeaderComponent';
import { Colors } from '../../../constants/constants';
import { colors } from '../../../styles/Colors';
import CustomText from '../../../components/common/CustomText';
import { scale } from 'react-native-size-matters';

const AddAccountScreen = ({ navigation }: { navigation: any }) => {
  return (
    <View style={{ flex: 1 }}>
      <HeaderComponent
        title="Files"
        navigation={navigation}
        IconName="bars"
        IconSize={20}
        backgroundColor={Colors.primary}
        titleColor={colors.white}
        IconColor={colors.white}
      />
      <SafeAreaView style={{ flex: 2 }}>
        <View
          style={{
            flex: 1,
            backgroundColor: Colors.primary,
            padding: scale(40),
          }}
        >
          <CustomText
            variant="h1"
            fontFamily="Medium"
            style={{ color: colors.white, alignSelf: 'center' }}
          >
            Create File Number
          </CustomText>
        </View>
        <View style={{ flex: 2, backgroundColor: colors.white }}></View>
      </SafeAreaView>
    </View>
  );
};

export default AddAccountScreen;
