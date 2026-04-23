import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { RoleTemplateVO, RoleTemplateForm, RoleTemplateQuery } from '@/api/system/roleTemplate/types';

/**
 * 查询租户角色管理列表
 * @param query
 * @returns {*}
 */

export const listRoleTemplate = (query?: RoleTemplateQuery): AxiosPromise<RoleTemplateVO[]> => {
  return request({
    url: '/system/roleTemplate/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询租户角色管理详细
 * @param id
 */
export const getRoleTemplate = (id: string | number): AxiosPromise<RoleTemplateVO> => {
  return request({
    url: '/system/roleTemplate/' + id,
    method: 'get'
  });
};

/**
 * 新增租户角色管理
 * @param data
 */
export const addRoleTemplate = (data: RoleTemplateForm) => {
  return request({
    url: '/system/roleTemplate',
    method: 'post',
    data: data
  });
};

/**
 * 修改租户角色管理
 * @param data
 */
export const updateRoleTemplate = (data: RoleTemplateForm) => {
  return request({
    url: '/system/roleTemplate',
    method: 'put',
    data: data
  });
};

/**
 * 删除租户角色管理
 * @param id
 */
export const delRoleTemplate = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/roleTemplate/' + id,
    method: 'delete'
  });
};

/**
 * 角色模板状态修改
 * @param id
 * @param status
 */
export const changeRoleTemplateStatus = (id: string | number, status: string) => {
  const data = {
    id,
    status
  };
  return request({
    url: '/system/roleTemplate/changeStatus',
    method: 'put',
    data: data
  });
};
