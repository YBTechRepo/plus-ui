<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="产品ID" prop="productId">
              <el-input v-model="queryParams.productId" placeholder="请输入产品ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品编码" prop="productCode">
              <el-input v-model="queryParams.productCode" placeholder="请输入产品编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="启用状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择启用状态" clearable>
                <el-option v-for="dict in insurance_product_commission_status" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:InsuranceProductCommission:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Refresh" @click="handleSync" v-hasPermi="['insurance:InsuranceProductCommission:edit']"
              >一键同步</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsuranceProductCommission:export']"
              >导出</el-button
            >
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsuranceProductCommissionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="产品编码" align="center" prop="productCode" />
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="佣金费率配置" align="center" prop="commissionConfig">
          <template #default="scope">
            <template v-if="scope.row.commissionConfig">
              <el-tag v-for="(item, idx) in parseCommissionConfig(scope.row.commissionConfig)" :key="idx" size="small" type="info" class="mr-1 mb-1">
                {{ (Number(item.commissionRate) * 100).toFixed(1) }}% ({{ item.effectiveTime ? item.effectiveTime.slice(0, 10) : '?' }}
                ~
                {{ item.expirationTime ? item.expirationTime.slice(0, 10) : '?' }})
              </el-tag>
            </template>
            <span v-else style="color: #999">未配置</span>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" align="center" prop="status" width="100">
          <template #default="scope">
            <dict-tag :options="insurance_product_commission_status" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right" width="120" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click="handleUpdate(scope.row)"
                v-hasPermi="['insurance:InsuranceProductCommission:edit']"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="primary"
                icon="Delete"
                @click="handleDelete(scope.row)"
                v-hasPermi="['insurance:InsuranceProductCommission:remove']"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 新增 / 修改弹窗 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="820px" append-to-body>
      <el-form ref="CommissionFormRef" :model="dialogForm" :rules="dialogRules" label-width="90px">
        <el-form-item label="产品名称" prop="productName">
          <el-select
            v-model="dialogForm.productName"
            placeholder="请选择产品"
            filterable
            style="width: 100%"
            :disabled="isEdit"
            @change="handleProductChange"
          >
            <el-option v-for="item in productOptions" :key="item.id" :label="item.productName" :value="item.productName">
              <span>{{ item.productName }}</span>
              <span style="float: right; color: #8492a6; font-size: 12px">{{ item.productCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-select v-model="dialogForm.status" placeholder="请选择启用状态" style="width: 100%">
            <el-option
              v-for="dict in insurance_product_commission_status"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 费率时间段配置表格 -->
      <div style="margin-top: 8px">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px">
          <span style="font-weight: bold; color: #606266">佣金费率时间段配置</span>
          <el-button type="primary" plain icon="Plus" size="small" @click="addRow">新增一行</el-button>
        </div>
        <div v-if="currentServiceFee != null" style="color: #f56c6c; font-weight: bold; margin-bottom: 8px; font-size: 13px">
          ⚠️ 当前产品服务费为 {{ (Number(currentServiceFee) * 100).toFixed(2) }}%，设置的佣金比例不应超过该数字。
        </div>
        <el-alert type="info" :closable="false" class="mb-2">
          <template #title> 费率变动时，请将旧记录的失效时间修改为变动前一天，再新增一条记录。时间段不允许重叠。 </template>
        </el-alert>
        <el-table :data="commissionRows" border size="small">
          <el-table-column label="佣金比例" width="180">
            <template #default="scope">
              <div style="display: flex; align-items: center; gap: 6px; padding: 4px 8px">
                <el-input-number v-model="scope.row.rateDisplay" :min="0" :max="100" :step="1" controls-position="right" style="width: 120px" />
                <span style="font-weight: bold">%</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="生效时间" width="195">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.effectiveTime"
                type="datetime"
                placeholder="请选择生效时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="失效时间" width="195">
            <template #default="scope">
              <el-date-picker
                v-model="scope.row.expirationTime"
                type="datetime"
                placeholder="请选择失效时间"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
              />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="60" align="center">
            <template #default="scope">
              <el-button type="danger" icon="Delete" circle size="small" @click="removeRow(scope.$index)" />
            </template>
          </el-table-column>
        </el-table>
        <div v-if="commissionRows.length === 0" style="text-align: center; color: #999; padding: 16px">请点击「新增一行」添加费率配置</div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InsuranceProductCommission" lang="ts">
import {
  listInsuranceProductCommission,
  getInsuranceProductCommission,
  delInsuranceProductCommission,
  addInsuranceProductCommission,
  updateInsuranceProductCommission
} from '@/api/insurance/InsuranceProductCommission';
import {
  InsuranceProductCommissionVO,
  InsuranceProductCommissionQuery,
  InsuranceProductCommissionForm
} from '@/api/insurance/InsuranceProductCommission/types';
import { listInsuranceTenantProduct } from '@/api/insurance/InsuranceTenantProduct';
import { getServiceFeeConfig } from '@/api/insurance/InsuranceProductConfig';
import type { InsuranceTenantProductVO } from '@/api/insurance/InsuranceTenantProduct/types';
import { ElLoading } from 'element-plus';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_product_commission_status } = toRefs<any>(proxy?.useDict('insurance_product_commission_status'));

const InsuranceProductCommissionList = ref<InsuranceProductCommissionVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const isEdit = ref(false);

const queryFormRef = ref<ElFormInstance>();
const CommissionFormRef = ref<ElFormInstance>();
const dialog = reactive<DialogOption>({ visible: false, title: '' });

/** 产品下拉 */
const productOptions = ref<InsuranceTenantProductVO[]>([]);
const loadProductOptions = async () => {
  const res = await listInsuranceTenantProduct({ status: 0, pageNum: 1, pageSize: 500 });
  productOptions.value = res.rows ?? [];
};

/** 弹窗顶层字段 */
const dialogForm = ref<any>({
  id: undefined,
  productId: undefined,
  productCode: undefined,
  productName: undefined,
  status: undefined
});

const dialogRules = {
  productName: [{ required: true, message: '请选择产品', trigger: 'change' }],
  status: [{ required: true, message: '请选择启用状态', trigger: 'change' }]
};

/** 动态费率行 */
const commissionRows = ref<any[]>([]);

const addRow = () => {
  commissionRows.value.push({ rateDisplay: 0, effectiveTime: undefined, expirationTime: undefined });
};
const removeRow = (index: number) => {
  commissionRows.value.splice(index, 1);
};

/** 当前选中产品的服务费 (BigDecimal 0-1) */
const currentServiceFee = ref<number | null>(null);

/** 选中产品回填 */
const handleProductChange = (selectedName: string) => {
  const product = productOptions.value.find((p) => p.productName === selectedName);
  if (product) {
    dialogForm.value.productId = product.productId;
    dialogForm.value.productCode = product.productCode;
    currentServiceFee.value = (product as any).serviceFee ?? null;
  }
};

/** 解析列表中的 commissionConfig JSON（用于表格展示） */
const parseCommissionConfig = (raw: any): any[] => {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const queryParams = ref<InsuranceProductCommissionQuery>({
  pageNum: 1,
  pageSize: 10,
  productId: undefined,
  productCode: undefined,
  productName: undefined,
  status: undefined,
  params: {}
});

/** 查询列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceProductCommission(queryParams.value);
  InsuranceProductCommissionList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 重置弹窗状态 */
const cancel = () => {
  dialog.visible = false;
  commissionRows.value = [];
  currentServiceFee.value = null;
  dialogForm.value = { id: undefined, productId: undefined, productCode: undefined, productName: undefined, status: undefined };
  CommissionFormRef.value?.resetFields();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: InsuranceProductCommissionVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增 */
const handleAdd = () => {
  cancel();
  isEdit.value = false;
  loadProductOptions();
  commissionRows.value = [{ rateDisplay: 0, effectiveTime: undefined, expirationTime: undefined }];
  dialog.visible = true;
  dialog.title = '新增佣金配置';
};

/** 修改 */
const handleUpdate = async (row?: InsuranceProductCommissionVO) => {
  cancel();
  isEdit.value = true;
  loadProductOptions();
  const _id = row?.id || ids.value[0];
  const res = await getInsuranceProductCommission(_id);
  const d = res.data as any;
  dialogForm.value = {
    id: d.id,
    productId: d.productId,
    productCode: d.productCode,
    productName: d.productName,
    status: d.status
  };
  // 从 productOptions 中查找对应的服务费（用 productId 精确匹配）
  await loadProductOptions();
  const matched = productOptions.value.find((p) => String(p.productId) === String(d.productId));
  currentServiceFee.value = matched ? ((matched as any).serviceFee ?? null) : null;
  // 解析 commissionConfig JSON → 填充费率行
  try {
    const cfg = d.commissionConfig;
    let parsed = typeof cfg === 'string' ? JSON.parse(cfg) : cfg;
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    if (Array.isArray(parsed) && parsed.length > 0) {
      commissionRows.value = parsed.map((item: any) => ({
        rateDisplay: parseFloat((Number(item.commissionRate) * 100).toFixed(2)),
        effectiveTime: item.effectiveTime,
        expirationTime: item.expirationTime
      }));
    } else {
      commissionRows.value = [{ rateDisplay: 0, effectiveTime: undefined, expirationTime: undefined }];
    }
  } catch {
    commissionRows.value = [{ rateDisplay: 0, effectiveTime: undefined, expirationTime: undefined }];
  }
  dialog.visible = true;
  dialog.title = '修改佣金配置';
};

/** 提交：把 commissionRows 序列化进 commissionConfig 字段 */
const submitForm = () => {
  CommissionFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    if (commissionRows.value.length === 0) {
      proxy?.$modal.msgWarning('请至少添加一条费率记录！');
      return;
    }
    const hasEmpty = commissionRows.value.some((r) => !r.effectiveTime || !r.expirationTime);
    if (hasEmpty) {
      proxy?.$modal.msgWarning('请填写所有费率记录的生效时间和失效时间！');
      return;
    }

    const configPayload = commissionRows.value.map((row: any) => ({
      commissionRate: parseFloat((row.rateDisplay / 100).toFixed(4)),
      effectiveTime: row.effectiveTime,
      expirationTime: row.expirationTime
    }));

    const payload: InsuranceProductCommissionForm = {
      ...dialogForm.value,
      commissionConfig: JSON.stringify(configPayload),
      // 保留 commissionRate / effectiveTime 等字段为 undefined，后端以 JSON 为准
      commissionRate: undefined,
      effectiveTime: undefined,
      expirationTime: undefined
    } as any;

    buttonLoading.value = true;
    try {
      if (isEdit.value) {
        await updateInsuranceProductCommission(payload);
      } else {
        await addInsuranceProductCommission(payload);
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    } finally {
      buttonLoading.value = false;
    }
  });
};

/** 删除 */
const handleDelete = async (row?: InsuranceProductCommissionVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除该佣金配置？').finally(() => (loading.value = false));
  await delInsuranceProductCommission(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出 */
const handleExport = () => {
  proxy?.download(
    'insurance/InsuranceProductCommission/export',
    {
      ...queryParams.value
    },
    `InsuranceProductCommission_${new Date().getTime()}.xlsx`
  );
};

/** 一键同步 */
const handleSync = async () => {
  try {
    await proxy?.$modal.confirm('确认要一键同步所有产品的佣金配置吗？');
    buttonLoading.value = true;
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在同步产品佣金配置，请稍候...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    try {
      // 1. 获取所有产品
      const productRes = await listInsuranceTenantProduct({ pageNum: 1, pageSize: 1000 });
      const products = productRes.rows || [];
      if (products.length === 0) {
        proxy?.$modal.msgWarning('没有可同步的产品');
        loadingInstance.close();
        return;
      }

      // 2. 遍历产品拉取费率并保存
      let successCount = 0;
      let failCount = 0;

      for (const product of products) {
        try {
          const configRes = await getServiceFeeConfig(product.productId as number);
          if (configRes && configRes.data) {
            const feeConfigArr = typeof configRes.data === 'string' ? JSON.parse(configRes.data) : configRes.data;

            if (Array.isArray(feeConfigArr) && feeConfigArr.length > 0) {
              const commissionConfig = feeConfigArr.map((item: any) => ({
                commissionRate: item.feeRatio != null ? parseFloat(item.feeRatio) : 0,
                effectiveTime: item.effectiveStartTime,
                expirationTime: item.effectiveEndTime
              }));

              const payload: any = {
                productId: product.productId,
                productCode: product.productCode,
                productName: product.productName,
                status: 0,
                commissionConfig: JSON.stringify(commissionConfig)
              };

              const existRes = await listInsuranceProductCommission({ productId: product.productId, pageNum: 1, pageSize: 1 } as any);
              if (existRes.rows && existRes.rows.length > 0) {
                payload.id = existRes.rows[0].id;
                await updateInsuranceProductCommission(payload);
              } else {
                await addInsuranceProductCommission(payload);
              }
              successCount++;
            } else {
              failCount++;
            }
          } else {
            failCount++;
          }
        } catch (e) {
          console.warn(`同步产品 ${product.productName} 失败`, e);
          failCount++;
        }
      }
      proxy?.$modal.msgSuccess(`同步完成！成功同步 ${successCount} 个资源，忽略/失败 ${failCount} 个资源。`);
      await getList();
    } catch (err) {
      // 取消
    } finally {
      loadingInstance.close();
      buttonLoading.value = false;
    }
  } catch (err) {
    // 确认框取消
  }
};

onMounted(() => {
  getList();
});
</script>
