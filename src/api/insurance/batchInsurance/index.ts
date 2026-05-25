import request from '@/utils/request';

// 获取在售产品列表
export function listSalesProducts(query?: any) {
  return request({
    url: '/open/api/v1/sales/list',
    method: 'get',
    params: query
  });
}

// 提交意向单
export function addInsuranceApplyRecord(data: any) {
  return request({
    url: '/insurance/InsuranceApplyRecord',
    method: 'post',
    data: data
  });
}

// 确认支付（余额支付）
export function confirmPay(data: any) {
  return request({
    url: '/insurance/InsuranceApplyRecord/payWithBalance',
    method: 'post',
    data: data
  });
}

// 保存详细投保信息
export function saveInsureInfo(orderNo: string, data: any) {
  return request({
    url: '/insurance/InsuranceApplyRecord/saveInsureInfo/' + orderNo,
    method: 'post',
    data: data
  });
}

// 导入并解析Excel数据
export function importBatchData(data: FormData) {
  return request({
    url: '/insurance/batch/importData',
    method: 'post',
    data: data,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}

// 下载产品专属批量投保模板
export function downloadBatchTemplate(productId: string | number) {
  return request({
    url: '/insurance/batch/template',
    method: 'get',
    params: { productId },
    responseType: 'blob'
  });
}

// 预览收馀台数据
export function previewBatch(data: any) {
  return request({
    url: '/insurance/batch/preview',
    method: 'post',
    data: data
  });
}

// 提交批量出单
export function submitBatch(data: any) {
  return request({
    url: '/insurance/batch/submit',
    method: 'post',
    data: data
  });
}
