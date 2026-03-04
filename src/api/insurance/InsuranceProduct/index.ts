import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceProductVO, InsuranceProductForm, InsuranceProductQuery } from '@/api/insurance/InsuranceProduct/types';

/**
 * 查询产品配置列表
 * @param query
 * @returns {*}
 */

export const listInsuranceProduct = (query?: InsuranceProductQuery): AxiosPromise<InsuranceProductVO[]> => {
  return request({
    url: '/insurance/InsuranceProduct/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询产品配置详细
 * @param id
 */
export const getInsuranceProduct = (id: string | number): AxiosPromise<InsuranceProductVO> => {
  return request({
    url: '/insurance/InsuranceProduct/' + id,
    method: 'get'
  });
};

/**
 * 新增产品配置
 * @param data
 */
export const addInsuranceProduct = (data: InsuranceProductForm) => {
  return request({
    url: '/insurance/InsuranceProduct',
    method: 'post',
    data: data
  });
};

/**
 * 修改产品配置
 * @param data
 */
export const updateInsuranceProduct = (data: InsuranceProductForm) => {
  return request({
    url: '/insurance/InsuranceProduct',
    method: 'put',
    data: data
  });
};

/**
 * 删除产品配置
 * @param id
 */
export const delInsuranceProduct = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/InsuranceProduct/' + id,
    method: 'delete'
  });
};
