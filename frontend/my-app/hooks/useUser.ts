import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/src/api/user';
import type {
  UpdateNicknameRequest,
  UpdateBirthRequest,
  UpdateHeightRequest,
  UpdateWeightRequest,
} from '@/src/types/user';

export const useMyProfile = () => {
  return useQuery({
    queryKey: ['userMe'],
    queryFn: async () => {
      const response = await userApi.getMe();
      return response.data.data;
    },
  });
};

export const useUpdateNickname = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateNicknameRequest) => {
      await userApi.updateNickname(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMe'] });
    },
  });
};

export const useUpdateBirthDate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateBirthRequest) => {
      await userApi.updateBirthDate(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMe'] });
    },
  });
};

export const useUpdateHeight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateHeightRequest) => {
      await userApi.updateHeight(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMe'] });
    },
  });
};

export const useUpdateWeight = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateWeightRequest) => {
      await userApi.updateWeight(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMe'] });
    },
  });
};