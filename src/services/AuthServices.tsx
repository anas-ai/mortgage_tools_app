import { ApiConfig } from '../config/apiConfig';
import { useAuthStore } from '../store/authStore';
import axiosInstance from '../utils/axiosInstance';
import { GetObjectFromStorage, SaveObjectToStorage,  } from '../utils/MmkvStorageHelper';

interface LoginFromParams {
  username: string;
  password: string;
}


export const login = async ({ username, password }: LoginFromParams) => {
  const { SaveLoginToken } = useAuthStore.getState();

  try {
    const response = await axiosInstance.post(ApiConfig.LOGIN_API, {
      username,
      password,
    });

    if (response.status === 200) {
      const token = response?.data.accessToken;
      const userInfo = response?.data.user
      SaveLoginToken(token);
      SaveObjectToStorage('userInfo',userInfo)
      // const userInfo2 = GetObjectFromStorage('userInfo')
      // console.log(userInfo2,'userInfo2')
      return true
    }
    return false
  } catch (error: any) {
    console.log('Login Error:', error?.response?.data || error.message);
    throw error
  }
};

export const logout = async (toast:any) => {
  const { logout } = useAuthStore.getState();

  try {
    const response = await axiosInstance.post(ApiConfig.LOGOUT_API);
    // console.log(response,'reslogout')

    if (response.status === 200) {
      logout();
      toast.show('Logout successful', {
        type: 'danger',
        placement: 'bottom',
        duration: 2000,
      });
    }
  } catch (error: any) {
    console.log('Logout error:', error?.response?.data || error.message);
    toast.show("Logout failed",{
      type:'danger',
      placement:'bottom',
      duration:2000
    })
  }
};
