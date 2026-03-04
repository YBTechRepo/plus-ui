import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceApplyRecordVO, InsuranceApplyRecordForm, InsuranceApplyRecordQuery } from '@/api/insurance/InsuranceApplyRecord/types';

/**
 * 查询投保记录列表
 * @param query
 * @returns {*}
 */

export const listInsuranceApplyRecord = (query?: InsuranceApplyRecordQuery): AxiosPromise<InsuranceApplyRecordVO[]> => {
  return request({
    url: '/insurance/InsuranceApplyRecord/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询投保记录详细
 * @param id
 */
export const getInsuranceApplyRecord = (id: string | number): AxiosPromise<InsuranceApplyRecordVO> => {
  return request({
    url: '/insurance/InsuranceApplyRecord/' + id,
    method: 'get'
  });
};

/**
 * 新增投保记录
 * @param data
 */
export const addInsuranceApplyRecord = (data: InsuranceApplyRecordForm) => {
  return request({
    url: '/insurance/InsuranceApplyRecord',
    method: 'post',
    data: data
  });
};

/**
 * 修改投保记录
 * @param data
 */
export const updateInsuranceApplyRecord = (data: InsuranceApplyRecordForm) => {
  return request({
    url: '/insurance/InsuranceApplyRecord',
    method: 'put',
    data: data
  });
};

/**
 * 删除投保记录
 * @param id
 */
export const delInsuranceApplyRecord = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/InsuranceApplyRecord/' + id,
    method: 'delete'
  });
};
