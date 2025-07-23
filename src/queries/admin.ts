import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  adminLogin, 
  adminLogout, 
  refreshAdminToken, 
  listAdmin, 
  getAdminByToken, 
  getAdminProfile
} from '@/requests/admin';

// Admin login mutation
export const useAdminLogin = () => {
  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      adminLogin(email, password),
    mutationKey: ['admin', 'login'],
  });
};

// Admin logout mutation
export const useAdminLogout = () => {
  return useMutation({
    mutationFn: ({ access_token, refresh_token }: { access_token: string; refresh_token: string }) =>
      adminLogout(access_token, refresh_token),
    mutationKey: ['admin', 'logout'],
  });
};

// Refresh admin token mutation
export const useRefreshAdminToken = () => {
  return useMutation({
    mutationFn: (refresh_token: string) => refreshAdminToken(refresh_token),
    mutationKey: ['admin', 'refresh-token'],
  });
};

// List admin mutation (Note: This seems to be using the wrong endpoint in the original code)
export const useListAdmin = () => {
  return useMutation({
    mutationFn: (refresh_token: string) => listAdmin(refresh_token),
    mutationKey: ['admin', 'list'],
  });
};

// Get admin by token query
export const useGetAdminByToken = (admin_id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['admin', 'by-token', admin_id],
    queryFn: () => getAdminByToken(admin_id),
    enabled: enabled && !!admin_id,
  });
};

// Get admin profile query
export const useGetAdminProfile = (bearerToken: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['admin', 'profile', bearerToken],
    queryFn: () => getAdminProfile(bearerToken),
    enabled: enabled && !!bearerToken,
  });
};