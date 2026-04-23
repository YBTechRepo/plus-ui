export interface CommissionRecordVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 关联保单ID
   */
  policyId: string | number;

  /**
   * 保单号
   */
  policyNo: string;

  /**
   * 产品ID
   */
  productId: string | number;

  /**
   * 产品名称
   */
  productName: string;

  /**
   * 实交保费
   */
  premium: number;

  /**
   * 佣金计算基数
   */
  commissionBase: number;

  /**
   * 业务员ID
   */
  salesUserId: string | number;

  /**
   * 业务员实发金额
   */
  salesAmount: number;

  /**
   * 团队长ID
   */
  teamUserId: string | number;

  /**
   * 团队长实发金额
   */
  teamAmount: number;

  /**
   * 总负责人ID
   */
  projectUserId: string | number;

  /**
   * 总负责人实发金额
   */
  projectAmount: number;

  /**
   * 算账依据
   */
  calcStrategy: number;

  /**
   * 流水状态
   */
  status: number;

  /**
   * 乐观锁
   */
  version: number;

  /**
   * 删除标志
   */
  delFlag: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 业务佣金比例
   */
  salesRatio: number;

  /**
   * 团队佣金比例
   */
  teamRatio: number;

  /**
   * 总负责人佣金比例
   */
  projectRatio: number;

  /**
   * 业务员姓名
   */
  salesUserName: string;

  /**
   * 团队负责人姓名
   */
  teamUserName: string;

  /**
   * 总负责人姓名
   */
  projectUserName: string;

  /**
   * 业务员佣金发放状态 (1-正常发放，2-净费已前置抵扣)
   */
  salesStatus: number;

  /**
   * 团队长津贴发放状态 (1-正常发放，2-净费已前置抵扣)
   */
  teamStatus: number;

  /**
   * 总负责人津贴发放状态 (1-正常发放，2-净费已前置抵扣)
   */
  projectStatus: number;

}

export interface CommissionRecordForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 关联保单ID
   */
  policyId?: string | number;

  /**
   * 保单号
   */
  policyNo?: string;

  /**
   * 产品ID
   */
  productId?: string | number;

    /**
   * 产品名称
   */
  productName?: string;

  /**
   * 实交保费
   */
  premium?: number;

  /**
   * 佣金计算基数
   */
  commissionBase?: number;

  /**
   * 业务员ID
   */
  salesUserId?: string | number;

  /**
   * 业务员实发金额
   */
  salesAmount?: number;

  /**
   * 团队长ID
   */
  teamUserId?: string | number;

  /**
   * 团队长实发金额
   */
  teamAmount?: number;

  /**
   * 总负责人ID
   */
  projectUserId?: string | number;

  /**
   * 总负责人实发金额
   */
  projectAmount?: number;

  /**
   * 算账依据
   */
  calcStrategy?: number;

  /**
   * 流水状态
   */
  status?: number;

  /**
   * 乐观锁
   */
  version?: number;

  /**
   * 删除标志
   */
  delFlag?: string;

  /**
   * 业务佣金比例
   */
  salesRatio?: number;

  /**
   * 团队佣金比例
   */
  teamRatio?: number;

  /**
   * 总负责人佣金比例
   */
  projectRatio?: number;

  /**
   * 业务员姓名
   */
  salesUserName?: string;

  /**
   * 团队负责人姓名
   */
  teamUserName?: string;

  /**
   * 总负责人姓名
   */
  projectUserName?: string;

  /**
   * 业务员佣金发放状态 (1-正常发放，2-净费已前置抵扣)
   */
  salesStatus?: number;

  /**
   * 团队长津贴发放状态 (1-正常发放，2-净费已前置抵扣)
   */
  teamStatus?: number;

  /**
   * 总负责人津贴发放状态 (1-正常发放，2-净费已前置抵扣)
   */
  projectStatus?: number;

}

export interface CommissionRecordQuery extends PageQuery {

  /**
   * 保单号
   */
  policyNo?: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
