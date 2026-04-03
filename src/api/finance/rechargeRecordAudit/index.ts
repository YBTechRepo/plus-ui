import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RechargeRecordAuditVO, RechargeRecordAuditForm, RechargeRecordAuditQuery } from '@/api/finance/rechargeRecordAudit/types';

/**
 * 查询充值申请审核列表
 * @param query
 * @returns {*}
 */

export const listRechargeRecordAudit = (query?: RechargeRecordAuditQuery): AxiosPromise<RechargeRecordAuditVO[]> => {
  return request({
    url: '/finance/rechargeRecordAudit/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询充值申请审核详细
 * @param id
 */
export const getRechargeRecordAudit = (id: string | number): AxiosPromise<RechargeRecordAuditVO> => {
  return request({
    url: '/finance/rechargeRecordAudit/' + id,
    method: 'get'
  });
};

/**
 * 新增充值申请审核
 * @param data
 */
export const addRechargeRecordAudit = (data: RechargeRecordAuditForm) => {
  return request({
    url: '/finance/rechargeRecordAudit',
    method: 'post',
    data: data
  });
};

/**
 * 修改充值申请审核
 * @param data
 */
export const updateRechargeRecordAudit = (data: RechargeRecordAuditForm) => {
  return request({
    url: '/finance/rechargeRecordAudit',
    method: 'put',
    data: data
  });
};

/**
 * 删除充值申请审核
 * @param id
 */
export const delRechargeRecordAudit = (id: string | number | Array<string | number>) => {
  return request({
    url: '/finance/rechargeRecordAudit/' + id,
    method: 'delete'
  });
};
