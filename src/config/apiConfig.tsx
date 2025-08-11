export const BASE_URL = 'https://staging3.mortgagetools.ca/api';

export const ApiConfig = {
  LOGIN_API: `${BASE_URL}/login`,
  SIDEBAR_MENU_API: (role: number) =>
    `${BASE_URL}/get/sidebar/menu?role=${role}`,
  LOGOUT_API: `${BASE_URL}/logout`,
  DASHBOARD_API:(userId:number,roleId:number)=> `${BASE_URL}/dashboard/${userId}/${roleId}`,
};
