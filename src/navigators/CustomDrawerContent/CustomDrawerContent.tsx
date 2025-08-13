import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { ListItem } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  ScrollView,
  View
} from 'react-native';
import { scale } from 'react-native-size-matters';
import { useToast } from 'react-native-toast-notifications';
import VectorIcon from '../../components/common/CustomIcons';
import CustomText from '../../components/common/CustomText';
import ModalComponent from '../../components/ModalComponent';
import { IMG_NAMES } from '../../constants/constants';
import { SCREEN_NAMES } from '../../constants/screenNames';
import { logout } from '../../services/AuthServices';
import { fetchMenuData } from '../../services/SideMenuServices';
import { styles } from './DrawerStyle';

interface ChildItem {
  id: string;
  child_name: string;
  link: string;
  ng_slug: string;
}

interface SubMenu {
  id: string;
  submenu: string;
  hasChild: boolean;
  link: string;
  ng_slug: string;
  children: ChildItem[];
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  hasSubmenus: boolean;
  link: string;
  ng_slug: string;
  submenus: SubMenu[];
}

const CustomDrawerContent = ({ navigation }: DrawerContentComponentProps) => {
  const [menuData, setMenuData] = useState<MenuItem[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [childExpanded, setChildExpanded] = useState<Record<string, boolean>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const toast = useToast();

  const sideMenData = async () => {
    try {
      const response = await fetchMenuData();
      setMenuData(response);
      // console.log(response, 'response');
    } catch (error) {
      console.log('Error fetching side menu:', error);
    }finally{
      setLoading(false)
    }
  };
  useEffect(() => {
    sideMenData();
  }, []);

  const toggleAccordion = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleChildAccordion = (id: string) => {
    setChildExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const ICON_MAP: Record<string, { type: string; name: string }> = {
    'ni ni-tv-2': { type: 'FontAwesome', name: 'home' },
    'ni ni-user-run': { type: 'FontAwesome', name: 'sign-out' },
    'ni ni-settings': { type: 'FontAwesome', name: 'gear' },
    'fas fa-file': { type: 'FontAwesome', name: 'file' },
    'fas fa-users': { type: 'FontAwesome', name: 'users' },
    'fas fa-cog': { type: 'FontAwesome', name: 'cog' },
    'fas fa-chart-line': { type: 'FontAwesome', name: 'line-chart' },
    'fas fa-bell': { type: 'FontAwesome', name: 'bell' },
    'fas fa-envelope': { type: 'FontAwesome', name: 'envelope' },
    'fas fa-question-circle': { type: 'FontAwesome', name: 'question-circle' },
    'fas fa-file-alt': { type: 'FontAwesome', name: 'file-text' },
    'fas fa-pen': { type: 'Entypo', name: 'pencil' },
    'fas fa-hashtag': { type: 'FontAwesome', name: 'hashtag' },
    'fas fa-calendar-days': { type: 'FontAwesome5', name: 'calendar-alt' },
    'fas fa-calculator': { type: 'Entypo', name: 'calculator' },
  };

  const getIconProps = (icon: string) => {
    const defaultIcon = {
      type: 'FontAwesome',
      name: 'star',
      size: 18,
      color: '#6e6e6e',
    };

    if (ICON_MAP[icon]) {
      return { ...ICON_MAP[icon], size: 18, color: '#6e6e6e' };
    }

    if (icon?.startsWith('fas ')) {
      return {
        type: 'FontAwesome',
        name: icon.replace('fas ', ''),
        size: 18,
        color: '#6e6e6e',
      };
    }

    if (icon?.startsWith('ni ')) {
      return {
        type: 'Ionicons',
        name: icon.replace('ni ', ''),
        size: 18,
        color: '#6e6e6e',
      };
    }

    return defaultIcon;
  };

  const getScreenNameByLink = (link: string): string | undefined => {
    return Object.values(SCREEN_NAMES).includes(link) ? link : undefined;
  };

  const handleNavigation = (link: string, ng_slug: string) => {
    if (link === 'logout') {
      setLogoutModalVisible(true);
    }

    const screenName = getScreenNameByLink(link);
    navigation.closeDrawer();

    if (screenName) {
      navigation.navigate(SCREEN_NAMES.DASHBOARD_SCREEN, {
        screen: screenName,
      });
    } else {
      console.warn(
        `Screen not found for: ${link} | ${ng_slug}. Add it to SCREEN_NAMES and HomeStack.`,
      );
    }
  };

  if (loading || error) {
    return (
      <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
        <CustomText variant="h5" style={styles.listItemText}>
          {loading ? 'Loading...' : `Error: ${error}`}
        </CustomText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={IMG_NAMES.APP_LOGO2 as ImageSourcePropType}
        style={styles.logo}
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View>
          <ModalComponent
            isLogoutModalVisible={isLogoutModalVisible}
            setLogoutModalVisible={setLogoutModalVisible}
            ModalTitle="Confirm Logout"
            ModalText="Are you sure you want to logout?"
            ModalButtonText="Logout"
            onConfirm={() => logout(toast)}
          />
        </View>
        {menuData.map((menu, index) => (
          <React.Fragment key={menu.id}>
            {menu.hasSubmenus ? (
              <ListItem.Accordion
                isExpanded={expanded[menu.id] || false}
                onPress={() => toggleAccordion(menu.id)}
                containerStyle={styles.listItemContainer}
                content={
                  <>
                    <VectorIcon  {...getIconProps(menu.icon)} />
                    <ListItem.Content>
                      <ListItem.Title style={{ marginLeft: scale(16) }}>
                        <CustomText
                          variant="h5"
                          fontFamily="SemiBold"
                          fontSize={15}
                        >
                          {menu.name}
                        </CustomText>
                      </ListItem.Title>
                    </ListItem.Content>
                  </>
                }
                expandIcon={
                  <VectorIcon
                    type="Feather"
                    name={expanded[menu.id] ? 'chevron-down' : 'chevron-right'}
                    size={20}
                    color="#6e6e6e"
                  />
                }
              >
                {menu.submenus.map((submenu, subIndex) => (
                  <React.Fragment key={submenu.id}>
                    {submenu.hasChild ? (
                      <ListItem.Accordion
                        isExpanded={childExpanded[submenu.id] || false}
                        onPress={() => toggleChildAccordion(submenu.id)}
                        containerStyle={styles.childItemContainer}
                        content={
                          <ListItem.Content>
                            <ListItem.Title style={styles.subItemText}>
                              {submenu.submenu}
                            </ListItem.Title>
                          </ListItem.Content>
                        }
                        expandIcon={
                          <VectorIcon
                            type="Feather"
                            name={
                              childExpanded[submenu.id]
                                ? 'chevron-down'
                                : 'chevron-right'
                            }
                            size={18}
                            color="#6e6e6e"
                          />
                        }
                      >
                        {submenu.children.map((child, childIndex) => (
                          <ListItem
                            key={child.id}
                            bottomDivider={
                              childIndex < submenu.children.length - 1
                            }
                            containerStyle={styles.grandChildItem}
                            onPress={() =>
                              handleNavigation(child.link, child.ng_slug)
                            }
                          >
                            <ListItem.Content>
                              <ListItem.Title style={styles.subItemText}>
                                {child.child_name}
                              </ListItem.Title>
                            </ListItem.Content>
                          </ListItem>
                        ))}
                      </ListItem.Accordion>
                    ) : (
                      <ListItem
                        bottomDivider={subIndex < menu.submenus.length - 1}
                        containerStyle={styles.childItemContainer}
                        onPress={() =>
                          handleNavigation(submenu.link, submenu.ng_slug)
                        }
                      >
                        <ListItem.Content>
                          <ListItem.Title style={styles.subItemText}>
                            {submenu.submenu}
                          </ListItem.Title>
                        </ListItem.Content>
                      </ListItem>
                    )}
                  </React.Fragment>
                ))}
              </ListItem.Accordion>
            ) : (
              <ListItem
                bottomDivider={index < menuData.length - 2}
                containerStyle={styles.listItemContainer}
                onPress={() => handleNavigation(menu.link, menu.ng_slug)}
              >
                <VectorIcon
                  {...getIconProps(menu.icon)}
                  size={20}
                  color="gray"
                />
                <ListItem.Content>
                  <ListItem.Title>
                    <CustomText
                      variant="h5"
                      fontFamily="Medium"
                      style={styles.listItemText}
                    >
                      {menu.name}
                    </CustomText>
                  </ListItem.Title>
                </ListItem.Content>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </ScrollView>
    </View>
  );
};

export default CustomDrawerContent;
