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
   * 分类ID
   */
  categoryId: string | number;

  /**
   * 分类名称
   */
  categoryName: string;

  /**
   * 营销标签
   */
  marketingTags: string;

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

  /**
   * 产品特点
   */
  productFeatures?: string;

  /**
   * 服务费配置
   */
  serviceFeeConfig?: string;

  /**
   * 投保扩展字段模板
   */
  insureFormSchema?: string;

  /**
   * 理赔说明步骤列表
   */
  claimInstructions?: ClaimStepItem[];

  /**
   * 朋友圈营销文案
   */
  marketingCopy?: string;

  /**
   * 朋友圈营销素材图片
   */
  marketingImages?: string[];

  insureMode: number;

  paymentMode: number;

  /**
   * 运费支付方式
   */
  freightPayType?: 'prepaid' | 'collect';

  /**
   * 运费金额
   */
  freight?: number;

  cardSpecs?: CardSpecItem[];
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

  /**
   * 产品特点
   */
  productFeatures?: string;

  /**
   * 服务费配置
   */
  serviceFeeConfig?: string;

  /**
   * 投保扩展字段模板
   */
  insureFormSchema?: string;

  /**
   * 理赔说明步骤列表
   */
  claimInstructions?: ClaimStepItem[];

  /**
   * 朋友圈营销文案
   */
  marketingCopy?: string;

  /**
   * 朋友圈营销素材图片
   */
  marketingImages?: string[];

  insureMode?: number;

  paymentMode?: number;

  /**
   * 运费支付方式
   */
  freightPayType?: 'prepaid' | 'collect';

  /**
   * 运费金额
   */
  freight?: number;

  cardSpecs?: CardSpecItem[];
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

/**
 * 理赔说明步骤对象
 */
export interface ClaimStepItem {
  title?: string;
  content?: string;
  sort?: number;
}

/**
 * 卡密产品规格
 */
export interface CardSpecItem {
  specId?: string | number;
  specName?: string;
  price?: number;
  stock?: number;
  sort?: number;
  status?: number;
}

export interface ServiceFeeCommissionSyncResult {
  productCount: number;
  tenantCount: number;
  successCount: number;
  skippedCount: number;
  failCount: number;
  details?: SyncResultDetail[];
}

export type TenantProductSyncResult = ServiceFeeCommissionSyncResult;

export interface SyncResultDetail {
  type?: 'commission' | 'tenantProduct' | 'status' | string;
  action?: string;
  productId?: string | number;
  productCode?: string;
  productName?: string;
  tenantCount?: number;
  successCount?: number;
  failCount?: number;
  addCount?: number;
  updateCount?: number;
  status?: string;
  statusLabel?: string;
}
