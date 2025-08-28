import { ApiConfig } from '../config/apiConfig';
import axiosInstance from '../utils/axiosInstance';
import { GetObjectFromStorage } from '../utils/MmkvStorageHelper';

interface saveStatusCollapsetypes {
  statusid?: number;
  is_collapsed?: number;
  user_id?: number;
  shareuserid?: number;
}

export const fetchDashboardData = async () => {
  const userInfo = GetObjectFromStorage<any>('userInfo');
  const userId = userInfo?.id;
  const sharedId = userInfo?.sharedId;
  try {
    const res = await axiosInstance.get(
      ApiConfig.DASHBOARD_API(userId, sharedId),
    );
    // console.log(res?.data?.fileStatus, 'resss');
    // console.log(res?.data, 'resss');
    // console.log(res?.data?.columns.name)
    return res;
  } catch (error) {}
};

export const saveStatusCollapse = async ({
  statusid,
  is_collapsed,
  user_id,
  shareuserid = 0,
}: saveStatusCollapsetypes) => {
  try {
    const res = axiosInstance.post(ApiConfig.STATUS_COLLAP_SAVE_API, {
      statusid,
      is_collapsed,
      user_id,
      shareuserid,
    });
    console.log(res, 'SaveStatusCollapse');
  } catch (error: any) {
    console.log('errorOns: saveStatusCollapse', error.message);
  }
};


