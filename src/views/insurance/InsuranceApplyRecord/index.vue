<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="订单号" prop="orderNo">
              <el-input v-model="queryParams.orderNo" placeholder="请输入订单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品编码" prop="productCode">
              <el-input v-model="queryParams.productCode" placeholder="请输入产品编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="产品名称" prop="productName">
              <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="业务员姓名" prop="agentName">
              <el-input v-model="queryParams.agentName" placeholder="请输入业务员姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="客户姓名" prop="customerName">
              <el-input v-model="queryParams.customerName" placeholder="请输入客户姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="客户手机号" prop="customerMobile">
              <el-input v-model="queryParams.customerMobile" placeholder="请输入客户手机号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="登记保费" prop="premium">
              <el-input v-model="queryParams.premium" placeholder="请输入登记保费" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="订单状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择订单状态" clearable >
                <el-option v-for="dict in insurance_apply_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="结算状态" prop="commissionStatus">
              <el-select v-model="queryParams.commissionStatus" placeholder="请选择结算状态" clearable >
                <el-option v-for="dict in insurance_commission_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
              </el-select>
            </el-form-item>
            <el-form-item label="创建时间" prop="createTime">
              <el-date-picker clearable
                v-model="queryParams.createTime"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择创建时间"
              />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['insurance:InsuranceApplyRecord:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['insurance:InsuranceApplyRecord:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['insurance:InsuranceApplyRecord:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['insurance:InsuranceApplyRecord:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="InsuranceApplyRecordList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="id" align="center" prop="id" v-if="true" />
        <el-table-column label="订单号" align="center" prop="orderNo" />
        <el-table-column label="产品编码" align="center" prop="productCode" />
        <el-table-column label="产品名称" align="center" prop="productName" />
        <el-table-column label="业务员姓名" align="center" prop="agentName" />
        <el-table-column label="客户姓名" align="center" prop="customerName" />
        <el-table-column label="客户手机号" align="center" prop="customerMobile" />
        <el-table-column label="登记保费" align="center" prop="premium" />
        <el-table-column label="订单状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="insurance_apply_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="结算状态" align="center" prop="commissionStatus">
          <template #default="scope">
            <dict-tag :options="insurance_commission_status" :value="scope.row.commissionStatus"/>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['insurance:InsuranceApplyRecord:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['insurance:InsuranceApplyRecord:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改投保记录对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="InsuranceApplyRecordFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="订单号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item label="产品ID" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入产品ID" />
        </el-form-item>
        <el-form-item label="产品编码" prop="productCode">
          <el-input v-model="form.productCode" placeholder="请输入产品编码" />
        </el-form-item>
        <el-form-item label="产品名称" prop="productName">
          <el-input v-model="form.productName" placeholder="请输入产品名称" />
        </el-form-item>
        <el-form-item label="业务员姓名" prop="agentName">
          <el-input v-model="form.agentName" placeholder="请输入业务员姓名" />
        </el-form-item>
        <el-form-item label="业务员ID" prop="agentUserId">
          <el-input v-model="form.agentUserId" placeholder="请输入业务员ID" />
        </el-form-item>
        <el-form-item label="所属机构ID" prop="agentDeptId">
          <el-input v-model="form.agentDeptId" placeholder="请输入所属机构ID" />
        </el-form-item>
        <el-form-item label="客户姓名" prop="customerName">
          <el-input v-model="form.customerName" placeholder="请输入客户姓名" />
        </el-form-item>
        <el-form-item label="客户手机号" prop="customerMobile">
          <el-input v-model="form.customerMobile" placeholder="请输入客户手机号" />
        </el-form-item>
        <el-form-item label="登记保费" prop="premium">
          <el-input v-model="form.premium" placeholder="请输入登记保费" />
        </el-form-item>
        <el-form-item label="订单状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择订单状态">
            <el-option
                v-for="dict in insurance_apply_status"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="结算状态" prop="commissionStatus">
          <el-select v-model="form.commissionStatus" placeholder="请选择结算状态">
            <el-option
                v-for="dict in insurance_commission_status"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
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

<script setup name="InsuranceApplyRecord" lang="ts">
import { listInsuranceApplyRecord, getInsuranceApplyRecord, delInsuranceApplyRecord, addInsuranceApplyRecord, updateInsuranceApplyRecord } from '@/api/insurance/InsuranceApplyRecord';
import { InsuranceApplyRecordVO, InsuranceApplyRecordQuery, InsuranceApplyRecordForm } from '@/api/insurance/InsuranceApplyRecord/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_apply_status, insurance_commission_status } = toRefs<any>(proxy?.useDict('insurance_apply_status', 'insurance_commission_status'));

const InsuranceApplyRecordList = ref<InsuranceApplyRecordVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const InsuranceApplyRecordFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: InsuranceApplyRecordForm = {
  id: undefined,
  orderNo: undefined,
  productId: undefined,
  productCode: undefined,
  productName: undefined,
  agentName: undefined,
  agentUserId: undefined,
  agentDeptId: undefined,
  customerName: undefined,
  customerMobile: undefined,
  premium: undefined,
  status: undefined,
  commissionStatus: undefined,
}
const data = reactive<PageData<InsuranceApplyRecordForm, InsuranceApplyRecordQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    orderNo: undefined,
    productCode: undefined,
    productName: undefined,
    agentName: undefined,
    customerName: undefined,
    customerMobile: undefined,
    premium: undefined,
    status: undefined,
    commissionStatus: undefined,
    createTime: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "id不能为空", trigger: "blur" }
    ],
    orderNo: [
      { required: true, message: "订单号不能为空", trigger: "blur" }
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
    agentName: [
      { required: true, message: "业务员姓名不能为空", trigger: "blur" }
    ],
    agentUserId: [
      { required: true, message: "业务员ID不能为空", trigger: "blur" }
    ],
    agentDeptId: [
      { required: true, message: "所属机构ID不能为空", trigger: "blur" }
    ],
    customerName: [
      { required: true, message: "客户姓名不能为空", trigger: "blur" }
    ],
    customerMobile: [
      { required: true, message: "客户手机号不能为空", trigger: "blur" }
    ],
    premium: [
      { required: true, message: "登记保费不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "订单状态不能为空", trigger: "change" }
    ],
    commissionStatus: [
      { required: true, message: "结算状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询投保记录列表 */
const getList = async () => {
  loading.value = true;
  const res = await listInsuranceApplyRecord(queryParams.value);
  InsuranceApplyRecordList.value = res.rows;
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
  InsuranceApplyRecordFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: InsuranceApplyRecordVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加投保记录";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: InsuranceApplyRecordVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getInsuranceApplyRecord(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改投保记录";
}

/** 提交按钮 */
const submitForm = () => {
  InsuranceApplyRecordFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateInsuranceApplyRecord(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addInsuranceApplyRecord(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: InsuranceApplyRecordVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除投保记录编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delInsuranceApplyRecord(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('insurance/InsuranceApplyRecord/export', {
    ...queryParams.value
  }, `InsuranceApplyRecord_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
