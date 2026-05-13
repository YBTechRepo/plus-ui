import { CommissionRecordQuery, CommissionRecordVO } from '@/api/commission/CommissionRecord/types';

export interface CommissionRecordAdminVO extends CommissionRecordVO {
  /**
   * 租户号
   */
  tenantId?: string | number;

  /**
   * 租户名称
   */
  tenantName?: string;
}

export interface CommissionRecordAdminQuery extends CommissionRecordQuery {
  /**
   * 租户号
   */
  tenantId?: string | number;
}
