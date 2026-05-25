export interface InsuranceApplyRecordVO {
  /**
   * id
   */
  id: string | number;

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
   * 净费出单保费
   */
  netPremium: number;

  /**
   * 投保模式 0-自投保 1-代投保
   */
  insureMode: number;

  /**
   * 支付模式 0-常规支付 1-余额代扣
   */
  paymentMode: number;

  /**
   * 产品模式
   */
  productMode?: number;

  /**
   * 卡密规格ID
   */
  specId?: string | number;

  /**
   * 卡密规格名称
   */
  specName?: string;

  /**
   * 商品金额
   */
  goodsAmount?: number;

  /**
   * 运费金额
   */
  freightAmount?: number;

  /**
   * 运费支付方式
   */
  freightPayType?: 'prepaid' | 'collect';

  /**
   * 选择的保险公司
   */
  selectedCompanyCode?: string;

  /**
   * 收货人姓名
   */
  receiverName?: string;

  /**
   * 收货人手机号
   */
  receiverMobile?: string;

  /**
   * 收货地址
   */
  receiverAddress?: string;

  /**
   * 投保扩展字段值
   */
  insureExtraData?: string;

  /**
   * 是否批量单：0-普通单 1-批次主单 2-批量子单
   */
  isBatch: number;

  /**
   * 所属批次单号（子单指向主单）
   */
  batchOrderNo: string;

}

export interface InsuranceApplyRecordForm extends BaseEntity {
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
   * 净费出单保费
   */
  netPremium?: number;

  /**
   * 投保模式 0-自投保 1-代投保
   */
  insureMode?: number;

  /**
   * 支付模式 0-常规支付 1-余额代扣
   */
  paymentMode?: number;

  /**
   * 产品模式
   */
  productMode?: number;

  /**
   * 卡密规格ID
   */
  specId?: string | number;

  /**
   * 卡密规格名称
   */
  specName?: string;

  /**
   * 商品金额
   */
  goodsAmount?: number;

  /**
   * 运费金额
   */
  freightAmount?: number;

  /**
   * 运费支付方式
   */
  freightPayType?: 'prepaid' | 'collect';

  /**
   * 选择的保险公司
   */
  selectedCompanyCode?: string;

  /**
   * 收货人姓名
   */
  receiverName?: string;

  /**
   * 收货人手机号
   */
  receiverMobile?: string;

  /**
   * 收货地址
   */
  receiverAddress?: string;

  /**
   * 投保扩展字段值
   */
  insureExtraData?: string;

  /**
   * 是否批量单：0-普通单 1-批次主单 2-批量子单
   */
  isBatch?: number;

  /**
   * 所属批次单号（子单指向主单）
   */
  batchOrderNo?: string;
}

export interface InsuranceApplyRecordQuery extends PageQuery {

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
   * 日期范围参数
   */
  params?: any;
}
