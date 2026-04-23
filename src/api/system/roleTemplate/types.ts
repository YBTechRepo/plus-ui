export interface RoleTemplateVO {
  /**
   * 模板ID
   */
  id: string | number;

  /**
   * 模板名称
   */
  templateName: string;

  /**
   * 模板描述
   */
  remark: string;

  /**
   * 角色及权限配置(JSON格式)
   */
  rolesJson: string;

  /**
   * 状态
   */
  status: string;

  /**
   * 创建时间
   */
  createTime: string;
}

export interface SubRoleTemplate {
  roleName: string;
  roleKey: string;
  menuIds: (string | number)[];
  sort: number;
}

export interface RoleTemplateForm extends BaseEntity {
  /**
   * 模板ID
   */
  id?: string | number;

  /**
   * 模板名称
   */
  templateName?: string;

  /**
   * 模板描述
   */
  remark?: string;

  /**
   * 角色及权限配置(JSON格式)
   */
  rolesJson?: string;

  /**
   * 状态
   */
  status?: string;

  /**
   * 关联的租户套餐ID
   */
  tenantPackageId?: string | number;

  /**
   * 创建时间
   */
  createTime?: string;

  subRoles?: SubRoleTemplate[];
}

export interface RoleTemplateQuery extends PageQuery {
  /**
   * 模板名称
   */
  templateName?: string;

  /**
   * 状态
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
