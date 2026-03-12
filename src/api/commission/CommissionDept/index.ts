import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CommissionDeptVO, CommissionDeptForm, CommissionDeptQuery } from '@/api/commission/CommissionDept/types';

/**
 * 查询机构费率配置列表
 * @param query
 * @returns {*}
 */

export const listCommissionDept = (query?: CommissionDeptQuery): AxiosPromise<CommissionDeptVO[]> => {
  return request({
    url: '/commission/CommissionDept/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询机构费率配置详细
 * @param id
 */
export const getCommissionDept = (id: string | number): AxiosPromise<CommissionDeptVO> => {
  return request({
    url: '/commission/CommissionDept/' + id,
    method: 'get'
  });
};

/**
 * 新增机构费率配置
 * @param data
 */
export const addCommissionDept = (data: CommissionDeptForm) => {
  return request({
    url: '/commission/CommissionDept',
    method: 'post',
    data: data
  });
};

/**
 * 修改机构费率配置
 * @param data
 */
export const updateCommissionDept = (data: CommissionDeptForm) => {
  return request({
    url: '/commission/CommissionDept',
    method: 'put',
    data: data
  });
};

/**
 * 删除机构费率配置
 * @param id
 */
export const delCommissionDept = (id: string | number | Array<string | number>) => {
  return request({
    url: '/commission/CommissionDept/' + id,
    method: 'delete'
  });
};
