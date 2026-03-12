import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CommissionRecordVO, CommissionRecordForm, CommissionRecordQuery } from '@/api/commission/CommissionRecord/types';

/**
 * 查询佣金分配明细列表
 * @param query
 * @returns {*}
 */

export const listCommissionRecord = (query?: CommissionRecordQuery): AxiosPromise<CommissionRecordVO[]> => {
  return request({
    url: '/commission/CommissionRecord/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询佣金分配明细详细
 * @param id
 */
export const getCommissionRecord = (id: string | number): AxiosPromise<CommissionRecordVO> => {
  return request({
    url: '/commission/CommissionRecord/' + id,
    method: 'get'
  });
};

/**
 * 新增佣金分配明细
 * @param data
 */
export const addCommissionRecord = (data: CommissionRecordForm) => {
  return request({
    url: '/commission/CommissionRecord',
    method: 'post',
    data: data
  });
};

/**
 * 修改佣金分配明细
 * @param data
 */
export const updateCommissionRecord = (data: CommissionRecordForm) => {
  return request({
    url: '/commission/CommissionRecord',
    method: 'put',
    data: data
  });
};

/**
 * 删除佣金分配明细
 * @param id
 */
export const delCommissionRecord = (id: string | number | Array<string | number>) => {
  return request({
    url: '/commission/CommissionRecord/' + id,
    method: 'delete'
  });
};
