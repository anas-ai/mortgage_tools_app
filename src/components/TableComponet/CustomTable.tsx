import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { scale } from 'react-native-size-matters';
import VectorIcon from '../../components/common/CustomIcons';
import CustomText from '../../components/common/CustomText';
import { fetchDashboardData } from '../../services/DashboardServices';
import { colors } from '../../styles/Colors';


interface FileStatus {
  id: number;
  user_id: number;
  name?: string;
  color: string;
  position: number;
  is_default: number;
  status: number;
  created_on: string;
  collapse: number;
}

interface DashboardData {
  fileStatus: FileStatus[];
}

const CustomTable = () => {
  const statusOptions = [
    { label: 'Working', value: 'working' },
    { label: 'Done', value: 'done' },
    { label: 'Pending', value: 'pending' },
  ];

  const getStatusColor = (value: string) => {
    switch (value) {
      case 'working':
        return '#f0ad4e';
      case 'done':
        return '#5cb85c';
      case 'pending':
        return '#d9534f';
      default:
        return '#ffffff';
    }
  };

  const initialColumns = [
    { key: '1', label: 'CHAT' },
    { key: '2', label: 'PRIORITY' },
    { key: '3', label: 'NOTE' },
    { key: '4', label: 'DOC(OTHER)' },
    { key: '5', label: 'DOC(MAIN)' },
    { key: '6', label: 'SR' },
    { key: '7', label: 'CLOSING' },
    { key: '8', label: 'NEXT CONTACT' },
    { key: '9', label: 'FILE STATUS' },
    { key: '10', label: 'TASK STATUS' },
    { key: '11', label: 'ACTION ON' },
    { key: '12', label: 'PROGRAM' },
    { key: '13', label: 'DEAL TYPE' },
    { key: '14', label: 'LENDER' },
    { key: '15', label: 'RATE TYPE' },
    { key: '16', label: 'PROPERTY VALUE' },
    { key: '17', label: 'MORTGAGE SIZE' },
    { key: '18', label: 'MATURITY DATE' },
    { key: '19', label: 'LTV' },
    { key: '20', label: 'ACTION' },
  ];

  const [isExpanded, setIsExpanded] = useState<{ [key: number]: boolean }>({});
  const [status, setStatus] = useState('working');
  const [data, setData] = useState<DashboardData | null>(null);


  
  const expandValue = useSharedValue(0);
  useEffect(() => {
    expandValue.value = withTiming(isExpanded ? 1 : 0, { duration: 100 });
  }, [isExpanded]);

  // ===== Scroll Animation =====
  const scrollX = useRef(new Animated.Value(0)).current;
  const minWidth = scale(150);
  const maxWidth = scale(260);

  const animatedWidth = scrollX.interpolate({
    inputRange: [0, 160],
    outputRange: [maxWidth, minWidth],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetchDashboardData();
        setData(res?.data);
        console.log(res, 'resss');
      } catch (error) {
        console.log('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace(/^#/, '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const toggleRow = (id: number) => {
    
    setIsExpanded(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  

  return (
    <View>
      {data?.fileStatus?.map((item, index) => (
        <React.Fragment key={item.id || index} >
          <TouchableOpacity
            onPress={() => toggleRow(item.id)}
            activeOpacity={0.9}
            style={[
              styles.header,
              { backgroundColor: hexToRgba(item?.color || '#000000', 0.060) ,
              },
              // index === data?.fileStatus.length - 1 && {marginBottom:scale(10)}
            ]}
          >
            <View
              style={[
                styles.expandIconWrapper,
                { backgroundColor: item?.color },
              ]}
            >
              <VectorIcon
                type="MaterialIcons"
                name={
                  isExpanded[item.id] ? 'keyboard-arrow-down' : 'keyboard-arrow-right'
                }
                size={30}
                color={colors.white}
              />
            </View>
            <CustomText
              variant="h5"
              fontFamily="Medium"
              style={[styles.headerTitle, { color: item?.color }]}
            >
              {item.name} ( )
            </CustomText>
          </TouchableOpacity>

          {isExpanded[item.id] && (
            <View style={{ flexDirection: 'row' ,
              // ...(index === data?.fileStatus?.length - 1 && { paddingBottom: scale(0) })

            }}>
              {/* Left column */}
              <Animated.View
                style={[
                  styles.fileNumberColumn,
                  {
                    width: animatedWidth,
                    borderRightWidth: 0.4,
                    borderRightColor: colors.graytextColor,
                  },
                ]}
              >
                <View style={styles.fileNumberHeader}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.fileNumberHeaderCell}
                  >
                    <CustomText fontSize={14} fontFamily="Medium">
                      FILE NUMBERS
                    </CustomText>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.fileNumberCell}
                >
                  <CustomText
                    fontSize={14}
                    fontFamily="Medium"
                    style={styles.centerText}
                  >
                    10 - Generated File Number 10
                  </CustomText>
                </TouchableOpacity>
              </Animated.View>

              {/* Right side scrollable columns */}
              <Animated.FlatList
                data={initialColumns}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={colItem => colItem.key}
                contentContainerStyle={{ paddingRight: scale(5) }}
                onScroll={Animated.event(
                  [{ nativeEvent: { contentOffset: { x: scrollX } } }],
                  { useNativeDriver: false },
                )}
                scrollEventThrottle={16}
                renderItem={({ item: colItem, index: colIndex }) => {
                  const isPriority = colItem.label.toLowerCase() === 'priority';
                  const isChat = colItem.label.toLowerCase() === 'chat';
                  const columnWidth = colIndex === 0 ? scale(120) : scale(150);

                  return (
                    <Animated.View
                      style={{ width: columnWidth, backgroundColor: '#fff' }}
                    >
                      <TouchableOpacity style={styles.columnHeader}>
                        <CustomText
                          fontSize={14}
                          fontFamily="Medium"
                          style={styles.centerText}
                        >
                          {colItem.label}
                        </CustomText>
                      </TouchableOpacity>

                      <View
                        style={[
                          styles.columnCell,
                          {
                            backgroundColor: isPriority
                              ? getStatusColor(status)
                              : '#fff',
                          },
                        ]}
                      >
                        {isChat ? (
                          <TouchableOpacity activeOpacity={0.8}>
                            <VectorIcon
                              type="MaterialCommunityIcons"
                              name="message-processing-outline"
                              size={20}
                              color={colors.primary}
                            />
                          </TouchableOpacity>
                        ) : isPriority ? (
                          <Dropdown
                            style={[
                              styles.dropdown,
                              { backgroundColor: getStatusColor(status) },
                            ]}
                            containerStyle={[
                              styles.dropdownContainer,
                              { width: scale(130) },
                            ]}
                            itemContainerStyle={styles.dropdownItemContainer}
                            placeholderStyle={styles.dropdownText}
                            selectedTextStyle={styles.dropdownText}
                            itemTextStyle={styles.dropdownItemText}
                            iconColor="#fff"
                            iconStyle={{ marginRight: 10 }}
                            renderItem={dropdownItem => (
                              <View
                                style={[
                                  styles.dropdownListItem,
                                  {
                                    backgroundColor: getStatusColor(
                                      dropdownItem.value,
                                    ),
                                  },
                                ]}
                              >
                                <Text style={styles.dropdownListItemText}>
                                  {dropdownItem.label}
                                </Text>
                              </View>
                            )}
                            data={statusOptions}
                            labelField="label"
                            valueField="value"
                            value={status}
                            placeholder="Select"
                            onChange={selected => setStatus(selected.value)}
                          />
                        ) : (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            Row data
                          </CustomText>
                        )}
                      </View>
                    </Animated.View>
                  );
                }}
              />
            </View>
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: scale(1),
    paddingHorizontal: scale(10),
    paddingVertical: scale(8),
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: scale(10),
  },
  expandIconWrapper: {
    height: scale(35),
    width: scale(35),
    borderRadius: scale(35),
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '500',
  },
  fileNumberColumn: {
    backgroundColor: '#fff',
    borderRightWidth: 0.5,
    borderColor: colors.graytextColor,
  },
  fileNumberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileNumberHeaderCell: {
    flex: 1,
    height: scale(45),
    borderBottomWidth: 0.4,
    borderColor: colors.graytextColor,
    padding: scale(12),
  },
  resizeHandle: {
    width: scale(5),
    height: scale(45),
    backgroundColor: colors.graytextColor,
  },
  fileNumberCell: {
    height: scale(45),
    borderBottomWidth: 0.2,
    borderColor: colors.graytextColor,
    padding: scale(12),
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  centerText: {
    textAlign: 'left',
  },
  columnHeader: {
    flex: 1,
    height: scale(45),
    borderBottomWidth: 0.4,
    borderLeftWidth: 0.4,
    borderColor: colors.graytextColor,
    padding: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  columnCell: {
    height: scale(45),
    borderBottomWidth: 0.4,
    borderLeftWidth: 0.4,
    borderColor: colors.graytextColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    marginTop: scale(1),
    borderWidth: 0.4,
    borderColor: colors.graytextColor,
  },
  dropdownItemContainer: {
    backgroundColor: '#fff',
    flex: 1,
  },
  dropdownText: {
    color: '#fff',
    fontSize: scale(14),
    fontFamily: 'Medium',
    textAlign: 'center',
  },
  dropdownItemText: {
    color: colors.black,
    fontSize: scale(14),
    fontFamily: 'Medium',
    textAlign: 'center',
  },
  dropdownListItem: {
    padding: scale(10),
    borderBottomWidth: 0.5,
    borderColor: colors.graytextColor,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownListItemText: {
    color: '#fff',
    fontSize: scale(14),
    fontFamily: 'Medium',
    textAlign: 'center',
  },
});

export default CustomTable;


// import React, { useEffect, useRef, useState } from 'react';
// import {
//   Animated,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { MMKV } from 'react-native-mmkv'; // Import MMKV
// import { Dropdown } from 'react-native-element-dropdown';
// import { useSharedValue, withTiming } from 'react-native-reanimated';
// import { scale } from 'react-native-size-matters';
// import VectorIcon from '../../components/common/CustomIcons';
// import CustomText from '../../components/common/CustomText';
// import { fetchDashboardData } from '../../services/DashboardServices';
// import { colors } from '../../styles/Colors';
// import axios from 'axios'; // For making API calls
// import { GetObjectFromStorage } from '../../utils/MmkvStorageHelper';

// // Initialize MMKV
// const storage = new MMKV();

// interface FileStatus {
//   id: number;
//   user_id: number;
//   name?: string;
//   color: string;
//   position: number;
//   is_default: number;
//   status: number;
//   created_on: string;
//   collapse: number;
// }

// interface DashboardData {
//   fileStatus: FileStatus[];
// }

// const CustomTable = () => {
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
//     { key: '1', label: 'CHAT' },
//     { key: '2', label: 'PRIORITY' },
//     { key: '3', label: 'NOTE' },
//     { key: '4', label: 'DOC(OTHER)' },
//     { key: '5', label: 'DOC(MAIN)' },
//     { key: '6', label: 'SR' },
//     { key: '7', label: 'CLOSING' },
//     { key: '8', label: 'NEXT CONTACT' },
//     { key: '9', label: 'FILE STATUS' },
//     { key: '10', label: 'TASK STATUS' },
//     { key: '11', label: 'ACTION ON' },
//     { key: '12', label: 'PROGRAM' },
//     { key: '13', label: 'DEAL TYPE' },
//     { key: '14', label: 'LENDER' },
//     { key: '15', label: 'RATE TYPE' },
//     { key: '16', label: 'PROPERTY VALUE' },
//     { key: '17', label: 'MORTGAGE SIZE' },
//     { key: '18', label: 'MATURITY DATE' },
//     { key: '19', label: 'LTV' },
//     { key: '20', label: 'ACTION' },
//   ];

//   const [isExpanded, setIsExpanded] = useState<{ [key: number]: boolean }>({});
//   const [status, setStatus] = useState('working');
//   const [data, setData] = useState<DashboardData | null>(null);

//   const expandValue = useSharedValue(0);
//   useEffect(() => {
//     expandValue.value = withTiming(
//       Object.values(isExpanded).some(val => val) ? 1 : 0,
//       { duration: 100 },
//     );
//   }, [isExpanded]);

//   // ===== Scroll Animation =====
//   const scrollX = useRef(new Animated.Value(0)).current;
//   const minWidth = scale(150);
//   const maxWidth = scale(260);

//   const animatedWidth = scrollX.interpolate({
//     inputRange: [0, 160],
//     outputRange: [maxWidth, minWidth],
//     extrapolate: 'clamp',
//   });

//   // Load saved expand/collapse state from MMKV
//   useEffect(() => {
//     const loadExpandState = () => {
//       try {
//         const savedState = storage.getString('expandState');
//         if (savedState) {
//           setIsExpanded(JSON.parse(savedState));
//         }
//       } catch (error) {
//         console.log('Error loading expand state from MMKV:', error);
//       }
//     };

//     loadExpandState();
//   }, []);

//   // Fetch dashboard data and initialize collapse state
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const res = await fetchDashboardData();
//         setData(res?.data);
//         // Initialize isExpanded based on API collapse field
//         const initialExpandState = res?.data?.fileStatus?.reduce(
//           (acc: { [key: number]: boolean }, item: FileStatus) => ({
//             ...acc,
//             [item.id]: item.collapse === 0, // 0 means expanded, 1 means collapsed
//           }),
//           {},
//         );
//         setIsExpanded(initialExpandState);
//         // Save initial state to MMKV
//         storage.set('expandState', JSON.stringify(initialExpandState));
//         console.log(res, 'resss');
//       } catch (error) {
//         console.log('Error fetching dashboard data:', error);
//       }
//     };

//     fetchData();
//   }, []);

//   // Save expand/collapse state to API and MMKV
//   const saveCollapseState = async (statusId: number, isCollapsed: number) => {
//     const userInfo = GetObjectFromStorage<any>('userInfo');
//     const userId = userInfo?.id;
//     try {
//       const response = await axios.post(
//         'https://staging3.mortgagetools.ca/api/save/statuscollap',
//         {
//           statusid: statusId,
//           is_collapsed: isCollapsed,
//           user_id: userId, // Replace with dynamic user_id if needed
//           shareuserid: 0,
//         },
//       );
//       console.log('Collapse state saved:', response.data);

//       // Update MMKV
//       const newExpandState = { ...isExpanded, [statusId]: isCollapsed === 0 };
//       storage.set('expandState', JSON.stringify(newExpandState));
//       setIsExpanded(newExpandState);
//     } catch (error) {
//       console.log('Error saving collapse state:', error);
//     }
//   };

//   const hexToRgba = (hex: string, alpha: number) => {
//     const cleanHex = hex.replace(/^#/, '');
//     const r = parseInt(cleanHex.substring(0, 2), 16);
//     const g = parseInt(cleanHex.substring(2, 4), 16);
//     const b = parseInt(cleanHex.substring(4, 6), 16);
//     return `rgba(${r}, ${g}, ${b}, ${alpha})`;
//   };

//   const toggleRow = (id: number) => {
//     const newIsCollapsed = isExpanded[id] ? 1 : 0; // Toggle: 0 for expanded, 1 for collapsed
//     saveCollapseState(id, newIsCollapsed);
//   };

//   return (
//     <View>
//       {data?.fileStatus?.map((item, index) => (
//         <React.Fragment key={item.id || index}>
//           <TouchableOpacity
//             onPress={() => toggleRow(item.id)}
//             activeOpacity={0.9}
//             style={[
//               styles.header,
//               { backgroundColor: hexToRgba(item?.color || '#000000', 0.06) },
//             ]}
//           >
//             <View
//               style={[
//                 styles.expandIconWrapper,
//                 { backgroundColor: item?.color },
//               ]}
//             >
//               <VectorIcon
//                 type="MaterialIcons"
//                 name={
//                   isExpanded[item.id]
//                     ? 'keyboard-arrow-down'
//                     : 'keyboard-arrow-right'
//                 }
//                 size={30}
//                 color={colors.white}
//               />
//             </View>
//             <CustomText
//               variant="h5"
//               fontFamily="Medium"
//               style={[styles.headerTitle, { color: item?.color }]}
//             >
//               {item.name} ( )
//             </CustomText>
//           </TouchableOpacity>

//           {isExpanded[item.id] && (
//             <View style={{ flexDirection: 'row' }}>
//               {/* Left column */}
//               <Animated.View
//                 style={[
//                   styles.fileNumberColumn,
//                   {
//                     width: animatedWidth,
//                     borderRightWidth: 0.4,
//                     borderRightColor: colors.graytextColor,
//                   },
//                 ]}
//               >
//                 <View style={styles.fileNumberHeader}>
//                   <TouchableOpacity
//                     activeOpacity={0.8}
//                     style={styles.fileNumberHeaderCell}
//                   >
//                     <CustomText fontSize={14} fontFamily="Medium">
//                       FILE NUMBERS
//                     </CustomText>
//                   </TouchableOpacity>
//                 </View>
//                 <TouchableOpacity
//                   activeOpacity={0.8}
//                   style={styles.fileNumberCell}
//                 >
//                   <CustomText
//                     fontSize={14}
//                     fontFamily="Medium"
//                     style={styles.centerText}
//                   >
//                     10 - Generated File Number 10
//                   </CustomText>
//                 </TouchableOpacity>
//               </Animated.View>

//               {/* Right side scrollable columns */}
//               <Animated.FlatList
//                 data={initialColumns}
//                 horizontal
//                 showsHorizontalScrollIndicator={false}
//                 keyExtractor={colItem => colItem.key}
//                 contentContainerStyle={{ paddingRight: scale(5) }}
//                 onScroll={Animated.event(
//                   [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//                   { useNativeDriver: false },
//                 )}
//                 scrollEventThrottle={16}
//                 renderItem={({ item: colItem, index: colIndex }) => {
//                   const isPriority = colItem.label.toLowerCase() === 'priority';
//                   const isChat = colItem.label.toLowerCase() === 'chat';
//                   const columnWidth = colIndex === 0 ? scale(120) : scale(150);

//                   return (
//                     <Animated.View
//                       style={{ width: columnWidth, backgroundColor: '#fff' }}
//                     >
//                       <TouchableOpacity style={styles.columnHeader}>
//                         <CustomText
//                           fontSize={14}
//                           fontFamily="Medium"
//                           style={styles.centerText}
//                         >
//                           {colItem.label}
//                         </CustomText>
//                       </TouchableOpacity>

//                       <View
//                         style={[
//                           styles.columnCell,
//                           {
//                             backgroundColor: isPriority
//                               ? getStatusColor(status)
//                               : '#fff',
//                           },
//                         ]}
//                       >
//                         {isChat ? (
//                           <TouchableOpacity activeOpacity={0.8}>
//                             <VectorIcon
//                               type="MaterialCommunityIcons"
//                               name="message-processing-outline"
//                               size={20}
//                               color={colors.primary}
//                             />
//                           </TouchableOpacity>
//                         ) : isPriority ? (
//                           <Dropdown
//                             style={[
//                               styles.dropdown,
//                               { backgroundColor: getStatusColor(status) },
//                             ]}
//                             containerStyle={[
//                               styles.dropdownContainer,
//                               { width: scale(130) },
//                             ]}
//                             itemContainerStyle={styles.dropdownItemContainer}
//                             placeholderStyle={styles.dropdownText}
//                             selectedTextStyle={styles.dropdownText}
//                             itemTextStyle={styles.dropdownItemText}
//                             iconColor="#fff"
//                             iconStyle={{ marginRight: 10 }}
//                             renderItem={dropdownItem => (
//                               <View
//                                 style={[
//                                   styles.dropdownListItem,
//                                   {
//                                     backgroundColor: getStatusColor(
//                                       dropdownItem.value,
//                                     ),
//                                   },
//                                 ]}
//                               >
//                                 <Text style={styles.dropdownListItemText}>
//                                   {dropdownItem.label}
//                                 </Text>
//                               </View>
//                             )}
//                             data={statusOptions}
//                             labelField="label"
//                             valueField="value"
//                             value={status}
//                             placeholder="Select"
//                             onChange={selected => setStatus(selected.value)}
//                           />
//                         ) : (
//                           <CustomText
//                             fontSize={14}
//                             fontFamily="Medium"
//                             style={styles.centerText}
//                           >
//                             Row data
//                           </CustomText>
//                         )}
//                       </View>
//                     </Animated.View>
//                   );
//                 }}
//               />
//             </View>
//           )}
//         </React.Fragment>
//       ))}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   header: {
//     marginTop: scale(1),
//     paddingHorizontal: scale(10),
//     paddingVertical: scale(8),
//     flexDirection: 'row',
//     alignItems: 'center',
//     columnGap: scale(10),
//   },
//   expandIconWrapper: {
//     height: scale(35),
//     width: scale(35),
//     borderRadius: scale(35),
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerTitle: {
//     fontWeight: '500',
//   },
//   fileNumberColumn: {
//     backgroundColor: '#fff',
//     borderRightWidth: 0.5,
//     borderColor: colors.graytextColor,
//   },
//   fileNumberHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   fileNumberHeaderCell: {
//     flex: 1,
//     height: scale(45),
//     borderBottomWidth: 0.4,
//     borderColor: colors.graytextColor,
//     padding: scale(12),
//   },
//   fileNumberCell: {
//     height: scale(45),
//     borderBottomWidth: 0.2,
//     borderColor: colors.graytextColor,
//     padding: scale(12),
//     justifyContent: 'center',
//     backgroundColor: '#fff',
//   },
//   centerText: {
//     textAlign: 'left',
//   },
//   columnHeader: {
//     flex: 1,
//     height: scale(45),
//     borderBottomWidth: 0.4,
//     borderLeftWidth: 0.4,
//     borderColor: colors.graytextColor,
//     padding: scale(12),
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f0f0f0',
//   },
//   columnCell: {
//     height: scale(45),
//     borderBottomWidth: 0.4,
//     borderLeftWidth: 0.4,
//     borderColor: colors.graytextColor,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   dropdown: {
//     width: '100%',
//     height: '100%',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   dropdownContainer: {
//     marginTop: scale(1),
//     borderWidth: 0.4,
//     borderColor: colors.graytextColor,
//   },
//   dropdownItemContainer: {
//     backgroundColor: '#fff',
//     flex: 1,
//   },
//   dropdownText: {
//     color: '#fff',
//     fontSize: scale(14),
//     fontFamily: 'Medium',
//     textAlign: 'center',
//   },
//   dropdownItemText: {
//     color: colors.black,
//     fontSize: scale(14),
//     fontFamily: 'Medium',
//     textAlign: 'center',
//   },
//   dropdownListItem: {
//     padding: scale(10),
//     borderBottomWidth: 0.5,
//     borderColor: colors.graytextColor,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   dropdownListItemText: {
//     color: '#fff',
//     fontSize: scale(14),
//     fontFamily: 'Medium',
//     textAlign: 'center',
//   },
// });

// export default CustomTable;
