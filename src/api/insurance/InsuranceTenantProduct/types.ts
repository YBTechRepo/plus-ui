export interface InsuranceTenantProductVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * 产品ID
   */
  productId: string | number;

  /**
   * 保险公司
   */
  companyCode: string;

  /**
   * 产品代码
   */
  productCode: string;

  /**
   * 产品名称
   */
  productName: string;

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
   * 产品头图
   */
  img: string;

  /**
   * 产品特点
   */
  description: string;

  /**
   * 上架状态
   */
  status: string;

  /**
   * 自定义排序
   */
  sort: number;

  /**
   * 乐观锁版本
   */
  version: number;

  /**
   * 删除标记
   */
  delFlag: string;

}

export interface InsuranceTenantProductForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * 产品ID
   */
  productId?: string | number;

  /**
   * 保险公司
   */
  companyCode?: string;

  /**
   * 产品代码
   */
  productCode?: string;

  /**
   * 产品名称
   */
  productName?: string;

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
   * 产品头图
   */
  img?: string;

  /**
   * 产品特点
   */
  description?: string;

  /**
   * 上架状态
   */
  status?: string;

  /**
   * 自定义排序
   */
  sort?: number;

  /**
   * 乐观锁版本
   */
  version?: number;

  /**
   * 删除标记
   */
  delFlag?: string;

}

export interface InsuranceTenantProductQuery extends PageQuery {

  /**
   * 保险公司
   */
  companyCode?: string;

  /**
   * 产品代码
   */
  productCode?: string;

  /**
   * 产品名称
   */
  productName?: string;

  /**
   * 产品类型
   */
  productType?: string;

  /**
   * 产品模式
   */
  productMode?: number;

  /**
   * 上架状态
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
