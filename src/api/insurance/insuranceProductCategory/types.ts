export interface InsuranceProductCategoryVO {
  /**
   * 分类ID
   */
  categoryId: string | number;

  /**
   * 父分类ID
   */
  parentId: string | number;

  /**
   * 祖级列表
   */
  ancestors: string;

  /**
   * 分类名称
   */
  categoryName: string;

  /**
   * 分类图标 
   */
  icon: string;

  /**
   * 图标颜色
   */
  iconColor?: string;

  /**
   * 显示顺序
   */
  sort: number;

  /**
   * 分类状态（0正常 1停用）
   */
  status: number;

  /**
   * 删除标志
   */
  delFlag: string;

  /**
   * 
   */
  version: number;

  /**
   * 绑定的营销标签(逗号分隔)
   */
  marketingTags?: string;
}

export interface InsuranceProductCategoryForm extends BaseEntity {
  /**
   * 分类ID
   */
  categoryId?: string | number;

  /**
   * 父分类ID
   */
  parentId?: string | number;

  /**
   * 祖级列表
   */
  ancestors?: string;

  /**
   * 分类名称
   */
  categoryName?: string;

  /**
   * 分类图标 
   */
  icon?: string;

  /**
   * 图标颜色
   */
  iconColor?: string;

  /**
   * 显示顺序
   */
  sort?: number;

  /**
   * 分类状态（0正常 1停用）
   */
  status?: number;

  /**
   * 删除标志
   */
  delFlag?: string;

  /**
   * 
   */
  version?: number;

  /**
   * 绑定的营销标签(逗号分隔)
   */
  marketingTags?: string;
}

export interface InsuranceProductCategoryQuery extends PageQuery {

  /**
   * 父分类ID
   */
  parentId?: string | number;

  /**
   * 祖级列表
   */
  ancestors?: string;

  /**
   * 分类名称
   */
  categoryName?: string;

  /**
   * 分类图标 
   */
  icon?: string;

  /**
   * 显示顺序
   */
  sort?: number;

  /**
   * 分类状态（0正常 1停用）
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
