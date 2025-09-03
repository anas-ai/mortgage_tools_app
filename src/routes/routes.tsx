import {
  FILE_MANAGEMENT_SCREEN_NAMES,
  FILE_MANAGEMENT_SETTINGS__SCREEN_NAMES,
  SCREEN_NAMES,
  TAB_SCREEN_NAMES,
} from '../constants/screenNames';
import AuthIndex from '../screens/auth/authIndex';
import DashboardScreen from '../screens/Dashboard';
import AccountLog from '../screens/DrawerScreens/FileManagement/AccountLog';
import BirthdayEmailTemplate from '../screens/DrawerScreens/FileManagement/BirthdayEmailTemplate';
import BorrowersLog from '../screens/DrawerScreens/FileManagement/BorrowersLog';
import EventEmailTemplates from '../screens/DrawerScreens/FileManagement/EventEmailTemplates';
import AddAccountScreen from '../screens/DrawerScreens/FileManagement/Generate';
import GenerateIframe from '../screens/DrawerScreens/FileManagement/GenerateIframe';
import Partners from '../screens/DrawerScreens/FileManagement/Partners';
import Renewals from '../screens/DrawerScreens/FileManagement/Renewals';
import FileNotification from '../screens/DrawerScreens/FileManagement/settingScreen/FileNotification';
import SharableUsers from '../screens/DrawerScreens/FileManagement/SharableUsers';
import UpcomingBirthdays from '../screens/DrawerScreens/FileManagement/UpcomingBirthdays';
import UpcomingEvents from '../screens/DrawerScreens/FileManagement/UpcomingEvents';
import CalendarScreen from '../screens/TabsScreen/CalendarScreen';
import ProfileScreen from '../screens/TabsScreen/ProfileScreen';
import TodoScreen from '../screens/TabsScreen/TodoScreen';

export const AuthStack = [
  { name: SCREEN_NAMES.LOGIN_SCREEN, component: AuthIndex},
];

export const HomeStack = [
  // Remove DASHBOARD_SCREEN from HomeStack since it’s handled by TabNavigator
  { name: FILE_MANAGEMENT_SCREEN_NAMES.ADD_ACCOUNT, component: AddAccountScreen },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.ACCOUNT_LOG, component: AccountLog },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.BORROWERS_LOGS, component: BorrowersLog },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.PARTNERS, component: Partners },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.RENEWALS, component: Renewals },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.UPCOMING_BRITHDAYS, component: UpcomingBirthdays },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.UPCOMING_EVENTS, component: UpcomingEvents },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.BRITHDAY_EMAIL_TEMPLATE, component: BirthdayEmailTemplate },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.EVENT_EMAIL_TEMPLATE, component: EventEmailTemplates },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.GENERATE_IFRAME, component: GenerateIframe },
  { name: FILE_MANAGEMENT_SCREEN_NAMES.SHARABLE_USERS, component: SharableUsers },
  { name: FILE_MANAGEMENT_SETTINGS__SCREEN_NAMES.FILE_NOTIFICAION, component: FileNotification },
 
];

export const TabStack = [
  { name: SCREEN_NAMES.DASHBOARD_SCREEN, component: DashboardScreen }, // Align with SCREEN_NAMES
  { name: TAB_SCREEN_NAMES.TODO_SCREEN, component: TodoScreen },
  { name: TAB_SCREEN_NAMES.CALENDAR_SCREEN, component: CalendarScreen },
  { name: TAB_SCREEN_NAMES.PROFILE_SCREEN, component: ProfileScreen },
];