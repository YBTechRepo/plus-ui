import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsurancePolicyAdminQuery, InsurancePolicyAdminVO } from '@/api/insurance/InsurancePolicyAdmin/types';

/**
 * 平台查询全部租户承保保单列表
 * @param query
 * @returns {*}
 */
export const listInsurancePolicyAdmin = (query?: InsurancePolicyAdminQuery): AxiosPromise<InsurancePolicyAdminVO[]> => {
  return request({
    url: '/insurance/InsurancePolicyAdmin/list',
    method: 'get',
    params: query
  });
};

/**
 * 平台查询承保保单详细
 * @param id
 */
export const getInsurancePolicyAdmin = (id: string | number): AxiosPromise<InsurancePolicyAdminVO> => {
  return request({
    url: '/insurance/InsurancePolicyAdmin/' + id,
    method: 'get'
  });
};
