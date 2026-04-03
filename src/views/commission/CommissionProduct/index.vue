<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="产品编码" prop="productCode">
              <el-input v-model="queryParams.productCode" placeholder="请输入产品编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="生效开始时间" prop="effectiveStart">
              <el-date-picker clearable
                v-model="queryParams.effectiveStart"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择生效开始时间"
              />
            </el-form-item>
            <el-form-item label="生效结束时间" prop="effectiveEnd">
              <el-date-picker clearable
                v-model="queryParams.effectiveEnd"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择生效结束时间"
              />
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择状态" clearable >
                <el-option v-for="dict in insurance_product_commission_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['commission:CommissionProduct:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['commission:CommissionProduct:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['commission:CommissionProduct:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['commission:CommissionProduct:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="CommissionProductList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="ID" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="产品ID" align="center" prop="productId" />
        <el-table-column label="产品编码" align="center" prop="productCode" />
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="项目负责人比例" align="center" prop="projectRatio">
          <template #default="scope">
            <span>{{ scope.row.projectRatio != null ? (Number(scope.row.projectRatio) * 100).toFixed(0) + '%' : '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="团队负责人比例" align="center" prop="teamRatio">
          <template #default="scope">
            <span>{{ scope.row.teamRatio != null ? (Number(scope.row.teamRatio) * 100).toFixed(0) + '%' : '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="业务员比例" align="center" prop="salesRatio">
          <template #default="scope">
            <span>{{ scope.row.salesRatio != null ? (Number(scope.row.salesRatio) * 100).toFixed(0) + '%' : '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="规则策略" align="center" prop="ruleStrategy">
          <template #default="scope">
            <dict-tag :options="commission_calc_strategy" :value="scope.row.ruleStrategy"/>
          </template>
        </el-table-column>
        <el-table-column label="生效开始时间" align="center" prop="effectiveStart" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.effectiveStart, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="生效结束时间" align="center" prop="effectiveEnd" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.effectiveEnd, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="insurance_product_commission_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <!-- <el-table-column label="乐观锁版本号" align="center" prop="version" /> -->
        <!-- <el-table-column label="删除标志" align="center" prop="delFlag" /> -->
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['commission:CommissionProduct:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['commission:CommissionProduct:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改特殊产品费率配置对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="CommissionProductFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="产品名称" prop="productName">
          <el-select v-model="form.productName" placeholder="请选择产品" filterable clearable @change="handleProductChange">
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.productName"
              :value="item.productName"
            >
              <span style="float: left">{{ item.productName }}</span>
              <span style="float: right; color: var(--el-text-color-secondary); font-size: 13px">{{ item.productCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="项目负责人比例" prop="projectRatioDisplay">
          <div style="display:flex;align-items:center;width:100%">
            <el-slider v-model="projectRatioDisplay" :min="0" :max="100" :step="1" show-input :show-input-controls="false" style="flex:1" />
            <span style="margin-left:8px">%</span>
          </div>
        </el-form-item>
        <el-form-item label="团队负责人比例" prop="teamRatioDisplay">
          <div style="display:flex;align-items:center;width:100%">
            <el-slider v-model="teamRatioDisplay" :min="0" :max="100" :step="1" show-input :show-input-controls="false" style="flex:1" />
            <span style="margin-left:8px">%</span>
          </div>
        </el-form-item>
        <el-form-item label="业务员比例" prop="salesRatioDisplay" class="is-required">
          <div style="display:flex;align-items:center;width:100%">
            <el-slider v-model="salesRatioDisplay" :min="0" :max="100" :step="1" show-input :show-input-controls="false" style="flex:1" />
            <span style="margin-left:8px">%</span>
          </div>
        </el-form-item>
        <el-form-item label="规则策略" prop="ruleStrategy">
          <el-select v-model="form.ruleStrategy" placeholder="请选择规则策略">
            <el-option
                v-for="dict in commission_calc_strategy"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="生效开始时间" prop="effectiveStart">
          <el-date-picker clearable
            v-model="form.effectiveStart"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择生效开始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="生效结束时间" prop="effectiveEnd">
          <el-date-picker clearable
            v-model="form.effectiveEnd"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择生效结束时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option
                v-for="dict in insurance_product_commission_status"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="乐观锁版本号" prop="version">
          <el-input v-model="form.version" placeholder="请输入乐观锁版本号" />
        </el-form-item> -->
        <!-- <el-form-item label="删除标志" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
        </el-form-item> -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CommissionProduct" lang="ts">
import { listCommissionProduct, getCommissionProduct, delCommissionProduct, addCommissionProduct, updateCommissionProduct } from '@/api/commission/CommissionProduct';
import { CommissionProductVO, CommissionProductQuery, CommissionProductForm } from '@/api/commission/CommissionProduct/types';
import { listInsuranceTenantProduct } from '@/api/insurance/InsuranceTenantProduct';
import type { InsuranceTenantProductVO } from '@/api/insurance/InsuranceTenantProduct/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_product_commission_status, commission_calc_strategy } = toRefs<any>(proxy?.useDict('insurance_product_commission_status', 'commission_calc_strategy'));

const CommissionProductList = ref<CommissionProductVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const CommissionProductFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CommissionProductForm = {
  id: undefined,
  productId: undefined,
  productCode: undefined,
  productName: undefined,
  projectRatio: 0,
  teamRatio: 0,
  salesRatio: 0,
  ruleStrategy: undefined,
  effectiveStart: undefined,
  effectiveEnd: undefined,
  status: undefined,
  version: undefined,
  delFlag: undefined,
}

/** 比例展示层 (0-100整数)，后端存 0-1 */
const projectRatioDisplay = ref<number>(0);
const teamRatioDisplay = ref<number>(0);
const salesRatioDisplay = ref<number>(0);

/** 产品下拉选项 */
const productOptions = ref<InsuranceTenantProductVO[]>([]);

/** 异步加载上架中的租户产品列表 */
const loadProductOptions = async () => {
  const res = await listInsuranceTenantProduct({ status: 0, pageNum: 1, pageSize: 500 });
  productOptions.value = res.rows ?? [];
};

/** 选中产品后自动填充 productId 和 productCode */
const handleProductChange = (selectedName: string) => {
  const product = productOptions.value.find(p => p.productName === selectedName);
  if (product) {
    form.value.productId   = product.productId as number;
    form.value.productCode = product.productCode;
  } else {
    form.value.productId = undefined;
    form.value.productCode = undefined;
  }
};

const validateRatioSum = (_: any, __: any, callback: any) => {
  const total = projectRatioDisplay.value + teamRatioDisplay.value + salesRatioDisplay.value;
  if (total !== 100) {
    callback(new Error(`三项比例之和必须等于100%，当前为 ${total}%`));
  } else {
    callback();
  }
};

const validateSalesRatio = (_: any, __: any, callback: any) => {
  if (salesRatioDisplay.value === undefined || salesRatioDisplay.value === null || salesRatioDisplay.value === 0) {
    callback(new Error('业务员比例不能为空且必须大于0'));
  } else {
    validateRatioSum(_, __, callback);
  }
};

watch(projectRatioDisplay, (val) => { form.value.projectRatio = parseFloat((val / 100).toFixed(4)); });
watch(teamRatioDisplay,    (val) => { form.value.teamRatio    = parseFloat((val / 100).toFixed(4)); });
watch(salesRatioDisplay,   (val) => { form.value.salesRatio   = parseFloat((val / 100).toFixed(4)); });
const data = reactive<PageData<CommissionProductForm, CommissionProductQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productCode: undefined,
    productName: undefined,
    effectiveStart: undefined,
    effectiveEnd: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "ID不能为空", trigger: "blur" }
    ],
    productId: [
      { required: true, message: "产品ID不能为空", trigger: "blur" }
    ],
    productCode: [
      { required: true, message: "产品编码不能为空", trigger: "blur" }
    ],
    productName: [
      { required: true, message: "产品名称不能为空", trigger: "blur" }
    ],
    projectRatioDisplay: [{ validator: validateRatioSum, trigger: 'change' }],
    teamRatioDisplay:    [{ validator: validateRatioSum, trigger: 'change' }],
    salesRatioDisplay:   [
      { validator: validateSalesRatio, trigger: 'change' }
    ],
    ruleStrategy: [
      { required: true, message: "规则策略不能为空", trigger: "change" }
    ],
    effectiveStart: [
      { required: true, message: "生效开始时间不能为空", trigger: "blur" }
    ],
    effectiveEnd: [
      { required: true, message: "生效结束时间不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询特殊产品费率配置列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCommissionProduct(queryParams.value);
  CommissionProductList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  projectRatioDisplay.value = 0;
  teamRatioDisplay.value = 0;
  salesRatioDisplay.value = 0;
  CommissionProductFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: CommissionProductVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  loadProductOptions();
  dialog.visible = true;
  dialog.title = "添加特殊产品费率配置";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: CommissionProductVO) => {
  reset();
  loadProductOptions();
  const _id = row?.id || ids.value[0]
  const res = await getCommissionProduct(_id);
  Object.assign(form.value, res.data);
  projectRatioDisplay.value = res.data.projectRatio != null ? Math.round(Number(res.data.projectRatio) * 100) : 0;
  teamRatioDisplay.value    = res.data.teamRatio    != null ? Math.round(Number(res.data.teamRatio)    * 100) : 0;
  salesRatioDisplay.value   = res.data.salesRatio   != null ? Math.round(Number(res.data.salesRatio)   * 100) : 0;
  dialog.visible = true;
  dialog.title = "修改特殊产品费率配置";
}

/** 提交按钮 */
const submitForm = () => {
  CommissionProductFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateCommissionProduct(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addCommissionProduct(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: CommissionProductVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除特殊产品费率配置编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delCommissionProduct(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('commission/CommissionProduct/export', {
    ...queryParams.value
  }, `CommissionProduct_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
