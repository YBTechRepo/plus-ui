import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AccountFlowVO, AccountFlowForm, AccountFlowQuery, AccountAdjustReqDTO } from '@/api/finance/accountFlow/types';

/**
 * 查询账户明细列表
 * @param query
 * @returns {*}
 */

export const listAccountFlow = (query?: AccountFlowQuery): AxiosPromise<AccountFlowVO[]> => {
  return request({
    url: '/finance/accountFlow/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询账户明细列表 (管理员)
 * @param query
 * @returns {*}
 */
export const listAccountFlowAdmin = (query?: AccountFlowQuery): AxiosPromise<AccountFlowVO[]> => {
  return request({
    url: '/finance/accountFlow/adminPageList',
    method: 'get',
    params: query
  });
};

/**
 * 查询账户明细详细
 * @param id
 */
export const getAccountFlow = (id: string | number): AxiosPromise<AccountFlowVO> => {
  return request({
    url: '/finance/accountFlow/' + id,
    method: 'get'
  });
};

/**
 * 新增账户明细
 * @param data
 */
export const addAccountFlow = (data: AccountFlowForm) => {
  return request({
    url: '/finance/accountFlow',
    method: 'post',
    data: data
  });
};

/**
 * 修改账户明细
 * @param data
 */
export const updateAccountFlow = (data: AccountFlowForm) => {
  return request({
    url: '/finance/accountFlow',
    method: 'put',
    data: data
  });
};

/**
 * 删除账户明细
 * @param id
 */
export const delAccountFlow = (id: string | number | Array<string | number>) => {
  return request({
    url: '/finance/accountFlow/' + id,
    method: 'delete'
  });
};

/**
 * 手动调账
 * @param data
 */
export const adjustBalance = (data: AccountAdjustReqDTO) => {
  return request({
    url: '/finance/accountFlow/adjustBalance',
    method: 'post',
    data: data
  });
};
