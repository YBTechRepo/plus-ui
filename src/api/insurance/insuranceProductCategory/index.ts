import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceProductCategoryVO, InsuranceProductCategoryForm, InsuranceProductCategoryQuery } from '@/api/insurance/insuranceProductCategory/types';

/**
 * 查询产品分类管理列表
 * @param query
 * @returns {*}
 */

export const listInsuranceProductCategory = (query?: InsuranceProductCategoryQuery): AxiosPromise<InsuranceProductCategoryVO[]> => {
  return request({
    url: '/insurance/insuranceProductCategory/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询产品分类管理详细
 * @param categoryId
 */
export const getInsuranceProductCategory = (categoryId: string | number): AxiosPromise<InsuranceProductCategoryVO> => {
  return request({
    url: '/insurance/insuranceProductCategory/' + categoryId,
    method: 'get'
  });
};

/**
 * 新增产品分类管理
 * @param data
 */
export const addInsuranceProductCategory = (data: InsuranceProductCategoryForm) => {
  return request({
    url: '/insurance/insuranceProductCategory',
    method: 'post',
    data: data
  });
};

/**
 * 修改产品分类管理
 * @param data
 */
export const updateInsuranceProductCategory = (data: InsuranceProductCategoryForm) => {
  return request({
    url: '/insurance/insuranceProductCategory',
    method: 'put',
    data: data
  });
};

/**
 * 删除产品分类管理
 * @param categoryId
 */
export const delInsuranceProductCategory = (categoryId: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/insuranceProductCategory/' + categoryId,
    method: 'delete'
  });
};
