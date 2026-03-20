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
              <el-select v-model="queryParams.status" placeholder="请选择启用状态" clearable >
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:InsuranceProductCommission:add']">新增</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:InsuranceProductCommission:edit']">修改</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['insurance:InsuranceProductCommission:remove']">删除</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsuranceProductCommission:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsuranceProductCommissionList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="id" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="产品ID" align="center" prop="productId" />
        <el-table-column label="产品编码" align="center" prop="productCode" />
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="基础佣金比例" align="center" prop="commissionRate">
          <template #default="scope">
            <span>{{ scope.row.commissionRate != null ? (Number(scope.row.commissionRate) * 100).toFixed(2) + '%' : '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="费率生效时间" align="center" prop="effectiveTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.effectiveTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="费率失效时间" align="center" prop="expirationTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.expirationTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="启用状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="insurance_product_commission_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <!-- <el-table-column label="乐观锁版本号" align="center" prop="version" /> -->
        <!-- <el-table-column label="删除标志" align="center" prop="delFlag" /> -->
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['insurance:InsuranceProductCommission:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['insurance:InsuranceProductCommission:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改佣金配置对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="InsuranceProductCommissionFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品名称" prop="productName">
          <el-select
            v-model="form.productName"
            placeholder="请选择产品"
            filterable
            style="width: 100%"
            @change="handleProductChange"
          >
            <el-option
              v-for="item in productOptions"
              :key="item.id"
              :label="item.productName"
              :value="item.productName"
            >
              <span>{{ item.productName }}</span>
              <span style="float:right;color:#8492a6;font-size:12px">{{ item.productCode }}</span>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="基础佣金比例" prop="commissionRateDisplay">
          <div style="display: flex; align-items: center; width: 100%;">
            <el-slider
              v-model="commissionRateDisplay"
              :min="0"
              :max="100"
              :step="1"
              show-input
              :show-input-controls="false"
              style="flex: 1;"
            />
            <span style="margin-left: 10px; white-space: nowrap;">%</span>
          </div>
        </el-form-item>
        <el-form-item label="费率生效时间" prop="effectiveTime">
          <el-date-picker clearable
            v-model="form.effectiveTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择费率生效时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="费率失效时间" prop="expirationTime">
          <el-date-picker clearable
            v-model="form.expirationTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择费率失效时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择启用状态">
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

<script setup name="InsuranceProductCommission" lang="ts">
import { listInsuranceProductCommission, getInsuranceProductCommission, delInsuranceProductCommission, addInsuranceProductCommission, updateInsuranceProductCommission } from '@/api/insurance/InsuranceProductCommission';
import { InsuranceProductCommissionVO, InsuranceProductCommissionQuery, InsuranceProductCommissionForm } from '@/api/insurance/InsuranceProductCommission/types';
import { listInsuranceTenantProduct } from '@/api/insurance/InsuranceTenantProduct';
import type { InsuranceTenantProductVO } from '@/api/insurance/InsuranceTenantProduct/types';

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

const queryFormRef = ref<ElFormInstance>();
const InsuranceProductCommissionFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: InsuranceProductCommissionForm = {
  id: undefined,
  productId: undefined,
  productCode: undefined,
  productName: undefined,
  commissionRate: 0,
  effectiveTime: undefined,
  expirationTime: undefined,
  status: undefined,
  version: undefined,
  delFlag: undefined,
}

/** 前端展示的百分比值 (0-100)，与 form.commissionRate (0-1) 之间自动转换 */
const commissionRateDisplay = ref<number>(0);

/** 产品下拉选项 */
const productOptions = ref<InsuranceTenantProductVO[]>([]);

/** 异步加载启用中的产品列表 */
const loadProductOptions = async () => {
  const res = await listInsuranceTenantProduct({ status: 0, pageNum: 1, pageSize: 500 });
  productOptions.value = res.rows ?? [];
};

/** 选中产品后自动填充 productId 和 productCode */
const handleProductChange = (selectedName: string) => {
  const product = productOptions.value.find(p => p.productName === selectedName);
  if (product) {
    form.value.productId   = product.productId;
    form.value.productCode = product.productCode;
  }
};

watch(commissionRateDisplay, (val) => {
  form.value.commissionRate = parseFloat((val / 100).toFixed(4));
});
const data = reactive<PageData<InsuranceProductCommissionForm, InsuranceProductCommissionQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productId: undefined,
    productCode: undefined,
    productName: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "id不能为空", trigger: "blur" }
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
    commissionRate: [
      { required: true, message: "基础佣金比例不能为空", trigger: "blur" }
    ],
    commissionRateDisplay: [
      {
        validator: (_: any, __: any, callback: any) => {
          if (commissionRateDisplay.value === undefined || commissionRateDisplay.value === null) {
            callback(new Error('基础佣金比例不能为空'));
          } else {
            callback();
          }
        },
        trigger: 'change'
      }
    ],
    effectiveTime: [
      { required: true, message: "费率生效时间不能为空", trigger: "blur" }
    ],
    expirationTime: [
      { required: true, message: "费率失效时间不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "启用状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询佣金配置列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceProductCommission(queryParams.value);
  InsuranceProductCommissionList.value = res.rows;
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
  commissionRateDisplay.value = 0;
  InsuranceProductCommissionFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: InsuranceProductCommissionVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  loadProductOptions();
  dialog.visible = true;
  dialog.title = "添加佣金配置";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: InsuranceProductCommissionVO) => {
  reset();
  loadProductOptions();
  const _id = row?.id || ids.value[0]
  const res = await getInsuranceProductCommission(_id);
  Object.assign(form.value, res.data);
  // 后端是 0-1，转换为前端展示的 0-100
  commissionRateDisplay.value = res.data.commissionRate != null
    ? parseFloat((Number(res.data.commissionRate) * 100).toFixed(2))
    : 0;
  dialog.visible = true;
  dialog.title = "修改佣金配置";
}

/** 提交按钮 */
const submitForm = () => {
  InsuranceProductCommissionFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateInsuranceProductCommission(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addInsuranceProductCommission(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: InsuranceProductCommissionVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除佣金配置编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delInsuranceProductCommission(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('insurance/InsuranceProductCommission/export', {
    ...queryParams.value
  }, `InsuranceProductCommission_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
