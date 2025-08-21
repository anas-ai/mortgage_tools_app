import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  useWindowDimensions,
} from 'react-native';
import React, { useState } from 'react';
import VectorIcon from '../common/CustomIcons';
import { colors } from '../../styles/Colors';
import Modal from 'react-native-modal';
import { scale } from 'react-native-size-matters';
import { GetObjectFromStorage } from '../../utils/MmkvStorageHelper';
import CustomText from '../common/CustomText';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { Colors } from '../../constants/constants';

const ChatColumn = ({ file }: any) => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const userInfo = GetObjectFromStorage<any>('userInfo');
  //   console.log(userInfo, 'user');
  const fileName =
    file?.['get_account_i_d']?.['get_account_number']?.['account_number'] ||
    'Unknown File';

  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'borrower', title: 'Borrow' },
    { key: 'personal', title: 'personal' },
    { key: 'pernter', title: 'partner' },
  ]);

  const BorrowerRoute = () => {
    return (
      <View>
        <Text>borrower</Text>
      </View>
    );
  };
  const PersonalRoute = () => {
    return (
      <View>
        <Text>Personal Route</Text>
      </View>
    );
  };
  const PertnerRoute = () => {
    return (
      <View>
        <Text>fhj</Text>
      </View>
    );
  };

  const renderScene = SceneMap({
    borrower: BorrowerRoute,
    personal: PersonalRoute,
    pernter: PertnerRoute,
  });

  return (
    <View>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setIsChatModalOpen(true)}
      >
        <VectorIcon
          type="Ionicons"
          name="chatbubble-ellipses-outline"
          size={28}
          color={colors.black}
        />
      </TouchableOpacity>

      <Modal
        isVisible={isChatModalOpen}
        onBackdropPress={() => setIsChatModalOpen(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View style={styles.ProfleContent}>
              <Image
                source={{ uri: userInfo?.profile_pic_url }}
                style={styles.ProfileImg}
              />
              <CustomText
                variant="h6"
                fontFamily="Medium"
                style={{ fontWeight: 'bold' }}
              >
                {fileName}
              </CustomText>
            </View>

            <VectorIcon
              type="Ionicons"
              name="close"
              color={colors.graytextColor}
              onPress={() => setIsChatModalOpen(false)}
              size={scale(28)}
              style={{ padding: scale(12) }}
            />
          </View>

          <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={props => (
              <TabBar
                {...props}
                indicatorStyle={{
                  backgroundColor: Colors.tertiary,
                }}
                style={{ backgroundColor: colors.white }}
                activeColor={Colors.tertiary}
                inactiveColor={colors.graytextColor}
                pressColor="transparent"
                contentContainerStyle={{ justifyContent: 'center' }}
              />
            )}
          />
        </View>
      </Modal>
    </View>
  );
};

export default ChatColumn;

const styles = StyleSheet.create({
  modal: { flex: 1, margin: 0, alignItems: 'center' },
  modalContent: {
    flex: 1,
    backgroundColor: colors.white,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 0.5,
    borderBottomColor: colors.graytextColor,
    elevation: 0.5,
  },
  ProfleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scale(10),
    padding: scale(12),
  },
  ProfileImg: {
    width: scale(30),
    height: scale(30),
    borderRadius: scale(50),
    backgroundColor: colors.ButtonColor,
  },
});
