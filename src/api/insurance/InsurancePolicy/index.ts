import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsurancePolicyVO, InsurancePolicyForm, InsurancePolicyQuery } from '@/api/insurance/InsurancePolicy/types';

/**
 * 查询承保保单列表
 * @param query
 * @returns {*}
 */

export const listInsurancePolicy = (query?: InsurancePolicyQuery): AxiosPromise<InsurancePolicyVO[]> => {
  return request({
    url: '/insurance/InsurancePolicy/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询承保保单详细
 * @param id
 */
export const getInsurancePolicy = (id: string | number): AxiosPromise<InsurancePolicyVO> => {
  return request({
    url: '/insurance/InsurancePolicy/' + id,
    method: 'get'
  });
};

/**
 * 新增承保保单
 * @param data
 */
export const addInsurancePolicy = (data: InsurancePolicyForm) => {
  return request({
    url: '/insurance/InsurancePolicy',
    method: 'post',
    data: data
  });
};

/**
 * 修改承保保单
 * @param data
 */
export const updateInsurancePolicy = (data: InsurancePolicyForm) => {
  return request({
    url: '/insurance/InsurancePolicy',
    method: 'put',
    data: data
  });
};

/**
 * 删除承保保单
 * @param id
 */
export const delInsurancePolicy = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/InsurancePolicy/' + id,
    method: 'delete'
  });
};

/**
 * 下载保单投保凭证 PDF
 * @param policyNo 保单号
 */
export const downloadPolicyVoucherPdf = (policyNo: string | number) => {
  return request({
    url: '/insurance/InsurancePolicy/voucherPdf/' + encodeURIComponent(policyNo),
    method: 'get',
    responseType: 'blob',
    headers: { repeatSubmit: false }
  });
};
