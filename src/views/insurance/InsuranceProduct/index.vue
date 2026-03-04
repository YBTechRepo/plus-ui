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
            <el-form-item label="保险公司编码" prop="companyCode">
              <el-select v-model="queryParams.companyCode" placeholder="请选择保险公司编码" clearable >
                <el-option v-for="dict in insurance_company" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="产品类型" prop="productType">
              <el-select v-model="queryParams.productType" placeholder="请选择产品类型" clearable >
                <el-option v-for="dict in insurance_product_type" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="产品模式" prop="productMode">
              <el-select v-model="queryParams.productMode" placeholder="请选择产品模式" clearable >
                <el-option v-for="dict in insurance_product_mode" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="产品状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择产品状态" clearable >
                <el-option v-for="dict in insurance_product_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="产品排序" prop="sort">
              <el-input v-model="queryParams.sort" placeholder="请输入产品排序" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:InsuranceProduct:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:InsuranceProduct:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['insurance:InsuranceProduct:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsuranceProduct:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsuranceProductList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="id" align="center" prop="id" v-if="true" />
        <el-table-column label="产品编码" align="center" prop="productCode" />
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="保险公司编码" align="center" prop="companyCode">
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
        <!-- <el-table-column label="投保链接" align="center" prop="proposalUrl" /> -->
        <el-table-column label="产品图片" align="center" prop="imgUrlUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.imgUrlUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column label="产品说明" align="center" prop="description" />
        <el-table-column label="产品状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="insurance_product_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="产品排序" align="center" prop="sort" />
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
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['insurance:InsuranceProduct:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['insurance:InsuranceProduct:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改产品配置对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="InsuranceProductFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入产品编码" />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="保险公司编码" prop="companyCode">
          <el-select v-model="form.companyCode" placeholder="请选择保险公司编码">
            <el-option
                v-for="dict in insurance_company"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            ></el-option>
          </el-select>
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
        <el-form-item label="投保链接" prop="proposalUrl">
            <el-input v-model="form.proposalUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="产品图片" prop="imgUrl">
          <image-upload v-model="form.imgUrl"/>
        </el-form-item>
        <el-form-item label="产品说明" prop="description">
            <el-input v-model="form.description" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="产品状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择产品状态">
            <el-option
                v-for="dict in insurance_product_status"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="产品排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入产品排序" />
        </el-form-item>
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

<script setup name="InsuranceProduct" lang="ts">
import { listInsuranceProduct, getInsuranceProduct, delInsuranceProduct, addInsuranceProduct, updateInsuranceProduct } from '@/api/insurance/InsuranceProduct';
import { InsuranceProductVO, InsuranceProductQuery, InsuranceProductForm } from '@/api/insurance/InsuranceProduct/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_product_type, insurance_product_mode, insurance_company, insurance_product_status } = toRefs<any>(proxy?.useDict('insurance_product_type', 'insurance_product_mode', 'insurance_company', 'insurance_product_status'));

const InsuranceProductList = ref<InsuranceProductVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const InsuranceProductFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: InsuranceProductForm = {
  id: undefined,
  productCode: undefined,
  productName: undefined,
  companyCode: undefined,
  productType: undefined,
  productMode: undefined,
  minPremium: undefined,
  proposalUrl: undefined,
  imgUrl: undefined,
  description: undefined,
  status: undefined,
  sort: undefined,
}
const data = reactive<PageData<InsuranceProductForm, InsuranceProductQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productCode: undefined,
    productName: undefined,
    companyCode: undefined,
    productType: undefined,
    productMode: undefined,
    status: undefined,
    sort: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "id不能为空", trigger: "blur" }
    ],
    productCode: [
      { required: true, message: "产品编码不能为空", trigger: "blur" }
    ],
    productName: [
      { required: true, message: "产品名称不能为空", trigger: "blur" }
    ],
    companyCode: [
      { required: true, message: "保险公司编码不能为空", trigger: "change" }
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
    proposalUrl: [
      { required: true, message: "投保链接不能为空", trigger: "blur" }
    ],
    imgUrl: [
      { required: true, message: "产品图片不能为空", trigger: "blur" }
    ],
    description: [
      { required: true, message: "产品说明不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "产品状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品配置列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceProduct(queryParams.value);
  InsuranceProductList.value = res.rows;
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
  InsuranceProductFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: InsuranceProductVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加产品配置";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: InsuranceProductVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getInsuranceProduct(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改产品配置";
}

/** 提交按钮 */
const submitForm = () => {
  InsuranceProductFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateInsuranceProduct(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addInsuranceProduct(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: InsuranceProductVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除产品配置编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delInsuranceProduct(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('insurance/InsuranceProduct/export', {
    ...queryParams.value
  }, `InsuranceProduct_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
