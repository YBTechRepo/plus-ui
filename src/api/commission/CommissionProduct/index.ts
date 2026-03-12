import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CommissionProductVO, CommissionProductForm, CommissionProductQuery } from '@/api/commission/CommissionProduct/types';

/**
 * 查询特殊产品费率配置列表
 * @param query
 * @returns {*}
 */

export const listCommissionProduct = (query?: CommissionProductQuery): AxiosPromise<CommissionProductVO[]> => {
  return request({
    url: '/commission/CommissionProduct/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询特殊产品费率配置详细
 * @param id
 */
export const getCommissionProduct = (id: string | number): AxiosPromise<CommissionProductVO> => {
  return request({
    url: '/commission/CommissionProduct/' + id,
    method: 'get'
  });
};

/**
 * 新增特殊产品费率配置
 * @param data
 */
export const addCommissionProduct = (data: CommissionProductForm) => {
  return request({
    url: '/commission/CommissionProduct',
    method: 'post',
    data: data
  });
};

/**
 * 修改特殊产品费率配置
 * @param data
 */
export const updateCommissionProduct = (data: CommissionProductForm) => {
  return request({
    url: '/commission/CommissionProduct',
    method: 'put',
    data: data
  });
};

/**
 * 删除特殊产品费率配置
 * @param id
 */
export const delCommissionProduct = (id: string | number | Array<string | number>) => {
  return request({
    url: '/commission/CommissionProduct/' + id,
    method: 'delete'
  });
};
