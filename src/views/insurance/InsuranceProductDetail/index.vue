<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="产品ID (关联 biz_insurance_product.id)" prop="productId">
              <el-input v-model="queryParams.productId" placeholder="请输入产品ID (关联 biz_insurance_product.id)" clearable @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:InsuranceProductDetail:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:InsuranceProductDetail:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['insurance:InsuranceProductDetail:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsuranceProductDetail:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsuranceProductDetailList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="主键ID" align="center" prop="id" v-if="true" />
        <el-table-column label="产品ID (关联 biz_insurance_product.id)" align="center" prop="productId" />
        <el-table-column label="产品特点图 (JSON数组：["url1", "url2"])" align="center" prop="featureImages" />
        <el-table-column label="理赔流程图 (JSON数组：["url1"])" align="center" prop="claimImages" />
        <el-table-column label="投保须知 (JSON对象数组：[{"title":"", "content":"", "sort":1}])" align="center" prop="insureNotice" />
        <el-table-column label="条款须知文件 (JSON对象数组：[{"clauseName":"", "fileUrl":"", "sort":1}])" align="center" prop="clauseFiles" />
        <el-table-column label="乐观锁版本" align="center" prop="version" />
        <el-table-column label="删除标记(0-未删除 1-删除)" align="center" prop="delFlag" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['insurance:InsuranceProductDetail:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['insurance:InsuranceProductDetail:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改保险产品-图文详情对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="InsuranceProductDetailFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="产品ID (关联 biz_insurance_product.id)" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入产品ID (关联 biz_insurance_product.id)" />
        </el-form-item>
        <el-form-item label="乐观锁版本" prop="version">
          <el-input v-model="form.version" placeholder="请输入乐观锁版本" />
        </el-form-item>
        <el-form-item label="删除标记(0-未删除 1-删除)" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标记(0-未删除 1-删除)" />
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

<script setup name="InsuranceProductDetail" lang="ts">
import { listInsuranceProductDetail, getInsuranceProductDetail, delInsuranceProductDetail, addInsuranceProductDetail, updateInsuranceProductDetail } from '@/api/insurance/InsuranceProductDetail';
import { InsuranceProductDetailVO, InsuranceProductDetailQuery, InsuranceProductDetailForm } from '@/api/insurance/InsuranceProductDetail/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const InsuranceProductDetailList = ref<InsuranceProductDetailVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const InsuranceProductDetailFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: InsuranceProductDetailForm = {
  id: undefined,
  productId: undefined,
  featureImages: undefined,
  claimImages: undefined,
  insureNotice: undefined,
  clauseFiles: undefined,
  version: undefined,
  delFlag: undefined
}
const data = reactive<PageData<InsuranceProductDetailForm, InsuranceProductDetailQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    productId: undefined,
    featureImages: undefined,
    claimImages: undefined,
    insureNotice: undefined,
    clauseFiles: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "主键ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询保险产品-图文详情列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceProductDetail(queryParams.value);
  InsuranceProductDetailList.value = res.rows;
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
  InsuranceProductDetailFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: InsuranceProductDetailVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加保险产品-图文详情";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: InsuranceProductDetailVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getInsuranceProductDetail(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改保险产品-图文详情";
}

/** 提交按钮 */
const submitForm = () => {
  InsuranceProductDetailFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateInsuranceProductDetail(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addInsuranceProductDetail(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: InsuranceProductDetailVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除保险产品-图文详情编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delInsuranceProductDetail(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('insurance/InsuranceProductDetail/export', {
    ...queryParams.value
  }, `InsuranceProductDetail_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
