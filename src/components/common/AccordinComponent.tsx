import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ListItem } from '@rneui/themed';
import { scale } from 'react-native-size-matters';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { ParamListBase } from '@react-navigation/native';

import VectorIcon from './CustomIcons';
import CustomText from './CustomText';
import { colors } from '../../styles/Colors';
import { SCREEN_NAMES } from '../../constants/screenNames';

type SubItemType = {
  label: string;
  screenName?: keyof typeof SCREEN_NAMES;
  children?: SubItemType[];
};

type AccordionComponentProps = {
  heading: string;
  items: SubItemType[];
};

const AccordionComponent = ({ heading, items }: AccordionComponentProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openStates, setOpenStates] = useState<{ [key: string]: boolean }>({});
  const navigation = useNavigation<StackNavigationProp<ParamListBase>>();

  const toggleChildOpen = (key: string) => {
    setOpenStates(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderItems = (subItems: SubItemType[], depth = 1, parentKey = '') => {
    return subItems.map((item, index) => {
      const currentKey = `${parentKey}-${index}`;
      const isExpanded = openStates[currentKey];
      const containerStyle =
        depth === 1 ? styles.childItemContainer : styles.grandChildItem;

      if (item.children && item.children.length > 0) {
        return (
          <ListItem.Accordion
            key={currentKey}
            isExpanded={!!isExpanded}
            onPress={() => toggleChildOpen(currentKey)}
            containerStyle={containerStyle}
            content={
              <ListItem.Content>
                <ListItem.Title style={styles.subItemText}>
                  {item.label}
                </ListItem.Title>
              </ListItem.Content>
            }
            expandIcon={
              <VectorIcon
                type="Feather"
                name={isExpanded ? 'chevron-down' : 'chevron-right'}
                size={18}
                color="#6e6e6e"
              />
            }
          >
            {renderItems(item.children, depth + 1, currentKey)}
          </ListItem.Accordion>
        );
      }

      return (
        <ListItem key={currentKey} bottomDivider containerStyle={containerStyle}>
          <TouchableOpacity
            onPress={() => {
              if (item.screenName) {
                navigation.navigate(item.screenName);
              }
            }}
          >
            <ListItem.Content>
              <ListItem.Title style={styles.subItemText}>
                {item.label}
              </ListItem.Title>
            </ListItem.Content>
          </TouchableOpacity>
        </ListItem>
      );
    });
  };

  return (
    <ListItem.Accordion
      isExpanded={isOpen}
      onPress={() => setIsOpen(!isOpen)}
      containerStyle={styles.listItemContainer}
      content={
        <>
          <View style={{ marginLeft: scale(2) }}>
            <VectorIcon
              type="FontAwesome"
              name="file"
              size={18}
              color="#6e6e6e"
              style={{ marginRight: scale(0) }}
            />
          </View>
          <ListItem.Content>
            <ListItem.Title style={styles.listItemText}>
              <CustomText variant="h5" fontFamily="Medium" style={styles.listItemText}>
                {heading}
              </CustomText>
            </ListItem.Title>
          </ListItem.Content>
        </>
      }
      expandIcon={
        <VectorIcon
          type="Feather"
          name={isOpen ? 'chevron-down' : 'chevron-right'}
          size={20}
          color="#6e6e6e"
        />
      }
    >
      {renderItems(items)}
    </ListItem.Accordion>
  );
};

export default AccordionComponent;


const styles = StyleSheet.create({
  listItemContainer: {
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  listItemText: {
    color: colors.graytextColor,
    fontSize: scale(16),
    marginLeft: scale(16),
  },
  subItemText: {
    fontSize: scale(14),
    color: '#444',
  },
  childItemContainer: {
    marginLeft: scale(20),
    paddingVertical: scale(10),
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
  },
  grandChildItem: {
    marginLeft: scale(40),
    paddingVertical: scale(10),
    backgroundColor: 'transparent',
  },
});
