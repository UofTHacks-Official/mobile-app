import axios, { AxiosInstance } from "axios";
import axiosRetry from "axios-retry";

console.log("Environment variables check:");
console.log(`API URL: ${process.env.EXPO_PUBLIC_UOFT_STAGING ? '✅' : '❌'} ${process.env.EXPO_PUBLIC_UOFT_STAGING || 'Not set'}`);
console.log(process.env.EXPO_PUBLIC_UOFT_STAGING)

const axiosInstance: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_UOFT_STAGING,
});

axiosRetry(axiosInstance);

export default axiosInstance;
