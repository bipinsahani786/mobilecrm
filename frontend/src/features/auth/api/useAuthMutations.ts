import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

export const useCheckUser = () => {
  return useMutation({
    mutationFn: async (data: { identifier: string }) => {
      const response = await api.post('/check-user', data);
      return response.data.data;
    }
  });
};

export const useSendOtp = () => {
  return useMutation({
    mutationFn: async (data: { identifier: string }) => {
      const response = await api.post('/send-otp', data);
      return response.data.data;
    }
  });
};

export const useLogin = () => {
  return useMutation({
    mutationFn: async (data: { identifier: string; password: string }) => {
      const response = await api.post('/login', data);
      return response.data.data;
    }
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (data: { identifier: string; otp: string }) => {
      const response = await api.post('/verify-otp', data);
      return response.data.data;
    }
  });
};

export const useSetPassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/set-password', data);
      return response.data.data;
    }
  });
};
