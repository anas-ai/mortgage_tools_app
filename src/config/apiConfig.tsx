import Config from 'react-native-config';

export const ApiConfig = {
  LOGIN_API: `${Config.BASE_URL}/login`,

  SIDEBAR_MENU_API: (role: number) =>
    `${Config.BASE_URL}/get/sidebar/menu?role=${role}`,

  LOGOUT_API: `${Config.BASE_URL}/logout`,
  DASHBOARD_API: (userId: number, roleId: number) =>
    `${Config.BASE_URL}/dashboard/${userId}/${roleId}`,
};
