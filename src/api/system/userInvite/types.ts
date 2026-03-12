export interface UserInviteVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * 用户账号
   */
  userName: string;

  /**
   * 用户姓名
   */
  nickName: string;

  /**
   * 手机号码
   */
  phoneNumber: string;

  /**
   * 身份证号
   */
  idCard: string | number;

  /**
   * 推荐人
   */
  referrerName: string;

  /**
   * 推荐人id
   */
  referrerId: string | number;

  /**
   * 申请部门ID(可选)
   */
  deptId: string | number;

  /**
   * 审核状态（0待审核 1已通过 2已拒绝）
   */
  status: number;

  /**
   * 审核意见
   */
  remark: string;

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

}

export interface UserInviteForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * 用户账号
   */
  userName?: string;

  /**
   * 用户姓名
   */
  nickName?: string;

  /**
   * 手机号码
   */
  phoneNumber?: string;

  /**
   * 身份证号
   */
  idCard?: string | number;

  /**
   * 推荐人
   */
  referrerName?: string;

  /**
   * 推荐人id
   */
  referrerId?: string | number;

  /**
   * 申请部门ID(可选)
   */
  deptId?: string | number;

  /**
   * 审核状态（0待审核 1已通过 2已拒绝）
   */
  status?: number;

  /**
   * 审核意见
   */
  remark?: string;

  /**
   * 删除标识
   */
  delFlag?: string;

  /**
   * 乐观锁版本
   */
  version?: number;

}

export interface UserInviteQuery extends PageQuery {

  /**
   * 用户姓名
   */
  nickName?: string;

  /**
   * 手机号码
   */
  phoneNumber?: string;

  /**
   * 身份证号
   */
  idCard?: string | number;

  /**
   * 推荐人
   */
  referrerName?: string;

  /**
   * 审核状态（0待审核 1已通过 2已拒绝）
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
