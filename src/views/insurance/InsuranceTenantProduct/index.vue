<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="上架状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择上架状态" clearable >
                <el-option v-for="dict in insurance_product_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:InsuranceTenantProduct:add']">添加产品</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:InsuranceTenantProduct:edit']">修改</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['insurance:InsuranceTenantProduct:remove']">删除</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsuranceTenantProduct:export']">导出</el-button>
          </el-col> -->
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsuranceTenantProductList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="ID" align="center" prop="id" v-if="true" />
        <el-table-column label="产品ID" align="center" prop="productId" />
        <el-table-column label="保险公司" align="center" prop="companyCode">
          <template #default="scope">
            <dict-tag :options="insurance_company" :value="scope.row.companyCode"/>
          </template>
        </el-table-column>
        <el-table-column label="产品代码" align="center" prop="productCode" />
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="产品类型" align="center" prop="productType">
          <template #default="scope">
            <dict-tag :options="insurance_product_type" :value="scope.row.productType"/>
          </template>
        </el-table-column>
        <el-table-column label="产品模式" align="center" prop="productMode">
          <template #default="scope">
            <dict-tag :options="insurance_product_mode" :value="scope.row.productMode"/>
          </template>
        </el-table-column>
        <el-table-column label="最低保费" align="center" prop="minPremium" />
        <el-table-column label="产品头图" align="center" prop="imgUrlUrl">
          <template #default="scope">
             <image-preview :src="scope.row.imgUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column label="产品特点" align="center" prop="description" />
        <el-table-column label="上架状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="insurance_product_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="自定义排序" align="center" prop="sort" />
        <!-- <el-table-column label="乐观锁版本" align="center" prop="version" /> -->
        <!-- <el-table-column label="删除标记" align="center" prop="delFlag" /> -->
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['insurance:InsuranceTenantProduct:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['insurance:InsuranceTenantProduct:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改产品库对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="InsuranceTenantProductFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品ID" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入产品ID" />
        </el-form-item>
        <el-form-item label="保险公司" prop="companyCode">
          <el-select v-model="form.companyCode" placeholder="请选择保险公司">
            <el-option
                v-for="dict in insurance_company"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品代码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入产品代码" />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="产品类型" prop="productType">
          <el-select v-model="form.productType" placeholder="请选择产品类型">
            <el-option
                v-for="dict in insurance_product_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品模式" prop="productMode">
          <el-select v-model="form.productMode" placeholder="请选择产品模式">
            <el-option
                v-for="dict in insurance_product_mode"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="最低保费" prop="minPremium">
          <el-input v-model="form.minPremium" placeholder="请输入最低保费" />
        </el-form-item>
        <el-form-item label="产品头图" prop="img">
          <el-input v-model="form.img" placeholder="请输入产品头图" />
        </el-form-item>
        <el-form-item label="产品特点" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="上架状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择上架状态">
            <el-option
                v-for="dict in insurance_product_status"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自定义排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入自定义排序" />
        </el-form-item>
        <el-form-item label="乐观锁版本" prop="version">
          <el-input v-model="form.version" placeholder="请输入乐观锁版本" />
        </el-form-item>
        <el-form-item label="删除标记" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标记" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 选择产品弹窗 (取代原本的新增) -->
    <el-dialog title="选择产品" v-model="productSelectDialog.visible" width="800px" append-to-body>
      <el-form :model="productSelectQueryParams" ref="productSelectQueryRef" :inline="true" v-show="true">
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="productSelectQueryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleProductSelectQuery" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleProductSelectQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetProductSelectQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="productSelectLoading" border :data="productConfigList" @selection-change="handleProductSelectionChange">
        <el-table-column type="selection" width="55" align="center" :selectable="(row) => !row.hasAdded" />
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="产品代码" align="center" prop="productCode" />
        <el-table-column label="保险公司" align="center" prop="companyCode">
          <template #default="scope">
            <dict-tag :options="insurance_company" :value="scope.row.companyCode"/>
          </template>
        </el-table-column>
        <el-table-column label="产品类型" align="center" prop="productType">
          <template #default="scope">
            <dict-tag :options="insurance_product_type" :value="scope.row.productType"/>
          </template>
        </el-table-column>
        <el-table-column label="产品模式" align="center" prop="productMode">
          <template #default="scope">
            <dict-tag :options="insurance_product_mode" :value="scope.row.productMode"/>
          </template>
        </el-table-column>
        <el-table-column label="最低保费" align="center" prop="minPremium" />
        <el-table-column label="产品图" align="center" prop="imgUrlUrl" show-overflow-tooltip>
          <template #default="scope">
            <image-preview :src="scope.row.imgUrlUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="productSelectTotal > 0" :total="productSelectTotal" v-model:page="productSelectQueryParams.pageNum" v-model:limit="productSelectQueryParams.pageSize" @pagination="loadProductConfigList" />

      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitBatchAdd">添 加</el-button>
          <el-button @click="productSelectDialog.visible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="InsuranceTenantProduct" lang="ts">
import { listInsuranceTenantProduct, getInsuranceTenantProduct, delInsuranceTenantProduct, addInsuranceTenantProduct, updateInsuranceTenantProduct, addInsuranceTenantProductBatch, listMarketProduct } from '@/api/insurance/InsuranceTenantProduct';
import type { InsuranceProductConfigVO } from '@/api/insurance/InsuranceProductConfig/types';
import { InsuranceTenantProductVO, InsuranceTenantProductQuery, InsuranceTenantProductForm } from '@/api/insurance/InsuranceTenantProduct/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_product_type, insurance_product_mode, insurance_company, insurance_product_status } = toRefs<any>(proxy?.useDict('insurance_product_type', 'insurance_product_mode', 'insurance_company', 'insurance_product_status'));

const InsuranceTenantProductList = ref<InsuranceTenantProductVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const InsuranceTenantProductFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

/** 产品选择弹窗状态与数据 */
const productSelectDialog = reactive({ visible: false });
const productSelectLoading = ref(false);
const productConfigList = ref<InsuranceProductConfigVO[]>([]);
const productSelectTotal = ref(0);
const selectedProductIds = ref<Array<string | number>>([]);

const productSelectQueryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: undefined
});

const loadProductConfigList = async () => {
  productSelectLoading.value = true;
  // 调用新的 marketList 接口
  const res = await listMarketProduct(productSelectQueryParams);
  productConfigList.value = res.rows ?? [];
  productSelectTotal.value = res.total;
  productSelectLoading.value = false;
};

const handleProductSelectQuery = () => {
  productSelectQueryParams.pageNum = 1;
  loadProductConfigList();
};

const resetProductSelectQuery = () => {
  productSelectQueryParams.productName = undefined;
  handleProductSelectQuery();
};

const handleProductSelectionChange = (selection: InsuranceProductConfigVO[]) => {
  selectedProductIds.value = selection.map((item) => item.id);
};

const initFormData: InsuranceTenantProductForm = {
  id: undefined,
  productId: undefined,
  companyCode: undefined,
  productCode: undefined,
  productName: undefined,
  productType: undefined,
  productMode: undefined,
  minPremium: undefined,
  img: undefined,
  description: undefined,
  status: undefined,
  sort: undefined,
  version: undefined,
  delFlag: undefined
}
const data = reactive<PageData<InsuranceTenantProductForm, InsuranceTenantProductQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    companyCode: undefined,
    productCode: undefined,
    productName: undefined,
    productType: undefined,
    productMode: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    productId: [
      { required: true, message: "产品ID不能为空", trigger: "blur" }
    ],
    companyCode: [
      { required: true, message: "保险公司不能为空", trigger: "change" }
    ],
    productCode: [
      { required: true, message: "产品代码不能为空", trigger: "blur" }
    ],
    productName: [
      { required: true, message: "产品名称不能为空", trigger: "blur" }
    ],
    productType: [
      { required: true, message: "产品类型不能为空", trigger: "change" }
    ],
    productMode: [
      { required: true, message: "产品模式不能为空", trigger: "change" }
    ],
    minPremium: [
      { required: true, message: "最低保费不能为空", trigger: "blur" }
    ],
    img: [
      { required: true, message: "产品头图不能为空", trigger: "blur" }
    ],
    description: [
      { required: true, message: "产品特点不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "上架状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品库列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceTenantProduct(queryParams.value);
  InsuranceTenantProductList.value = res.rows;
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
  InsuranceTenantProductFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: InsuranceTenantProductVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 - 改为打开批量选择弹窗 */
const handleAdd = () => {
  selectedProductIds.value = [];
  productSelectDialog.visible = true;
  loadProductConfigList();
}

/** 批量添加提交 */
const submitBatchAdd = async () => {
  if (selectedProductIds.value.length === 0) {
    proxy?.$modal.msgWarning('请至少选择一项产品');
    return;
  }
  buttonLoading.value = true;
  try {
    await addInsuranceTenantProductBatch(selectedProductIds.value);
    proxy?.$modal.msgSuccess('批量添加成功');
    productSelectDialog.visible = false;
    await getList();
  } finally {
    buttonLoading.value = false;
  }
};

/** 修改按钮操作 */
const handleUpdate = async (row?: InsuranceTenantProductVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getInsuranceTenantProduct(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改产品库";
}

/** 提交按钮 */
const submitForm = () => {
  InsuranceTenantProductFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateInsuranceTenantProduct(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addInsuranceTenantProduct(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: InsuranceTenantProductVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除产品库编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delInsuranceTenantProduct(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('insurance/InsuranceTenantProduct/export', {
    ...queryParams.value
  }, `InsuranceTenantProduct_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
