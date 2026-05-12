import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceCardOrderVO, InsuranceCardOrderForm, InsuranceCardOrderQuery } from '@/api/insurance/InsuranceCardOrderAdmin/types';

/**
 * 平台查询全部租户卡密订单列表
 */
export const listInsuranceCardOrderAdmin = (query?: InsuranceCardOrderQuery): AxiosPromise<InsuranceCardOrderVO[]> => {
  return request({
    url: '/insurance/InsuranceCardOrderAdmin/list',
    method: 'get',
    params: query
  });
};

/**
 * 平台查询卡密订单详细
 */
export const getInsuranceCardOrderAdmin = (id: string | number): AxiosPromise<InsuranceCardOrderVO> => {
  return request({
    url: '/insurance/InsuranceCardOrderAdmin/' + id,
    method: 'get'
  });
};

/**
 * 平台录入或修改卡密订单快递信息
 */
export const updateCardOrderAdminLogistics = (data: Pick<InsuranceCardOrderForm, 'id' | 'expressCompany' | 'expressNo'>) => {
  return request({
    url: '/insurance/InsuranceCardOrderAdmin/logistics',
    method: 'post',
    data
  });
};
