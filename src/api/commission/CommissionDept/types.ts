export interface CommissionDeptVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * 部门ID
   */
  deptId: string | number;

  /**
   * 部门名称
   */
  deptName: string;

  /**
   * 项目负责人比例
   */
  projectRatio: number;

  /**
   * 团队负责人比例
   */
  teamRatio: number;

  /**
   * 业务员比例
   */
  salesRatio: number;

  /**
   * 生效开始时间
   */
  effectiveStart: string;

  /**
   * 生效结束时间
   */
  effectiveEnd: string;

  /**
   * 状态
   */
  status: number;

  /**
   * 乐观锁版本号
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
   * 更新时间
   */
  updateTime: string;

}

export interface CommissionDeptForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * 部门ID
   */
  deptId?: string | number;

  /**
   * 部门名称
   */
  deptName?: string;

  /**
   * 项目负责人比例
   */
  projectRatio?: number;

  /**
   * 团队负责人比例
   */
  teamRatio?: number;

  /**
   * 业务员比例
   */
  salesRatio?: number;

  /**
   * 生效开始时间
   */
  effectiveStart?: string;

  /**
   * 生效结束时间
   */
  effectiveEnd?: string;

  /**
   * 状态
   */
  status?: number;

  /**
   * 乐观锁版本号
   */
  version?: number;

  /**
   * 删除标志
   */
  delFlag?: string;

}

export interface CommissionDeptQuery extends PageQuery {

  /**
   * 部门名称
   */
  deptName?: string;

  /**
   * 生效开始时间
   */
  effectiveStart?: string;

  /**
   * 生效结束时间
   */
  effectiveEnd?: string;

  /**
   * 状态
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
