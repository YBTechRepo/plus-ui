import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceTenantProductVO, InsuranceTenantProductForm, InsuranceTenantProductQuery } from '@/api/insurance/InsuranceTenantProduct/types';

/**
 * 查询产品库列表
 * @param query
 * @returns {*}
 */

export const listInsuranceTenantProduct = (query?: InsuranceTenantProductQuery): AxiosPromise<InsuranceTenantProductVO[]> => {
  return request({
    url: '/insurance/InsuranceTenantProduct/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询产品库详细
 * @param id
 */
export const getInsuranceTenantProduct = (id: string | number): AxiosPromise<InsuranceTenantProductVO> => {
  return request({
    url: '/insurance/InsuranceTenantProduct/' + id,
    method: 'get'
  });
};

/**
 * 新增产品库
 * @param data
 */
export const addInsuranceTenantProduct = (data: InsuranceTenantProductForm) => {
  return request({
    url: '/insurance/InsuranceTenantProduct',
    method: 'post',
    data: data
  });
};

/**
 * 修改产品库
 * @param data
 */
export const updateInsuranceTenantProduct = (data: InsuranceTenantProductForm) => {
  return request({
    url: '/insurance/InsuranceTenantProduct',
    method: 'put',
    data: data
  });
};

/**
 * 删除产品库
 * @param id
 */
export const delInsuranceTenantProduct = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/InsuranceTenantProduct/' + id,
    method: 'delete'
  });
};

/**
 * 批量新增产品库（Mock）
 * @param productIds 产品ID数组
 */
export const addInsuranceTenantProductBatch = (productIds: Array<string | number>) => {
  return request({
    url: '/insurance/InsuranceTenantProduct/batchAdd',
    method: 'post',
    data: productIds
  });
};

/**
 * 获取可添加到组合的产品列表(市场列表)
 * @param query
 */
export const listMarketProduct = (query?: InsuranceTenantProductQuery) => {
  return request({
    url: '/insurance/InsuranceProductConfig/marketList',
    method: 'get',
    params: query
  });
};
