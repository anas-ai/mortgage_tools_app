import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { color, Skeleton } from '@rneui/base';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Modal from 'react-native-modal';
import { scale, ScaledSheet } from 'react-native-size-matters';
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
import Config from 'react-native-config';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import CustomCheckBox from '../common/CustomCheckBox';
import CustomButton from '../common/CustomButton';
import { useToast } from 'react-native-toast-notifications';
const Tab = createMaterialTopTabNavigator();

const ChatColumn = ({ file }: any) => {
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const userInfo = GetObjectFromStorage<any>('userInfo');
  const [sharedData, setSharedData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [borrowerId, setBorrowerId] = useState<any>();
  const [personalNoteId, setPerSonalNoteId] = useState<any>();
  const [partnerId, setPartnerId] = useState<any>();
  const [canAddNote, setCanAddNote] = useState<{ [key: number]: boolean }>({});
  const [addUsers, setAddUsers] = useState<any | []>([]);
  const [addUserModalVisible, setAddUserModalVisible] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [SkeletonLoading,setSkeletonLoading] = useState<{ [key: number]: boolean }>({});
  const toast = useToast();
  const inputRefs = useRef<{ [key: number]: any }>({});
  // console.log(userInfo, 'userInfo');

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
      // console.log(chatTypes, 'chatypes');
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

  const handleAddUsers = async () => {
    setAddUserModalVisible(true);

    try {
      const res = await axiosInstance.get(
        ApiConfig.FILE_USERS_API(file.get_account_i_d.account_id),
      );
      console.log(res?.data?.members, 'File users');
      const members = res?.data?.members || [];
      setAddUsers(members);
      const allowedIds = members
        .filter((u: any) => u.allowed)
        .map((u: any) => u.id);
      setSelectedUsers(allowedIds);
    } catch (error: any) {
      console.log(error.message, 'Error fetching file users');
    }
  };

  const toggleUserSeletion = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId],
    );
  };

  const handleAddAllowUser = async () => {
    try {
      const res = await axiosInstance.post(ApiConfig.ADD_ALLOW_USERS_API, {
        log_id: file.get_account_i_d.account_id,
        allowusernote: selectedUsers,
      });
      console.log(res?.data, 'add Allow User Response:');

      setAddUserModalVisible(false);

      setSelectedUsers([]);
    } catch (error: any) {
      console.log(error.message, 'Error adding allow user');
    }
  };

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
    const [seenUsers, setSeenUsers] = useState<any[]>([]);
    const [showSeenPopup, setShowSeenPopup] = useState(false);
    const [isReplyDelete, setIsReplyDelete] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState<boolean>(false);
    const [isReplying, setIsReplying] = useState<{ [key: number]: boolean }>(
      {},
    );
    const [activeChatId, setActiveChatId] = useState<number | null>(null);
    const [isSeen, setIsSeen] = useState<{ [key: number]: boolean }>({});

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
        replyContent: '',
      },
    });

    const content = watch('content');

    const fetchChat = useCallback(async () => {
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
        // console.log(res?.data, 'chatdata');
        setCanAddNote(res?.data?.canAddNote);
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setLoading(false);
      }
    }, [file?.get_account_i_d?.account_id, role, userInfo?.id]);

    useFocusEffect(
      useCallback(() => {
        fetchChat();
      }, [fetchChat]),
    );

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

    const handleChatLike = async (chatId: number, isReply: boolean = false) => {
      setLoadingChatIds(prev => ({ ...prev, [chatId]: true }));
      try {
        const res = await axiosInstance.post(ApiConfig.CHAT_LIKE_API, {
          user_id: userInfo?.id,
          chat_id: chatId,
        });
        if (res?.data?.status) {
          setChatData((prev: any[]) =>
            prev.map(item => {
              if (!isReply) {
                return item.id === chatId
                  ? {
                      ...item,
                      likes: res?.data.likes,
                      my_like: res?.data?.my_like,
                    }
                  : item;
              } else {
                return {
                  ...item,
                  replies: item.replies?.map((reply: any) =>
                    reply.id === chatId
                      ? {
                          ...reply,
                          likes: res?.data.likes,
                          my_like: res.data.my_like,
                        }
                      : reply,
                  ),
                };
              }
            }),
          );
        }
      } catch (error) {
        console.error('Error liking chat:', error);
      } finally {
        setLoadingChatIds(prev => ({ ...prev, [chatId]: false }));
      }
    };

    const handleDeleteChat = async (
      chatId: number,
      isReply: boolean = false,
    ) => {
      console.log('Deleting chat with ID:', chatId, 'isReply:', isReply); // Debug log
      alertRef.current?.close();
      try {
        const res = await axiosInstance.post(ApiConfig.DELETE_USER_CHAT_API, {
          chat_id: chatId,
        });

        console.log('Delete API response:', res?.data); // Debug log

        if (res?.data.status) {
          setChatData((prev: any[]) => {
            // Create a deep copy of the previous state
            const updatedChatData = [...prev];
            if (!isReply) {
              // 🔹 Delete main chat
              const filteredData = updatedChatData.filter(
                (chat: any) => chat.id !== chatId,
              );
              // console.log('Updated chatData after deletion:', filteredData); // Debug log
              return filteredData;
            } else {
              // 🔹 Delete reply inside replies
              const updatedData = updatedChatData.map((item: any) => ({
                ...item,
                replies:
                  item.replies?.filter((reply: any) => reply.id !== chatId) ||
                  [],
              }));
              // console.log(
              //   'Updated chatData after reply deletion:',
              //   updatedData,
              // ); // Debug log
              return updatedData;
            }
          });

          console.log('Chat deleted successfully');
        } else {
          console.error(
            'Failed to delete chat:',
            res?.data?.message || 'Unknown error',
          );
        }
      } catch (error: any) {
        console.error(
          'Error deleting chat:',
          error?.response?.data || error.message,
        );
      } finally {
        alertRef.current?.close();
        setDeleteChatId(null);
        setIsReplyDelete(false);
      }
    };

    const handleUpdateChat =
      (chatId: number, isReply: boolean = false) =>
      async (data: { updatedContent: string }) => {
        setIsUpdating(true);
        try {
          const res = await axiosInstance.post(ApiConfig.CHAT_UPDATE_API, {
            chat_id: chatId,
            content: data.updatedContent,
            user_id: userInfo?.id,
          });
          if (res?.data.status) {
            setChatData((prev: any[]) =>
              prev.map(item => {
                if (!isReply) {
                  return item.id === chatId
                    ? { ...item, content: data.updatedContent }
                    : item;
                } else {
                  return {
                    ...item,
                    replies: item.replies?.map((reply: any) =>
                      reply.id === chatId
                        ? { ...reply, content: data.updatedContent }
                        : reply,
                    ),
                  };
                }
              }),
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
        } finally {
          setIsUpdating(false);
        }
      };

    const handleSeenChat = async (chatId: number) => {
      setIsSeen(prev => ({ ...prev, [chatId]: true }));
      try {
        if (activeChatId === chatId && showSeenPopup) {
          setShowSeenPopup(false);
          setActiveChatId(null);
          setSeenUsers([]);
          return;
        }

        const res = await axiosInstance.get(
          ApiConfig.SEEN_USER_CHAT_API(chatId),
        );

        console.log(res?.data, 'seen users');

        if (res?.data?.success) {
          setSeenUsers(res?.data?.data);
          setActiveChatId(chatId);
          setShowSeenPopup(true);
        }
      } catch (error) {
        console.error('Error fetching seen users:', error);
      } finally {
        setIsSeen(prev => ({ ...prev, [chatId]: false }));
      }
    };

    const handleReplyChat = async (replyId: number, replyContent: string) => {
      if (!replyContent.trim()) return;
      setIsReplying(prev => ({ ...prev, [replyId]: true }));
      try {
        const res = await axiosInstance.post(ApiConfig.SEND_USER_CHAT_API, {
          role: role,
          user_id: userInfo?.id,
          log_id: file?.get_account_i_d?.account_id,
          reply_to: replyId,
          content: replyContent,
        });

        console.log(res?.data, 'reply');

        if (res?.data?.status && res?.data?.chat) {
          const newReply = {
            id: res.data.chat.id,
            user_id: res.data.chat.user_id,
            user_name: userInfo?.name ?? 'Unknown',
            profile_pic: userInfo?.profile_pic_url ?? '',
            content: res.data.chat.content,
            likes: 0,
            my_like: false,
            date: res.data.chat.added_on
              ? res.data.chat.added_on.split(' ')[0]
              : new Date().toISOString().split('T')[0],
          };

          // Update the chatData state by adding the new reply to the correct chat's replies array
          setChatData((prev: any[]) =>
            prev.map(item =>
              item.id === replyId
                ? { ...item, replies: [...(item.replies || []), newReply] }
                : item,
            ),
          );

          reset({ replyContent: '' }); // Clear the reply input
        } else {
          console.error(
            'Failed to send reply:',
            res?.data?.message || 'Unknown error',
          );
        }
      } catch (error: any) {
        console.error('Reply error:', error?.response?.data || error.message);
      } finally {
        setIsReplying(prev => ({ ...prev, [replyId]: false }));
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
            {item?.profile_pic ? (
              <Image
                source={{ uri: item?.profile_pic }}
                style={styles.ProfileImg}
              />
            ) : (
              <View
                style={{
                  width: scale(30),
                  height: scale(30),
                  borderRadius: scale(50),
                  backgroundColor: Colors.tertiary,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CustomText
                  variant="h6"
                  fontFamily="Medium"
                  style={{ color: colors.white, fontWeight: '600' }}
                >
                  {item?.user_name
                    ? `${item.user_name.charAt(0)}${
                        item.user_name.split(' ').length > 1
                          ? item.user_name.split(' ').slice(-1)[0].charAt(0)
                          : ''
                      }`.toUpperCase()
                    : ''}
                </CustomText>
              </View>
            )}

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
                  setIsReplyDelete(false);
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
              {isUpdating ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <CustomText
                  variant="h6"
                  fontFamily="Medium"
                  style={{ color: colors.white, fontWeight: '500' }}
                >
                  Update
                </CustomText>
              )}
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
            onPress={() => handleSeenChat(item?.id)}
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

          {showSeenPopup &&
            activeChatId === item?.id &&
            seenUsers.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: scale(20),
                  right: scale(10),
                  backgroundColor: colors.white,
                  borderRadius: scale(10),
                  padding: scale(8),
                  shadowColor: '#000',
                  shadowOpacity: 0.15,
                  shadowRadius: 6,
                  elevation: 6,
                  borderWidth: 0.5,
                  borderColor: colors.borderGrey,
                  zIndex: 999,
                }}
              >
                <FlatList
                  data={seenUsers}
                  horizontal
                  keyExtractor={(_, index) => index.toString()}
                  renderItem={({ item }) => (
                    <Image
                      source={{
                        uri: `${Config.IMG_BASE_URL}${item.profile_pic}`,
                      }}
                      style={{
                        width: scale(30),
                        height: scale(30),
                        borderRadius: scale(20),
                        marginHorizontal: 4,
                        borderWidth: scale(0.5),
                        borderColor: colors.borderGrey,
                      }}
                    />
                  )}
                />
              </View>
            )}
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
            onPress={() => handleChatLike(item?.id, false)}
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

        {item.replies?.length > 0 && (
          <View
            style={{
              paddingHorizontal: scale(14),
              paddingVertical: scale(14),
              borderBottomWidth: scale(0.5),
              borderColor: '#cfcfcf',
            }}
          >
            <FlatList
              data={item.replies}
              keyExtractor={reply => reply.id.toString()}
              renderItem={({ item: reply }) => (
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: scale(10),
                      marginBottom: scale(12),
                    }}
                  >
                    <Image
                      source={{ uri: reply.profile_pic }}
                      style={styles.ProfileImg}
                    />
                    <View
                      style={{
                        backgroundColor: colors.lightGray,
                        paddingVertical: scale(12),
                        paddingHorizontal: scale(12),
                        flex: 1,
                        borderRadius: scale(10),
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}
                    >
                      {editChatId === reply.id ? (
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
                            onPress={handleSubmit(
                              handleUpdateChat(reply?.id, true),
                            )}
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
                            {isUpdating ? (
                              <ActivityIndicator
                                size="small"
                                color={colors.white}
                              />
                            ) : (
                              <CustomText
                                variant="h6"
                                fontFamily="Medium"
                                style={{
                                  color: colors.white,
                                  fontWeight: '500',
                                }}
                              >
                                Update
                              </CustomText>
                            )}
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <View>
                          <CustomText
                            variant="h6"
                            fontFamily="Medium"
                            style={{ fontWeight: '500' }}
                          >
                            {reply.user_name}
                          </CustomText>
                          <CustomText
                            variant="h6"
                            fontFamily="Medium"
                            style={{
                              fontWeight: '500',
                              paddingTop: scale(4),
                            }}
                          >
                            {reply.content}
                          </CustomText>
                        </View>
                      )}

                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() =>
                          setMenuVisible(
                            menuVisible === reply.id ? null : reply.id,
                          )
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
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      paddingHorizontal: scale(30),
                      justifyContent: 'space-around',
                    }}
                  >
                    <CustomText
                      variant="h7"
                      fontFamily="Medium"
                      style={{
                        color: colors.black,
                      }}
                    >
                      {reply?.date}
                    </CustomText>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: scale(4),
                        paddingHorizontal: scale(10),
                      }}
                      onPress={() => handleSeenChat(reply.id)}
                    >
                      <VectorIcon
                        type="Entypo"
                        name="eye"
                        color={colors.black}
                        size={18}
                        style={{ marginBottom: scale(4) }}
                      />
                    </TouchableOpacity>

                    {showSeenPopup &&
                      activeChatId === reply?.id &&
                      seenUsers.length > 0 &&
                      (isSeen[reply.id] ? (
                        <View>
                          <TouchableWithoutFeedback
                            onPress={() => setShowSeenPopup(false)}
                          >
                            <View
                              style={{
                                position: 'absolute',
                                top: scale(16),
                                right: scale(100),
                                backgroundColor: colors.white,
                                borderRadius: scale(10),
                                padding: scale(8),
                                shadowColor: '#000',
                                shadowOpacity: 0.15,
                                shadowRadius: 6,
                                elevation: 6,
                                borderWidth: 0.5,
                                borderColor: colors.borderGrey,
                                zIndex: 999,
                              }}
                            >
                              <ActivityIndicator
                                size="small"
                                color={Colors.tertiary}
                              />
                            </View>
                          </TouchableWithoutFeedback>
                        </View>
                      ) : (
                        <TouchableWithoutFeedback
                          onPress={() => setShowSeenPopup(false)}
                        >
                          <View
                            style={{
                              position: 'absolute',
                              top: scale(16),
                              right: scale(100),
                              backgroundColor: colors.white,
                              borderRadius: scale(10),
                              padding: scale(8),
                              shadowColor: '#000',
                              shadowOpacity: 0.15,
                              shadowRadius: 6,
                              elevation: 6,
                              borderWidth: 0.5,
                              borderColor: colors.borderGrey,
                              zIndex: 999,
                            }}
                          >
                            <FlatList
                              data={seenUsers}
                              horizontal
                              keyExtractor={(_, index) => index.toString()}
                              renderItem={({ item }) => (
                                <Image
                                  source={{
                                    uri: `${Config.IMG_BASE_URL}${item.profile_pic}`,
                                  }}
                                  style={{
                                    width: scale(30),
                                    height: scale(30),
                                    borderRadius: scale(20),
                                    marginHorizontal: 4,
                                    borderWidth: scale(0.5),
                                    borderColor: colors.borderGrey,
                                  }}
                                />
                              )}
                            />
                          </View>
                        </TouchableWithoutFeedback>
                      ))}

                    <TouchableOpacity
                      onPress={() => handleChatLike(reply.id, true)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: scale(4),
                      }}
                    >
                      {loadingChatIds[reply.id] ? (
                        <ActivityIndicator
                          size="small"
                          color={Colors.tertiary}
                        />
                      ) : (
                        <>
                          <VectorIcon
                            type="MaterialIcons"
                            name="thumb-up"
                            color={
                              reply.likes
                                ? Colors.tertiary
                                : colors.graytextColor
                            }
                            size={18}
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
                            {reply.likes}
                          </CustomText>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  {menuVisible === reply.id && (
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
                          setEditChatId(reply.id);
                          setValue('updatedContent', reply.content);
                          setMenuVisible(null);
                        }}
                      >
                        <CustomText
                          variant="h6"
                          fontFamily="Medium"
                          style={{
                            color: colors.black,
                            marginVertical: scale(4),
                          }}
                        >
                          Edit
                        </CustomText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setDeleteChatId(reply.id);
                          setMenuVisible(null);
                          setIsReplyDelete(true);
                          alertRef.current?.open();
                        }}
                      >
                        <CustomText
                          variant="h6"
                          fontFamily="Medium"
                          style={{
                            color: colors.red,
                            marginVertical: scale(4),
                          }}
                        >
                          Delete
                        </CustomText>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            />
          </View>
        )}
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
            <Controller
              control={control}
              name="replyContent" // Changed from replayContent
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput
                  ref={(ref: any) => (inputRefs.current[item.id] = ref)}
                  placeholder="Write a reply..."
                  placeholderTextColor={colors.graytextColor}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  width={'70%'}
                  style={{
                    borderColor: inputRefs.current[item.id]
                      ? colors.primary
                      : colors.graytextColor,
                    borderWidth: 1,
                  }}
                />
              )}
            />
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ marginTop: scale(16) }}
            disabled={loading || !watch('replyContent')?.trim()}
            onPress={() => {
              const replyContent = watch('replyContent');
              if (replyContent && replyContent.trim()) {
                handleReplyChat(item.id, replyContent);
              }
            }}
          >
            {isReplying[item.id] ? (
              <ActivityIndicator size="small" color={Colors.tertiary} />
            ) : (
              <VectorIcon
                name="send"
                type="FontAwesome"
                color={Colors.tertiary}
                size={22}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    );

    const ChatSkeleton = () => {
      return (
        <View
          style={{
            backgroundColor: colors.white,
            elevation: 2,
            borderRadius: scale(5),
            marginTop: scale(16),
            paddingVertical: scale(8),
            paddingHorizontal: scale(10),
          }}
        >
          {/* Header row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: scale(10),
            }}
          >
            <Skeleton
              animation="wave"
              circle
              width={scale(30)}
              height={scale(30)}
            />
            <Skeleton animation="wave" width={120} height={16} />
          </View>

          {/* Message */}
          <Skeleton
            animation="wave"
            width={'90%'}
            height={14}
            style={{ marginTop: scale(12) }}
          />
          <Skeleton
            animation="wave"
            width={'60%'}
            height={14}
            style={{ marginTop: scale(6) }}
          />

          {/* Footer (like/reply) */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: scale(16),
            }}
          >
            <Skeleton animation="wave" width={60} height={20} />
            <Skeleton animation="wave" width={60} height={20} />
          </View>
        </View>
      );
    };
    return (
      <>
        <View style={[styles.tabContent]}>
          <FlatList
            data={loading ? Array(3).fill({}) : chatData} 
            renderItem={({ item, index }) =>
              loading ? <ChatSkeleton /> : renderChatItem({ item, index })
            }
            keyExtractor={(item, index) =>
              item?.id?.toString() || index.toString()
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: scale(180), flexGrow: 1 }}
            initialNumToRender={10}
            windowSize={5}
            updateCellsBatchingPeriod={50}
            extraData={[chatData, loading, menuVisible, editChatId, isReplying]}
            ListEmptyComponent={() =>
              !loading && (
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
              )
            }
          />
        </View>

        <KeyboardAvoidingView
          style={{
            backgroundColor: colors.white,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            paddingVertical: scale(20),
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
        </KeyboardAvoidingView>
        <AlertPro
          ref={alertRef}
          onConfirm={() => {
            if (deleteChatId !== null) {
              handleDeleteChat(deleteChatId, isReplyDelete);
            }
          }}
          onCancel={() => alertRef.current?.close()}
          title="Delete confirmation"
          message="Are you sure you want to delete this chat?"
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
                fontFamily="Medium"
                variant="h7"
                style={{ fontWeight: 'bold' }}
              >
                {fileName
                  ? fileName.length > 30
                    ? `${fileName.slice(0, 25)}...`
                    : fileName
                  : ''}
              </CustomText>
            </View>

            {canAddNote && (
              <TouchableOpacity onPress={handleAddUsers}>
                <CustomText
                  variant="h6"
                  fontFamily="Bold"
                  style={{ color: Colors.tertiary, fontWeight: 'bold' }}
                >
                  + Add User
                </CustomText>
              </TouchableOpacity>
            )}

            <VectorIcon
              type="Ionicons"
              name="close"
              color={colors.graytextColor}
              onPress={() => setIsChatModalOpen(false)}
              size={scale(26)}
              style={{ paddingRight: scale(12) }}
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

      {canAddNote && (
        <Modal
          style={{ flex: 1, alignItems: 'center', margin: 0 }}
          isVisible={addUserModalVisible}
          onBackdropPress={() => setAddUserModalVisible(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: colors.lightGray,
              width: '100%',
            }}
          >
            <View
              style={{
                backgroundColor: colors.white,
                padding: scale(10),
                borderBottomColor: colors.black,
                borderBottomWidth: 0.1,
                elevation: 3,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <CustomText
                variant="h5"
                fontFamily="Medium"
                style={{ color: colors.bgBlack1, fontWeight: 'bold' }}
              >
                Allow To Personnal Note
              </CustomText>

              <VectorIcon
                type="Ionicons"
                name="close"
                color={colors.graytextColor}
                onPress={() => setAddUserModalVisible(false)}
                size={scale(26)}
              />
            </View>
            <View style={{ justifyContent: 'center', padding: scale(20) }}>
              <View
                style={{
                  backgroundColor: colors.white,
                  paddingHorizontal: scale(10),
                  borderRadius: scale(8),
                  justifyContent: 'center',
                  paddingVertical: scale(10),
                }}
              >
                <FlatList
                  data={addUsers}
                  keyExtractor={item => item.id.toString()}
                  renderItem={({ item: user }) => (
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingVertical: scale(8),
                      }}
                    >
                      {/* Left side: Image + Name */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: scale(10),
                        }}
                      >
                        {user?.profile ? (
                          <Image
                            source={{ uri: user.profile }}
                            style={{
                              width: scale(30),
                              height: scale(30),
                              borderRadius: scale(20),
                            }}
                          />
                        ) : (
                          <View
                            style={{
                              width: scale(30),
                              height: scale(30),
                              backgroundColor: Colors.tertiary,
                              borderRadius: scale(20),
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CustomText
                              variant="h7"
                              fontFamily="Regular"
                              style={{
                                color: colors.white,
                                fontWeight: 'bold',
                              }}
                            >
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </CustomText>
                          </View>
                        )}

                        <CustomText
                          variant="h6"
                          style={{ color: colors.bgBlack }}
                        >
                          {user.name}
                        </CustomText>
                      </View>

                      {/* Right side: Checkbox */}
                      <CustomCheckBox
                        isChecked={selectedUsers.includes(user.id)}
                        onPress={() => toggleUserSeletion(user.id)}
                      />
                    </View>
                  )}
                />
              </View>
            </View>

            <View
              style={{
                backgroundColor: colors.white,
                height: scale(80),
                position: 'absolute',
                bottom: 0,
                width: '100%',
                elevation: 10,
                padding: scale(20),
                justifyContent: 'center',
                alignItems: 'flex-end',
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: scale(25),
                }}
              >
                <TouchableOpacity activeOpacity={0.8}>
                  <CustomText
                    variant="h7"
                    fontSize={15}
                    fontFamily="Medium"
                    style={{ color: Colors.tertiary }}
                  >
                    Cancel
                  </CustomText>
                </TouchableOpacity>
                <CustomButton
                  title="Add User"
                  backgroundColor={Colors.tertiary}
                  fontColor="#fff"
                  textStyle={{ fontSize: scale(14) }}
                  style={{ width: '30%' }}
                  onPress={handleAddAllowUser}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}
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
