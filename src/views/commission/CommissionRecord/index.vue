<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="保单号" prop="policyNo">
              <el-input v-model="queryParams.policyNo" placeholder="请输入保单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="创建时间" prop="createTime">
              <el-date-picker clearable v-model="queryParams.createTime" type="date" value-format="YYYY-MM-DD" placeholder="请选择创建时间" />
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['commission:CommissionRecord:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['commission:CommissionRecord:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['commission:CommissionRecord:remove']">删除</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['commission:CommissionRecord:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="CommissionRecordList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="主键ID" align="center" prop="id" v-if="true" /> -->
        <!-- <el-table-column label="关联保单ID" align="center" prop="policyId" /> -->
        <el-table-column label="保单号" align="center" prop="policyNo" />
        <!-- <el-table-column label="产品ID" align="center" prop="productId" /> -->
        <el-table-column label="佣金计算基数" align="center" prop="commissionBase" width="120" />
        <el-table-column label="业务员实发金额" align="center" prop="salesAmount" width="120" />
        <el-table-column label="团队长实发金额" align="center" prop="teamAmount" width="120" />
        <el-table-column label="总负责人实发金额" align="center" prop="projectAmount" width="130" />
        <el-table-column label="计算依据" align="center" prop="calcStrategy" width="120">
          <template #default="scope">
            <dict-tag :options="commission_calc_strategy" :value="scope.row.calcStrategy" />
          </template>
        </el-table-column>

        <el-table-column label="业务佣金比例" align="center" prop="salesRatio" width="110">
          <template #default="scope">
            <span>{{ scope.row.salesRatio != null ? (Number(scope.row.salesRatio) * 100).toFixed(0) + '%' : '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="团队佣金比例" align="center" prop="teamRatio" width="110">
          <template #default="scope">
            <span>{{ scope.row.teamRatio != null ? (Number(scope.row.teamRatio) * 100).toFixed(0) + '%' : '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总负责人佣金比例" align="center" prop="projectRatio" width="130">
          <template #default="scope">
            <span>{{ scope.row.projectRatio != null ? (Number(scope.row.projectRatio) * 100).toFixed(0) + '%' : '--' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="业务员姓名" align="center" prop="salesUserName" width="100" />
        <el-table-column label="团队负责人姓名" align="center" prop="teamUserName" width="120" />
        <el-table-column label="总负责人姓名" align="center" prop="projectUserName" width="120" />
        <el-table-column label="业务员佣金发放状态" align="center" prop="salesStatus" width="150">
          <template #default="scope">
            <dict-tag :options="commission_pay_status" :value="scope.row.salesStatus" />
          </template>
        </el-table-column>
        <el-table-column label="团队长津贴发放状态" align="center" prop="teamStatus" width="150">
          <template #default="scope">
            <dict-tag :options="commission_pay_status" :value="scope.row.teamStatus" />
          </template>
        </el-table-column>
        <el-table-column label="总负责人津贴发放状态" align="center" prop="projectStatus" width="160">
          <template #default="scope">
            <dict-tag :options="commission_pay_status" :value="scope.row.projectStatus" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="110">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['commission:CommissionRecord:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['commission:CommissionRecord:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column> -->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改佣金分配明细对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="CommissionRecordFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="关联保单ID" prop="policyId">
          <el-input v-model="form.policyId" placeholder="请输入关联保单ID" />
        </el-form-item>
        <el-form-item label="保单号" prop="policyNo">
          <el-input v-model="form.policyNo" placeholder="请输入保单号" />
        </el-form-item>
        <el-form-item label="产品ID" prop="productId">
          <el-input v-model="form.productId" placeholder="请输入产品ID" />
        </el-form-item>
        <el-form-item label="佣金计算基数" prop="commissionBase">
          <el-input v-model="form.commissionBase" placeholder="请输入佣金计算基数" />
        </el-form-item>
        <el-form-item label="业务员ID" prop="salesUserId">
          <el-input v-model="form.salesUserId" placeholder="请输入业务员ID" />
        </el-form-item>
        <el-form-item label="业务员实发金额" prop="salesAmount">
          <el-input v-model="form.salesAmount" placeholder="请输入业务员实发金额" />
        </el-form-item>
        <el-form-item label="团队长ID" prop="teamUserId">
          <el-input v-model="form.teamUserId" placeholder="请输入团队长ID" />
        </el-form-item>
        <el-form-item label="团队长实发金额" prop="teamAmount">
          <el-input v-model="form.teamAmount" placeholder="请输入团队长实发金额" />
        </el-form-item>
        <el-form-item label="总负责人ID" prop="projectUserId">
          <el-input v-model="form.projectUserId" placeholder="请输入总负责人ID" />
        </el-form-item>
        <el-form-item label="总负责人实发金额" prop="projectAmount">
          <el-input v-model="form.projectAmount" placeholder="请输入总负责人实发金额" />
        </el-form-item>
        <el-form-item label="算账依据" prop="calcStrategy">
          <el-select v-model="form.calcStrategy" placeholder="请选择算账依据">
            <el-option v-for="dict in commission_calc_strategy" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="流水状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择流水状态">
            <el-option v-for="dict in insurance_policy_status" :key="dict.value" :label="dict.label" :value="parseInt(dict.value)"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="乐观锁" prop="version">
          <el-input v-model="form.version" placeholder="请输入乐观锁" />
        </el-form-item>
        <el-form-item label="删除标志" prop="delFlag">
          <el-input v-model="form.delFlag" placeholder="请输入删除标志" />
        </el-form-item>
        <el-form-item label="业务佣金比例" prop="salesRatio">
          <el-input v-model="form.salesRatio" placeholder="请输入业务佣金比例" />
        </el-form-item>
        <el-form-item label="团队佣金比例" prop="teamRatio">
          <el-input v-model="form.teamRatio" placeholder="请输入团队佣金比例" />
        </el-form-item>
        <el-form-item label="总负责人佣金比例" prop="projectRatio">
          <el-input v-model="form.projectRatio" placeholder="请输入总负责人佣金比例" />
        </el-form-item>
        <el-form-item label="业务员姓名" prop="salesUserName">
          <el-input v-model="form.salesUserName" placeholder="请输入业务员姓名" />
        </el-form-item>
        <el-form-item label="团队负责人姓名" prop="teamUserName">
          <el-input v-model="form.teamUserName" placeholder="请输入团队负责人姓名" />
        </el-form-item>
        <el-form-item label="总负责人姓名" prop="projectUserName">
          <el-input v-model="form.projectUserName" placeholder="请输入总负责人姓名" />
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

<script setup name="CommissionRecord" lang="ts">
import {
  listCommissionRecord,
  getCommissionRecord,
  delCommissionRecord,
  addCommissionRecord,
  updateCommissionRecord
} from '@/api/commission/CommissionRecord';
import { CommissionRecordVO, CommissionRecordQuery, CommissionRecordForm } from '@/api/commission/CommissionRecord/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { insurance_policy_status, commission_calc_strategy, commission_pay_status } = toRefs<any>(
  proxy?.useDict('insurance_policy_status', 'commission_calc_strategy', 'commission_pay_status')
);

const CommissionRecordList = ref<CommissionRecordVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const CommissionRecordFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: CommissionRecordForm = {
  id: undefined,
  policyId: undefined,
  policyNo: undefined,
  productId: undefined,
  commissionBase: undefined,
  salesUserId: undefined,
  salesAmount: undefined,
  teamUserId: undefined,
  teamAmount: undefined,
  projectUserId: undefined,
  projectAmount: undefined,
  calcStrategy: undefined,
  status: undefined,
  version: undefined,
  delFlag: undefined,
  salesRatio: undefined,
  teamRatio: undefined,
  projectRatio: undefined,
  salesUserName: undefined,
  teamUserName: undefined,
  projectUserName: undefined
};
const data = reactive<PageData<CommissionRecordForm, CommissionRecordQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    policyNo: undefined,
    createTime: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: '主键ID不能为空', trigger: 'blur' }],
    policyId: [{ required: true, message: '关联保单ID不能为空', trigger: 'blur' }],
    policyNo: [{ required: true, message: '保单号不能为空', trigger: 'blur' }],
    productId: [{ required: true, message: '产品ID不能为空', trigger: 'blur' }],
    commissionBase: [{ required: true, message: '佣金计算基数不能为空', trigger: 'blur' }],
    salesUserId: [{ required: true, message: '业务员ID不能为空', trigger: 'blur' }],
    salesAmount: [{ required: true, message: '业务员实发金额不能为空', trigger: 'blur' }],
    teamUserId: [{ required: true, message: '团队长ID不能为空', trigger: 'blur' }],
    teamAmount: [{ required: true, message: '团队长实发金额不能为空', trigger: 'blur' }],
    projectUserId: [{ required: true, message: '总负责人ID不能为空', trigger: 'blur' }],
    projectAmount: [{ required: true, message: '总负责人实发金额不能为空', trigger: 'blur' }],
    calcStrategy: [{ required: true, message: '算账依据不能为空', trigger: 'change' }],
    status: [{ required: true, message: '流水状态不能为空', trigger: 'change' }],
    salesRatio: [{ required: true, message: '业务佣金比例不能为空', trigger: 'blur' }],
    teamRatio: [{ required: true, message: '团队佣金比例不能为空', trigger: 'blur' }],
    projectRatio: [{ required: true, message: '总负责人佣金比例不能为空', trigger: 'blur' }],
    salesUserName: [{ required: true, message: '业务员姓名不能为空', trigger: 'blur' }],
    teamUserName: [{ required: true, message: '团队负责人姓名不能为空', trigger: 'blur' }],
    projectUserName: [{ required: true, message: '总负责人姓名不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询佣金分配明细列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCommissionRecord(queryParams.value);
  CommissionRecordList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  CommissionRecordFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: CommissionRecordVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加佣金分配明细';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: CommissionRecordVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getCommissionRecord(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改佣金分配明细';
};

/** 提交按钮 */
const submitForm = () => {
  CommissionRecordFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateCommissionRecord(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addCommissionRecord(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: CommissionRecordVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除佣金分配明细编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delCommissionRecord(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'commission/CommissionRecord/export',
    {
      ...queryParams.value
    },
    `CommissionRecord_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
