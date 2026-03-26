export interface InsuranceProductLiabilityVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 产品ID (关联 biz_insurance_product.id)
   */
  productId: string | number;

  /**
   * 责任名称 (如：意外身故/伤残)
   */
  liabilityName: string;

  /**
   * 保障额度说明 (如：50万、按比例赔付)
   */
  insuredAmountDesc: string;

  /**
   * 详情描述 (选填的补充说明)
   */
  description: string;

  /**
   * 排序号 (升序)
   */
  sort: number;

  /**
   * 乐观锁版本
   */
  version: number;

  /**
   * 删除标记(0-未删除 1-删除)
   */
  delFlag: string;

}

export interface InsuranceProductLiabilityForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 产品ID (关联 biz_insurance_product.id)
   */
  productId?: string | number;

  /**
   * 责任名称 (如：意外身故/伤残)
   */
  liabilityName?: string;

  /**
   * 保障额度说明 (如：50万、按比例赔付)
   */
  insuredAmountDesc?: string;

  /**
   * 详情描述 (选填的补充说明)
   */
  description?: string;

  /**
   * 排序号 (升序)
   */
  sort?: number;

  /**
   * 乐观锁版本
   */
  version?: number;

  /**
   * 删除标记(0-未删除 1-删除)
   */
  delFlag?: string;

}

export interface InsuranceProductLiabilityQuery extends PageQuery {

  /**
   * 产品ID (关联 biz_insurance_product.id)
   */
  productId?: string | number;

  /**
   * 责任名称 (如：意外身故/伤残)
   */
  liabilityName?: string;

  /**
   * 保障额度说明 (如：50万、按比例赔付)
   */
  insuredAmountDesc?: string;

  /**
   * 详情描述 (选填的补充说明)
   */
  description?: string;

  /**
   * 排序号 (升序)
   */
  sort?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
