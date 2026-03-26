import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceProductLiabilityVO, InsuranceProductLiabilityForm, InsuranceProductLiabilityQuery } from '@/api/insurance/InsuranceProductLiability/types';

/**
 * 查询保险产品-保障责任列表
 * @param query
 * @returns {*}
 */

export const listInsuranceProductLiability = (query?: InsuranceProductLiabilityQuery): AxiosPromise<InsuranceProductLiabilityVO[]> => {
  return request({
    url: '/insurance/InsuranceProductLiability/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询保险产品-保障责任详细
 * @param id
 */
export const getInsuranceProductLiability = (id: string | number): AxiosPromise<InsuranceProductLiabilityVO> => {
  return request({
    url: '/insurance/InsuranceProductLiability/' + id,
    method: 'get'
  });
};

/**
 * 新增保险产品-保障责任
 * @param data
 */
export const addInsuranceProductLiability = (data: InsuranceProductLiabilityForm) => {
  return request({
    url: '/insurance/InsuranceProductLiability',
    method: 'post',
    data: data
  });
};

/**
 * 修改保险产品-保障责任
 * @param data
 */
export const updateInsuranceProductLiability = (data: InsuranceProductLiabilityForm) => {
  return request({
    url: '/insurance/InsuranceProductLiability',
    method: 'put',
    data: data
  });
};

/**
 * 删除保险产品-保障责任
 * @param id
 */
export const delInsuranceProductLiability = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/InsuranceProductLiability/' + id,
    method: 'delete'
  });
};
