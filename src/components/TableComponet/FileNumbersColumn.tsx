import { Divider } from '@rneui/themed';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { scale } from 'react-native-size-matters';
import { ApiConfig } from '../../config/apiConfig';
import { Colors } from '../../constants/constants';
import { colors } from '../../styles/Colors';
import axiosInstance from '../../utils/axiosInstance';
import { GetObjectFromStorage } from '../../utils/MmkvStorageHelper';
import CustomButton from '../common/CustomButton';
import VectorIcon from '../common/CustomIcons';
import CustomInput from '../common/CustomInput';
import CustomText from '../common/CustomText';
import ExpandableSection from '../common/ExpandableSection ';
import { createTransposedArray } from '../../helpers/HelperFuncitons';

type visiableProps = {
  open: boolean;
  data: any;
};

type Props = {
  visible: visiableProps;
  onClose: (open: boolean) => void;
};
type Borrowertype = {
  borrowerFirstName: string;
  borrowerLastName: string;
  borrower_DOB: string;
  borrower_email: string;
  borrower_phone: string;
  borrower_type: string;
};

// Define type for mortgage fields (adjust if your API has more/less)
type MortgageType = {
  balance: string;
  maturityDate: string;
  rateType: string;
  termType: string;
  lineOfBusiness: string;
  interestRate: string;
  discount: string;
  netRate: string;
  term: string;
  amortization: string;
  renewalDate: string;
};

type FormValues = {
  fileNumber: string;
  searchBorrower: string;
  borrowers: Borrowertype[];
  propertyAddress: string;
  gds: string;
  propertyValue: string;
  tds: string;
  occupancy: string;
  ltv: string;

  mortgages: MortgageType[];
};

const FileNumbersColumn = ({ visible, onClose }: Props) => {
  console.log(visible?.data?.get_account_i_d?.account_id, 'item');
  function parseCurrency(value: string): string {
    if (!value) return '';
    return value.replace(/[^0-9.]/g, ''); // Remove everything except numbers and decimal point
  }

  // Helper function to format currency for display
  function currencyFormat(value: any): string {
    if (!value || isNaN(parseFloat(value))) return '$0.00'; // Handle empty or invalid input
    const num = parseFloat(value);
    return `$${num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`; // Format as $X,XXX.XX
  }

  const empType = [
    { label: 'Cellular', value: 'Cellular' },
    { label: 'Work', value: 'Work' },
    { label: 'Home', value: 'Home' },
  ];

  const communicationList: any[] = [
    { key: 'Communicate with Borrower(s)', value: 1 },
    { key: 'Communicate with Partner(s)', value: 2 },
    { key: 'Communicate with Borrower(s) & Partner(s)', value: 3 },
  ];

  const occupencyList = [
    { label: 'Owner Occupied', value: 'Owner Occupied' },
    { label: 'Owner Occupied & Rental', value: 'Owner Occupied & Rental' },
    { label: 'Rental', value: 'Rental' },
    { label: 'Second Home', value: 'Second Home' },
  ];

  const rateType: any[] = [
    { label: 'adjustable', value: 'adjustable' },
    { label: 'fixed', value: 'fixed' },
    { label: 'variable', value: 'variable' },
  ];

  const termType: any[] = [
    { label: 'open', value: 'open' },
    { label: 'closed', value: 'closed' },
    { label: 'convertible', value: 'convertible' },
  ];

  const lineOfBusinessType = [
    { label: 'A', value: 'A' },
    { label: 'B', value: 'B' },
    { label: 'C', value: 'C' },
  ];

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const userInfo = GetObjectFromStorage<any>('userInfo');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [borrowInfo, setBorrowInfo] = useState<any | {}>({});
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
    null,
  );
  const [seletedBorrower, setSelectBorrower] = useState<any | null>(null);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, [[isKeyboardVisible]]);

  const showDatePicker = (index: number) => {
    setSelectedDateIndex(index);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setDatePickerVisibility(false);
  };

  const fetchBorrowInfo = async () => {
    const file_id = visible?.data?.get_account_i_d?.account_id;

    try {
      const res = await axiosInstance.get(
        ApiConfig.BORROW_INFO_API(userInfo.id, 0, file_id),
      );
      console.log(res.data, 'borrowerin');
      setBorrowInfo(res?.data);
    } catch (error: any) {
      console.log('Error duering fetchBorrowInfo', error.message);
    }
  };

  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<FormValues>({
      defaultValues: {
        fileNumber: borrowInfo?.accountInfo?.account_number,
        searchBorrower: borrowInfo?.borrowersfirstname,
        borrowers: [],
        propertyAddress: borrowInfo?.accountInfo?.property_address,
        gds: borrowInfo?.accountInfo?.income_gds,
        propertyValue: borrowInfo?.accountInfo?.property_value,
        tds: borrowInfo?.accountInfo?.income_tds,
        occupancy: borrowInfo?.accountInfo?.occupancy,
        ltv: borrowInfo?.accountInfo?.ltv,
        mortgages: [],
      },
    });

  const {
    fields: borrowersFields,
    append: appendBorrowers,
    remove: removeBorrowers,
  } = useFieldArray({
    control,
    name: 'borrowers',
  });
  const {
    fields: mortgageFields,
    append: appendMortgage,
    remove: removeMortgage,
  } = useFieldArray({
    control,
    name: 'mortgages',
  });

  useEffect(() => {
    setValue('fileNumber', borrowInfo?.accountInfo?.account_number);
  }, [borrowInfo?.accountInfo?.account_number]);

  const fetchAutoCompleteSearch = async (text: string) => {
    if (!text) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await axiosInstance.get(
        ApiConfig.AUTOCOMPLETE_SEARCH_API(userInfo.id, 0, text),
      );
      setResults(res.data || []);
      console.log(res.data, 'response');
    } catch (error: any) {
      console.error('Error fetching  borrowers:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((text: string) => {
      fetchAutoCompleteSearch(text);
    }, 500),
    [],
  );

  useEffect(() => {
    fetchBorrowInfo();
  }, [visible?.open]);

  useEffect(() => {
    if (!visible) {
      setResults([]);
      reset({
        fileNumber: borrowInfo?.accountInfo?.account_number || '',
        searchBorrower: '',
        borrowers: [],
        propertyAddress: '',
        gds: '',
        propertyValue: '',
        tds: '',
        occupancy: '',
        ltv: '',
      });
    }
  }, [visible?.open, reset]);

  useEffect(() => {
    if (borrowInfo?.accountInfo) {
      const accountInfo = borrowInfo.accountInfo;
      setValue('fileNumber', accountInfo.account_number || '');
      setValue('propertyAddress', accountInfo.property_address || '');
      setValue('gds', String(accountInfo.income_gds ?? ''));
      setValue('propertyValue', String(accountInfo.property_value ?? ''));
      setValue('tds', String(accountInfo.income_tds ?? ''));
      setValue('occupancy', accountInfo.occupancy || '');
      setValue('ltv', String(accountInfo.ltv ?? ''));

      // Transform mortgage data using createTransposedArray
      const mortgageData = createTransposedArray({
        balance: accountInfo.mortgage_balance,
        maturityDate: accountInfo.mortgage_maturity,
        rateType: accountInfo.mortgage_rate_type,
        termType: accountInfo.mortgage_term_type,
        lineOfBusiness: accountInfo.mortgage_line_of_business,
        interestRate: accountInfo.mortgage_interest_rate,
        discount: accountInfo.mortgage_discount,
        netRate: accountInfo.mortgage_net_rate,
        term: accountInfo.mortgage_term,
        amortization: accountInfo.mortgage_amortization,
        renewalDate: accountInfo.mortgage_renewal,
      });

      // Initialize borrowers array
      const borrowersData = Array.isArray(borrowInfo?.borrowers)
        ? borrowInfo.borrowers.map((borrower: any) => ({
            borrowerFirstName: borrower.firstname || '',
            borrowerLastName: borrower.lastname || '',
            borrower_DOB: borrower.dob || '',
            borrower_email: borrower.email || '',
            borrower_phone: borrower.phone || '',
            borrower_type: borrower.type || '',
          }))
        : [];

      // Reset form with all data
      reset({
        ...getValues(),
        fileNumber: accountInfo.account_number || '',
        propertyAddress: accountInfo.property_address || '',
        gds: String(accountInfo.income_gds ?? ''),
        propertyValue: String(accountInfo.property_value ?? ''),
        tds: String(accountInfo.income_tds ?? ''),
        occupancy: accountInfo.occupancy || '',
        ltv: String(accountInfo.ltv ?? ''),
        borrowers: borrowersData,
        mortgages: mortgageData.map(mortgage => ({
          balance: String(mortgage.balance || ''),
          maturityDate: mortgage.maturityDate || '',
          rateType: mortgage.rateType || '',
          termType: mortgage.termType || '',
          lineOfBusiness: mortgage.lineOfBusiness || '',
          interestRate: String(mortgage.interestRate || ''),
          discount: String(mortgage.discount || ''),
          netRate: String(mortgage.netRate || ''),
          term: mortgage.term || '',
          amortization: mortgage.amortization || '',
          renewalDate: mortgage.renewalDate || '',
        })),
      });
    }
  }, [borrowInfo, setValue, reset, getValues]);
  const handleAddBorrower = () => {
    // Check if the borrower limit is reached
    if (borrowersFields.length >= 4) {
      Alert.alert(
        'Limit Reached',
        'You can only add up to 4 borrowers. Please remove an existing borrower before adding a new one.',
        [{ text: 'OK', style: 'cancel' }],
      );
      return;
    }

    if (seletedBorrower) {
      const borrowerData: Borrowertype = {
        borrowerFirstName: seletedBorrower.firstname || '',
        borrowerLastName: seletedBorrower.lastname || '',
        borrower_DOB: seletedBorrower.dob || '',
        borrower_email: seletedBorrower.email || '',
        borrower_phone: seletedBorrower.phone || '',
        borrower_type: seletedBorrower.type || '',
      };
      appendBorrowers(borrowerData);
      setResults([]);
      setSelectBorrower(null);
      setValue('searchBorrower', '');
    }
  };
  return (
    <Modal
      style={styles.modalContainer}
      isVisible={visible?.open}
      onBackdropPress={() => onClose(false)}
      onBackButtonPress={() => onClose(false)}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
        style={styles.modalWrapper}
      >
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
            onPress={() => onClose(false)}
          />
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: scale(100) }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View
            style={{
              paddingVertical: scale(10),
              paddingHorizontal: scale(16),
            }}
          >
            {/* Header*/}
            <View>
              <Controller
                control={control}
                name="fileNumber"
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput
                    label="File Number"
                    iconType="Feather"
                    iconName="hash"
                    lableFontSize={18}
                    lablePaddingVertical={10}
                    placeholder="Enter File Number"
                    placeholderTextColor={colors.graytextColor}
                    iconColor={colors.graytextColor}
                    onChangeText={onChange}
                    value={value}
                    onBlur={onBlur}
                    style={{ color: colors.black, fontWeight: 'bold' }}
                  />
                )}
              />
            </View>

            <View>
              <Controller
                control={control}
                name="searchBorrower"
                render={({ field: { value, onChange } }) => (
                  <CustomInput
                    label="Add Borrowers"
                    iconType="Ionicons"
                    iconName="search"
                    iconColor={colors.graytextColor}
                    placeholder="Search borrower name"
                    placeholderTextColor={colors.graytextColor}
                    style={{ color: colors.black, fontWeight: 'bold' }}
                    lableFontSize={18}
                    lablePaddingVertical={10}
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
                        setSelectBorrower(item);
                        setResults([]);
                        setValue(
                          'searchBorrower',
                          `${item?.firstname} ${item?.lastname || ''}`,
                        );
                      }}
                      style={{
                        paddingVertical: scale(10),
                        paddingHorizontal: scale(12),
                        borderBottomWidth: 0.2,
                        borderBottomColor: colors.graytextColor,
                      }}
                    >
                      <CustomText variant="h6" style={{ color: colors.black }}>
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
                onPress={() => {
                  if (borrowersFields.length >= 4) {
                    Alert.alert(
                      'Maximum Borrowers Reached',
                      'Only 4 borrowers can be added to this application.',
                      [{ text: 'Got it', style: 'cancel' }],
                    );

                    return;
                  }
                  appendBorrowers({
                    borrowerFirstName: '',
                    borrowerLastName: '',
                    borrower_DOB: '',
                    borrower_email: '',
                    borrower_phone: '',
                    borrower_type: '',
                  });
                }}
                title="Create"
                backgroundColor={'#6366F1'}
                fontColor="#fff"
                textStyle={{ fontSize: scale(14) }}
                style={{
                  width: '30%',
                  borderRadius: scale(5),
                  height: scale(40),
                }}
              />
              <CustomButton
                onPress={handleAddBorrower}
                title="Add User"
                backgroundColor={'#6366F1'}
                fontColor="#fff"
                textStyle={{ fontSize: scale(14) }}
                style={{
                  width: '30%',
                  borderRadius: scale(5),
                  height: scale(40),
                }}
              />
            </View>

            {borrowersFields.map((field, index) => (
              <View key={field?.id} style={{ marginVertical: scale(8) }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: scale(8),
                  }}
                >
                  <CustomText
                    variant="h6"
                    fontFamily="Bold"
                    style={{ color: colors.black, fontWeight: '500' }}
                  >
                    Borrower #{index + 1}
                  </CustomText>
                  <Divider style={{ flex: 1 }} />
                  <TouchableOpacity
                    onPress={() => {
                      removeBorrowers(Number(field?.id));
                    }}
                  >
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      style={{ color: colors.red }}
                    >
                      Delete
                    </CustomText>
                  </TouchableOpacity>
                </View>
                <View style={{ marginVertical: scale(8) }}>
                  <Controller
                    control={control}
                    name={`borrowers.${index}.borrowerFirstName`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="First Name "
                        lablePaddingTop={5}
                        required
                        iconType="FontAwesome"
                        iconName="user"
                        placeholder="Enter First Name"
                        placeholderTextColor={colors.graytextColor}
                        iconColor={colors.graytextColor}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`borrowers.${index}.borrowerLastName`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="Last Name"
                        iconType="FontAwesome"
                        iconName="user"
                        placeholder="Enter Last Name "
                        placeholderTextColor={colors.graytextColor}
                        iconColor={colors.graytextColor}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`borrowers.${index}.borrower_DOB`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => showDatePicker(index)}
                      >
                        <CustomInput
                          label="Date Of Birth"
                          iconType="AntDesign"
                          iconName="calendar"
                          placeholder="Select Date of Birth"
                          placeholderTextColor={colors.graytextColor}
                          iconColor={colors.graytextColor}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          editable={false}
                          value={value}
                          style={{
                            color: colors.black,
                            fontWeight: 'bold',
                          }}
                        />
                      </TouchableOpacity>
                    )}
                  />
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={date => {
                      setValue(
                        `borrowers.${index}.borrower_DOB`,
                        date.toLocaleDateString(),
                      );
                      hideDatePicker();
                    }}
                    onCancel={hideDatePicker}
                  />
                  <Controller
                    control={control}
                    name={`borrowers.${index}.borrower_email`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="Email "
                        required
                        iconType="FontAwesome"
                        iconName="envelope"
                        placeholder="Enter your Email"
                        placeholderTextColor={colors.graytextColor}
                        iconColor={colors.graytextColor}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`borrowers.${index}.borrower_phone`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="Phone "
                        iconType="FontAwesome"
                        required
                        iconName="phone"
                        placeholder="## ## ## ## ##"
                        placeholderTextColor={colors.graytextColor}
                        iconColor={colors.graytextColor}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        value={value}
                        keyboardType="number-pad"
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />

                  <CustomText
                    variant="h6"
                    fontFamily="Bold"
                    fontSize={12}
                    style={{
                      fontWeight: '500',
                      color: colors.bgBlack,
                      paddingTop: scale(14),
                    }}
                  >
                    Type
                  </CustomText>
                  <Controller
                    control={control}
                    name={`borrowers.${index}.borrower_type`}
                    render={({ field: { value, onChange, onBlur } }) => (
                      <Dropdown
                        style={styles.dropdown}
                        data={empType || ''}
                        placeholder="Select type"
                        labelField="label"
                        valueField="value"
                        value={value || ''}
                        onBlur={onBlur}
                        selectedTextStyle={{ paddingLeft: scale(20) }}
                        onChange={onChange}
                        placeholderStyle={{ paddingLeft: scale(20) }}
                        renderLeftIcon={() => (
                          <VectorIcon
                            type="Entypo"
                            name="flow-tree"
                            size={20}
                          />
                        )}
                      />
                    )}
                  />
                </View>
              </View>
            ))}

            <TouchableOpacity
              activeOpacity={0.8}
              style={{ paddingVertical: scale(20) }}
              onPress={() =>
                appendBorrowers({
                  borrowerFirstName: '',
                  borrowerLastName: '',
                  borrower_DOB: '',
                  borrower_email: '',
                  borrower_phone: '',
                  borrower_type: '',
                })
              }
            >
              <CustomText
                variant="h6"
                fontSize={15}
                fontFamily="Bold"
                style={{ color: '#6366F1' }}
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
              }}
            >
              Communicate With
            </CustomText>

            <Dropdown
              style={styles.dropdown}
              data={empType || ''}
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
              outputRange={borrowersFields.length * scale(380)}
            >
              <View>
                <Controller
                  control={control}
                  name="propertyAddress"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput
                      label="Property Address"
                      iconType="Entypo"
                      lablePaddingTop={4}
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

                <Controller
                  control={control}
                  name="gds"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput
                      label="GDS (%)"
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

                <Controller
                  control={control}
                  name="propertyValue"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput
                      label=" Property Value"
                      iconType="FontAwesome"
                      iconName="dollar"
                      iconSize={18}
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

                <Controller
                  control={control}
                  name="tds"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput
                      label="TDS (%)"
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
                <View style={{ paddingTop: scale(10) }}>
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
                    name="occupancy"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Dropdown
                        style={styles.dropdown}
                        data={occupencyList}
                        placeholder="Select Occupancy"
                        labelField="label"
                        valueField="value"
                        value={value}
                        selectedTextStyle={{ paddingLeft: scale(20) }}
                        onChange={onChange}
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

                <Controller
                  control={control}
                  name="ltv"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput
                      label="LTV (%)"
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
            </ExpandableSection>

            <ExpandableSection
              title="Mortgage(s)"
              marginTop={10}
              outputRange={mortgageFields.length * 880}
            >
              {mortgageFields.map((item, index) => (
                <View
                  key={item.id}
                  style={{ marginTop: index === 0 ? 0 : scale(20) }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: scale(8),
                    }}
                  >
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      style={{ color: colors.black, fontWeight: '500' }}
                    >
                      Mortgage ({index + 1})
                    </CustomText>
                    <Divider style={{ flex: 1 }} />
                    <TouchableOpacity onPress={() => removeMortgage(index)}>
                      <CustomText
                        variant="h6"
                        fontFamily="Bold"
                        style={{ color: colors.red }}
                      >
                        Delete
                      </CustomText>
                    </TouchableOpacity>
                  </View>

                  <Controller
                    control={control}
                    name={`mortgages.${index}.balance`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="Enter Balance"
                        iconType="FontAwesome"
                        iconName="dollar"
                        placeholder="Enter LTV (%)"
                        placeholderTextColor={colors.graytextColor}
                        iconColor={colors.graytextColor}
                        value={value ? currencyFormat(value) : ''}
                        onChangeText={text => onChange(currencyFormat(text))}
                        onBlur={onBlur}
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`mortgages.${index}.maturityDate`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => showDatePicker(index)}
                      >
                        <CustomInput
                          label="Maturity Date"
                          iconType="AntDesign"
                          iconName="calendar"
                          placeholder="Select your maturity date"
                          placeholderTextColor={colors.graytextColor}
                          iconColor={colors.graytextColor}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                          editable={false}
                          style={{ color: colors.black, fontWeight: 'bold' }}
                        />
                      </TouchableOpacity>
                    )}
                  />
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={date => {
                      setValue(
                        `mortgages.${index}.maturityDate`,
                        date.toLocaleDateString(),
                      );
                      hideDatePicker();
                    }}
                    onCancel={hideDatePicker}
                  />

                  <View style={{ paddingTop: scale(10) }}>
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      fontSize={13}
                      style={{
                        fontWeight: '500',
                        color: colors.bgBlack,
                      }}
                    >
                      Rate Type
                    </CustomText>
                    <Controller
                      control={control}
                      name={`mortgages.${index}.rateType`}
                      render={({ field: { onChange, value, onBlur } }) => (
                        <Dropdown
                          style={styles.dropdown}
                          data={rateType || ''}
                          placeholder="Rate Type"
                          labelField="label"
                          valueField="value"
                          value={value}
                          selectedTextStyle={{ paddingLeft: scale(20) }}
                          onChange={onChange}
                          placeholderStyle={{ paddingLeft: scale(20) }}
                          renderLeftIcon={() => (
                            <VectorIcon
                              type="FontAwesome5"
                              name="hand-holding-usd"
                              size={20}
                            />
                          )}
                        />
                      )}
                    />
                  </View>
                  <View style={{ paddingTop: scale(10) }}>
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      fontSize={13}
                      style={{
                        fontWeight: '500',
                        color: colors.bgBlack,
                      }}
                    >
                      Term Type
                    </CustomText>
                    <Controller
                      control={control}
                      name={`mortgages.${index}.termType`}
                      render={({ field: { onChange, value } }) => (
                        <Dropdown
                          style={styles.dropdown}
                          data={termType || ''}
                          placeholder="Term Type"
                          labelField="label"
                          valueField="value"
                          value={value}
                          selectedTextStyle={{ paddingLeft: scale(20) }}
                          onChange={onChange}
                          placeholderStyle={{ paddingLeft: scale(20) }}
                          renderLeftIcon={() => (
                            <VectorIcon
                              type="FontAwesome5"
                              name="hand-holding-usd"
                              size={20}
                            />
                          )}
                        />
                      )}
                    />
                  </View>
                  <View style={{ paddingTop: scale(10) }}>
                    <CustomText
                      variant="h6"
                      fontFamily="Bold"
                      fontSize={13}
                      style={{
                        fontWeight: '500',
                        color: colors.bgBlack,
                      }}
                    >
                      Line Of Business
                    </CustomText>
                    <Controller
                      control={control}
                      name={`mortgages.${index}.lineOfBusiness`}
                      render={({ field: { onChange, onBlur, value } }) => (
                        <Dropdown
                          style={styles.dropdown}
                          data={lineOfBusinessType || ''}
                          placeholder="Select your line of business"
                          labelField="label"
                          valueField="value"
                          value={value}
                          selectedTextStyle={{ paddingLeft: scale(20) }}
                          onChange={onChange}
                          onBlur={onBlur}
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
                  <Controller
                    control={control}
                    name={`mortgages.${index}.interestRate`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="Interest Rate (%)"
                        iconType="Entypo"
                        iconName="calculator"
                        placeholder="Enter Interest Rate (%)"
                        placeholderTextColor={colors.graytextColor}
                        iconColor={colors.graytextColor}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`mortgages.${index}.discount`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="Discount (%)"
                        iconType="MaterialIcons"
                        iconName="discount"
                        placeholder="EnterDiscount (%)"
                        placeholderTextColor={colors.graytextColor}
                        iconColor={colors.graytextColor}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`mortgages.${index}.netRate`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="Net rate"
                        iconType="Feather"
                        iconName="divide"
                        placeholder="Enter Net rate"
                        placeholderTextColor={colors.lightGray}
                        iconColor={colors.graytextColor}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        editable={false}
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`mortgages.${index}.term`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="Term"
                        iconType="FontAwesome"
                        iconName="file"
                        placeholder="Enter Term"
                        placeholderTextColor={colors.graytextColor}
                        iconColor={colors.graytextColor}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`mortgages.${index}.amortization`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <CustomInput
                        label="Amortization"
                        iconType="FontAwesome"
                        iconName="file"
                        placeholder="Enter Amortization"
                        placeholderTextColor={colors.graytextColor}
                        iconColor={colors.graytextColor}
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                        style={{ color: colors.black, fontWeight: 'bold' }}
                      />
                    )}
                  />
                  <Controller
                    control={control}
                    name={`mortgages.${index}.renewalDate`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => showDatePicker(index)}
                      >
                        <CustomInput
                          label="Renewal  Date"
                          iconType="AntDesign"
                          iconName="calendar"
                          placeholder="Select your Renewal Date"
                          placeholderTextColor={colors.graytextColor}
                          iconColor={colors.graytextColor}
                          onChangeText={onChange}
                          onBlur={onBlur}
                          value={value}
                          editable={false}
                          style={{ color: colors.black, fontWeight: 'bold' }}
                        />
                      </TouchableOpacity>
                    )}
                  />
                  <DateTimePickerModal
                    isVisible={isDatePickerVisible}
                    mode="date"
                    onConfirm={date => {
                      setValue(
                        `mortgages.${index}.renewalDate`,
                        date.toLocaleDateString(),
                      );
                      hideDatePicker();
                    }}
                    onCancel={hideDatePicker}
                  />
                </View>
              ))}
              <View
                style={{
                  paddingVertical: scale(10),
                  marginBottom: scale(40),
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    if (mortgageFields.length >= 5) {
                      Alert.alert(
                        'Maximum Mortgage Reached',
                        'Only 5 Mortgage can be added to this application.',
                        [{ text: 'Got it', style: 'cancel' }],
                      );
                      return;
                    }
                    appendMortgage({
                      balance: '',
                      maturityDate: '',
                      rateType: '',
                      termType: '',
                      lineOfBusiness: '',
                      interestRate: '',
                      discount: '',
                      netRate: '',
                      term: '',
                      amortization: '',
                      renewalDate: '',
                    });
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
                </TouchableOpacity>
              </View>
            </ExpandableSection>
          </View>
        </ScrollView>
        <View
          style={{
            backgroundColor: colors.lightGray,
            position: 'absolute',
            bottom: 0,
            width: '100%',
            elevation: 1,
            paddingHorizontal: scale(16),
            paddingVertical: scale(16),
            justifyContent: 'center',
            borderTopWidth: 0.2,
            borderTopColor: colors.graytextColor,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: scale(25),
            }}
          >
            <TouchableOpacity
              onPress={() => onClose(false)}
              activeOpacity={0.6}
              style={{
                borderWidth: 1,
                borderColor: '#6366F1',
                borderRadius: scale(5),
                flex: 1,
                paddingHorizontal: scale(8),
                paddingVertical: scale(8),
                alignItems: 'center',
              }}
            >
              <CustomText
                variant="h7"
                fontSize={15}
                fontFamily="Medium"
                style={{ color: Colors.tertiary }}
              >
                Cancel
              </CustomText>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.6}
              style={{
                borderWidth: 1,
                borderColor: '#6366F1',
                borderRadius: scale(5),
                flex: 1,
                paddingHorizontal: scale(8),
                paddingVertical: scale(8),
                alignItems: 'center',
                backgroundColor: '#6366F1',
              }}
            >
              <CustomText
                variant="h7"
                fontSize={15}
                fontFamily="Medium"
                style={{ color: colors.white }}
              >
                Update file
              </CustomText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
