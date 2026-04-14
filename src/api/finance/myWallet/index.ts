import request from '@/utils/request';

export interface RechargeApplyForm {
  applyAmount: number | string;
  voucherImg: string;
}

// 上传凭证图片到 OSS
export function uploadOss(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/resource/oss/upload',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: formData
  }).then((res: any) => String(res.data?.ossId || res.ossId || ''));
}

// 提交充值申请
export function rechargeApply(data: RechargeApplyForm) {
  return request({
    url: '/finance/rechargeRecord/rechargeApply',
    method: 'post',
    data
  });
}

// 查询用户账户信息（余额等）
export function getUserAccount(userId: number | string) {
  return request({
    url: '/finance/userAccount/' + userId,
    method: 'get'
  });
}

// 查询用户账户流水明细
export function getUserAccountFlow(userId: number | string, pageNum: number = 1, pageSize: number = 10) {
  return request({
    url: '/finance/accountFlow/getUserAccountFlow',
    method: 'post',
    data: { userId },
    params: { pageNum, pageSize }
  });
}
