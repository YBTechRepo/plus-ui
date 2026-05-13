<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="充值单号" prop="rechargeNo">
              <el-input v-model="queryParams.rechargeNo" placeholder="请输入充值单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="申请人ID" prop="userId">
              <el-input v-model="queryParams.userId" placeholder="请输入申请人ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="审核状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择审核状态" clearable >
                <el-option v-for="dict in finance_recharge_audit_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
          <!-- <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['finance:rechargeRecord:add']">新增</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="success" plain icon="Stamp" :disabled="single" @click="handleUpdate()" v-hasPermi="['finance:rechargeRecord:edit']">审核</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['finance:rechargeRecord:remove']">删除</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['finance:rechargeRecord:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="rechargeRecordList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="id" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="充值单号" align="center" prop="rechargeNo" />
        <el-table-column label="租户号" align="center" prop="tenantId" width="110" />
        <el-table-column label="租户名称" align="center" prop="tenantName" width="160" show-overflow-tooltip />
        <!-- <el-table-column label="申请人ID" align="center" prop="userId" /> -->
        <el-table-column label="申请人账号" align="center" prop="userName" />
        <el-table-column label="申请人姓名" align="center" prop="userNickName" />
        <el-table-column label="申请充值金额" align="center" prop="applyAmount" />
        <el-table-column label="实际到账金额" align="center" prop="actualAmount" />
        <el-table-column label="支付凭证" align="center" prop="voucherImgUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.voucherImgUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" align="center" prop="createTime" />
        <el-table-column label="审核状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="finance_recharge_audit_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="审核/驳回备注说明" align="center" prop="auditRemark" />
        <!-- <el-table-column label="审核人ID" align="center" prop="auditBy" /> -->
        <el-table-column label="审核时间" align="center" prop="auditTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.auditTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column label="乐观锁版本号" align="center" prop="version" /> -->
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="审核" placement="top">
              <el-button link type="primary" icon="Stamp" @click="handleUpdate(scope.row)" :disabled="scope.row.status !== 0" v-hasPermi="['finance:rechargeRecord:edit']">审核</el-button>
            </el-tooltip>
            <!-- <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:rechargeRecord:remove']"></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改充值申请对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="600px" append-to-body>
      <el-form ref="rechargeRecordFormRef" :model="form" :rules="rules" label-width="100px">
        <el-divider content-position="left">申请信息</el-divider>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="充值单号">{{ form.rechargeNo }}</el-descriptions-item>
          <el-descriptions-item label="申请人姓名">{{ form.userNickName }}</el-descriptions-item>
          <el-descriptions-item label="申请人账号">{{ form.userName }}</el-descriptions-item>
          <el-descriptions-item label="申请金额">
             <span class="text-red-500 font-bold">￥{{ form.applyAmount }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="支付凭证" :span="2">
             <image-preview :src="form.voucherImgUrl" :width="100" :height="100"/>
          </el-descriptions-item>
          <el-descriptions-item label="申请时间" :span="2">{{ form.createTime }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">审核处理</el-divider>
        <el-form-item label="审核状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in finance_recharge_audit_status"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="实际到账金额" prop="actualAmount">
          <el-input-number v-model="form.actualAmount" :precision="2" :step="0.01" :min="0" placeholder="请输入实际到账金额" style="width: 100%" />
        </el-form-item>
        <el-form-item label="审核意见" prop="auditRemark">
          <el-input v-model="form.auditRemark" type="textarea" :rows="3" placeholder="请输入审核/驳回备注说明" />
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

<script setup name="RechargeRecord" lang="ts">
import { listRechargeRecord, getRechargeRecord, delRechargeRecord, addRechargeRecord, updateRechargeRecord, rechargeAudit } from '@/api/finance/rechargeRecord';
import { RechargeRecordVO, RechargeRecordQuery, RechargeRecordForm } from '@/api/finance/rechargeRecord/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { finance_recharge_audit_status } = toRefs<any>(proxy?.useDict('finance_recharge_audit_status'));

const rechargeRecordList = ref<RechargeRecordVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const rechargeRecordFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RechargeRecordForm = {
  id: undefined,
  rechargeNo: undefined,
  userId: undefined,
  applyAmount: undefined,
  actualAmount: undefined,
  voucherImg: undefined,
  status: undefined,
  auditRemark: undefined,
  auditBy: undefined,
  auditTime: undefined,
  version: undefined,
}
const data = reactive<PageData<RechargeRecordForm, RechargeRecordQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    rechargeNo: undefined,
    userId: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "id不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询充值申请列表 */
const getList = async () => {
  loading.value = true;
  const res = await listRechargeRecord(queryParams.value);
  rechargeRecordList.value = res.rows;
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
  rechargeRecordFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: RechargeRecordVO[]) => {
  ids.value = selection.map(item => item.id);
  // 仅当选中 1 条数据且状态为待审核（0）时，单选操作才可用
  single.value = selection.length != 1 || selection[0].status !== 0;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加充值申请";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: RechargeRecordVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getRechargeRecord(_id);
  Object.assign(form.value, res.data);
  // 如果实际到账金额为空，默认填入申请金额，方便审核人员微调
  if (!form.value.actualAmount) {
    form.value.actualAmount = form.value.applyAmount;
  }
  dialog.visible = true;
  dialog.title = '充值申请审核';
}

/** 提交按钮 */
const submitForm = () => {
  rechargeRecordFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      const auditData = {
        id: form.value.id,
        auditStatus: form.value.status,
        actualAmount: form.value.actualAmount,
        auditRemark: form.value.auditRemark
      };
      await rechargeAudit(auditData).finally(() => buttonLoading.value = false);
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: RechargeRecordVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除充值申请编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delRechargeRecord(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('finance/rechargeRecord/export', {
    ...queryParams.value
  }, `rechargeRecord_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
