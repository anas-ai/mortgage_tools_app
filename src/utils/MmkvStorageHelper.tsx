import { MMKV } from 'react-native-mmkv';

const storage = new MMKV();

export const saveToStorage = (
  key: string,
  value: string | number | boolean,
) => {
  storage.set(key, value);
};

export const GetStringFromStorage = (key: string): string | undefined => {
  return storage.getString(key);
};
export const GetNumberFromStorage = (key: string): number | undefined => {
  return storage.getNumber(key);
};

export const GetBooleanFromStorage = (key: string): boolean | undefined => {
  return storage.getBoolean(key);
};

export const RemoveFromStorage = (key: string) => {
  return storage.delete(key);
};

export const ClearStorage = () => {
  return storage.clearAll();
};

export const SaveObjectToStorage = (key: string, obj: object) => {
  return storage.set(key, JSON.stringify(obj));
};
export function GetObjectFromStorage<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? (JSON.parse(value) as T) : null;
}






export const saveToken = (key: string,value:string) => {
  storage.set(key, value);
};

export const getToken = (key: string) => {
  return storage.getString(key);
};

export const removeToken = (key: string) => {
  storage.delete(key);
};