export interface BannerConfigVO {
  /**
   * 主键ID
   */
  id: string | number;

  /**
   * 轮播图标题
   */
  title: string;

  /**
   * 轮播图内容
   */
  content: string;

  /**
   * 图片地址id
   */
  image: string | number;

  /**
   * 图片地址idUrl
   */
  imageUrl: string;
  /**
   * 跳转类型
   */
  jumpType: number;

  /**
   * 跳转链接
   */
  jumpUrl: string;

  /**
   * 排序
   */
  sortOrder: number;

  /**
   * 状态
   */
  status: number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 乐观锁版本
   */
  version: number;

  /**
   * 租户ID
   */
  tenantId: string | number;
}

export interface BannerConfigForm extends BaseEntity {
  /**
   * 主键ID
   */
  id?: string | number;

  /**
   * 轮播图标题
   */
  title?: string;

  /**
   * 轮播图内容
   */
  content?: string;

  /**
   * 图片地址id
   */
  image?: any;

  /**
   * 跳转类型
   */
  jumpType?: number;

  /**
   * 跳转链接
   */
  jumpUrl?: string;

  /**
   * 排序
   */
  sortOrder?: number;

  /**
   * 状态
   */
  status?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 乐观锁版本
   */
  version?: number;

  /**
   * 租户ID
   */
  tenantId?: string | number;
}

export interface BannerConfigQuery extends PageQuery {

  /**
   * 轮播图标题
   */
  title?: string;

  /**
   * 跳转类型
   */
  jumpType?: number;

  /**
   * 跳转链接
   */
  jumpUrl?: string;

  /**
   * 排序
   */
  sortOrder?: number;

  /**
   * 状态
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
