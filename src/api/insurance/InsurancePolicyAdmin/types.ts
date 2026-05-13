import { InsurancePolicyQuery, InsurancePolicyVO } from '@/api/insurance/InsurancePolicy/types';

export interface InsurancePolicyAdminVO extends InsurancePolicyVO {
  /**
   * 租户编号
   */
  tenantId?: string;

  /**
   * 租户名称
   */
  tenantName?: string;
}

export interface InsurancePolicyAdminQuery extends InsurancePolicyQuery {
  /**
   * 租户编号
   */
  tenantId?: string;

  /**
   * 租户名称
   */
  tenantName?: string;
}
