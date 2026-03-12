export interface InsurancePolicyVO {
  /**
   * id
   */
  id: string | number;

  /**
   * 产品id
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
   * 保单号
   */
  policyNo: string;

  /**
   * 订单号
   */
  orderNo: string;

  /**
   * 业务人员姓名
   */
  agentName: string;

  /**
   * 业务人员id
   */
  agentUserId: string | number;

  /**
   * 业务人员所属部门
   */
  agentDeptId: string | number;

  /**
   * 保费
   */
  premium: number;

  /**
   * 保额
   */
  amt: number;

  /**
   * 结算状态
   */
  commissionStatus: number;

  /**
   * 保单状态
   */
  status: number;

  /**
   * 投保时间
   */
  appntDate: string;

  /**
   * 承保时间
   */
  accecptDate: string;

  /**
   * 保单失效时间
   */
  policyInvalidDate: string | number;

  /**
   * 保障开始时间
   */
  policyStartDate: string;

  /**
   * 保障结束时间
   */
  policyEndDate: string;

  /**
   * 投保人姓名
   */
  applicantName: string;

  /**
   * 投保人性别
   */
  applicantSex: string;

  /**
   * 投保人证件号
   */
  applicantIdNo: string | number;

  /**
   * 投保人证件类型
   */
  applicantIdType: string | number;

  /**
   * 投保人手机号
   */
  applicantMobile: string;

  /**
   * 被保人与投保人关系
   */
  relationshipToInsured: string;

  /**
   * 被保人姓名
   */
  insuredName: string;

  /**
   * 被保人性别
   */
  insuredSex: string;

  /**
   * 被保人证件号
   */
  insuredIdNo: string | number;

  /**
   * 被保人证件类型
   */
  insuredIdType: string | number;

  /**
   * 被保人手机号
   */
  insuredMobile: string;

  /**
   * 删除标识
   */
  delFlag: string;

  /**
   * 乐观锁版本
   */
  version: number;

}

export interface InsurancePolicyForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * 产品id
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
   * 保单号
   */
  policyNo?: string;

  /**
   * 订单号
   */
  orderNo?: string;

  /**
   * 业务人员姓名
   */
  agentName?: string;

  /**
   * 业务人员id
   */
  agentUserId?: string | number;

  /**
   * 业务人员所属部门
   */
  agentDeptId?: string | number;

  /**
   * 保费
   */
  premium?: number;

  /**
   * 保额
   */
  amt?: number;

  /**
   * 结算状态
   */
  commissionStatus?: number;

  /**
   * 保单状态
   */
  status?: number;

  /**
   * 投保时间
   */
  appntDate?: string;

  /**
   * 承保时间
   */
  accecptDate?: string;

  /**
   * 保单失效时间
   */
  policyInvalidDate?: string | number;

  /**
   * 保障开始时间
   */
  policyStartDate?: string;

  /**
   * 保障结束时间
   */
  policyEndDate?: string;

  /**
   * 投保人姓名
   */
  applicantName?: string;

  /**
   * 投保人性别
   */
  applicantSex?: string;

  /**
   * 投保人证件号
   */
  applicantIdNo?: string | number;

  /**
   * 投保人证件类型
   */
  applicantIdType?: string | number;

  /**
   * 投保人手机号
   */
  applicantMobile?: string;

  /**
   * 被保人与投保人关系
   */
  relationshipToInsured?: string;

  /**
   * 被保人姓名
   */
  insuredName?: string;

  /**
   * 被保人性别
   */
  insuredSex?: string;

  /**
   * 被保人证件号
   */
  insuredIdNo?: string | number;

  /**
   * 被保人证件类型
   */
  insuredIdType?: string | number;

  /**
   * 被保人手机号
   */
  insuredMobile?: string;

  /**
   * 删除标识
   */
  delFlag?: string;

  /**
   * 乐观锁版本
   */
  version?: number;

}

export interface InsurancePolicyQuery extends PageQuery {

  /**
   * 产品编码
   */
  productCode?: string;

  /**
   * 产品名称
   */
  productName?: string;

  /**
   * 保单号
   */
  policyNo?: string;

  /**
   * 订单号
   */
  orderNo?: string;

  /**
   * 业务人员姓名
   */
  agentName?: string;

  /**
   * 保费
   */
  premium?: number;

  /**
   * 保额
   */
  amt?: number;

  /**
   * 结算状态
   */
  commissionStatus?: number;

  /**
   * 保单状态
   */
  status?: number;

  /**
   * 投保时间
   */
  appntDate?: string;

  /**
   * 投保人姓名
   */
  applicantName?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
