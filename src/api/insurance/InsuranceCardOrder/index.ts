import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { InsuranceCardOrderVO, InsuranceCardOrderForm, InsuranceCardOrderQuery } from '@/api/insurance/InsuranceCardOrder/types';

/**
 * 查询当前登录人的卡密订单列表
 */
export const listInsuranceCardOrder = (query?: InsuranceCardOrderQuery): AxiosPromise<InsuranceCardOrderVO[]> => {
  return request({
    url: '/insurance/InsuranceCardOrder/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询当前登录人的卡密订单详细
 */
export const getInsuranceCardOrder = (id: string | number): AxiosPromise<InsuranceCardOrderVO> => {
  return request({
    url: '/insurance/InsuranceCardOrder/' + id,
    method: 'get'
  });
};

/**
 * 新增卡密订单
 */
export const addInsuranceCardOrder = (data: InsuranceCardOrderForm) => {
  return request({
    url: '/insurance/InsuranceCardOrder',
    method: 'post',
    data
  });
};

/**
 * 保存卡密订单收货与购买信息
 */
export const saveCardOrderInfo = (orderNo: string, data: Partial<InsuranceCardOrderForm>) => {
  return request({
    url: `/insurance/InsuranceCardOrder/saveOrderInfo/${orderNo}`,
    method: 'post',
    data
  });
};

/**
 * 卡密订单余额支付
 */
export const payCardOrderWithBalance = (data: { orderNo: string; payAmount: number }) => {
  return request({
    url: '/insurance/InsuranceCardOrder/payWithBalance',
    method: 'post',
    data
  });
};

/**
 * 根据订单号查询当前登录人的卡密订单
 */
export const getInsuranceCardOrderByOrderNo = async (orderNo: string): Promise<any> => {
  return request({
    url: '/insurance/InsuranceCardOrder/orderNo/' + orderNo,
    method: 'get'
  });
};
