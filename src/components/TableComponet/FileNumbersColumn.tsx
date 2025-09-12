import { Divider } from '@rneui/themed';
import debounce from 'lodash.debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown, MultiSelect } from 'react-native-element-dropdown';
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
import {
  communicationList,
  empType,
  lineOfBusinessType,
  occupencyList,
  rateType,
  termType,
} from '../../utils/FileNumberDropdwonItems';

type visiableProps = {
  open: boolean;
  data: any;
};

type Props = {
  visible: visiableProps;
  onClose: (open: boolean) => void;
};

interface Partner {
  id: string;
  first_name: string;
  last_name: string;
  label?: string; // Optional, as it seems to be used in MultiSelect
}
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
  communication: number;
  mortgages: MortgageType[];
  partners: [];
};

const FileNumbersColumn = ({ visible, onClose }: Props) => {
  console.log(visible?.data?.get_account_i_d?.account_id, 'item');

  const currencyFormatSimple = (value: any) => {
    if (!value) return '';

    const numericValue = value.toString().replace(/[^0-9]/g, '');

    if (!numericValue) return '';

    const number = parseInt(numericValue) || 0;

    return `${number.toLocaleString('en-US')}.00`;
  };

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const userInfo = GetObjectFromStorage<any>('userInfo');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [fileInfo, setfileInfo] = useState<any | {}>({});
  const [selectedDateIndex, setSelectedDateIndex] = useState<number | null>(
    null,
  );
  const [seletedBorrower, setSelectBorrower] = useState<any | null>(null);
  const [fileInfoLoading,setfileInfoLoading] = useState(false)

  const showDatePicker = (index: number) => {
    setSelectedDateIndex(index);
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
    setDatePickerVisibility(false);
  };

  const fetchFileInfo = async () => {
    const file_id = visible?.data?.get_account_i_d?.account_id;
    setfileInfoLoading(true)
    try {
      const res = await axiosInstance.get(
        ApiConfig.FILE_INFO_API(userInfo.id, 0, file_id),
      );
      console.log(res.data, 'fileInfo');
      setfileInfo(res?.data);
      console.log(res?.data?.partners, 'parn');
    } catch (error: any) {
      console.log('Error duering fetchFileInfo', error.message);
    }finally{
      setfileInfoLoading(false)
    }
  };

  const { control, handleSubmit, reset, setValue, getValues } =
    useForm<FormValues>({
      defaultValues: {
        fileNumber: fileInfo?.accountInfo?.account_number,
        searchBorrower: fileInfo?.borrowersfirstname,
        borrowers: [],
        propertyAddress: fileInfo?.accountInfo?.property_address,
        gds: fileInfo?.accountInfo?.income_gds,
        propertyValue: fileInfo?.accountInfo?.property_value,
        tds: fileInfo?.accountInfo?.income_tds,
        occupancy: fileInfo?.accountInfo?.occupancy,
        ltv: fileInfo?.accountInfo?.ltv,
        mortgages: [],
        communication: 0,
        partners: [],
      },
    });

  const watchedCommunication = useWatch({
    control,
    name: 'communication',
    defaultValue: 0,
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
    
    fetchFileInfo();
  }, [visible?.open]);

  useEffect(() => {
    if (!visible) {
      setResults([]);
      reset({
        fileNumber: fileInfo?.accountInfo?.account_number || '',
        searchBorrower: '',
        borrowers: [],
        propertyAddress: '',
        gds: '',
        propertyValue: '',
        tds: '',
        occupancy: '',
        ltv: '',
        mortgages: [],
      });
    }
  }, [visible?.open, reset]);

  useEffect(() => {
    if (fileInfo?.accountInfo) {
      const accountInfo = fileInfo.accountInfo;
      setValue('fileNumber', accountInfo.account_number || '');
      setValue('propertyAddress', accountInfo.property_address || '');
      setValue('gds', String(accountInfo.income_gds ?? ''));
      setValue('propertyValue', String(accountInfo.property_value ?? ''));
      setValue('tds', String(accountInfo.income_tds ?? ''));
      setValue('occupancy', accountInfo.occupancy || '');
      setValue('ltv', String(accountInfo.ltv ?? ''));
      setValue('communication', Number(accountInfo?.communication || 0));

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
      const borrowersData = Array.isArray(fileInfo?.borrowers)
        ? fileInfo.borrowers.map((borrower: any) => ({
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
        communication: Number(accountInfo.communication || 0),
        borrowers: borrowersData,
        mortgages: mortgageData.map(mortgage => ({
          balance: String(mortgage.balance || ''),
          maturityDate: mortgage.maturityDate || '',
          rateType: mortgage.rateType || '',
          termType: mortgage.termType || '',
          lineOfBusiness: mortgage.lineOfBusiness || '',
          interestRate: String(mortgage.interestRate || ''),
          discount: String(mortgage.discount || ''),
          netRate: String(
            (
              parseFloat(mortgage.interestRate || '0') -
              parseFloat(mortgage.discount || '0')
            ).toFixed(2),
          ),
          term: mortgage.term || '',
          amortization: mortgage.amortization || '',
          renewalDate: mortgage.renewalDate || '',
        })),
      });
    }
  }, [fileInfo, setValue, reset, getValues]);

  const watchedMortgages = useWatch({ control, name: 'mortgages' }) || [];

  useEffect(() => {
    watchedMortgages.forEach((mortgage: MortgageType, index: number) => {
      if (
        mortgage &&
        (mortgage.interestRate !== undefined || mortgage.discount !== undefined)
      ) {
        const interestNum = parseFloat(mortgage.interestRate) || 0;
        const discountNum = parseFloat(mortgage.discount) || 0;
        const calculatedNetRate = (interestNum - discountNum).toFixed(2);

        // Only update if different (prevents infinite loops)
        const currentNetRate = getValues(`mortgages.${index}.netRate`) || '';
        if (currentNetRate !== calculatedNetRate) {
          setValue(`mortgages.${index}.netRate`, calculatedNetRate, {
            shouldValidate: false,
            shouldDirty: false, // Keeps form "clean" for auto-updates
          });
        }
      }
    });
  }, [watchedMortgages, setValue, getValues]);

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

  const partnerOptions =
    fileInfo?.partners?.map((p: Partner) => ({
      label: `${p.first_name} ${p.last_name}`,
      value: p, // store full partner
    })) || [];

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
              fontSize={14}
              style={{
                fontWeight: '500',
                color: colors.bgBlack,
              }}
            >
              Communicate With
            </CustomText>
            <Controller
              control={control}
              name="communication"
              render={({ field: { value, onChange } }) => (
                console.log(value, 'valie'),
                (
                  <Dropdown
                    style={styles.dropdown}
                    data={communicationList || ''}
                    placeholder="Select User"
                    labelField="label"
                    valueField="value"
                    value={value}
                    selectedTextStyle={{
                      paddingLeft: scale(18),
                      fontSize: scale(14),
                    }}
                    onChange={item => onChange(item.value)}
                    renderLeftIcon={() => (
                      <VectorIcon type="Entypo" name="flow-tree" size={20} />
                    )}
                  />
                )
              )}
            />

            {(Number(watchedCommunication) === 2 ||
              Number(watchedCommunication) === 3) && (
              <>
                <View style={{ marginVertical: scale(10) }}>
                  <CustomText
                    variant="h6"
                    fontFamily="Bold"
                    fontSize={14}
                    style={{
                      fontWeight: '500',
                      color: colors.bgBlack,
                    }}
                  >
                    Partners
                  </CustomText>
                </View>

                <Controller
                  control={control}
                  name="partners"
                  render={({ field: { value, onChange } }) => (
                    <MultiSelect
                      style={styles.dropdown}
                      placeholderStyle={styles.placeholderStyle}
                      selectedTextStyle={styles.selectedTextStyle}
                      inputSearchStyle={styles.inputSearchStyle}
                      iconStyle={styles.iconStyle}
                      data={partnerOptions}
                      labelField="label"
                      valueField="value"
                      placeholder="Select Partner(s)"
                      search
                      searchPlaceholder="Search..."
                      value={value}
                      onChange={onChange}
                      renderSelectedItem={(item, unSelect) => (
                        <TouchableOpacity
                          style={styles.selectedItemContainer}
                          onPress={() => unSelect && unSelect(item)}
                        >
                          <Text style={styles.selectedItemText}>
                            {item.label}
                          </Text>
                          <VectorIcon
                            type="EvilIcons"
                            color="black"
                            name="close-o"
                            size={20}
                          />
                        </TouchableOpacity>
                      )}
                      selectedStyle={styles.selectedWrapper}
                    />
                  )}
                />
              </>
            )}

            <ExpandableSection
              marginTop={20}
              title="Property & File Overview"
              outputRange={scale(380)}
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
              outputRange={mortgageFields.length * 900}
            >
              {mortgageFields.length > 0 ? (
                mortgageFields.map((item, index) => (
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
                          placeholder="Enter Balance"
                          placeholderTextColor={colors.graytextColor}
                          iconColor={colors.graytextColor}
                          value={value ? currencyFormatSimple(value) : ''}
                          onChangeText={text => {
                            // Remove formatting to get raw number for storing
                            const rawValue = text.replace(/[^0-9.]/g, '');
                            onChange(rawValue); // Store raw number
                          }}
                          onBlur={onBlur}
                          style={{ color: colors.black, fontWeight: 'bold' }}
                          keyboardType="numeric"
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
                      render={({ field: { onChange, onBlur, value } }) => {
                        const interestRate = parseInt(
                          getValues(`mortgages.${index}.interestRate`) || '0',
                        );
                        console.log(interestRate, 'inte');

                        const discount = parseInt(
                          getValues(`mortgages.${index}.discount`) || '0',
                        );
                        const calculatedNetRate = (
                          interestRate - discount
                        ).toFixed(0);
                        console.log(calculatedNetRate, 'cal');
                        return (
                          <CustomInput
                            label="Net Rate (Auto: Interest - Discount)"
                            iconType="Feather"
                            iconName="divide"
                            placeholder="Calculated Automatically"
                            placeholderTextColor={colors.lightGray}
                            iconColor={colors.graytextColor}
                            value={calculatedNetRate}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            editable={false}
                            style={{
                              color: colors.green,
                              fontWeight: 'bold',
                              opacity: 1,
                            }}
                          />
                        );
                      }}
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
                ))
              ) : (
                <CustomText
                  variant="h6"
                  fontSize={14}
                  style={{
                    color: colors.graytextColor,
                    marginBottom: scale(10),
                  }}
                >
                  No mortgages added yet.
                </CustomText>
              )}
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
  Multidropdown: {
    height: 42,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    borderWidth: 0.5,
    borderColor: colors.bgBlack,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 14,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  icon: {
    marginRight: 5,
  },
  item: {
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedStyle: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    backgroundColor: 'white',
    shadowColor: '#000',
    marginTop: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  selectedItemText: {
    fontSize: 13,
    marginRight: 4,
    color: '#333',
  },
  selectedItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e6f0ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    margin: 2,
  },
  selectedWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    padding: 4,
  },
});

export default FileNumbersColumn;
