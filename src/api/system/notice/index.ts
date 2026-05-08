import request from '@/utils/request';
import { NoticeForm, NoticeQuery, NoticeVO } from './types';
import { AxiosPromise } from 'axios';
// 查询公告列表
export function listNotice(query: NoticeQuery): AxiosPromise<NoticeVO[]> {
  return request({
    url: '/system/notice/list',
    method: 'get',
    params: query
  });
}

// 查询公告详细
export function getNotice(noticeId: string | number): AxiosPromise<NoticeVO> {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'get'
  });
}

// 查询用户端可见公告列表
export function listUserNotice(query?: NoticeQuery): AxiosPromise<NoticeVO[]> {
  return request({
    url: '/system/notice/user/list',
    method: 'get',
    params: query
  });
}

// 查询用户端可见公告详细
export function getUserNotice(noticeId: string | number): AxiosPromise<NoticeVO> {
  return request({
    url: '/system/notice/user/' + noticeId,
    method: 'get'
  });
}

// 新增公告
export function addNotice(data: NoticeForm) {
  return request({
    url: '/system/notice',
    method: 'post',
    data: data
  });
}

// 修改公告
export function updateNotice(data: NoticeForm) {
  return request({
    url: '/system/notice',
    method: 'put',
    data: data
  });
}

// 删除公告
export function delNotice(noticeId: string | number | Array<string | number>) {
  return request({
    url: '/system/notice/' + noticeId,
    method: 'delete'
  });
}

// 查询登录弹窗未读公告
export function listUnreadPopupNotices(): AxiosPromise<NoticeVO[]> {
  return request({
    url: '/system/notice/popup/unread',
    method: 'get',
    params: {
      clientId: import.meta.env.VITE_APP_CLIENT_ID
    }
  });
}

// 标记登录弹窗公告已读
export function readPopupNotice(noticeId: string | number) {
  return request({
    url: '/system/notice/popup/read/' + noticeId,
    method: 'post'
  });
}
