import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BannerConfigVO, BannerConfigForm, BannerConfigQuery } from '@/api/insurance/bannerConfig/types';

/**
 * 查询轮播图配置列表
 * @param query
 * @returns {*}
 */

export const listBannerConfig = (query?: BannerConfigQuery): AxiosPromise<BannerConfigVO[]> => {
  return request({
    url: '/insurance/bannerConfig/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询轮播图配置详细
 * @param id
 */
export const getBannerConfig = (id: string | number): AxiosPromise<BannerConfigVO> => {
  return request({
    url: '/insurance/bannerConfig/' + id,
    method: 'get'
  });
};

/**
 * 新增轮播图配置
 * @param data
 */
export const addBannerConfig = (data: BannerConfigForm) => {
  return request({
    url: '/insurance/bannerConfig',
    method: 'post',
    data: data
  });
};

/**
 * 修改轮播图配置
 * @param data
 */
export const updateBannerConfig = (data: BannerConfigForm) => {
  return request({
    url: '/insurance/bannerConfig',
    method: 'put',
    data: data
  });
};

/**
 * 删除轮播图配置
 * @param id
 */
export const delBannerConfig = (id: string | number | Array<string | number>) => {
  return request({
    url: '/insurance/bannerConfig/' + id,
    method: 'delete'
  });
};
