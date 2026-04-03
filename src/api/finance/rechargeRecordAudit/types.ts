export interface RechargeRecordAuditVO {
  /**
   * id
   */
  id: string | number;

  /**
   * 充值单号
   */
  rechargeNo: string;

  /**
   * 申请人ID
   */
  userId: string | number;

  /**
   * 用户填写的申请充值金额
   */
  applyAmount: number;

  /**
   * 财务实际核准到账的金额
   */
  actualAmount: number;

  /**
   * 支付凭证(转账截图)URL
   */
  voucherImg: string;

  /**
   * 支付凭证(转账截图)URLUrl
   */
  voucherImgUrl: string;
  /**
   * 审核状态: 0=待审核, 1=已通过, 2=已驳回
   */
  status: number;

  /**
   * 审核/驳回备注说明
   */
  auditRemark: string;

  /**
   * 审核人ID
   */
  auditBy: number;

  /**
   * 审核时间
   */
  auditTime: string;

  /**
   * 乐观锁版本号
   */
  version: number;

}

export interface RechargeRecordAuditForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * 充值单号
   */
  rechargeNo?: string;

  /**
   * 申请人ID
   */
  userId?: string | number;

  /**
   * 用户填写的申请充值金额
   */
  applyAmount?: number;

  /**
   * 财务实际核准到账的金额
   */
  actualAmount?: number;

  /**
   * 支付凭证(转账截图)URL
   */
  voucherImg?: string;

  /**
   * 审核状态: 0=待审核, 1=已通过, 2=已驳回
   */
  status?: number;

  /**
   * 审核/驳回备注说明
   */
  auditRemark?: string;

  /**
   * 审核人ID
   */
  auditBy?: number;

  /**
   * 审核时间
   */
  auditTime?: string;

  /**
   * 乐观锁版本号
   */
  version?: number;

}

export interface RechargeRecordAuditQuery extends PageQuery {

  /**
   * 充值单号
   */
  rechargeNo?: string;

  /**
   * 申请人ID
   */
  userId?: string | number;

  /**
   * 审核状态: 0=待审核, 1=已通过, 2=已驳回
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
