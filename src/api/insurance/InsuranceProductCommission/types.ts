export interface InsuranceProductCommissionVO {
  /**
   * id
   */
  id: string | number;

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
   * 基础佣金比例
   */
  commissionRate: number;

  /**
   * 费率生效时间
   */
  effectiveTime: string;

  /**
   * 费率失效时间
   */
  expirationTime: string;

  /**
   * 启用状态
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

}

export interface InsuranceProductCommissionForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

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
   * 基础佣金比例
   */
  commissionRate?: number;

  /**
   * 费率生效时间
   */
  effectiveTime?: string;

  /**
   * 费率失效时间
   */
  expirationTime?: string;

  /**
   * 启用状态
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

export interface InsuranceProductCommissionQuery extends PageQuery {

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
   * 启用状态
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
