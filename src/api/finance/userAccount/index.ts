import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { UserAccountVO, UserAccountForm, UserAccountQuery } from '@/api/finance/userAccount/types';

/**
 * 查询账户信息列表
 * @param query
 * @returns {*}
 */

export const listUserAccount = (query?: UserAccountQuery): AxiosPromise<UserAccountVO[]> => {
  return request({
    url: '/finance/userAccount/adminPageList',
    method: 'get',
    params: query
  });
};

/**
 * 查询账户信息详细
 * @param userId
 */
export const getUserAccount = (userId: string | number): AxiosPromise<UserAccountVO> => {
  return request({
    url: '/finance/userAccount/' + userId,
    method: 'get'
  });
};

/**
 * 新增账户信息
 * @param data
 */
export const addUserAccount = (data: UserAccountForm) => {
  return request({
    url: '/finance/userAccount',
    method: 'post',
    data: data
  });
};

/**
 * 修改账户信息
 * @param data
 */
export const updateUserAccount = (data: UserAccountForm) => {
  return request({
    url: '/finance/userAccount',
    method: 'put',
    data: data
  });
};

/**
 * 删除账户信息
 * @param userId
 */
export const delUserAccount = (userId: string | number | Array<string | number>) => {
  return request({
    url: '/finance/userAccount/' + userId,
    method: 'delete'
  });
};
/**
 * 查询账户信息列表 (管理员-不带分页)
 * @returns {*}
 */
export const listUserAccountAdmin = (query?: UserAccountQuery): AxiosPromise<UserAccountVO[]> => {
  return request({
    url: '/finance/userAccount/adminList',
    method: 'get',
    params: query
  });
};
