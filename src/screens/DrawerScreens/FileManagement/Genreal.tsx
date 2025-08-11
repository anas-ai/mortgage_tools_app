import { View, Text } from 'react-native'
import React from 'react'
import HeaderComponent from '../../../components/HeaderComponent'
import { Colors } from '../../../constants/constants'
import { colors } from '../../../styles/Colors'



const AddAccountScreen = ({navigation}:{navigation:any}) => {
  return (
    <View>
      <HeaderComponent
        title="Files"
        navigation={navigation}
        IconName="bars"
        IconSize={18}
        backgroundColor={Colors.tertiary}
        titleColor={colors.white}
        IconColor ={colors.white}
      />
      <Text>accunt_screen</Text>
    </View>
  )
}

export default AddAccountScreen