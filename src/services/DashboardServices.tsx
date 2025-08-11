import { ApiConfig } from "../config/apiConfig";
import axiosInstance from "../utils/axiosInstance";
import { GetObjectFromStorage } from "../utils/MmkvStorageHelper";

export const fetchDashboardData = async () => {
    const userInfo =  GetObjectFromStorage<any>('userInfo');
    const userId = userInfo?.id;
     const roleId = userInfo?.roleId;
    try {
      const res = await axiosInstance.get(
        ApiConfig.DASHBOARD_API(userId,roleId)
      );
      console.log(res?.data?.fileStatus, 'resss');
      return res
    } catch (error) {}
  };