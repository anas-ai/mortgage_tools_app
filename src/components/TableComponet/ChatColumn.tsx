import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Skeleton } from '@rneui/base';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { scale } from 'react-native-size-matters';
import { ApiConfig } from '../../config/apiConfig';
import { colors } from '../../styles/Colors';
import axiosInstance from '../../utils/axiosInstance';
import { GetObjectFromStorage } from '../../utils/MmkvStorageHelper';
import VectorIcon from '../common/CustomIcons';
import CustomText from '../common/CustomText';
import CustomInput from '../common/CustomInput';
import { Colors } from '../../constants/constants';
import { Controller, useForm } from 'react-hook-form';
import AlertPro from 'react-native-alert-pro';

const Tab = createMaterialTopTabNavigator();

const ChatColumn = ({ file }: any) => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const userInfo = GetObjectFromStorage<any>('userInfo');
  const [sharedData, setSharedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [borrowerId, setBorrowerId] = useState<any>();
  const [personalNoteId, setPerSonalNoteId] = useState<any>();
  const [partnerId, setPartnerId] = useState<any>();

  const inputRefs = useRef<{ [key: number]: any }>({});

  const fileName =
    file?.['get_account_i_d']?.['get_account_number']?.['account_number'] ||
    'Unknown File';

  const fetchSharedUsers = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(
        ApiConfig.SHARED_USERS_API(
          file.get_account_i_d.account_id,
          userInfo.id,
        ),
      );

      const chatTypes = res?.data?.chatTypes || [];
      setSharedData(chatTypes);

      const borrower = chatTypes.find((item: any) => item.role === 5);
      const partner = chatTypes.find((item: any) => item.role === 4);
      const personalNote = chatTypes.find((item: any) => item.role === 10);

      setBorrowerId(borrower?.role || null);
      setPartnerId(partner?.role || null);
      setPerSonalNoteId(personalNote?.role || null);
    } catch (error: any) {
      console.error(error.message, 'error in the tabs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isChatModalOpen) {
      fetchSharedUsers();
    }
  }, [isChatModalOpen]);

  const TabContent = ({ role }: { role: number; label: string }) => {
    const [chatData, setChatData] = useState<any[] | any>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingChatIds, setLoadingChatIds] = useState<{
      [key: number]: boolean;
    }>({});

    const [menuVisible, setMenuVisible] = useState<number | null>(null);
    const [editChatId, setEditChatId] = useState<number | null>(null);
    const alertRef = useRef<AlertPro>(null);
    const [deleteChatId, setDeleteChatId] = useState<number | null>(null);

    const {
      control,
      handleSubmit,
      formState: { errors },
      watch,
      reset,
      setValue,
    } = useForm({
      defaultValues: {
        content: '',
        updatedContent: '',
      },
    });

    const content = watch('content');
    const fetchChat = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          ApiConfig.CHAT_API(
            file?.get_account_i_d?.account_id,
            role,
            userInfo?.id,
          ),
        );
        setChatData((res?.data?.chats || []).reverse());
        // console.log(res?.data?.chats, 'chatres');
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchChat();
    }, [role]);

    const sendMessage = async (data: { content: string }) => {
      setLoading(true);
      try {
        const res: any = await axiosInstance.post(
          ApiConfig.SEND_USER_CHAT_API,
          {
            role: role,
            user_id: userInfo?.id,
            log_id: file?.get_account_i_d?.account_id,
            reply_to: null,
            content: data.content,
          },
        );

        console.log(res?.data, 'sendMessage');

        if (res?.data.status && res?.data.chat) {
          const newChat = {
            ...res.data.chat,
            likes: 0,
            date: res.data.chat.added_on
              ? res.data.chat.added_on.split(' ')[0]
              : new Date().toISOString().split('T')[0],
            my_like: false,
            user_name: userInfo?.name ?? 'Unknown',
            replies: [],
            profile_pic: userInfo?.profile_pic_url ?? '',
          };

          setChatData((prev: any[]) => [newChat, ...prev]);

          reset();
        }
      } catch (error: any) {
        console.log(error.message, 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleChatLike = async (chatId: number) => {
      setLoadingChatIds(prev => ({ ...prev, [chatId]: true }));
      try {
        const res = await axiosInstance.post(ApiConfig.CHAT_LIKE_API, {
          user_id: userInfo?.id,
          chat_id: chatId,
        });
        setChatData((prev: any[]) =>
          prev.map(item =>
            item.id === chatId
              ? {
                  ...item,
                  likes: res?.data.likes,
                  my_like: res?.data.my_like,
                }
              : item,
          ),
        );
      } catch (error) {
        console.error('Error liking chat:', error);
      } finally {
        setLoadingChatIds(prev => ({ ...prev, [chatId]: false }));
      }
    };

    const handleDeleteChat = async (chatId: number) => {
      alertRef.current?.close();
      try {
        const res = await axiosInstance.post(ApiConfig.DELETE_USER_CHAT_API, {
          chat_id: chatId,
        });
        if (res?.data.status) {
          setChatData((prev: any[]) => prev.filter(item => item.id !== chatId));
          console.log('Chat deleted successfully');
        } else {
          console.error(
            'Failed to delete chat:',
            res?.data?.message || 'Unknown error',
          );
        }
        console.log(res, 'Delete chat response');
      } catch (error: any) {
        console.log(
          'Error deleting chat:',
          error?.response?.data || error.message,
        );
      } finally {
        alertRef.current?.close();
      }
    };

    const handleUpdateChat =
      (chatId: number) => async (data: { updatedContent: string }) => {
        try {
          const res = await axiosInstance.post(ApiConfig.CHAT_UPDATE_API, {
            chat_id: chatId,
            content: data.updatedContent,
            user_id: userInfo?.id,
          });
          if (res?.data.status) {
            setChatData((prev: any[]) =>
              prev.map(item =>
                item.id === chatId
                  ? { ...item, content: data.updatedContent }
                  : item,
              ),
            );
            setEditChatId(null); // Exit edit mode
            reset({ updatedContent: '' }); // Reset updatedContent field
          } else {
            console.error(
              'Failed to update chat:',
              res?.data?.message || 'Unknown error',
            );
          }
        } catch (error: any) {
          console.error(
            'Error updating chat:',
            error?.response?.data || error.message,
          );
        }
      };

    const renderChatItem = ({ item, index }: { item: any; index: number }) => (
      <View
        key={item?.id}
        style={{
          backgroundColor: colors.white,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          borderRadius: scale(5),
          marginTop: index === 0 ? 0 : scale(16),
          width: '100%',
          paddingVertical: scale(8),
        }}
      >
        {/* Header row */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: scale(10),
            paddingVertical: scale(4),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(10),
            }}
          >
            <Image
              source={{ uri: item?.profile_pic }}
              style={styles.ProfileImg}
            />
            <CustomText
              variant="h6"
              fontFamily="Medium"
              style={{ color: colors.black, fontWeight: '500' }}
            >
              {item?.user_name}
            </CustomText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(12),
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                gap: scale(2),
                alignItems: 'center',
              }}
            >
              <VectorIcon
                type="Ionicons"
                name="time"
                color={colors.graytextColor}
                size={18}
              />
              <CustomText
                variant="h6"
                fontFamily="Medium"
                style={{ color: colors.graytextColor }}
              >
                {item?.date}
              </CustomText>
            </View>
            <TouchableOpacity
              activeOpacity={0.6}
              onPress={() =>
                setMenuVisible(menuVisible === item.id ? null : item.id)
              }
            >
              <VectorIcon
                type="Entypo"
                name="dots-three-vertical"
                color={colors.black}
                size={16}
              />
            </TouchableOpacity>
          </View>

          {menuVisible === item.id && (
            <View
              style={{
                position: 'absolute',
                top: scale(40),
                right: scale(10),
                backgroundColor: colors.white,
                borderRadius: scale(8),
                paddingVertical: scale(4),
                paddingHorizontal: scale(16),
                shadowColor: '#000',
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 5,
                borderWidth: 0.5,
                borderColor: colors.borderGrey,
                zIndex: 999,
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  setEditChatId(item.id);
                  setValue('updatedContent', item.content);
                  setMenuVisible(null);
                }}
              >
                <CustomText
                  variant="h6"
                  fontFamily="Medium"
                  style={{ color: colors.black, marginVertical: scale(4) }}
                >
                  Edit
                </CustomText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setDeleteChatId(item?.id);
                  setMenuVisible(null);
                  alertRef.current?.open();
                }}
              >
                <CustomText
                  variant="h6"
                  fontFamily="Medium"
                  style={{ color: colors.red, marginVertical: scale(4) }}
                >
                  Delete
                </CustomText>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {editChatId === item.id ? (
          <View style={{ marginHorizontal: scale(14) }}>
            <Controller
              control={control}
              name="updatedContent"
              render={({ field: { onChange, value } }) => (
                <CustomInput
                  placeholder={value}
                  value={value}
                  height={scale(40)}
                  onChangeText={onChange}
                />
              )}
            />

            <TouchableOpacity
              onPress={handleSubmit(handleUpdateChat(item?.id))}
              activeOpacity={0.8}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: scale(8),
                backgroundColor: colors.ButtonColor,
                paddingVertical: scale(8),
                borderRadius: scale(8),
                marginTop: scale(8),
              }}
            >
              <CustomText
                variant="h6"
                fontFamily="Medium"
                style={{ color: colors.white, fontWeight: '500' }}
              >
                Update
              </CustomText>
            </TouchableOpacity>
          </View>
        ) : (
          <CustomText
            variant="h6"
            fontFamily="Medium"
            style={{
              color: colors.bgBlack,
              fontWeight: '500',
              marginTop: scale(12),
              paddingHorizontal: scale(10),
            }}
          >
            {item?.content}
          </CustomText>
        )}
        {/* Content */}

        {/* Seen */}
        <View
          style={{
            alignItems: 'flex-end',
            marginTop: scale(10),
            paddingRight: scale(10),
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(4),
              paddingHorizontal: scale(10),
            }}
          >
            <VectorIcon
              type="Entypo"
              name="eye"
              color={colors.black}
              size={18}
              style={{ marginBottom: scale(4) }}
            />
            <CustomText
              variant="h7"
              fontFamily="Medium"
              style={{
                color: colors.bgBlack,
                fontWeight: '500',
                marginBottom: scale(4),
              }}
            >
              SEEN
            </CustomText>
          </TouchableOpacity>
        </View>

        {/* Like & Reply */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: scale(10),
            borderTopWidth: 0.5,
            borderBottomWidth: 0.5,
            borderColor: '#cfcfcf',
          }}
        >
          <TouchableOpacity
            onPress={() => handleChatLike(item?.id)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: scale(8),
              borderRightWidth: 0.5,
              borderRightColor: '#cfcfcf',
              flexDirection: 'row',
              gap: scale(4),
            }}
          >
            {loadingChatIds[item.id] ? (
              <ActivityIndicator />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <VectorIcon
                  type="MaterialIcons"
                  name="thumb-up"
                  color={item?.likes ? Colors.tertiary : colors.graytextColor}
                  size={20}
                />
                <CustomText
                  variant="h7"
                  fontFamily="Medium"
                  style={{
                    color: colors.bgBlack,
                    fontWeight: '500',
                    marginLeft: 6,
                  }}
                >
                  {item?.likes}
                </CustomText>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => inputRefs.current[item.id]?.focus()}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: scale(8),
              borderLeftWidth: 0.5,
              borderLeftColor: '#cfcfcf',
              flexDirection: 'row',
              gap: scale(4),
            }}
          >
            <VectorIcon
              type="FontAwesome5"
              name="reply"
              color={colors.bgBlack}
              size={20}
            />
            <CustomText
              variant="h7"
              fontFamily="Medium"
              style={{ color: colors.bgBlack, fontWeight: '500' }}
            >
              Reply
            </CustomText>
          </TouchableOpacity>
        </View>
        {/* Reply Input */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: scale(10),
            paddingBottom: scale(6),
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(10),
              marginTop: scale(10),
            }}
          >
            <Image
              source={{ uri: userInfo?.profile_pic_url }}
              style={{
                width: scale(30),
                height: scale(30),
                borderRadius: scale(20),
                marginTop: scale(10),
              }}
            />

            <CustomInput
              ref={(ref: any) => (inputRefs.current[item.id] = ref)}
              placeholder="Write a reply..."
              placeholderTextColor={colors.graytextColor}
              width={'70%'}
              style={{
                borderColor: inputRefs.current[item.id]
                  ? colors.primary
                  : colors.graytextColor,
                borderWidth: 1,
              }}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ marginTop: scale(16) }}
          >
            <VectorIcon
              name="send"
              type="FontAwesome"
              color={Colors.tertiary}
              size={22}
            />
          </TouchableOpacity>
        </View>
      </View>
    );

    return (
      <>
        <View style={[styles.tabContent]}>
          <FlatList
            data={chatData}
            renderItem={renderChatItem}
            keyExtractor={item => item?.id?.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: scale(180), flexGrow: 1 }}
            initialNumToRender={10} // Render fewer items initially
            windowSize={5} // Reduce the number of items rendered outside the viewport
            updateCellsBatchingPeriod={50} // Increase batch update frequency
            ListEmptyComponent={() => (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <VectorIcon
                  type="MaterialCommunityIcons"
                  name="message-off-outline"
                  color={colors.graytextColor}
                  size={50}
                  style={{
                    backgroundColor: '#E5E7EB',
                    padding: scale(10),
                    borderRadius: scale(50),
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
                <CustomText
                  variant="h4"
                  fontFamily="Medium"
                  style={{
                    fontWeight: 'bold',
                    color: '#252525',
                    marginTop: scale(10),
                  }}
                >
                  No Chat Found
                </CustomText>
                <CustomText
                  variant="h7"
                  style={{
                    alignSelf: 'center',
                    justifyContent: 'center',
                    marginTop: scale(6),
                    textAlign: 'center',
                  }}
                >
                  No chat activity. Please send a message to see the
                  conversation.
                </CustomText>
              </View>
            )}
          />
        </View>

        <View
          style={{
            backgroundColor: colors.white,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingVertical: scale(40),
            paddingHorizontal: scale(20),
            borderTopLeftRadius: scale(12),
            borderTopRightRadius: scale(12),
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: -2 },
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Controller
            control={control}
            name="content"
            render={({ field: { onChange, value } }) => (
              <CustomInput
                placeholder="Write a message..."
                placeholderTextColor={colors.graytextColor}
                height={scale(60)}
                value={value}
                onChangeText={onChange}
                style={{
                  borderWidth: 1,
                  borderColor: colors.graytextColor,
                  borderRadius: scale(8),
                  paddingHorizontal: scale(10),
                  marginBottom: scale(12),
                }}
              />
            )}
          />

          <TouchableOpacity
            onPress={handleSubmit(sendMessage)}
            disabled={!content}
            activeOpacity={0.8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: scale(8),
              backgroundColor: content ? colors.ButtonColor : colors.lightGreen,
              paddingVertical: scale(8),
              borderRadius: scale(8),
              marginTop: scale(8),
            }}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <VectorIcon
                type="FontAwesome"
                name="send"
                size={20}
                color={colors.white}
              />
            )}
            <CustomText
              variant="h6"
              fontFamily="Medium"
              style={{ color: colors.white, fontWeight: '500' }}
            >
              Send
            </CustomText>
          </TouchableOpacity>
        </View>
        <AlertPro
          ref={alertRef}
          onConfirm={() => {
            if (deleteChatId !== null) {
              handleDeleteChat(deleteChatId);
            }
          }}
          onCancel={() => alertRef.current?.close()}
          title="Delete confirmation"
          message="Are you sure you want to delete this item?"
          textCancel="Cancel"
          textConfirm="Delete"
          customStyles={{
            buttonCancel: {
              backgroundColor: colors.graytextColor,
            },
            buttonConfirm: {
              backgroundColor: colors.red,
            },
          }}
        />
      </>
    );
  };

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
              size={scale(26)}
              style={{ padding: scale(12) }}
            />
          </View>

          {loading ? (
            <View style={{ flexDirection: 'row', padding: 10 }}>
              <Skeleton
                animation="pulse"
                width={100}
                height={30}
                style={{ marginRight: 10, borderRadius: 8 }}
              />
              <Skeleton
                animation="pulse"
                width={100}
                height={30}
                style={{ marginRight: 10, borderRadius: 8 }}
              />
            </View>
          ) : sharedData.length > 0 ? (
            <Tab.Navigator>
              {sharedData.map(tab => (
                <Tab.Screen
                  key={tab.role}
                  name={tab.label}
                  children={() => (
                    <TabContent role={tab.role} label={tab.label} />
                  )}
                />
              ))}
            </Tab.Navigator>
          ) : (
            <View style={styles.tabContent}>
              <Text>No Chats Available</Text>
            </View>
          )}
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
  tabContent: {
    justifyContent: 'flex-start',
    padding: scale(20),
    flex: 1,
  },
});
