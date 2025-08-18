import { Skeleton } from '@rneui/themed';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { scale } from 'react-native-size-matters';
import VectorIcon from '../../components/common/CustomIcons';
import CustomText from '../../components/common/CustomText';
import { saveStatusCollapse } from '../../services/DashboardServices';
import { colors } from '../../styles/Colors';
import { GetObjectFromStorage } from '../../utils/MmkvStorageHelper';
import debounce from 'lodash.debounce';

export interface FileStatus {
  id: number;
  user_id: number;
  name?: string;
  color: string;
  position: number;
  is_default: number;
  status: number;
  created_on: string;
  collapse: number;
  files: any[];
  columns: any[];
}

interface CustomTableProps {
  loading: boolean;
  data: FileStatus[] | null;
  columns: [];
  isExpanded: { [key: number]: boolean };
  setIsExpanded: React.Dispatch<
    React.SetStateAction<{ [key: number]: boolean }>
  >; // Add setIsExpanded
  options: any;
}

interface TableRowProps {
  item: FileStatus;
  index: number;
  isExpanded: { [key: number]: boolean };
  toggleRow: (id: number, currentState: boolean) => void;
  status: string;
  setStatus: (value: string) => void;
  scrollX: Animated.Value;
  column: any;
  option: any;
}

const TableRow = ({
  item,
  index,
  isExpanded,
  toggleRow,
  status,
  setStatus,
  scrollX,
  column,
  option,
}: TableRowProps) => {
  

  const minWidth = scale(150);
  const maxWidth = scale(260);

  const animatedWidth = scrollX.interpolate({
    inputRange: [0, 150],
    outputRange: [maxWidth, minWidth],
    extrapolate: 'clamp',
  });

  const [selectedValues, setSelectedValues] = useState<{ [key: string]: any }>(
    {},
  );

  const getStatusColor = (id: number, list: any) => {
    const item: any = list.find((f: any) => f.id === id);
    // console.log(id, list, 'item');
    return item || '#252525';
  };
  const handleChange = (fileId: string | number, selected: any) => {
    setSelectedValues(prev => ({
      ...prev,
      [fileId]: selected,
    }));
    getStatusColor(selected?.lending_type_id, option?.priority);
  };
  const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace(/^#/, '');
    const r = parseInt(cleanHex.substring(0, 2), 16);
    const g = parseInt(cleanHex.substring(2, 4), 16);
    const b = parseInt(cleanHex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const expandValue = useSharedValue(isExpanded[item.id] ? 1 : 0);

  React.useEffect(() => {
    expandValue.value = withTiming(isExpanded[item.id] ? 1 : 0, {
      duration: 100,
    });
  }, [isExpanded[item.id]]);


  const getCellData = (file:any,colkey:string,colType:string)=>{
    let cellData = colkey ? file[colkey] : null;
    
  }
  

  return (
    <>
      <TouchableOpacity
        onPress={() => toggleRow(item.id, isExpanded[item.id])}
        activeOpacity={0.9}
        style={[
          styles.header,
          { backgroundColor: hexToRgba(item?.color || '#000000', 0.06) },
        ]}
      >
        <View
          style={[styles.expandIconWrapper, { backgroundColor: item?.color }]}
        >
          <VectorIcon
            type="MaterialIcons"
            name={
              isExpanded[item.id]
                ? 'keyboard-arrow-down'
                : 'keyboard-arrow-right'
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
          {item.name} ({item?.files.length})
        </CustomText>
      </TouchableOpacity>

      {isExpanded[item.id] && (
        <View style={{ flexDirection: 'row' }}>
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
                  {column[0].name}
                </CustomText>
              </TouchableOpacity>
            </View>

            {!item?.files ? (
              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.fileNumberCell}
              >
                <CustomText
                  fontSize={14}
                  fontFamily="Medium"
                  style={styles.centerText}
                >
                  {null}
                </CustomText>
              </TouchableOpacity>
            ) : (
              item?.files.map((file, index) => (
                <TouchableOpacity
                  key={file['id'] || index}
                  activeOpacity={0.8}
                  style={styles.fileNumberCell}
                >
                  <CustomText
                    fontSize={14}
                    fontFamily="Medium"
                    style={styles.centerText}
                  >
                    {
                      file['get_account_i_d']['get_account_number'][
                        'account_number'
                      ]
                    }
                  </CustomText>
                </TouchableOpacity>
              ))
            )}
          </Animated.View>

          <Animated.FlatList
            data={column.slice(1)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={colItem => colItem.id.toString()}
            contentContainerStyle={{ paddingRight: scale(5) }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
            renderItem={({ item: colItem, index: colIndex }) => {
              const isPriority = colItem.name.toLowerCase() === 'priority';
              const isChat = colItem.name.toLowerCase() === 'chat';
              const columnWidth = colItem?.width;
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
                      {colItem.name}
                    </CustomText>
                  </TouchableOpacity>

                  {item?.files.map((file, fileIndex) => {
                    const selected =
                      selectedValues[file.id] ||
                      option?.priority.find(
                        (p: any) => p.id === file?.lending_type_id,
                      );

                    return (
                      <View
                        key={file['id'] || fileIndex}
                        style={[
                          styles.columnCell,
                          {
                            backgroundColor: isPriority
                              ? getStatusColor(
                                  file?.lending_type_id,
                                  option?.priority,
                                )
                              : '#0000',
                          },
                        ]}
                      >
                        {isChat ? (
                          <TouchableOpacity activeOpacity={0.8}>
                            <VectorIcon
                              type="MaterialCommunityIcons"
                              name="message-processing-outline"
                              size={20}
                              color={colors.black}
                            />
                          </TouchableOpacity>
                        ) : isPriority ? (
                          <Dropdown
                            style={[
                              styles.dropdown,
                              {
                                backgroundColor: selected?.color || '#252525',
                              },
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
                                    backgroundColor: dropdownItem.color,
                                  },
                                ]}
                              >
                                <Text style={styles.dropdownListItemText}>
                                  {dropdownItem.name}
                                </Text>
                              </View>
                            )}
                            data={option?.priority}
                            labelField="name"
                            valueField="id"
                            value={selected?.id}
                            placeholder="Select"
                            onChange={selected =>
                              handleChange(file.id, selected)
                            }
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
                    );
                  })}
                </Animated.View>
              );
            }}
          />

          {/* <Animated.FlatList
    data={column.slice(1)} // Use provided column data, excluding FILE NUMBERS
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={colItem => colItem.id.toString()} // Use id as key
    contentContainerStyle={{ paddingRight: scale(5) }}
    onScroll={Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      { useNativeDriver: false },
    )}
    scrollEventThrottle={16}
    renderItem={({ item: colItem, index: colIndex }) => {
      const isPriority = colItem.name.toLowerCase() === 'priority';
      const isChat = colItem.name.toLowerCase() === 'chat';
      const columnWidth = colItem.width ? scale(colItem.width) : scale(150); // Use width from column data

      // Options for select columns
      const optionsMap = {
        lending_type_id: statusOptions, // PRIORITY
        file_status_id: [
          { label: 'Open', value: 'open' },
          { label: 'Closed', value: 'closed' },
          { label: 'In Progress', value: 'in_progress' },
        ],
        task_status_id: [
          { label: 'Not Started', value: 'not_started' },
          { label: 'In Progress', value: 'in_progress' },
          { label: 'Completed', value: 'completed' },
        ],
        member_id: [
          { label: 'Member A', value: 'member_a' },
          { label: 'Member B', value: 'member_b' },
        ],
        program_id: [
          { label: 'Program A', value: 'program_a' },
          { label: 'Program B', value: 'program_b' },
        ],
        deal_type_id: [
          { label: 'Type A', value: 'type_a' },
          { label: 'Type B', value: 'type_b' },
        ],
        lender_id: [
          { label: 'Lender A', value: 'lender_a' },
          { label: 'Lender B', value: 'lender_b' },
        ],
        rate_type_id: [
          { label: 'Fixed', value: 'fixed' },
          { label: 'Variable', value: 'variable' },
        ],
      };

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
              {colItem.name}
            </CustomText>
          </TouchableOpacity>

          {item?.files.map((file, fileIndex) => {
            // Extract cell data based on col_key
            let cellData = colItem.col_key ? file[colItem.col_key] : null;

            // Handle nested data structures
            if (colItem.col_key === 'get_manual_note') {
              cellData = file['get_manual_note']?.['note'] || null;
            } else if (colItem.col_key === 'get_email_los_info') {
              cellData = file['get_email_los_info']?.['email'] || null;
            } else if (['subject_removal', 'closing', 'next_contact'].includes(colItem.col_key)) {
              cellData = cellData ? new Date(cellData).toLocaleDateString() : null; // Format dates
            }

            // Map select values to labels
            let displayValue = cellData;
            if (colItem.type === 'select') {
              const selectedOption = optionsMap[colItem.col_key]?.find(
                option => option.value === cellData
              );
              displayValue = selectedOption?.label || cellData || 'Select';
            }

            return (
              <View
                key={file['id'] || fileIndex}
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
                ) : colItem.type === 'select' ? (
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
                            backgroundColor: getStatusColor(dropdownItem.value),
                          },
                        ]}
                      >
                        <Text style={styles.dropdownListItemText}>
                          {dropdownItem.label}
                        </Text>
                      </View>
                    )}
                    data={optionsMap[colItem.col_key] || statusOptions}
                    labelField="label"
                    valueField="value"
                    value={cellData || 'Select'}
                    placeholder="Select"
                    onChange={selected => {
                      // Update state for the specific file and column
                      setStatus(selected.value); // Replace with dynamic state update
                    }}
                  />
                ) : colItem.type === 'button' && !isChat ? (
                  <TouchableOpacity activeOpacity={0.8}>
                    <VectorIcon
                      type="MaterialCommunityIcons"
                      name="dots-horizontal"
                      size={20}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                ) : (
                  <CustomText
                    fontSize={14}
                    fontFamily="Medium"
                    style={styles.centerText}
                  >
                    {displayValue || '-'}
                  </CustomText>
                )}
              </View>
            );
          })}
        </Animated.View>
      );
    }}
  /> */}
        </View>
      )}
    </>
  );
};

const CustomTable = ({
  loading,
  data,
  columns,
  isExpanded,
  setIsExpanded,
  options,
}: CustomTableProps) => {
  const column = columns;
  const option = options;
  console.log(column, 'column');
  console.log(options, 'options');

  const [status, setStatus] = React.useState('working');
  const scrollX = useRef(new Animated.Value(0)).current;

  const toggleRow = useCallback(
    debounce(async (id: number, currentState: boolean) => {
      const newState = !currentState;
      setIsExpanded(prev => ({
        ...prev,
        [id]: newState,
      }));
      try {
        const userInfo = GetObjectFromStorage<any>('userInfo');
        await saveStatusCollapse({
          statusid: id,
          is_collapsed: newState ? 1 : 0,
          user_id: userInfo?.id,
          shareuserid: 0,
        });
        console.log(
          `Collapse state saved for ${id}: ${newState ? 'open' : 'close'}`,
        );
      } catch (error) {
        console.error('Error saving collapse status:', error);
      }
    }, 500),
    [setIsExpanded],
  );

  const renderSkeletonItem = () => (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: scale(10),
          backgroundColor: '#f5f5f5',
        }}
      >
        <Skeleton
          animation="wave"
          style={{
            width: scale(30),
            height: scale(30),
            borderRadius: scale(15),
            marginRight: scale(10),
          }}
        />
        <Skeleton
          animation="wave"
          style={{
            width: scale(180),
            height: scale(18),
            borderRadius: 4,
          }}
        />
      </TouchableOpacity>

      <View style={{ flexDirection: 'row' }}>
        <Animated.View
          style={{
            width: scale(120),
            borderRightWidth: 0.4,
            borderRightColor: '#ccc',
            padding: scale(10),
          }}
        >
          <Skeleton
            animation="wave"
            style={{
              width: '100%',
              height: scale(20),
              marginBottom: scale(10),
              borderRadius: 4,
            }}
          />
          <Skeleton
            animation="wave"
            style={{
              width: '100%',
              height: scale(20),
              borderRadius: 4,
            }}
          />
        </Animated.View>

        <Animated.FlatList
          data={Array(3).fill(0)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => index.toString()}
          renderItem={() => (
            <Animated.View
              style={{
                width: scale(150),
                padding: scale(10),
                backgroundColor: '#fff',
              }}
            >
              <Skeleton
                animation="wave"
                style={{
                  width: '100%',
                  height: scale(20),
                  marginBottom: scale(10),
                  borderRadius: 4,
                }}
              />
              <Skeleton
                animation="wave"
                style={{
                  width: '100%',
                  height: scale(20),
                  borderRadius: 4,
                }}
              />
            </Animated.View>
          )}
        />
      </View>
    </>
  );

  if (!loading && (!data || data.length === 0)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <CustomText fontSize={16} fontFamily="Medium">
          No data available
        </CustomText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={loading ? Array(3).fill({}) : data || []}
        keyExtractor={(item, index) => String(item.id || index)}
        renderItem={({ item, index }) =>
          loading ? (
            renderSkeletonItem()
          ) : (
            <TableRow
              item={item}
              index={index}
              isExpanded={isExpanded}
              toggleRow={toggleRow}
              status={status}
              setStatus={setStatus}
              scrollX={scrollX}
              column={column}
              option={option}
            />
          )
        }
      />
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
    // backgroundColor: '#f0f0f0',
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
