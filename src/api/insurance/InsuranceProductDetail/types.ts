export interface InsuranceProductDetailVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 产品ID (关联 biz_insurance_product.id)
   */
  productId: string | number;

  /**
   * 产品特点图 (JSON数组：["url1", "url2"])
   */
  featureImages: string;

  /**
   * 理赔流程图 (JSON数组：["url1"])
   */
  claimImages: string;

  /**
   * 投保须知 (JSON对象数组：[{"title":"", "content":"", "sort":1}])
   */
  insureNotice: string;

  /**
   * 条款须知文件 (JSON对象数组：[{"clauseName":"", "fileUrl":"", "sort":1}])
   */
  clauseFiles: string;

  /**
   * 乐观锁版本
   */
  version: number;

  /**
   * 删除标记(0-未删除 1-删除)
   */
  delFlag: string;

}

export interface InsuranceProductDetailForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 产品ID (关联 biz_insurance_product.id)
   */
  productId?: string | number;

  /**
   * 产品特点图 (JSON数组：["url1", "url2"])
   */
  featureImages?: string;

  /**
   * 理赔流程图 (JSON数组：["url1"])
   */
  claimImages?: string;

  /**
   * 投保须知 (JSON对象数组：[{"title":"", "content":"", "sort":1}])
   */
  insureNotice?: string;

  /**
   * 条款须知文件 (JSON对象数组：[{"clauseName":"", "fileUrl":"", "sort":1}])
   */
  clauseFiles?: string;

  /**
   * 乐观锁版本
   */
  version?: number;

  /**
   * 删除标记(0-未删除 1-删除)
   */
  delFlag?: string;

}

export interface InsuranceProductDetailQuery extends PageQuery {

  /**
   * 产品ID (关联 biz_insurance_product.id)
   */
  productId?: string | number;

  /**
   * 产品特点图 (JSON数组：["url1", "url2"])
   */
  featureImages?: string;

  /**
   * 理赔流程图 (JSON数组：["url1"])
   */
  claimImages?: string;

  /**
   * 投保须知 (JSON对象数组：[{"title":"", "content":"", "sort":1}])
   */
  insureNotice?: string;

  /**
   * 条款须知文件 (JSON对象数组：[{"clauseName":"", "fileUrl":"", "sort":1}])
   */
  clauseFiles?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
