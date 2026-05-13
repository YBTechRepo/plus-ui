import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CommissionRecordAdminQuery, CommissionRecordAdminVO } from '@/api/commission/CommissionRecordAdmin/types';

/**
 * 平台查询全部租户佣金分配明细列表
 * @param query
 */
export const listCommissionRecordAdmin = (query?: CommissionRecordAdminQuery): AxiosPromise<CommissionRecordAdminVO[]> => {
  return request({
    url: '/commission/CommissionRecordAdmin/list',
    method: 'get',
    params: query
  });
};
