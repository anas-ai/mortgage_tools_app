import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { scale } from 'react-native-size-matters';
import VectorIcon from '../../components/common/CustomIcons';
import CustomInput from '../../components/common/CustomInput';
import CustomText from '../../components/common/CustomText';
import HeaderComponent from '../../components/HeaderComponent';
import CustomTable from '../../components/TableComponet/CustomTable';
import { Colors } from '../../constants/constants';
import { colors } from '../../styles/Colors';
import { globalStyles } from '../../styles/GlobalStyle';
import axiosInstance from '../../utils/axiosInstance';
import { ApiConfig } from '../../config/apiConfig';
import { GetObjectFromStorage } from '../../utils/MmkvStorageHelper';
import { fetchDashboardData } from '../../services/DashboardServices';

const DashboardScreen = ({ navigation }: { navigation: any }) => {
  const [data, setData] = useState<any>(null);
    const scrollX = useRef(new Animated.Value(0)).current; // shared value


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchDashboardData();
        setData(res?.data);
      } catch (error) {
        console.log('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  

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
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const toggleTableIcon = () => {
    setIsTableChange(!isTableChange);
  };

  const expandValue = useSharedValue(0);
  useEffect(() => {
    expandValue.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  return (
    <SafeAreaView style={globalStyles.globalContainer}>
      <HeaderComponent
        title="Dashboard"
        navigation={navigation}
        IconName="bars"
        IconSize={18}
        backgroundColor={Colors.tertiary}
        titleColor={colors.white}
        IconColor={colors.white}
      />

      <View>
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
                    paddingHorizontal: scale(22),
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <CustomTable
          backgroundColor="#F8F4F5"
          ExpandBackgroundColor="#DB4D4D"
          title="Lead"
          titleCount={5}
        />
        <CustomTable
          backgroundColor="#F8F4F5"
          ExpandBackgroundColor="#EE5B2B"
          title="Pre-Approved"
          titleCount={2}
        />
        <CustomTable
          backgroundColor="#F1F8FB"
          ExpandBackgroundColor="#05C1F0"
          title="Live Deal"
          titleCount={0}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;

const style = StyleSheet.create({
  layoutStyle: {
    paddingHorizontal: scale(14),
    paddingVertical: scale(18),
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  tableButton: {
    backgroundColor: colors.jobcategoriColor1,
    width: 60,
    height: 45,
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
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: scale(10),
    backgroundColor: '#fff',
  },
});

// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   SafeAreaView,
//   Platform,
//   StatusBar,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
// } from 'react-native';
// import HeaderComponent from '../../components/HeaderComponent';
// import { globalStyles } from '../../styles/GlobalStyle';
// import { Colors } from '../../constants/constants';
// import { colors } from '../../styles/Colors';
// import CustomText from '../../components/common/CustomText';
// import { scale } from 'react-native-size-matters';
// import CustomInput from '../../components/common/CustomInput';
// import VectorIcon from '../../components/common/CustomIcons';
// import { Dropdown } from 'react-native-element-dropdown';
// import DraggableFlatList, {
//   RenderItemParams,
// } from 'react-native-draggable-flatlist';
// import {
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming,
// } from 'react-native-reanimated';

// const DashboardScreen = ({ navigation }: { navigation: any }) => {
//   const Tabs = [
//     { name: 'Lead', bgColor: '#DB4D4D' },
//     { name: 'Pre-Approval', bgColor: '#012446' },
//     { name: 'Pre-Approved', bgColor: '#EE5B2B' },
//     { name: 'Live Deal', bgColor: '#05C1F0' },
//     { name: 'Declined', bgColor: '#3E8FC1' },
//     { name: 'Approved', bgColor: '#696969' },
//     { name: 'Accepted', bgColor: '#F3A216' },
//     { name: 'Waiting to Close', bgColor: '#90C224' },
//     { name: 'Funded + Awaiting Payment', bgColor: '#3E9871' },
//     { name: 'Complete', bgColor: '#01A75F' },
//     { name: 'Cancelled', bgColor: '#0A663E' },
//     { name: 'On Hold', bgColor: '#D86B22' },
//     { name: 'Cancelled', bgColor: '#252525' },
//     { name: 'Created by amjad', bgColor: '#252525' },
//   ];

//   const userOptions = [
//     { label: 'User 1', value: 'user1' },
//     { label: 'User 2', value: 'user2' },
//     { label: 'User 3', value: 'user3' },
//   ];

//   const rowOptions = [
//     { label: '5 Rows', value: '5' },
//     { label: '10 Rows', value: '10' },
//     { label: '15 Rows', value: '15' },
//   ];

//   const statusOptions = [
//     { label: 'Working', value: 'working' },
//     { label: 'Done', value: 'done' },
//     { label: 'Pending', value: 'pending' },
//   ];

//   const getStatusColor = (value: string) => {
//     switch (value) {
//       case 'working':
//         return '#f0ad4e'; // orange
//       case 'done':
//         return '#5cb85c'; // green
//       case 'pending':
//         return '#d9534f'; // red
//       default:
//         return '#ffffff'; // white
//     }
//   };

//   const columns = [
//     { key: '1', label: 'CHAT' },
//     { key: '2', label: 'PRIORITY' },
//     { key: '3', label: 'NO...' },
//     { key: '4', label: 'DO...' },
//     { key: '5', label: 'SR' },
//     { key: '6', label: 'CL' },
//     { key: '7', label: 'NE' },
//     { key: '8', label: 'NE' },
//     { key: '9', label: 'NE' },
//     { key: '10', label: 'NE' },
//     { key: '11', label: 'NE' },
//     { key: '12', label: 'NE' },
//     { key: '13', label: 'NE' },
//     { key: '14', label: 'NE' },
//   ];

//   const [selectedUser, setSelectedUser] = useState(null);
//   const [selectedRows, setSelectedRows] = useState(null);
//   const [isTableChange, setIsTableChange] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false);
//   const [status, setStatus] = useState('working');

//   const toggleTableIcon = () => {
//     setIsTableChange(!isTableChange);
//   };

//   const toggleExpand = () => {
//     setIsExpanded(!isExpanded);
//   };

//   const expandValue = useSharedValue(0);
//   useEffect(() => {
//     expandValue.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
//   }, [isExpanded]);

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       height: expandValue.value === 0 ? 0 : undefined,
//       opacity: expandValue.value,
//       transform: [{ scaleY: expandValue.value }],
//     };
//   });

//   return (
//     <SafeAreaView style={globalStyles.globalContainer}>
//       <HeaderComponent
//         title="Dashboard"
//         navigation={navigation}
//         IconName="bars"
//         IconSize={18}
//         backgroundColor={Colors.tertiary}
//         titleColor={colors.white}
//         IconColor={colors.white}
//       />

//       <View>
//         <FlatList
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           data={Tabs}
//           contentContainerStyle={style.layoutStyle}
//           renderItem={({ item, index }) => (
//             <View
//               key={index}
//               style={{
//                 marginLeft: index === 0 ? 0 : scale(10),
//               }}
//             >
//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 style={{
//                   backgroundColor: item?.bgColor,
//                   borderRadius: scale(8),
//                 }}
//               >
//                 <CustomText
//                   fontFamily="Medium"
//                   style={{
//                     color: colors.white,
//                     paddingHorizontal: scale(22),
//                     paddingVertical: scale(10),
//                   }}
//                   fontSize={14}
//                   variant="h7"
//                 >
//                   {item?.name}
//                 </CustomText>
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={style.searchRow}>
//           <CustomInput
//             placeholder="Search"
//             iconName="search"
//             iconType="FontAwesome"
//             iconColor={colors.LoginIconColor}
//             iconSize={20}
//             width={'70%'}
//           />
//           <TouchableOpacity
//             activeOpacity={0.8}
//             style={style.tableButton}
//             onPress={toggleTableIcon}
//           >
//             <VectorIcon
//               type="MaterialIcons"
//               name={isTableChange ? 'table-view' : 'table-rows'}
//               color={colors.white}
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={style.dropdownRow}>
//           <Dropdown
//             style={style.dropdown}
//             data={userOptions}
//             placeholder="Select User"
//             labelField="label"
//             valueField="value"
//             value={selectedUser}
//             onChange={item => setSelectedUser(item.value)}
//           />

//           <Dropdown
//             style={style.dropdown}
//             data={rowOptions}
//             placeholder="Select Rows"
//             labelField="label"
//             valueField="value"
//             value={selectedRows}
//             onChange={item => setSelectedRows(item.value)}
//           />
//         </View>
//         <View>
//           <TouchableOpacity
//             onPress={toggleExpand}
//             activeOpacity={0.9}
//             style={{
//               backgroundColor: '#F8F4F5',
//               marginTop: scale(10),
//               paddingHorizontal: scale(10),
//               paddingVertical: scale(8),
//               flexDirection: 'row',
//               alignItems: 'center',
//               columnGap: scale(10),
//             }}
//           >
//             <View
//               style={{
//                 backgroundColor: '#DB4D4D',
//                 height: scale(35),
//                 width: scale(35),
//                 borderRadius: scale(35) / 2,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               <VectorIcon
//                 type="MaterialIcons"
//                 name={
//                   isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'
//                 }
//                 size={30}
//                 color={colors.white}
//               />
//             </View>
//             <CustomText
//               variant="h5"
//               fontFamily="Medium"
//               style={{
//                 color: colors.black,
//                 fontWeight: '500',
//               }}
//             >
//               Lead (43)
//             </CustomText>
//           </TouchableOpacity>

//           {isExpanded && (
//             <View style={{ flexDirection: 'row', position: 'relative' }}>
//               {/* Sticky FILE NUMBERS Column */}
//               <View
//                 style={{
//                   width: scale(150),
//                   backgroundColor: '#fff',
//                   position: 'absolute', // Sticky positioning
//                   left: 0,
//                   zIndex: 1, // Ensure it stays on top
//                   borderRightWidth: 0.5,
//                   borderColor: colors.graytextColor,
//                 }}
//               >
//                 <TouchableOpacity
//                   style={{
//                     height: scale(45),
//                     borderBottomWidth: 0.5,
//                     borderColor: colors.graytextColor,
//                     padding: scale(12),
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     backgroundColor: '#f0f0f0',
//                   }}
//                 >
//                   <CustomText
//                     fontSize={14}
//                     fontFamily="Medium"
//                     style={{ textAlign: 'center' }}
//                   >
//                     FILE NUMBERS
//                   </CustomText>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   style={{
//                     height: scale(45),
//                     borderBottomWidth: 0.5,
//                     borderColor: colors.graytextColor,
//                     padding: scale(12),
//                     justifyContent: 'center',
//                     alignItems: 'center',
//                     backgroundColor: '#fff',
//                   }}
//                 >
//                   <CustomText
//                     fontSize={14}
//                     fontFamily="Medium"
//                     style={{ textAlign: 'center' }}
//                   >
//                     10 - Generated File Number 10
//                   </CustomText>
//                 </TouchableOpacity>
//               </View>

//               {/* DraggableFlatList for Other Columns */}
//               <View style={{ marginLeft: scale(150) }}>
//                 <DraggableFlatList
//                   data={columns}
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   keyExtractor={item => item.key}
//                   contentContainerStyle={{ paddingRight: scale(5) }}
//                   renderItem={({ item, drag }) => {
//                     const isPriority = item.label.toLowerCase() === 'priority';
//                     const isChat = item.label.toLowerCase() === 'chat';

//                     return (
//                       <View
//                         style={{
//                           width: scale(130),
//                           borderLeftWidth: 0.5,
//                           borderColor: colors.graytextColor,
//                           backgroundColor: '#fff',
//                         }}
//                       >
//                         {/* Column Header */}
//                         <TouchableOpacity
//                           onLongPress={drag} // Enable dragging for other columns
//                           style={{
//                             height: scale(45),
//                             borderBottomWidth: 0.5,
//                             borderColor: colors.graytextColor,
//                             padding: scale(12),
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             backgroundColor: '#f0f0f0',
//                           }}
//                         >
//                           <CustomText
//                             fontSize={14}
//                             fontFamily="Medium"
//                             style={{ textAlign: 'center' }}
//                           >
//                             {item.label}
//                           </CustomText>
//                         </TouchableOpacity>

//                         {/* Row Cell */}
//                         <View
//                           style={{
//                             height: scale(45),
//                             borderBottomWidth: 0.5,
//                             borderColor: colors.graytextColor,
//                             justifyContent: 'center',
//                             alignItems: 'center',
//                             backgroundColor: isPriority
//                               ? getStatusColor(status)
//                               : '#fff',
//                           }}
//                         >
//                           {isChat ? (
//                             <TouchableOpacity activeOpacity={0.8}>
//                               <VectorIcon
//                                 type="MaterialCommunityIcons"
//                                 name="message-processing-outline"
//                                 size={20}
//                                 color={colors.primary}
//                               />
//                             </TouchableOpacity>
//                           ) : isPriority ? (
//                             <Dropdown
//                               style={{
//                                 width: '100%',
//                                 height: '100%',
//                                 backgroundColor: getStatusColor(status),
//                                 justifyContent: 'center',
//                                 alignItems: 'center',
//                               }}
//                               containerStyle={{
//                                 marginTop: scale(1),
//                                 borderWidth: 0.5,
//                                 borderColor: colors.graytextColor,
//                                 width: scale(130),
//                               }}
//                               itemContainerStyle={{
//                                 backgroundColor: '#fff',
//                                 justifyContent: 'center',
//                                 alignItems: 'center',
//                               }}
//                               placeholderStyle={{
//                                 color: '#fff',
//                                 fontSize: scale(14),
//                                 fontFamily: 'Medium',
//                                 textAlign: 'center',
//                               }}
//                               selectedTextStyle={{
//                                 color: '#fff',
//                                 fontSize: scale(14),
//                                 fontFamily: 'Medium',
//                                 textAlign: 'center',
//                               }}
//                               itemTextStyle={{
//                                 color: colors.black,
//                                 fontSize: scale(14),
//                                 fontFamily: 'Medium',
//                                 textAlign: 'center',
//                               }}
//                               renderItem={dropdownItem => (
//                                 <View
//                                   style={{
//                                     backgroundColor: getStatusColor(
//                                       dropdownItem.value,
//                                     ),
//                                     padding: scale(10),
//                                     borderBottomWidth: 0.5,
//                                     borderColor: colors.graytextColor,
//                                     justifyContent: 'center',
//                                     alignItems: 'center',
//                                     width: scale(130),
//                                   }}
//                                 >
//                                   <Text
//                                     style={{
//                                       color: '#fff',
//                                       fontSize: scale(14),
//                                       fontFamily: 'Medium',
//                                       textAlign: 'center',
//                                     }}
//                                   >
//                                     {dropdownItem.label}
//                                   </Text>
//                                 </View>
//                               )}
//                               data={statusOptions}
//                               labelField="label"
//                               valueField="value"
//                               value={status}
//                               placeholder="Select"
//                               onChange={item => setStatus(item.value)}
//                             />
//                           ) : (
//                             <CustomText
//                               fontSize={14}
//                               fontFamily="Medium"
//                               style={{ textAlign: 'center' }}
//                             >
//                               Row data
//                             </CustomText>
//                           )}
//                         </View>
//                       </View>
//                     );
//                   }}
//                 />
//               </View>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default DashboardScreen;

// const style = StyleSheet.create({
//   layoutStyle: {
//     paddingHorizontal: scale(14),
//     paddingVertical: scale(18),
//   },
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-evenly',
//   },
//   tableButton: {
//     backgroundColor: colors.jobcategoriColor1,
//     width: 60,
//     height: 45,
//     marginTop: scale(8),
//     borderRadius: scale(5),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   dropdownRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: scale(20),
//     paddingHorizontal: scale(10),
//   },
//   dropdown: {
//     width: '45%',
//     height: 50,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     backgroundColor: '#fff',
//   },
// });

// Prompt: Implementing Drag-to-Resize Column Headers in a React Native Table
// Objective:

// // Implement a drag-to-resize feature for column headers in a React Native table, allowing users to adjust the width of each column (including a sticky column) by dragging a resize handle. The table should display dynamic data from a rowData array, support column reordering via react-native-draggable-flatlist, and maintain all existing functionality (e.g., tabs, search bar, dropdowns, expand/collapse). The solution should only modify the table section, keeping other components unchanged.

// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   SafeAreaView,
//   FlatList,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   PanResponder,
// } from 'react-native';
// import HeaderComponent from '../../components/HeaderComponent';
// import { globalStyles } from '../../styles/GlobalStyle';
// import { Colors } from '../../constants/constants';
// import { colors } from '../../styles/Colors';
// import CustomText from '../../components/common/CustomText';
// import { scale } from 'react-native-size-matters';
// import CustomInput from '../../components/common/CustomInput';
// import VectorIcon from '../../components/common/CustomIcons';
// import { Dropdown } from 'react-native-element-dropdown';
// import DraggableFlatList from 'react-native-draggable-flatlist';
// import {
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming,
// } from 'react-native-reanimated';

// const DashboardScreen = ({ navigation }: { navigation: any }) => {
//   const Tabs = [
//     { name: 'Lead', bgColor: '#DB4D4D' },
//     { name: 'Pre-Approval', bgColor: '#012446' },
//     { name: 'Pre-Approved', bgColor: '#EE5B2B' },
//     { name: 'Live Deal', bgColor: '#05C1F0' },
//     { name: 'Declined', bgColor: '#3E8FC1' },
//     { name: 'Approved', bgColor: '#696969' },
//     { name: 'Accepted', bgColor: '#F3A216' },
//     { name: 'Waiting to Close', bgColor: '#90C224' },
//     { name: 'Funded + Awaiting Payment', bgColor: '#3E9871' },
//     { name: 'Complete', bgColor: '#01A75F' },
//     { name: 'Cancelled', bgColor: '#0A663E' },
//     { name: 'On Hold', bgColor: '#D86B22' },
//     { name: 'Cancelled', bgColor: '#252525' },
//     { name: 'Created by amjad', bgColor: '#252525' },
//   ];

//   const userOptions = [
//     { label: 'User 1', value: 'user1' },
//     { label: 'User 2', value: 'user2' },
//     { label: 'User 3', value: 'user3' },
//   ];

//   const rowOptions = [
//     { label: '5 Rows', value: '5' },
//     { label: '10 Rows', value: '10' },
//     { label: '15 Rows', value: '15' },
//   ];

//   const statusOptions = [
//     { label: 'Working', value: 'working' },
//     { label: 'Done', value: 'done' },
//     { label: 'Pending', value: 'pending' },
//   ];

//   const getStatusColor = (value: string) => {
//     switch (value) {
//       case 'working':
//         return '#f0ad4e';
//       case 'done':
//         return '#5cb85c';
//       case 'pending':
//         return '#d9534f';
//       default:
//         return '#ffffff';
//     }
//   };

//   const initialColumns = [
//     { key: '1', label: 'CHAT', width: scale(130) },
//     { key: '2', label: 'PRIORITY', width: scale(130) },
//     { key: '3', label: 'NO...', width: scale(130) },
//     { key: '4', label: 'DO...', width: scale(130) },
//     { key: '5', label: 'SR', width: scale(130) },
//     { key: '6', label: 'CL', width: scale(130) },
//     { key: '7', label: 'NE', width: scale(130) },
//     { key: '8', label: 'NE', width: scale(130) },
//     { key: '9', label: 'NE', width: scale(130) },
//     { key: '10', label: 'NE', width: scale(130) },
//     { key: '11', label: 'NE', width: scale(130) },
//     { key: '12', label: 'NE', width: scale(130) },
//     { key: '13', label: 'NE', width: scale(130) },
//     { key: '14', label: 'NE', width: scale(130) },
//   ];

//   const rowData = [
//     {
//       id: '1',
//       fileNumber: '10 - Generated File Number 10',
//       data: {
//         chat: null,
//         priority: 'working',
//         no: 'NO123',
//         do: 'DO456',
//         sr: 'SR789',
//         cl: 'CL012',
//         ne1: 'NE101',
//         ne2: 'NE102',
//         ne3: 'NE103',
//         ne4: 'NE104',
//         ne5: 'NE105',
//         ne6: 'NE106',
//         ne7: 'NE107',
//         ne8: 'NE108',
//       },
//     },
//     {
//       id: '2',
//       fileNumber: '11 - Generated File Number 11',
//       data: {
//         chat: null,
//         priority: 'done',
//         no: 'NO124',
//         do: 'DO457',
//         sr: 'SR790',
//         cl: 'CL013',
//         ne1: 'NE201',
//         ne2: 'NE202',
//         ne3: 'NE203',
//         ne4: 'NE204',
//         ne5: 'NE205',
//         ne6: 'NE206',
//         ne7: 'NE207',
//         ne8: 'NE208',
//       },
//     },
//     {
//       id: '3',
//       fileNumber: '12 - Generated File Number 12',
//       data: {
//         chat: null,
//         priority: 'pending',
//         no: 'NO125',
//         do: 'DO458',
//         sr: 'SR791',
//         cl: 'CL014',
//         ne1: 'NE301',
//         ne2: 'NE302',
//         ne3: 'NE303',
//         ne4: 'NE304',
//         ne5: 'NE305',
//         ne6: 'NE306',
//         ne7: 'NE307',
//         ne8: 'NE308',
//       },
//     },
//     {
//       id: '4',
//       fileNumber: '13 - Generated File Number 13',
//       data: {
//         chat: null,
//         priority: 'working',
//         no: 'NO126',
//         do: 'DO459',
//         sr: 'SR792',
//         cl: 'CL015',
//         ne1: 'NE401',
//         ne2: 'NE402',
//         ne3: 'NE403',
//         ne4: 'NE404',
//         ne5: 'NE405',
//         ne6: 'NE406',
//         ne7: 'NE407',
//         ne8: 'NE408',
//       },
//     },
//     {
//       id: '5',
//       fileNumber: '14 - Generated File Number 14',
//       data: {
//         chat: null,
//         priority: 'done',
//         no: 'NO127',
//         do: 'DO460',
//         sr: 'SR793',
//         cl: 'CL016',
//         ne1: 'NE501',
//         ne2: 'NE502',
//         ne3: 'NE503',
//         ne4: 'NE504',
//         ne5: 'NE505',
//         ne6: 'NE506',
//         ne7: 'NE507',
//         ne8: 'NE508',
//       },
//     },
//   ];

//   const [selectedUser, setSelectedUser] = useState<string | null>(null);
//   const [selectedRows, setSelectedRows] = useState<string | null>(null);
//   const [isTableChange, setIsTableChange] = useState<boolean>(false);
//   const [isExpanded, setIsExpanded] = useState<boolean>(false);
//   const [data, setData] = useState(rowData);
//   const [columns, setColumns] = useState(initialColumns);
//   const [fileNumberWidth, setFileNumberWidth] = useState(scale(150));

//   const toggleTableIcon = () => {
//     setIsTableChange(!isTableChange);
//   };

//   const toggleExpand = () => {
//     setIsExpanded(!isExpanded);
//   };

//   const expandValue = useSharedValue(0);
//   useEffect(() => {
//     expandValue.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
//   }, [isExpanded]);

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       height: expandValue.value === 0 ? 0 : undefined,
//       opacity: expandValue.value,
//       transform: [{ scaleY: expandValue.value }],
//     };
//   });

//   const filteredData = selectedRows ? data.slice(0, parseInt(selectedRows)) : data;

//   // PanResponder for resizing file number column
//   const fileNumberPanResponder = useRef(
//     PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: (evt, gestureState) => {
//         const newWidth = fileNumberWidth + gestureState.dx;
//         if (newWidth >= scale(100) && newWidth <= scale(300)) {
//           setFileNumberWidth(newWidth);
//         }
//       },
//       onPanResponderRelease: () => {},
//     })
//   ).current;

//   // PanResponder for resizing table columns
//   const createColumnPanResponder = (columnKey: string) => {
//     return PanResponder.create({
//       onStartShouldSetPanResponder: () => true,
//       onPanResponderMove: (evt, gestureState) => {
//         setColumns((prevColumns) =>
//           prevColumns.map((col) =>
//             col.key === columnKey
//               ? {
//                   ...col,
//                   width: Math.max(scale(100), Math.min(scale(300), col.width + gestureState.dx)),
//                 }
//               : col
//           )
//         );
//       },
//       onPanResponderRelease: () => {},
//     });
//   };

//   return (
//     <SafeAreaView style={globalStyles.globalContainer}>
//       <HeaderComponent
//         title="Dashboard"
//         navigation={navigation}
//         IconName="bars"
//         IconSize={18}
//         backgroundColor={Colors.tertiary}
//         titleColor={colors.white}
//         IconColor={colors.white}
//       />

//       <View>
//         <FlatList
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           data={Tabs}
//           contentContainerStyle={style.layoutStyle}
//           renderItem={({ item, index }) => (
//             <View key={index} style={{ marginLeft: index === 0 ? 0 : scale(10) }}>
//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 style={{ backgroundColor: item?.bgColor, borderRadius: scale(8) }}
//               >
//                 <CustomText
//                   fontFamily="Medium"
//                   style={{
//                     color: colors.white,
//                     paddingHorizontal: scale(22),
//                     paddingVertical: scale(10),
//                   }}
//                   fontSize={14}
//                   variant="h7"
//                 >
//                   {item?.name}
//                 </CustomText>
//               </TouchableOpacity>
//             </View>
//           )}
//         />
//       </View>

//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={style.searchRow}>
//           <CustomInput
//             placeholder="Search"
//             iconName="search"
//             iconType="FontAwesome"
//             iconColor={colors.LoginIconColor}
//             iconSize={20}
//             width={'70%'}
//           />
//           <TouchableOpacity
//             activeOpacity={0.8}
//             style={style.tableButton}
//             onPress={toggleTableIcon}
//           >
//             <VectorIcon
//               type="MaterialIcons"
//               name={isTableChange ? 'table-view' : 'table-rows'}
//               color={colors.white}
//             />
//           </TouchableOpacity>
//         </View>

//         <View style={style.dropdownRow}>
//           <Dropdown
//             style={style.dropdown}
//             data={userOptions}
//             placeholder="Select User"
//             labelField="label"
//             valueField="value"
//             value={selectedUser}
//             onChange={(item) => setSelectedUser(item.value)}
//           />
//           <Dropdown
//             style={style.dropdown}
//             data={rowOptions}
//             placeholder="Select Rows"
//             labelField="label"
//             valueField="value"
//             value={selectedRows}
//             onChange={(item) => setSelectedRows(item.value)}
//           />
//         </View>

//         <View>
//           <TouchableOpacity
//             onPress={toggleExpand}
//             activeOpacity={0.9}
//             style={{
//               backgroundColor: '#F8F4F5',
//               marginTop: scale(10),
//               paddingHorizontal: scale(10),
//               paddingVertical: scale(8),
//               flexDirection: 'row',
//               alignItems: 'center',
//               columnGap: scale(10),
//             }}
//           >
//             <View
//               style={{
//                 backgroundColor: '#DB4D4D',
//                 height: scale(35),
//                 width: scale(35),
//                 borderRadius: scale(35) / 2,
//                 alignItems: 'center',
//                 justifyContent: 'center',
//               }}
//             >
//               <VectorIcon
//                 type="MaterialIcons"
//                 name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
//                 size={30}
//                 color={colors.white}
//               />
//             </View>
//             <CustomText
//               variant="h5"
//               fontFamily="Medium"
//               style={{ color: colors.black, fontWeight: '500' }}
//             >
//               Lead ({filteredData.length})
//             </CustomText>
//           </TouchableOpacity>

//           {isExpanded && (
//             <View style={{ flexDirection: 'row', position: 'relative' }}>
//               {/* Sticky FILE NUMBERS Column */}
//               <View
//                 style={{
//                   width: fileNumberWidth,
//                   backgroundColor: '#fff',
//                   position: 'absolute',
//                   left: 0,
//                   zIndex: 1,
//                   borderRightWidth: 0.5,
//                   borderColor: colors.graytextColor,
//                 }}
//               >
//                 <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                   <TouchableOpacity
//                     style={{
//                       flex: 1,
//                       height: scale(45),
//                       borderBottomWidth: 0.5,
//                       borderColor: colors.graytextColor,
//                       padding: scale(12),
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       backgroundColor: '#f0f0f0',
//                     }}
//                   >
//                     <CustomText
//                       fontSize={14}
//                       fontFamily="Medium"
//                       style={{ textAlign: 'center' }}
//                     >
//                       FILE NUMBERS
//                     </CustomText>
//                   </TouchableOpacity>
//                   <View
//                     {...fileNumberPanResponder.panHandlers}
//                     style={{
//                       width: scale(5),
//                       height: scale(45),
//                       backgroundColor: colors.graytextColor,
//                       cursor: 'col-resize',
//                     }}
//                   />
//                 </View>
//                 {filteredData.map((row) => (
//                   <TouchableOpacity
//                     key={row.id}
//                     style={{
//                       height: scale(45),
//                       borderBottomWidth: 0.5,
//                       borderColor: colors.graytextColor,
//                       padding: scale(12),
//                       justifyContent: 'center',
//                       alignItems: 'center',
//                       backgroundColor: '#fff',
//                     }}
//                   >
//                     <CustomText
//                       fontSize={14}
//                       fontFamily="Medium"
//                       style={{ textAlign: 'center' }}
//                     >
//                       {row.fileNumber}
//                     </CustomText>
//                   </TouchableOpacity>
//                 ))}
//               </View>

//               {/* DraggableFlatList for Other Columns */}
//               <View style={{ marginLeft: fileNumberWidth }}>
//                 <DraggableFlatList
//                   data={columns}
//                   horizontal
//                   showsHorizontalScrollIndicator={false}
//                   keyExtractor={(item) => item.key}
//                   contentContainerStyle={{ paddingRight: scale(5) }}
//                   onDragEnd={({ data }) => setColumns(data)}
//                   renderItem={({ item, drag }) => {
//                     const isPriority = item.label.toLowerCase() === 'priority';
//                     const isChat = item.label.toLowerCase() === 'chat';
//                     const columnKey = isPriority
//                       ? 'priority'
//                       : isChat
//                       ? 'chat'
//                       : item.label.toLowerCase().replace('...', '');
//                     const panResponder = createColumnPanResponder(item.key);

//                     return (
//                       <View style={{ width: item.width, backgroundColor: '#fff' }}>
//                         {/* Column Header with Resize Handle */}
//                         <View style={{ flexDirection: 'row', alignItems: 'center' }}>
//                           <TouchableOpacity
//                             onLongPress={drag}
//                             style={{
//                               flex: 1,
//                               height: scale(45),
//                               borderBottomWidth: 0.5,
//                               borderLeftWidth: 0.5,
//                               borderColor: colors.graytextColor,
//                               padding: scale(12),
//                               justifyContent: 'center',
//                               alignItems: 'center',
//                               backgroundColor: '#f0f0f0',
//                             }}
//                           >
//                             <CustomText
//                               fontSize={14}
//                               fontFamily="Medium"
//                               style={{ textAlign: 'center' }}
//                             >
//                               {item.label}
//                             </CustomText>
//                           </TouchableOpacity>
//                           <View
//                             {...panResponder.panHandlers}
//                             style={{
//                               width: scale(5),
//                               height: scale(45),
//                               backgroundColor: colors.graytextColor,
//                               cursor: 'col-resize',
//                             }}
//                           />
//                         </View>

//                         {/* Row Cells */}
//                         {filteredData.map((row, rowIndex) => (
//                           <View
//                             key={row.id}
//                             style={{
//                               width: item.width,
//                               height: scale(45),
//                               borderBottomWidth: 0.5,
//                               borderLeftWidth: 0.5,
//                               borderColor: colors.graytextColor,
//                               justifyContent: 'center',
//                               alignItems: 'center',
//                               backgroundColor: isPriority ? getStatusColor(row.data.priority) : '#fff',
//                             }}
//                           >
//                             {isChat ? (
//                               <TouchableOpacity activeOpacity={0.8}>
//                                 <VectorIcon
//                                   type="MaterialCommunityIcons"
//                                   name="message-processing-outline"
//                                   size={20}
//                                   color={colors.primary}
//                                 />
//                               </TouchableOpacity>
//                             ) : isPriority ? (
//                               <Dropdown
//                                 style={{
//                                   width: '100%',
//                                   height: '100%',
//                                   backgroundColor: getStatusColor(row.data.priority),
//                                   justifyContent: 'center',
//                                   alignItems: 'center',
//                                 }}
//                                 containerStyle={{
//                                   marginTop: scale(1),
//                                   borderWidth: 0.5,
//                                   borderColor: colors.graytextColor,
//                                   width: item.width,
//                                 }}
//                                 itemContainerStyle={{
//                                   backgroundColor: '#fff',
//                                   justifyContent: 'center',
//                                   alignItems: 'center',
//                                 }}
//                                 placeholderStyle={{
//                                   color: '#fff',
//                                   fontSize: scale(14),
//                                   fontFamily: 'Medium',
//                                   textAlign: 'center',
//                                 }}
//                                 selectedTextStyle={{
//                                   color: '#fff',
//                                   fontSize: scale(14),
//                                   fontFamily: 'Medium',
//                                   textAlign: 'center',
//                                 }}
//                                 itemTextStyle={{
//                                   color: colors.black,
//                                   fontSize: scale(14),
//                                   fontFamily: 'Medium',
//                                   textAlign: 'center',
//                                 }}
//                                 iconColor="#fff"
//                                 iconStyle={{ marginRight: 10 }}
//                                 renderItem={(dropdownItem) => (
//                                   <View
//                                     style={{
//                                       backgroundColor: getStatusColor(dropdownItem.value),
//                                       padding: scale(10),
//                                       borderBottomWidth: 0.5,
//                                       borderColor: colors.graytextColor,
//                                       justifyContent: 'center',
//                                       alignItems: 'center',
//                                       width: item.width,
//                                     }}
//                                   >
//                                     <Text
//                                       style={{
//                                         color: '#fff',
//                                         fontSize: scale(14),
//                                         fontFamily: 'Medium',
//                                         textAlign: 'center',
//                                       }}
//                                     >
//                                       {dropdownItem.label}
//                                     </Text>
//                                   </View>
//                                 )}
//                                 data={statusOptions}
//                                 labelField="label"
//                                 valueField="value"
//                                 value={row.data.priority}
//                                 placeholder="Select"
//                                 onChange={(dropdownItem) => {
//                                   const newData = [...data];
//                                   newData[rowIndex].data.priority = dropdownItem.value;
//                                   setData(newData);
//                                 }}
//                               />
//                             ) : (
//                               <CustomText
//                                 fontSize={14}
//                                 fontFamily="Medium"
//                                 style={{ textAlign: 'center' }}
//                               >
//                                 {row.data[columnKey] || 'N/A'}
//                               </CustomText>
//                             )}
//                           </View>
//                         ))}
//                       </View>
//                     );
//                   }}
//                 />
//               </View>
//             </View>
//           )}
//         </View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// export default DashboardScreen;

// const style = StyleSheet.create({
//   layoutStyle: {
//     paddingHorizontal: scale(14),
//     paddingVertical: scale(18),
//   },
//   searchRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-evenly',
//   },
//   tableButton: {
//     backgroundColor: colors.jobcategoriColor1,
//     width: 60,
//     height: 45,
//     marginTop: scale(8),
//     borderRadius: scale(5),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   dropdownRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     marginTop: scale(20),
//     paddingHorizontal: scale(10),
//   },
//   dropdown: {
//     width: '45%',
//     height: 50,
//     borderColor: '#ccc',
//     borderWidth: 1,
//     borderRadius: 8,
//     paddingHorizontal: 10,
//     backgroundColor: '#fff',
//   },
// });
