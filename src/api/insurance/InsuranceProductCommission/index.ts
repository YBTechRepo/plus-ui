import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceProductCommissionVO, InsuranceProductCommissionForm, InsuranceProductCommissionQuery } from '@/api/insurance/InsuranceProductCommission/types';

/**
 * 查询佣金配置列表
 * @param query
 * @returns {*}
 */

export const listInsuranceProductCommission = (query?: InsuranceProductCommissionQuery): AxiosPromise<InsuranceProductCommissionVO[]> => {
  return request({
    url: '/insurance/InsuranceProductCommission/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询佣金配置详细
 * @param id
 */
export const getInsuranceProductCommission = (id: string | number): AxiosPromise<InsuranceProductCommissionVO> => {
  return request({
    url: '/insurance/InsuranceProductCommission/' + id,
    method: 'get'
  });
};

/**
 * 新增佣金配置
 * @param data
 */
export const addInsuranceProductCommission = (data: InsuranceProductCommissionForm) => {
  return request({
    url: '/insurance/InsuranceProductCommission',
    method: 'post',
    data: data
  });
};

/**
 * 修改佣金配置
 * @param data
 */
export const updateInsuranceProductCommission = (data: InsuranceProductCommissionForm) => {
  return request({
    url: '/insurance/InsuranceProductCommission',
    method: 'put',
    data: data
  });
};

/**
 * 删除佣金配置
 * @param id
 */
export const delInsuranceProductCommission = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/InsuranceProductCommission/' + id,
    method: 'delete'
  });
};
