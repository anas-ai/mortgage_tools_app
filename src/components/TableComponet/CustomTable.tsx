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
import ChatColumn from './ChatColumn';

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

  const [selectedValues, setSelectedValues] = useState<{
    [fileId: string]: { [colKey: string]: any };
  }>({});

  const getStatusColor = (id: number | string, list: any[]) => {
    const item: any = list.find((f: any) => f.id == id);
    // console.log(id, list, 'item');
    return item || '#252525';
  };
  const handleChange = (
    fileId: string | number,
    colKey: string,
    selected: any,
  ) => {
    setSelectedValues(prev => ({
      ...prev,
      [fileId]: {
        ...prev[fileId],
        [colKey]: selected,
      },
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

  // const getCellData = (file: any, colkey: string, colType: string) => {
  //   let cellData = colkey ? file[colkey] : null;
  //   if (colkey === 'get_manual_note') {
  //     cellData = file['get_manual_note']?.note ?? null;
  //   } else if (colkey === 'get_email_los_info') {
  //     cellData = file['get_email_los_info']?.email ?? null;
  //   } else if (['property_value', 'mortgage_size', 'ltv'].includes(colkey)) {
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
  //       console.error(`Invalid data for  ${colkey}:`, cellData);
  //       cellData = null;
  //     }
  //   }
  //   return cellData;
  // };

  // const dropdownDataMap = {
  //   lending_type_id: 0,
  //   file_status_id: 0,
  //   task_status_id: 0,
  //   member_id: 0,
  //   program_id: 0,
  //   deal_type_id: 0,
  //   lender_id: 0,
  //   rate_type_id: 0,
  // } as const;

  return (
    <>
      {/* Satatus group */}
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

      {/* Mian table */}
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
            {/* File number col */}
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
              const columnWidth = colItem?.width;
              const colKey = colItem.col_key;
              const colType = colItem?.type;
              return (
                <Animated.View
                  style={{ width: columnWidth, backgroundColor: '#fff' }}
                >
                  {/* Coulmn Header */}
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
                      selectedValues[file.id]?.[colItem.col_key] ||
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
                        {colItem.col_key === 'chatcount' ? (
                          <ChatColumn file={file}/>
                        ) : colItem.col_key === 'lending_type_id' ? (
                          <Dropdown
                            data={option?.priority}
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
                            labelField="name"
                            valueField="id"
                            value={selected?.id}
                            placeholder="Select"
                            onChange={selected =>
                              handleChange(file.id, colItem.col_key, selected)
                            }
                          />
                        ) : colItem.col_key === 'get_manual_note' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            Note Data
                          </CustomText>
                        ) : colItem.name === 'DOC(OTHER)' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            Other ocuments
                          </CustomText>
                        ) : colItem.name === 'DOC(MAIN)' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            Main ocuments
                          </CustomText>
                        ) : colItem.col_key === 'subject_removal' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            SR
                          </CustomText>
                        ) : colItem.col_key === 'closing' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            Closing
                          </CustomText>
                        ) : colItem.col_key === 'next_contact' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            Next Contect
                          </CustomText>
                        ) : colItem.col_key === 'file_status_id' ? (
                          <Dropdown
                            data={option?.filestatus}
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
                            labelField="name"
                            valueField="id"
                            value={selected?.id}
                            placeholder="Select"
                            onChange={selected =>
                              handleChange(file.id, colItem.col_key, selected)
                            }
                          />
                        ) : colItem.col_key === 'task_status_id' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            task_status_id
                          </CustomText>
                        ) : colItem.col_key === 'member_id' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            member_id
                          </CustomText>
                        ) : colItem.col_key === 'program_id' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            program_id
                          </CustomText>
                        ) : colItem.col_key === 'deal_type_id' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            deal_type_id
                          </CustomText>
                        ) : colItem.col_key === 'lender_id' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            lender_id
                          </CustomText>
                        ) : colItem.col_key === 'rate_type_id' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            rate_type_id
                          </CustomText>
                        ) : colItem.col_key === 'property_value' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            {
                              file['get_account_i_d']['get_account_number'][
                                'property_value'
                              ] ? `$${file['get_account_i_d']['get_account_number'][
                                'property_value'
                              ]}` : '-'
                            }
                          </CustomText>
                        ) : colItem.col_key === 'mortgage_size' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            mortgage_size
                          </CustomText>
                        ) : colItem.col_key === 'maturity_date' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            maturity_date
                          </CustomText>
                        ) : colItem.col_key === 'ltv' ? (
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            Ltv
                          </CustomText>
                        ) : (
                          <View>
                          <CustomText
                            fontSize={14}
                            fontFamily="Medium"
                            style={styles.centerText}
                          >
                            aCTION
                          </CustomText>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </Animated.View>
              );
            }}
          />
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
  // console.log(options, 'options');

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

