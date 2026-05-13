export interface UserAccountVO {
  /**
   * 租户号
   */
  tenantId?: string | number;

  /**
   * 租户名称
   */
  tenantName?: string;

  /**
   * 用户ID
   */
  userId: string | number;

  /**
   * 用户编号
   */
  userName: string;

  /**
   * 用户姓名
   */
  userNickName: string;

  /**
   * 可用充值余额
   */
  balance: number;

  /**
   * 账户状态
   */
  status: number;

  /**
   * 乐观锁版本号
   */
  version: number;

}

export interface UserAccountForm extends BaseEntity {
  /**
   * 用户ID
   */
  userId?: string | number;

  /**
   * 用户编号
   */
  userName?: string;

  /**
   * 用户姓名
   */
  userNickName?: string;

  /**
   * 可用充值余额
   */
  balance?: number;

  /**
   * 账户状态
   */
  status?: number;

  /**
   * 乐观锁版本号
   */
  version?: number;

}

export interface UserAccountQuery extends PageQuery {

  /**
   * 用户编号
   */
  userName?: string;

  /**
   * 用户姓名
   */
  userNickName?: string;

  /**
   * 可用充值余额
   */
  balance?: number;

  /**
   * 账户状态
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
