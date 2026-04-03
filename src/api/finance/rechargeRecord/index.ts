import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RechargeRecordVO, RechargeRecordForm, RechargeRecordQuery } from '@/api/finance/rechargeRecord/types';

/**
 * 查询充值申请列表
 * @param query
 * @returns {*}
 */

export const listRechargeRecord = (query?: RechargeRecordQuery): AxiosPromise<RechargeRecordVO[]> => {
  return request({
    url: '/finance/rechargeRecord/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询充值申请详细
 * @param id
 */
export const getRechargeRecord = (id: string | number): AxiosPromise<RechargeRecordVO> => {
  return request({
    url: '/finance/rechargeRecord/' + id,
    method: 'get'
  });
};

/**
 * 新增充值申请
 * @param data
 */
export const addRechargeRecord = (data: RechargeRecordForm) => {
  return request({
    url: '/finance/rechargeRecord',
    method: 'post',
    data: data
  });
};

/**
 * 修改充值申请
 * @param data
 */
export const updateRechargeRecord = (data: RechargeRecordForm) => {
  return request({
    url: '/finance/rechargeRecord',
    method: 'put',
    data: data
  });
};

/**
 * 删除充值申请
 * @param id
 */
export const delRechargeRecord = (id: string | number | Array<string | number>) => {
  return request({
    url: '/finance/rechargeRecord/' + id,
    method: 'delete'
  });
};
/**
 * 审核充值申请
 * @param data
 */
export const rechargeAudit = (data: any) => {
  return request({
    url: '/finance/rechargeRecord/rechargeAudit',
    method: 'post',
    data: data
  });
};
