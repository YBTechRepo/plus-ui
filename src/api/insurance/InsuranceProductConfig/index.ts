import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceProductConfigVO, InsuranceProductConfigForm, InsuranceProductConfigQuery } from '@/api/insurance/InsuranceProductConfig/types';

/**
 * 查询产品配置列表
 * @param query
 * @returns {*}
 */

export const listInsuranceProductConfig = (query?: InsuranceProductConfigQuery): AxiosPromise<InsuranceProductConfigVO[]> => {
  return request({
    url: '/insurance/InsuranceProductConfig/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询产品配置详细
 * @param id
 */
export const getInsuranceProductConfig = (id: string | number): AxiosPromise<InsuranceProductConfigVO> => {
  return request({
    url: '/insurance/InsuranceProductConfig/' + id,
    method: 'get'
  });
};

/**
 * 新增产品配置
 * @param data
 */
export const addInsuranceProductConfig = (data: InsuranceProductConfigForm) => {
  return request({
    url: '/insurance/InsuranceProductConfig',
    method: 'post',
    data: data
  });
};

/**
 * 修改产品配置
 * @param data
 */
export const updateInsuranceProductConfig = (data: InsuranceProductConfigForm) => {
  return request({
    url: '/insurance/InsuranceProductConfig',
    method: 'put',
    data: data
  });
};

/**
 * 删除产品配置
 * @param id
 */
export const delInsuranceProductConfig = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/InsuranceProductConfig/' + id,
    method: 'delete'
  });
};

// 🌟 注意：把 productConfig 改成严格匹配你后端的 InsuranceProductConfig
export function getProductFull(id: string | number) {
  return request({
    url: '/insurance/InsuranceProductConfig/getFull/' + id, // 修改这里
    method: 'get'
  });
}

export function addProductFull(data: any) {
  return request({
    url: '/insurance/InsuranceProductConfig/saveFull', // 修改这里
    method: 'post',
    data: data
  });
}

export function updateProductFull(data: any) {
  return request({
    url: '/insurance/InsuranceProductConfig/saveFull', // 修改这里
    method: 'post',
    data: data
  });
}

/**
 * 获取产品服务费配置 (JSON 字符串)
 * @param id 产品ID
 */
export function getServiceFeeConfig(id: string | number) {
  return request({
    url: '/insurance/InsuranceProductConfig/getServiceFeeConfig/' + id,
    method: 'get'
  });
}

/**
 * 将产品服务费配置同步到各租户佣金配置
 * @param productIds 产品ID数组
 */
export function syncServiceFeeCommission(productIds: Array<string | number>) {
  return request({
    url: '/insurance/InsuranceProductConfig/syncServiceFeeCommission',
    method: 'post',
    data: { productIds }
  });
}

/**
 * 将全部产品服务费配置同步到各租户佣金配置
 */
export function syncAllServiceFeeCommission() {
  return request({
    url: '/insurance/InsuranceProductConfig/syncAllServiceFeeCommission',
    method: 'post'
  });
}

/**
 * 将平台产品同步到各租户产品库
 * @param productIds 产品ID数组
 */
export function syncTenantProducts(productIds: Array<string | number>) {
  return request({
    url: '/insurance/InsuranceProductConfig/syncTenantProducts',
    method: 'post',
    data: { productIds }
  });
}

/**
 * 将全部平台产品同步到各租户产品库
 */
export function syncAllTenantProducts() {
  return request({
    url: '/insurance/InsuranceProductConfig/syncAllTenantProducts',
    method: 'post'
  });
}

/**
 * 将全部平台下架产品状态同步到各租户产品库
 */
export function syncAllTenantProductStatus() {
  return request({
    url: '/insurance/InsuranceProductConfig/syncAllTenantProductStatus',
    method: 'post'
  });
}
