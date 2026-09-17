import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  InsuranceProxyOrderVO,
  InsuranceProxyOrderForm,
  InsuranceProxyOrderQuery,
  InsuranceProxyOrderStatusForm,
  InsuranceApplicationFormStatus,
  InsuranceApplicationExportRequest,
  InsuranceApplicationExportTaskVO
} from '@/api/insurance/insuranceProxyOrder/types';

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
 * 管理员变更代投保订单状态
 * @param data
 */
export const changeInsuranceProxyOrderStatus = (data: InsuranceProxyOrderStatusForm) => {
  return request({
    url: '/insurance/insuranceProxyOrder/changeStatus',
    method: 'post',
    data
  });
};

/** 查询代投保订单的投保单状态 */
export const getInsuranceProxyOrderApplicationForm = (id: string | number): AxiosPromise<InsuranceApplicationFormStatus> => {
  return request({
    url: `/insurance/insuranceProxyOrder/${id}/applicationForm`,
    method: 'get'
  });
};

export const getInsuranceProxyOrderApplicationFormPdf = (id: string | number): AxiosPromise<Blob> => {
  return request({
    url: `/insurance/insuranceProxyOrder/${id}/applicationForm/pdf`,
    method: 'get',
    params: { inline: true },
    responseType: 'blob'
  });
};

/** 创建投保单批量导出任务 */
export const createInsuranceApplicationExportTask = (data: InsuranceApplicationExportRequest): AxiosPromise<InsuranceApplicationExportTaskVO> => {
  return request({
    url: '/insurance/insuranceProxyOrder/applicationForm/exportTasks',
    method: 'post',
    data
  });
};

/** 查询当前用户的投保单批量导出任务 */
export const listInsuranceApplicationExportTasks = (query: PageQuery): AxiosPromise<InsuranceApplicationExportTaskVO[]> => {
  return request({
    url: '/insurance/insuranceProxyOrder/applicationForm/exportTasks',
    method: 'get',
    params: query
  });
};

/** 查询投保单批量导出任务进度 */
export const getInsuranceApplicationExportTask = (taskId: string | number): AxiosPromise<InsuranceApplicationExportTaskVO> => {
  return request({
    url: `/insurance/insuranceProxyOrder/applicationForm/exportTasks/${taskId}`,
    method: 'get'
  });
};

/** 下载投保单批量导出 ZIP */
export const downloadInsuranceApplicationExportTask = (taskId: string | number): AxiosPromise<Blob> => {
  return request({
    url: `/insurance/insuranceProxyOrder/applicationForm/exportTasks/${taskId}/file`,
    method: 'get',
    responseType: 'blob'
  });
};

/** 删除代投保订单查询 */
export const delInsuranceProxyOrder = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/insuranceProxyOrder/' + id,
    method: 'delete'
  });
};
