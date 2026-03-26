import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/src/api/user';

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['userMe'],
    queryFn: async () => {
      const response = await userApi.getMe();
      return response.data.data;
    },
  });
};
