import { ApiConfig } from '../config/apiConfig';
import axiosInstance from '../utils/axiosInstance';
import { GetObjectFromStorage } from '../utils/MmkvStorageHelper';

interface saveStatusCollapsetypes {
  statusid?: number;
  is_collapsed?: number;
  user_id?: number;
  shareuserid?: number;
}

export const fetchDashboardData = async () => {
  const userInfo = GetObjectFromStorage<any>('userInfo');
  const userId = userInfo?.id;
  const sharedId = userInfo?.sharedId;
  try {
    const res = await axiosInstance.get(
      ApiConfig.DASHBOARD_API(userId, sharedId),
    );
    // console.log(res?.data?.fileStatus, 'resss');
    console.log(res?.data, 'resss');
    console.log(res?.data?.columns.name)
    return res;
  } catch (error) {}
};

export const saveStatusCollapse = async ({
  statusid,
  is_collapsed,
  user_id,
  shareuserid = 0,
}: saveStatusCollapsetypes) => {
  try {
    const res = axiosInstance.post(ApiConfig.STATUS_COLLAP_SAVE_API, {
      statusid,
      is_collapsed,
      user_id,
      shareuserid,
    });
    console.log(res, 'SaveStatusCollapse');
  } catch (error: any) {
    console.log('errorOns: saveStatusCollapse', error.message);
  }
};


// import { Skeleton } from '@rneui/themed';
// import React, { useCallback, useRef, useState } from 'react';
// import {
//   Animated,
//   FlatList,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { Dropdown } from 'react-native-element-dropdown';
// import { useSharedValue, withTiming } from 'react-native-reanimated';
// import { scale } from 'react-native-size-matters';
// import VectorIcon from '../../components/common/CustomIcons';
// import CustomText from '../../components/common/CustomText';
// import { saveStatusCollapse } from '../../services/DashboardServices';
// import { colors } from '../../styles/Colors';
// import { GetObjectFromStorage } from '../../utils/MmkvStorageHelper';
// import debounce from 'lodash.debounce';

// export interface FileStatus {
//   id: number;
//   user_id: number;
//   name?: string;
//   color: string;
//   position: number;
//   is_default: number;
//   status: number;
//   created_on: string;
//   collapse: number;
//   files: any[];
//   columns: any[];
// }

// interface Option {
//   actionon?: Array<{ id: number | string; name: string; color: string }>;
//   dealtype?: Array<{ id: number | string; name: string; color: string }>;
//   filestatus?: Array<{ id: number | string; name: string; color: string }>;
//   lender?: Array<{ id: number | string; name: string; color: string }>;
//   priority?: Array<{ id: number | string; name: string; color: string }>;
//   program?: Array<{ id: number | string; name: string; color: string }>;
//   ratetype?: Array<{ id: number | string; name: string; color: string }>;
//   taskstatus?: Array<{ id: number | string; name: string; color: string }>;
// }

// interface CustomTableProps {
//   loading: boolean;
//   data: FileStatus[] | null;
//   columns: Array<{
//     id: number;
//     name: string;
//     col_key: string;
//     type: 'text' | 'date' | 'select' | 'button';
//     width?: number;
//   }>;
//   isExpanded: { [key: number]: boolean };
//   setIsExpanded: React.Dispatch<
//     React.SetStateAction<{ [key: number]: boolean }>
//   >;
//   options: Option;
// }

// interface TableRowProps {
//   item: FileStatus;
//   index: number;
//   isExpanded: { [key: number]: boolean };
//   toggleRow: (id: number, currentState: boolean) => void;
//   scrollX: Animated.Value;
//   column: Array<{
//     id: number;
//     name: string;
//     col_key: string;
//     type: 'text' | 'date' | 'select' | 'button';
//     width?: number;
//   }>;
//   option: Option;
// }

// const TableRow = ({
//   item,
//   index,
//   isExpanded,
//   toggleRow,
//   scrollX,
//   column,
//   option,
// }: TableRowProps) => {
//   const minWidth = scale(150);
//   const maxWidth = scale(260);

//   const animatedWidth = scrollX.interpolate({
//     inputRange: [0, 150],
//     outputRange: [maxWidth, minWidth],
//     extrapolate: 'clamp',
//   });

//   const [selectedValues, setSelectedValues] = useState<{
//     [fileId: string]: { [colKey: string]: any };
//   }>({});

//   const getStatusColor = (id: number | string | null, list: any[]) => {
//     const item = list.find((f) => f.id == id);
//     return item?.color ?? '#252525';
//   };

//   const handleChange = async (
//     fileId: string | number,
//     colKey: string,
//     selected: any,
//   ) => {
//     setSelectedValues(prev => ({
//       ...prev,
//       [fileId]: {
//         ...prev[fileId],
//         [colKey]: selected,
//       },
//     }));
//     try {
//       // Replace with your actual API endpoint
//       await fetch(`/api/update-file/${fileId}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ [colKey]: selected.id }),
//       });
//       console.log(`Updated ${colKey} for file ${fileId} to`, selected.id);
//     } catch (error) {
//       console.error(`Error updating ${colKey} for file ${fileId}:`, error);
//     }
//   };

//   const hexToRgba = (hex: string, alpha: number) => {
//     const cleanHex = hex.replace(/^#/, '');
//     const r = parseInt(cleanHex.substring(0, 2), 16);
//     const g = parseInt(cleanHex.substring(2, 4), 16);
//     const b = parseInt(cleanHex.substring(4, 6), 16);
//     return `rgba(${r}, ${g}, ${b}, ${alpha})`;
//   };

//   const expandValue = useSharedValue(isExpanded[item.id] ? 1 : 0);

//   React.useEffect(() => {
//     expandValue.value = withTiming(isExpanded[item.id] ? 1 : 0, {
//       duration: 100,
//     });
//   }, [isExpanded[item.id]]);

  // const getCellData = (file: any, colKey: string, colType: string) => {
  //   let cellData = colKey ? file[colKey] : null;
  //   if (colKey === 'get_manual_note') {
  //     cellData = file['get_manual_note']?.note ?? null;
  //   } else if (colKey === 'get_email_los_info') {
  //     cellData = file['get_email_los_info']?.email ?? null;
  //   } else if (['property_value', 'mortgage_size', 'ltv'].includes(colKey)) {
  //     cellData = cellData ? parseFloat(cellData).toLocaleString() : null;
  //   } else if (colKey === 'maturity_date') {
  //     cellData = cellData ?? null;
  //   }

  //   if (colType === 'date' && cellData) {
  //     try {
  //       cellData = new Date(cellData).toLocaleDateString('en-US', {
  //         month: 'short',
  //         day: '2-digit',
  //         year: 'numeric',
  //       });
  //     } catch (error) {
  //       console.error(`Invalid date for ${colKey}:`, cellData);
  //       cellData = null;
  //     }
  //   }
  //   return cellData;
  // };

  // type DropdownKey = keyof typeof dropdownDataMap;
  // const dropdownDataMap = {
  //   lending_type_id: 'priority',
  //   file_status_id: 'filestatus',
  //   task_status_id: 'taskstatus',
  //   member_id: 'member',
  //   program_id: 'program',
  //   deal_type_id: 'dealtype',
  //   lender_id: 'lender',
  //   rate_type_id: 'ratetype',
  //   action_on_id: 'actionon', // Added for actionon
  // } as const;

//   console.log('Sample file:', JSON.stringify(item.files[0], null, 2));
//   console.log('Options:', JSON.stringify(option, null, 2));

//   return (
//     <>
//       <TouchableOpacity
//         onPress={() => toggleRow(item.id, isExpanded[item.id])}
//         activeOpacity={0.9}
//         style={[
//           styles.header,
//           { backgroundColor: hexToRgba(item?.color || '#000000', 0.06) },
//         ]}
//       >
//         <View
//           style={[styles.expandIconWrapper, { backgroundColor: item?.color }]}
//         >
//           <VectorIcon
//             type="MaterialIcons"
//             name={
//               isExpanded[item.id]
//                 ? 'keyboard-arrow-down'
//                 : 'keyboard-arrow-right'
//             }
//             size={30}
//             color={colors.white}
//           />
//         </View>
//         <CustomText
//           variant="h5"
//           fontFamily="Medium"
//           style={[styles.headerTitle, { color: item?.color }]}
//         >
//           {item.name} ({item?.files.length})
//         </CustomText>
//       </TouchableOpacity>

//       {isExpanded[item.id] && (
//         <View style={{ flexDirection: 'row' }}>
//           <Animated.View
//             style={[
//               styles.fileNumberColumn,
//               {
//                 width: animatedWidth,
//                 borderRightWidth: 0.4,
//                 borderRightColor: colors.graytextColor,
//               },
//             ]}
//           >
//             <View style={styles.fileNumberHeader}>
//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 style={styles.fileNumberHeaderCell}
//               >
//                 <CustomText fontSize={14} fontFamily="Medium">
//                   {column[0].name}
//                 </CustomText>
//               </TouchableOpacity>
//             </View>

//             {!item?.files ? (
//               <TouchableOpacity
//                 activeOpacity={0.8}
//                 style={styles.fileNumberCell}
//               >
//                 <CustomText
//                   fontSize={14}
//                   fontFamily="Medium"
//                   style={styles.centerText}
//                 >
//                   {null}
//                 </CustomText>
//               </TouchableOpacity>
//             ) : (
//               item?.files.map((file, index) => (
//                 <TouchableOpacity
//                   key={file['id'] || index}
//                   activeOpacity={0.8}
//                   style={styles.fileNumberCell}
//                 >
//                   <CustomText
//                     fontSize={14}
//                     fontFamily="Medium"
//                     style={styles.centerText}
//                   >
//                     {
//                       file['get_account_i_d']?.['get_account_number']?.[
//                         'account_number'
//                       ] ?? '-'
//                     }
//                   </CustomText>
//                 </TouchableOpacity>
//               ))
//             )}
//           </Animated.View>

//           <Animated.FlatList
//             data={column.slice(1)}
//             horizontal
//             showsHorizontalScrollIndicator={false}
//             keyExtractor={colItem => colItem.id.toString()}
//             contentContainerStyle={{ paddingRight: scale(5) }}
//             onScroll={Animated.event(
//               [{ nativeEvent: { contentOffset: { x: scrollX } } }],
//               { useNativeDriver: false },
//             )}
//             scrollEventThrottle={16}
//             renderItem={({ item: colItem }) => {
//               const isChat = colItem.name.toLowerCase() === 'chat';
//               const columnWidth = colItem?.width || scale(150);
//               const colKey = colItem.col_key;
//               const colType = colItem.type;
//               const dropdownKey = dropdownDataMap[colKey as DropdownKey];
//               const dropdownData = dropdownKey ? option?.[dropdownKey] ?? [] : [];

//               return (
//                 <Animated.View
//                   style={{ width: columnWidth, backgroundColor: '#fff' }}
//                 >
//                   <TouchableOpacity style={styles.columnHeader}>
//                     <CustomText
//                       fontSize={14}
//                       fontFamily="Medium"
//                       style={styles.centerText}
//                     >
//                       {colItem.name}
//                     </CustomText>
//                   </TouchableOpacity>

//                   {item?.files.map((file, fileIndex) => {
//                     const cellData = getCellData(file, colKey, colType);
//                     const selected =
//                       selectedValues[file.id]?.[colKey] ??
//                       dropdownData.find((p) => p.id == cellData);
//                     const cellBackground =
//                       colType === 'select' && dropdownData.length > 0
//                         ? getStatusColor(selected?.id ?? cellData, dropdownData)
//                         : '#fff';

//                     return (
//                       <View
//                         key={file['id'] || fileIndex}
//                         style={[
//                           styles.columnCell,
//                           { backgroundColor: cellBackground },
//                         ]}
//                       >
//                         {(() => {
//                           switch (colType) {
//                             case 'button':
//                               return isChat ? (
//                                 <TouchableOpacity activeOpacity={0.8}>
//                                   <VectorIcon
//                                     type="MaterialCommunityIcons"
//                                     name="message-processing-outline"
//                                     size={20}
//                                     color={colors.black}
//                                   />
//                                 </TouchableOpacity>
//                               ) : (
//                                 <TouchableOpacity activeOpacity={0.8}>
//                                   <VectorIcon
//                                     type="MaterialCommunityIcons"
//                                     name="dots-horizontal"
//                                     size={20}
//                                     color={colors.black}
//                                   />
//                                 </TouchableOpacity>
//                               );
//                             case 'select':
//                               return dropdownData.length > 0 ? (
//                                 <Dropdown
//                                   style={[
//                                     styles.dropdown,
//                                     {
//                                       backgroundColor:
//                                         selected?.color ?? '#252525',
//                                     },
//                                   ]}
//                                   containerStyle={[
//                                     styles.dropdownContainer,
//                                     { width: scale(130) },
//                                   ]}
//                                   itemContainerStyle={styles.dropdownItemContainer}
//                                   placeholderStyle={styles.dropdownText}
//                                   selectedTextStyle={styles.dropdownText}
//                                   itemTextStyle={styles.dropdownItemText}
//                                   iconColor="#fff"
//                                   iconStyle={{ marginRight: 10 }}
//                                   renderItem={dropdownItem => (
//                                     <View
//                                       style={[
//                                         styles.dropdownListItem,
//                                         {
//                                           backgroundColor:
//                                             dropdownItem.color ?? '#252525',
//                                         },
//                                       ]}
//                                     >
//                                       <Text style={styles.dropdownListItemText}>
//                                         {dropdownItem.name}
//                                       </Text>
//                                     </View>
//                                   )}
//                                   data={dropdownData}
//                                   labelField="name"
//                                   valueField="id"
//                                   value={selected?.id ?? cellData}
//                                   placeholder="Select"
//                                   onChange={selected =>
//                                     handleChange(file.id, colKey, selected)
//                                   }
//                                 />
//                               ) : (
//                                 <CustomText
//                                   fontSize={14}
//                                   fontFamily="Medium"
//                                   style={styles.centerText}
//                                 >
//                                   {'-'}
//                                 </CustomText>
//                               );
//                             case 'text':
//                             case 'date':
//                             default:
//                               return (
//                                 <CustomText
//                                   fontSize={14}
//                                   fontFamily="Medium"
//                                   style={styles.centerText}
//                                 >
//                                   {cellData ?? '-'}
//                                 </CustomText>
//                               );
//                           }
//                         })()}
//                       </View>
//                     );
//                   })}
//                 </Animated.View>
//               );
//             }}
//           />
//         </View>
//       )}
//     </>
//   );
// };

// const CustomTable = ({
//   loading,
//   data,
//   columns,
//   isExpanded,
//   setIsExpanded,
//   options,
// }: CustomTableProps) => {
//   const column = columns;
//   const option = options;
//   console.log('Columns:', JSON.stringify(column, null, 2));
//   console.log('Options:', JSON.stringify(option, null, 2));

//   const scrollX = useRef(new Animated.Value(0)).current;

//   const toggleRow = useCallback(
//     debounce(async (id: number, currentState: boolean) => {
//       const newState = !currentState;
//       setIsExpanded(prev => ({
//         ...prev,
//         [id]: newState,
//       }));
//       try {
//         const userInfo = GetObjectFromStorage<any>('userInfo');
//         await saveStatusCollapse({
//           statusid: id,
//           is_collapsed: newState ? 1 : 0,
//           user_id: userInfo?.id,
//           shareuserid: 0,
//         });
//         console.log(
//           `Collapse state saved for ${id}: ${newState ? 'open' : 'close'}`,
//         );
//       } catch (error) {
//         console.error('Error saving collapse status:', error);
//       }
//     }, 500),
//     [setIsExpanded],
//   );

//   const renderSkeletonItem = () => (
//     <>
//       <TouchableOpacity
//         activeOpacity={0.9}
//         style={{
//           flexDirection: 'row',
//           alignItems: 'center',
//           padding: scale(10),
//           backgroundColor: '#f5f5f5',
//         }}
//       >
//         <Skeleton
//           animation="wave"
//           style={{
//             width: scale(30),
//             height: scale(30),
//             borderRadius: scale(15),
//             marginRight: scale(10),
//           }}
//         />
//         <Skeleton
//           animation="wave"
//           style={{
//             width: scale(180),
//             height: scale(18),
//             borderRadius: 4,
//           }}
//         />
//       </TouchableOpacity>

//       <View style={{ flexDirection: 'row' }}>
//         <Animated.View
//           style={{
//             width: scale(120),
//             borderRightWidth: 0.4,
//             borderRightColor: '#ccc',
//             padding: scale(10),
//           }}
//         >
//           <Skeleton
//             animation="wave"
//             style={{
//               width: '100%',
//               height: scale(20),
//               marginBottom: scale(10),
//               borderRadius: 4,
//             }}
//           />
//           <Skeleton
//             animation="wave"
//             style={{
//               width: '100%',
//               height: scale(20),
//               borderRadius: 4,
//             }}
//           />
//         </Animated.View>

//         <Animated.FlatList
//           data={Array(3).fill(0)}
//           horizontal
//           showsHorizontalScrollIndicator={false}
//           keyExtractor={(item, index) => index.toString()}
//           renderItem={() => (
//             <Animated.View
//               style={{
//                 width: scale(150),
//                 padding: scale(10),
//                 backgroundColor: '#fff',
//               }}
//             >
//               <Skeleton
//                 animation="wave"
//                 style={{
//                   width: '100%',
//                   height: scale(20),
//                   marginBottom: scale(10),
//                   borderRadius: 4,
//                 }}
//               />
//               <Skeleton
//                 animation="wave"
//                 style={{
//                   width: '100%',
//                   height: scale(20),
//                   borderRadius: 4,
//                 }}
//               />
//             </Animated.View>
//           )}
//         />
//       </View>
//     </>
//   );

//   if (!loading && (!data || data.length === 0)) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//         <CustomText fontSize={16} fontFamily="Medium">
//           No data available
//         </CustomText>
//       </View>
//     );
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       <FlatList
//         data={loading ? Array(3).fill({}) : data || []}
//         keyExtractor={(item, index) => String(item.id || index)}
//         renderItem={({ item, index }) =>
//           loading ? (
//             renderSkeletonItem()
//           ) : (
//             <TableRow
//               item={item}
//               index={index}
//               isExpanded={isExpanded}
//               toggleRow={toggleRow}
//               scrollX={scrollX}
//               column={column}
//               option={option}
//             />
//           )
//         }
//       />
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
