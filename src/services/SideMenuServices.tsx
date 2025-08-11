import { ApiConfig } from '../config/apiConfig';
import axiosInstance from '../utils/axiosInstance';
import { GetObjectFromStorage } from '../utils/MmkvStorageHelper';

export const fetchMenuData = async () => {
  const userInfo = await GetObjectFromStorage<any>('userInfo');
  const roleId = userInfo?.roleId || 1;
  try {
    const response = await axiosInstance.get(
      ApiConfig.SIDEBAR_MENU_API(roleId),
    );
    return response.data;
  } catch (error) {
    console.log(error, 'sidemenu error');
    throw error;
  }
};
