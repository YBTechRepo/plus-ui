export interface InsuranceProxyOrderVO {
  /**
   * id
   */
  id: string | number;

  /**
   * 租户编号
   */
  tenantId?: string;

  /**
   * 租户名称
   */
  tenantName?: string;

  /**
   * 订单号
   */
  orderNo: string;

  /**
   * 产品ID
   */
  productId: string | number;

  /**
   * 产品编码
   */
  productCode: string;

  /**
   * 产品名称
   */
  productName: string;

  /**
   * 业务员姓名
   */
  agentName: string;

  /**
   * 业务员ID
   */
  agentUserId: string | number;

  /**
   * 所属机构ID
   */
  agentDeptId: string | number;

  /**
   * 客户姓名
   */
  customerName: string;

  /**
   * 客户手机号
   */
  customerMobile: string;

  /**
   * 登记保费
   */
  premium: number;

  /**
   * 净费出单保费
   */
  netPremium: number;

  /**
   * 订单状态
   */
  status: number;

  /**
   * 结算状态
   */
  commissionStatus: number;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 删除标识
   */
  delFlag: string;

  /**
   * 乐观锁版本
   */
  version: number;

  /**
   * 投保模式
   */
  insureMode: number;

  /**
   * 支付模式
   */
  paymentMode: number;

  /**
   * 支付时间
   */
  payTime: string;

  /**
   * 是否批量单
   */
  isBatch: number;

  /**
   * 所属批次单号
   */
  batchOrderNo: string;

}

export interface InsuranceProxyOrderForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * 订单号
   */
  orderNo?: string;

  /**
   * 产品ID
   */
  productId?: string | number;

  /**
   * 产品编码
   */
  productCode?: string;

  /**
   * 产品名称
   */
  productName?: string;

  /**
   * 业务员姓名
   */
  agentName?: string;

  /**
   * 业务员ID
   */
  agentUserId?: string | number;

  /**
   * 所属机构ID
   */
  agentDeptId?: string | number;

  /**
   * 客户姓名
   */
  customerName?: string;

  /**
   * 客户手机号
   */
  customerMobile?: string;

  /**
   * 登记保费
   */
  premium?: number;

  /**
   * 净费出单保费
   */
  netPremium?: number;

  /**
   * 订单状态
   */
  status?: number;

  /**
   * 结算状态
   */
  commissionStatus?: number;

  /**
   * 删除标识
   */
  delFlag?: string;

  /**
   * 乐观锁版本
   */
  version?: number;

  /**
   * 投保模式
   */
  insureMode?: number;

  /**
   * 支付模式
   */
  paymentMode?: number;

  /**
   * 支付时间
   */
  payTime?: string;

  /**
   * 是否批量单
   */
  isBatch?: number;

  /**
   * 所属批次单号
   */
  batchOrderNo?: string;

}

export interface InsuranceProxyOrderQuery extends PageQuery {

  /**
   * 订单号
   */
  orderNo?: string;

  /**
   * 产品编码
   */
  productCode?: string;

  /**
   * 产品名称
   */
  productName?: string;

  /**
   * 业务员姓名
   */
  agentName?: string;

  /**
   * 客户姓名
   */
  customerName?: string;

  /**
   * 客户手机号
   */
  customerMobile?: string;

  /**
   * 订单状态
   */
  status?: number;

  /**
   * 结算状态
   */
  commissionStatus?: number;

  /**
   * 投保模式（固定为1代表代投保）
   */
  insureMode?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
