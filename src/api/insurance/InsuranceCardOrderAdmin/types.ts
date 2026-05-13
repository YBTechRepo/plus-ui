export interface InsuranceCardOrderVO {
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
   * 订单状态
   */
  status: number;

  /**
   * 产品模式
   */
  productMode?: number;

  /**
   * 投保模式
   */
  insureMode?: number;

  /**
   * 支付模式
   */
  paymentMode?: number;

  /**
   * 卡密规格ID
   */
  specId?: string | number;

  /**
   * 卡密规格名称
   */
  specName?: string;

  /**
   * 购买数量
   */
  goodsQuantity?: number;

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
   * 应付金额
   */
  payAmount?: number;

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
   * 快递公司
   */
  expressCompany?: string;

  /**
   * 快递单号
   */
  expressNo?: string;

  /**
   * 发货时间
   */
  deliveryTime?: string;

  /**
   * 创建时间
   */
  createTime?: string;
}

export interface InsuranceCardOrderForm extends BaseEntity {
  id?: string | number;
  tenantId?: string;
  tenantName?: string;
  orderNo?: string;
  productId?: string | number;
  productCode?: string;
  productName?: string;
  agentName?: string;
  agentUserId?: string | number;
  agentDeptId?: string | number;
  customerName?: string;
  customerMobile?: string;
  status?: number;
  productMode?: number;
  insureMode?: number;
  paymentMode?: number;
  specId?: string | number;
  specName?: string;
  goodsQuantity?: number;
  goodsAmount?: number;
  freightAmount?: number;
  freightPayType?: 'prepaid' | 'collect';
  payAmount?: number;
  selectedCompanyCode?: string;
  receiverName?: string;
  receiverMobile?: string;
  receiverAddress?: string;
  expressCompany?: string;
  expressNo?: string;
  deliveryTime?: string;
}

export interface InsuranceCardOrderQuery extends PageQuery {
  tenantId?: string;
  orderNo?: string;
  productCode?: string;
  productName?: string;
  agentName?: string;
  customerName?: string;
  customerMobile?: string;
  status?: number;
  selectedCompanyCode?: string;
  expressNo?: string;
  params?: any;
}
