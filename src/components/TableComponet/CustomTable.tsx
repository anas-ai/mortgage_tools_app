import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { scale } from 'react-native-size-matters';
import VectorIcon from '../../components/common/CustomIcons';
import CustomText from '../../components/common/CustomText';
import { colors } from '../../styles/Colors';

interface CustomTableProps{
  backgroundColor?:string,
  title?:string,
  titleCount?:number,
  ExpandBackgroundColor?:string,
}

const CustomTable = ({
  backgroundColor,
  title,
  titleCount,
  ExpandBackgroundColor,
}: CustomTableProps) => {
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
    { key: '3', label: 'NO...' },
    { key: '4', label: 'DO...' },
    { key: '5', label: 'SR' },
    { key: '6', label: 'CL' },
    { key: '7', label: 'NE' },
    { key: '8', label: 'NE' },
    { key: '9', label: 'NE' },
    { key: '10', label: 'NE' },
  ];

  const [isExpanded, setIsExpanded] = useState(true);
  const [status, setStatus] = useState('working');

  const expandValue = useSharedValue(0);
  useEffect(() => {
    expandValue.value = withTiming(isExpanded ? 1 : 0, { duration: 100 });
  }, [isExpanded]);

  // ===== Scroll Animation =====
  const scrollX = useRef(new Animated.Value(0)).current;
  const minWidth = scale(100);
  const maxWidth = scale(230);

  const animatedWidth = scrollX.interpolate({
    inputRange: [0, 150], 
    outputRange: [maxWidth, minWidth],
    extrapolate: 'clamp',
  });

  return (
    <View>
      {/* Expand/Collapse Header */}
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.9}
        style={[styles.header, { backgroundColor }]}
      >
        <View
          style={[
            styles.expandIconWrapper,
            { backgroundColor: ExpandBackgroundColor },
          ]}
        >
          <VectorIcon
            type="MaterialIcons"
            name={isExpanded ? 'keyboard-arrow-down' : 'keyboard-arrow-right'}
            size={30}
            color={colors.white}
          />
        </View>
        <CustomText variant="h5" fontFamily="Medium" style={styles.headerTitle}>
          {title} {titleCount}
        </CustomText>
      </TouchableOpacity>

      {isExpanded && (
        <View style={{ flexDirection: 'row' }}>
          <Animated.View
            style={[styles.fileNumberColumn, { width: animatedWidth }]}
          >
            <View style={styles.fileNumberHeader}>
              <TouchableOpacity style={styles.fileNumberHeaderCell}>
                <CustomText
                  fontSize={14}
                  fontFamily="Medium"
                  style={styles.centerText}
                >
                  FILE NUMBERS
                </CustomText>
              </TouchableOpacity>
              <View style={styles.resizeHandle} />
            </View>
            <TouchableOpacity style={styles.fileNumberCell}>
              <CustomText
                fontSize={14}
                fontFamily="Medium"
                style={styles.centerText}
              >
                10 - Generated File Number 10
              </CustomText>
            </TouchableOpacity>
          </Animated.View>

          {/* Scrollable Columns */}
          <Animated.FlatList
            data={initialColumns}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={item => item.key}
            contentContainerStyle={{ paddingRight: scale(5) }}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={16}
            renderItem={({ item, index }) => {
              const isPriority = item.label.toLowerCase() === 'priority';
              const isChat = item.label.toLowerCase() === 'chat';

              const columnWidth = index === 0 ? animatedWidth : scale(130);

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
                      {item.label}
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
                        onChange={item => setStatus(item.value)}
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
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: scale(10),
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
    color: colors.black,
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
    borderBottomWidth: 0.5,
    borderColor: colors.graytextColor,
    padding: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  resizeHandle: {
    width: scale(5),
    height: scale(45),
    backgroundColor: colors.graytextColor,
  },
  fileNumberCell: {
    height: scale(45),
    borderBottomWidth: 0.5,
    borderColor: colors.graytextColor,
    padding: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  centerText: {
    textAlign: 'center',
  },
  columnHeader: {
    flex: 1,
    height: scale(45),
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
    borderColor: colors.graytextColor,
    padding: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  columnCell: {
    height: scale(45),
    borderBottomWidth: 0.5,
    borderLeftWidth: 0.5,
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
    borderWidth: 0.5,
    borderColor: colors.graytextColor,
  },
  dropdownItemContainer: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
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
