import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import CustomText from './common/CustomText';
import { scale } from 'react-native-size-matters';

interface ModalComponentProps {
  isLogoutModalVisible: boolean;
  setLogoutModalVisible: (visible: boolean) => void;
  ModalTitle: string;
  ModalText: string;
  ModalButtonText: string;
  onConfirm: () => void; // 👈 new prop to handle logout logic
}

const ModalComponent = ({
  isLogoutModalVisible,
  setLogoutModalVisible,
  ModalTitle,
  ModalText,
  ModalButtonText,
  onConfirm,
}: ModalComponentProps) => {
  const handleConfirm = () => {
    setLogoutModalVisible(false);
    onConfirm(); // 👈 trigger the action passed from parent
  };

  return (
    <Modal
      isVisible={isLogoutModalVisible}
      onBackdropPress={() => setLogoutModalVisible(false)}
      onBackButtonPress={() => setLogoutModalVisible(false)}
      animationIn={'fadeIn'}
      animationOut={'fadeOut'}
      animationInTiming={300}
      animationOutTiming={300}
      backdropTransitionOutTiming={0}
      useNativeDriver
    >
      <View style={style.constainer}>
        <CustomText variant="h4" fontFamily="Medium" style={style.textStyle}>
          {ModalTitle}
        </CustomText>
        <CustomText variant="h5" fontFamily="Medium" style={style.textStyle}>
          {ModalText}
        </CustomText>

        <View style={style.buttonContainer}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setLogoutModalVisible(false)}
            style={style.cancalStyle}
          >
            <CustomText variant="h5" fontFamily="Medium">
              Cancel
            </CustomText>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleConfirm}
            style={style.logoutStyle}
          >
            <CustomText
              variant="h5"
              fontFamily="Medium"
              style={{ color: 'white' }}
            >
              {ModalButtonText}
            </CustomText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ModalComponent;

const style = StyleSheet.create({
  constainer: {
    backgroundColor: 'white',
    padding: scale(20),
    borderRadius: scale(10),
  },
  textStyle: { marginBottom: scale(10), textAlign: 'center' },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  cancalStyle: {
    flex: 1,
    marginRight: scale(10),
    padding: scale(12),
    backgroundColor: '#ccc',
    borderRadius: 6,
    alignItems: 'center',
  },
  logoutStyle: {
    flex: 1,
    marginLeft: scale(10),
    padding: scale(12),
    backgroundColor: 'red',
    borderRadius: scale(6),
    alignItems: 'center',
  },
});
