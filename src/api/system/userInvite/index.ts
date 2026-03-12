import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { UserInviteVO, UserInviteForm, UserInviteQuery } from '@/api/system/userInvite/types';

/**
 * 查询人员邀请登记列表
 * @param query
 * @returns {*}
 */

export const listUserInvite = (query?: UserInviteQuery): AxiosPromise<UserInviteVO[]> => {
  return request({
    url: '/system/userInvite/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询人员邀请登记详细
 * @param id
 */
export const getUserInvite = (id: string | number): AxiosPromise<UserInviteVO> => {
  return request({
    url: '/system/userInvite/' + id,
    method: 'get'
  });
};

/**
 * 新增人员邀请登记
 * @param data
 */
export const addUserInvite = (data: UserInviteForm) => {
  return request({
    url: '/system/userInvite',
    method: 'post',
    data: data
  });
};

/**
 * 修改人员邀请登记
 * @param data
 */
export const updateUserInvite = (data: UserInviteForm) => {
  return request({
    url: '/system/userInvite',
    method: 'put',
    data: data
  });
};

/**
 * 删除人员邀请登记
 * @param id
 */
export const delUserInvite = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/userInvite/' + id,
    method: 'delete'
  });
};
