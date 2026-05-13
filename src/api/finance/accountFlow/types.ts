export interface AccountFlowVO {
  /**
   * 租户号
   */
  tenantId?: string | number;

  /**
   * 租户名称
   */
  tenantName?: string;

  /**
   * id
   */
  id: string | number;

  /**
   * 资金归属的用户ID
   */
  userId: string | number;

  userName: string;

  userNickName: string;

  /**
   * 流水类型
   */
  flowType: number;

  /**
   * 变动金额
   */
  amount: number;

  /**
   * 变动后的账户总余额
   */
  balanceAfter: number;

  /**
   * 关联业务单号
   */
  bizNo: string;

  /**
   * 流水摘要说明
   */
  remark: string;

  createTime: string;
}

export interface AccountFlowForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * 资金归属的用户ID
   */
  userId?: string | number;

  userName?: string;

  userNickName?: string;

  /**
   * 流水类型
   */
  flowType?: number;

  /**
   * 变动金额
   */
  amount?: number;

  /**
   * 变动后的账户总余额
   */
  balanceAfter?: number;

  /**
   * 关联业务单号
   */
  bizNo?: string;

  /**
   * 流水摘要说明
   */
  remark?: string;

  createTime?: string;
}

export interface AccountFlowQuery extends PageQuery {

  /**
   * 资金归属的用户ID
   */
  userId?: string | number;

  /**
   * 关联业务单号
   */
  bizNo?: string;

  /**
   * 流水类型
   */
  flowType?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
export interface AccountAdjustReqDTO {
  userId: string | number;
  flowType: number;
  amount: number;
  remark: string;
}
