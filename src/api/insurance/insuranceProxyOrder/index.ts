import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceProxyOrderVO, InsuranceProxyOrderForm, InsuranceProxyOrderQuery } from '@/api/insurance/insuranceProxyOrder/types';

/**
 * 查询代投保订单查询列表
 * @param query
 * @returns {*}
 */

export const listInsuranceProxyOrder = (query?: InsuranceProxyOrderQuery): AxiosPromise<InsuranceProxyOrderVO[]> => {
  return request({
    url: '/insurance/insuranceProxyOrder/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询代投保订单查询详细
 * @param id
 */
export const getInsuranceProxyOrder = (id: string | number): AxiosPromise<InsuranceProxyOrderVO> => {
  return request({
    url: '/insurance/insuranceProxyOrder/' + id,
    method: 'get'
  });
};

/**
 * 新增代投保订单查询
 * @param data
 */
export const addInsuranceProxyOrder = (data: InsuranceProxyOrderForm) => {
  return request({
    url: '/insurance/insuranceProxyOrder',
    method: 'post',
    data: data
  });
};

/**
 * 修改代投保订单查询
 * @param data
 */
export const updateInsuranceProxyOrder = (data: InsuranceProxyOrderForm) => {
  return request({
    url: '/insurance/insuranceProxyOrder',
    method: 'put',
    data: data
  });
};

/**
 * 删除代投保订单查询
 * @param id
 */
export const delInsuranceProxyOrder = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/insuranceProxyOrder/' + id,
    method: 'delete'
  });
};
