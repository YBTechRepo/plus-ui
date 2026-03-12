export interface InsuranceProductConfigVO {
  /**
   * id
   */
  id: string | number;

  /**
   * 产品编码
   */
  productCode: string;

  /**
   * 产品名称
   */
  productName: string;

  /**
   * 保险公司
   */
  companyCode: string;

  /**
   * 产品类型
   */
  productType: string;

  /**
   * 产品模式
   */
  productMode: number;

  /**
   * 最低保费
   */
  minPremium: number;

  /**
   * 投保链接
   */
  proposalUrl: string;

  /**
   * 产品图片
   */
  imgUrl: string;

  /**
   * 产品图片Url
   */
  imgUrlUrl: string;
  /**
   * 产品说明
   */
  description: string;

  /**
   * 产品状态
   */
  status: number;

  /**
   * 产品排序
   */
  sort: number;

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

export interface InsuranceProductConfigForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * 产品编码
   */
  productCode?: string;

  /**
   * 产品名称
   */
  productName?: string;

  /**
   * 保险公司
   */
  companyCode?: string;

  /**
   * 产品类型
   */
  productType?: string;

  /**
   * 产品模式
   */
  productMode?: number;

  /**
   * 最低保费
   */
  minPremium?: number;

  /**
   * 投保链接
   */
  proposalUrl?: string;

  /**
   * 产品图片
   */
  imgUrl?: string;

  /**
   * 产品说明
   */
  description?: string;

  /**
   * 产品状态
   */
  status?: number;

  /**
   * 产品排序
   */
  sort?: number;

  /**
   * 删除标识
   */
  delFlag?: string;

  /**
   * 乐观锁版本
   */
  version?: number;

}

export interface InsuranceProductConfigQuery extends PageQuery {

  /**
   * 产品编码
   */
  productCode?: string;

  /**
   * 产品名称
   */
  productName?: string;

  /**
   * 保险公司
   */
  companyCode?: string;

  /**
   * 产品类型
   */
  productType?: string;

  /**
   * 产品模式
   */
  productMode?: number;

  /**
   * 最低保费
   */
  minPremium?: number;

  /**
   * 产品图片
   */
  imgUrl?: string;

  /**
   * 产品状态
   */
  status?: number;

  /**
   * 产品排序
   */
  sort?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
