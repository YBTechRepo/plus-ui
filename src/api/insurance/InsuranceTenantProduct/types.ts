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
   * 投保模式
   */
  insureMode?: number;

  /**
   * 支付模式
   */
  paymentMode?: number;

  /**
   * 最低保费
   */
  minPremium: number;

  /**
   * 产品头图
   */
  img: string;

  /**
   * 产品头图访问地址
   */
  imgUrl?: string;

  /**
   * 产品头图访问地址
   */
  imgUrlUrl?: string;

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
   * 服务费比例
   */
  serviceFee?: number | string;

  /**
   * 净费出单金额
   */
  netPremium?: number | string;

  /**
   * 乐观锁版本
   */
  version: number;

  /**
   * 删除标记
   */
  delFlag: string;

  /**
   * 产品分类ID
   */
  categoryId?: string | number;

  /**
   * 产品分类名称
   */
  categoryName?: string;

  /**
   * 营销标签(逗号分隔)
   */
  marketingTags?: string;

  /**
   * 投保链接
   */
  proposalUrl?: string;

  /**
   * 投保链接(兼容后端历史大写字段)
   */
  ProposalUrl?: string;
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
   * 投保模式
   */
  insureMode?: number;

  /**
   * 支付模式
   */
  paymentMode?: number;

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

  /**
   * 产品分类ID
   */
  categoryId?: string | number;

  /**
   * 产品分类名称
   */
  categoryName?: string;

  /**
   * 营销标签(逗号分隔)
   */
  marketingTags?: string;

  /**
   * 投保链接
   */
  proposalUrl?: string;
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
   * 产品分类ID
   */
  categoryId?: string | number;

  /**
   * 日期范围参数
   */
  params?: {
    /**
     * 营销标签筛选，后端按 marketing_tags 做 FIND_IN_SET 查询
     */
    marketingTag?: string;
    [key: string]: any;
  };
}
