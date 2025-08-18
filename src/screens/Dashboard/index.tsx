import { Skeleton } from '@rneui/themed';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { scale } from 'react-native-size-matters';
import VectorIcon from '../../components/common/CustomIcons';
import CustomInput from '../../components/common/CustomInput';
import CustomText from '../../components/common/CustomText';
import HeaderComponent from '../../components/HeaderComponent';
import CustomTable, {
  FileStatus,
} from '../../components/TableComponet/CustomTable';
import { Colors } from '../../constants/constants';
import { fetchDashboardData } from '../../services/DashboardServices';
import { colors } from '../../styles/Colors';
import { globalStyles } from '../../styles/GlobalStyle';

const DashboardScreen = ({ navigation }: { navigation: any }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState<{ [key: number]: boolean }>({});

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetchDashboardData();
      const mainData = res?.data.fileStatus.map((m: any) => {
        return {
          ...m,
          files: res.data.statusTable[m.id] || [],
        };
      });
      console.log('mainData', mainData);

      setData({ ...res?.data, mainData });
      
      
      const expandedState = res?.data.fileStatus?.reduce(
        (acc: any, item: FileStatus) => ({
          ...acc,
          [item.id]: item?.collapse === 1,
        }),
        {},
      )
      setIsExpanded(expandedState || {});
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const userOptions = [
    { label: 'User 1', value: 'user1' },
    { label: 'User 2', value: 'user2' },
    { label: 'User 3', value: 'user3' },
  ];

  const rowOptions = [
    { label: '5 Rows', value: '5' },
    { label: '10 Rows', value: '10' },
    { label: '15 Rows', value: '15' },
  ];

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<string | null>(null);
  const [isTableChange, setIsTableChange] = useState<boolean>(false);

  const toggleTableIcon = () => {
    setIsTableChange(!isTableChange);
  };

  return (
    <SafeAreaView style={globalStyles.globalContainer}>
      <HeaderComponent
        title="Dashboard"
        navigation={navigation}
        IconName="bars"
        IconSize={18}
        backgroundColor={Colors.primary}
        titleColor={colors.white}
        IconColor={colors.white}
      />

      <View>
        {!data?.fileStatus || data?.fileStatus.length === 0 ? (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[1, 2, 3, 4]}
            contentContainerStyle={style.layoutStyle}
            keyExtractor={item => item.toString()}
            renderItem={({ index }) => (
              <Skeleton
                animation="wave"
                width={scale(100)}
                height={scale(40)}
                style={{
                  borderRadius: scale(8),
                  marginLeft: index === 0 ? 0 : scale(10),
                }}
              />
            )}
          />
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={data?.fileStatus}
            contentContainerStyle={style.layoutStyle}
            renderItem={({ item, index }) => (
              <View
                key={index}
                style={{ marginLeft: index === 0 ? 0 : scale(10) }}
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={{
                    backgroundColor: item?.color,
                    borderRadius: scale(8),
                  }}
                >
                  <CustomText
                    fontFamily="Medium"
                    style={{
                      color: colors.white,
                      paddingHorizontal: scale(14),
                      paddingVertical: scale(10),
                    }}
                    fontSize={14}
                    variant="h7"
                  >
                    {item?.name}
                  </CustomText>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>

      <View style={style.searchRow}>
        <CustomInput
          placeholder="Search"
          iconName="search"
          iconType="FontAwesome"
          iconColor={colors.LoginIconColor}
          iconSize={20}
          width={'70%'}
        />
        <TouchableOpacity
          activeOpacity={0.8}
          style={style.tableButton}
          onPress={toggleTableIcon}
        >
          <VectorIcon
            type="MaterialIcons"
            name={isTableChange ? 'table-view' : 'table-rows'}
            color={colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={style.dropdownRow}>
        <Dropdown
          style={style.dropdown}
          data={userOptions}
          placeholder="Select User"
          labelField="label"
          valueField="value"
          value={selectedUser}
          onChange={item => setSelectedUser(item.value)}
        />
        <Dropdown
          style={style.dropdown}
          data={rowOptions}
          placeholder="Select Rows"
          labelField="label"
          valueField="value"
          value={selectedRows}
          onChange={item => setSelectedRows(item.value)}
        />
      </View>

      <CustomTable
        data={data?.mainData}
        loading={loading}
        columns={data?.columns}
        options = {data?.options}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
      />
    </SafeAreaView>
  );
};

export default DashboardScreen;

const style = StyleSheet.create({
  layoutStyle: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(12),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  tableButton: {
    backgroundColor: colors.jobcategoriColor1,
    width: scale(45),
    height: scale(39),
    marginTop: scale(8),
    borderRadius: scale(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: scale(20),
    paddingHorizontal: scale(10),
    paddingBottom: scale(15),
  },
  dropdown: {
    width: '45%',
    height: scale(40),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: scale(10),
  },
});
