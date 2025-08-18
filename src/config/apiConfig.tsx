import Config from 'react-native-config';

export const ApiConfig = {
  LOGIN_API: `${Config.BASE_URL}/login`,

  SIDEBAR_MENU_API: (role: number) =>
    `${Config.BASE_URL}/get/sidebar/menu?role=${role}`,

  LOGOUT_API: `${Config.BASE_URL}/logout`,

  DASHBOARD_API: (userId: number, sharedId = 0) =>
    `${Config.BASE_URL}/dashboard/${userId}/${sharedId}`,

  STATUS_COLLAP_SAVE_API: `${Config.BASE_URL}/save/statuscollap`,
  STATUS_UPDATE_API: `${Config.BASE_URL}/statusupdate`,
};
