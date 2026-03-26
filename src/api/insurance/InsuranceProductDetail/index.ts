import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceProductDetailVO, InsuranceProductDetailForm, InsuranceProductDetailQuery } from '@/api/insurance/InsuranceProductDetail/types';

/**
 * 查询保险产品-图文详情列表
 * @param query
 * @returns {*}
 */

export const listInsuranceProductDetail = (query?: InsuranceProductDetailQuery): AxiosPromise<InsuranceProductDetailVO[]> => {
  return request({
    url: '/insurance/InsuranceProductDetail/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询保险产品-图文详情详细
 * @param id
 */
export const getInsuranceProductDetail = (id: string | number): AxiosPromise<InsuranceProductDetailVO> => {
  return request({
    url: '/insurance/InsuranceProductDetail/' + id,
    method: 'get'
  });
};

/**
 * 新增保险产品-图文详情
 * @param data
 */
export const addInsuranceProductDetail = (data: InsuranceProductDetailForm) => {
  return request({
    url: '/insurance/InsuranceProductDetail',
    method: 'post',
    data: data
  });
};

/**
 * 修改保险产品-图文详情
 * @param data
 */
export const updateInsuranceProductDetail = (data: InsuranceProductDetailForm) => {
  return request({
    url: '/insurance/InsuranceProductDetail',
    method: 'put',
    data: data
  });
};

/**
 * 删除保险产品-图文详情
 * @param id
 */
export const delInsuranceProductDetail = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/InsuranceProductDetail/' + id,
    method: 'delete'
  });
};
