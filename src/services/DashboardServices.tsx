import { ApiConfig } from '../config/apiConfig';
import axiosInstance from '../utils/axiosInstance';
import { GetObjectFromStorage } from '../utils/MmkvStorageHelper';

export const fetchDashboardData = async () => {
  const userInfo = GetObjectFromStorage<any>('userInfo');
  const userId = userInfo?.id;
  const sharedId = userInfo?.sharedId;
  try {
    const res = await axiosInstance.get(
      ApiConfig.DASHBOARD_API(userId, sharedId),
    );
    // console.log(res?.data?.fileStatus, 'resss');
    return res;
  } catch (error) {}
};

export const saveStatusCollapse = async (
  statusid: number,
  is_collapsed: number,
  user_id: number,
  shareuserid: number = 0,
) => {
  try {
    const res = await axiosInstance.post(ApiConfig.STATUS_COLLAP_SAVE_API, {
      statusid,
      is_collapsed,
      user_id,
      shareuserid,
    });
    console.log(res, 'ressdds');
    return res;
  } catch (error: any) {
    console.log('errorOns: saveStatusCollapse', error.message);
    throw error;
  }
};
