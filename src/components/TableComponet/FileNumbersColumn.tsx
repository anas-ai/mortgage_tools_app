import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Animated,
  ScrollView,
  FlatList,
} from 'react-native';
import Modal from 'react-native-modal';
import CustomText from '../common/CustomText';
import { moderateScale, scale } from 'react-native-size-matters';
import { colors } from '../../styles/Colors';
import VectorIcon from '../common/CustomIcons';
import CustomInput from '../common/CustomInput';
import CustomButton from '../common/CustomButton';
import { Colors } from '../../constants/constants';
import { Dropdown } from 'react-native-element-dropdown';
import { Controller, useForm } from 'react-hook-form';
import ExpandableSection from '../common/ExpandableSection ';
import axiosInstance from '../../utils/axiosInstance';
import { ApiConfig } from '../../config/apiConfig';
import { GetObjectFromStorage } from '../../utils/MmkvStorageHelper';
import debounce from 'lodash.debounce';

type Props = {
  visible: boolean;
  onClose: () => void;
  item: any;
};

type FormValues = {
  fileNumber: string;
  borrower: string;
};

const FileNumbersColumn = ({ visible, onClose, item }: Props) => {
  console.log(item, 'item');

  const { control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      fileNumber:
        item?.get_account_i_d?.get_account_number?.account_number || '',
      borrower: '',
    },
  });

  useEffect(() => {
    reset({
      fileNumber:
        item?.get_account_i_d?.get_account_number?.account_number || '',
    });
  }, [item, reset]);

  const userOptions = [
    { label: 'User 1', value: 'user1' },
    { label: 'User 2', value: 'user2' },
    { label: 'User 3', value: 'user3' },
  ];
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const userInfo = GetObjectFromStorage<any>('userInfo');

  const fetchBorrowers = async (text: string) => {
    if (!text) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        ApiConfig.FETCH_BORROWERS_API(userInfo.id, 0, text),
      );
      setResults(res.data || []);
      console.log(res.data, 'response');
      reset({ borrower: '' });
    } catch (error: any) {
      console.error('Error fetching  borrowers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      fetchBorrowers(text);
    }, 500),
    [],
  );
  const getValues = () => {
    return {
      fileNumber: control._formValues.fileNumber,
      borrower: control._formValues.borrower,
    };
  };

  useEffect(() => {
    if (!visible) {
      setResults([]);
      reset({
        fileNumber:
          item?.get_account_i_d?.get_account_number?.account_number || '',
        borrower: '',
      });
    }
  }, [visible, item, reset]);

  return (
    <Modal
      style={styles.modalContainer}
      isVisible={visible}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
    >
      <View style={styles.modalWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <CustomText
            variant="h5"
            fontFamily="Medium"
            style={styles.headerText}
          >
            Update File Number
          </CustomText>

          <VectorIcon
            type="Ionicons"
            name="close"
            color={colors.graytextColor}
            size={scale(26)}
            onPress={onClose}
          />
        </View>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={{
                paddingVertical: scale(14),
                paddingHorizontal: scale(16),
              }}
            >
              <View>
                <CustomText
                  variant="h6"
                  fontFamily="Bold"
                  fontSize={15}
                  style={{ fontWeight: '500', color: colors.bgBlack }}
                >
                  File Number
                </CustomText>

                <Controller
                  control={control}
                  name="fileNumber"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput
                      iconType="Feather"
                      iconName="hash"
                      placeholder="Enter File Number"
                      placeholderTextColor={colors.graytextColor}
                      iconColor={colors.graytextColor}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      style={{ color: colors.black, fontWeight: 'bold' }}
                    />
                  )}
                />
              </View>
              <View style={{ paddingTop: scale(16) }}>
                <CustomText
                  variant="h6"
                  fontFamily="Bold"
                  fontSize={15}
                  style={{ fontWeight: '500', color: colors.bgBlack }}
                >
                  Add Borrowers
                </CustomText>

                <Controller
                  control={control}
                  name="borrower"
                  render={({ field: { value, onChange } }) => (
                    <CustomInput
                      iconType="Ionicons"
                      iconName="search"
                      iconColor={colors.graytextColor}
                      placeholder="Search borrower name"
                      placeholderTextColor={colors.graytextColor}
                      style={{ color: colors.black, fontWeight: 'bold' }}
                      iconSize={22}
                      value={value}
                      onChangeText={text => {
                        onChange(text);
                        debouncedSearch(text);
                      }}
                      loading={loading}
                    />
                  )}
                />
              </View>

              {results.length > 0 && (
                <View
                  style={{
                    borderWidth: 0.5,
                    borderColor: colors.graytextColor,
                    borderRadius: scale(5),
                    marginTop: scale(6),
                    maxHeight: scale(150),
                    backgroundColor: colors.white,
                    elevation: 2,
                  }}
                >
                  <ScrollView nestedScrollEnabled>
                    {results.map(item => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          setResults([]);
                          reset({
                            ...getValues(),
                            borrower: item?.account_number,
                          });
                        }}
                        style={{
                          paddingVertical: scale(10),
                          paddingHorizontal: scale(12),
                          borderBottomWidth: 0.2,
                          borderBottomColor: colors.graytextColor,
                        }}
                      >
                        <CustomText
                          variant="h6"
                          style={{ color: colors.black }}
                        >
                          {`${item?.firstname} ${item?.lastname || ''}`}
                        </CustomText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: scale(16),
                  paddingTop: scale(8),
                }}
              >
                <CustomButton
                  title="Create"
                  backgroundColor={'#6366F1'}
                  fontColor="#fff"
                  textStyle={{ fontSize: scale(14) }}
                  style={{ width: '30%', borderRadius: scale(5), height: 50 }}
                />
                <CustomButton
                  title="Add User"
                  backgroundColor={'#6366F1'}
                  fontColor="#fff"
                  textStyle={{ fontSize: scale(14) }}
                  style={{ width: '30%', borderRadius: scale(5), height: 50 }}
                />
              </View>

              <TouchableOpacity activeOpacity={0.8}>
                <CustomText
                  variant="h6"
                  fontSize={15}
                  fontFamily="Bold"
                  style={{ color: '#6366F1', paddingTop: 10 }}
                >
                  + Add More Borrower
                </CustomText>
              </TouchableOpacity>

              <CustomText
                variant="h6"
                fontFamily="Bold"
                fontSize={15}
                style={{
                  fontWeight: '500',
                  color: colors.bgBlack,
                  paddingTop: scale(30),
                }}
              >
                Communicate With
              </CustomText>

              <Dropdown
                style={styles.dropdown}
                data={userOptions}
                placeholder="Select User"
                labelField="label"
                valueField="value"
                value={selectedUser}
                selectedTextStyle={{ paddingLeft: scale(20) }}
                onChange={item => setSelectedUser(item.value)}
                placeholderStyle={{ paddingLeft: scale(20) }}
                renderLeftIcon={() => (
                  <VectorIcon type="Entypo" name="flow-tree" size={20} />
                )}
              />

              <ExpandableSection
                marginTop={20}
                title="Property & File Overview"
                outputRange={scale(390)}
              >
                <View>
                  <View>
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      fontSize={14}
                      style={{ fontWeight: '500', color: colors.bgBlack }}
                    >
                      Property Address
                    </CustomText>

                    <Controller
                      control={control}
                      name="fileNumber"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomInput
                          iconType="Entypo"
                          iconName="home"
                          placeholder="Enter property address"
                          placeholderTextColor={colors.graytextColor}
                          iconColor={colors.graytextColor}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          style={{ color: colors.black, fontWeight: 'bold' }}
                        />
                      )}
                    />
                  </View>
                  <View style={{ paddingVertical: scale(10) }}>
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      fontSize={14}
                      style={{ fontWeight: '500', color: colors.bgBlack }}
                    >
                      GDS (%)
                    </CustomText>

                    <Controller
                      control={control}
                      name="fileNumber"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomInput
                          iconType="Ionicons"
                          iconName="calculator"
                          placeholder="Enter GDS (%)"
                          placeholderTextColor={colors.graytextColor}
                          iconColor={colors.graytextColor}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          style={{ color: colors.black, fontWeight: 'bold' }}
                        />
                      )}
                    />
                  </View>
                  <View>
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      fontSize={14}
                      style={{ fontWeight: '500', color: colors.bgBlack }}
                    >
                      Property Value
                    </CustomText>

                    <Controller
                      control={control}
                      name="fileNumber"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomInput
                          iconType="FontAwesome"
                          iconName="dollar"
                          placeholder="Enter Property Value"
                          placeholderTextColor={colors.graytextColor}
                          iconColor={colors.graytextColor}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          style={{ color: colors.black, fontWeight: 'bold' }}
                        />
                      )}
                    />
                  </View>
                  <View style={{ paddingVertical: scale(10) }}>
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      fontSize={14}
                      style={{ fontWeight: '500', color: colors.bgBlack }}
                    >
                      TDS (%)
                    </CustomText>

                    <Controller
                      control={control}
                      name="fileNumber"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomInput
                          iconType="Entypo"
                          iconName="calculator"
                          placeholder="Enter TDS (%)"
                          placeholderTextColor={colors.graytextColor}
                          iconColor={colors.graytextColor}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          style={{ color: colors.black, fontWeight: 'bold' }}
                        />
                      )}
                    />
                  </View>
                  <View>
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      fontSize={14}
                      style={{ fontWeight: '500', color: colors.bgBlack }}
                    >
                      Occupancy
                    </CustomText>

                    <Controller
                      control={control}
                      name="fileNumber"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Dropdown
                          style={styles.dropdown}
                          data={userOptions}
                          placeholder="Select Occupancy"
                          labelField="label"
                          valueField="value"
                          value={selectedUser}
                          selectedTextStyle={{ paddingLeft: scale(20) }}
                          onChange={item => setSelectedUser(item.value)}
                          placeholderStyle={{ paddingLeft: scale(20) }}
                          renderLeftIcon={() => (
                            <VectorIcon
                              type="MaterialIcons"
                              name="business-center"
                              size={20}
                            />
                          )}
                        />
                      )}
                    />
                  </View>
                  <View style={{ paddingVertical: scale(10) }}>
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      fontSize={14}
                      style={{ fontWeight: '500', color: colors.bgBlack }}
                    >
                      LTV (%)
                    </CustomText>

                    <Controller
                      control={control}
                      name="fileNumber"
                      render={({ field: { onChange, onBlur, value } }) => (
                        <CustomInput
                          iconType="Entypo"
                          iconName="calculator"
                          placeholder="Enter LTV (%)"
                          placeholderTextColor={colors.graytextColor}
                          iconColor={colors.graytextColor}
                          value={value}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          style={{ color: colors.black, fontWeight: 'bold' }}
                        />
                      )}
                    />
                  </View>
                </View>
              </ExpandableSection>

              <ExpandableSection
                title="Mortgage(s)"
                marginTop={10}
                marginBottom={40}
              >
                <View>
                  <View
                    style={{
                      paddingVertical: scale(10),
                      marginBottom: scale(40),
                    }}
                  >
                    <CustomText
                      variant="h6"
                      fontSize={15}
                      fontFamily="Bold"
                      style={{ color: '#6366F1' }}
                    >
                      + Add More Mortgage
                    </CustomText>
                  </View>
                </View>
              </ExpandableSection>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
      <View
        style={{
          backgroundColor: colors.white,
          position: 'absolute',
          bottom: 0,
          width: '100%',
          elevation: 5,
          padding: scale(20),
          justifyContent: 'center',
          alignItems: 'flex-end',
          borderTopWidth: 0.5,
          borderTopColor: colors.graytextColor,
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
            title="Update file"
            backgroundColor={'#6366F1'}
            fontColor="#fff"
            textStyle={{ fontSize: scale(14) }}
            style={{ width: '30%' }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: 'center',
    margin: 0,
  },
  modalWrapper: {
    flex: 1,
    backgroundColor: colors.white,
    width: '100%',
  },
  header: {
    backgroundColor: colors.lightGray,
    padding: scale(15),
    borderBottomColor: colors.black,
    borderBottomWidth: 0.1,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: colors.bgBlack1,
    fontWeight: 'bold',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: '100%',
    height: scale(40),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: scale(8),
    paddingHorizontal: scale(10),
    marginTop: scale(8),
  },
});

export default FileNumbersColumn;
