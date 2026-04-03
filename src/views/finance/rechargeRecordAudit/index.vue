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
            <el-form-item label="审核状态: 0=待审核, 1=已通过, 2=已驳回" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择审核状态: 0=待审核, 1=已通过, 2=已驳回" clearable >
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
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['finance:rechargeRecordAudit:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['finance:rechargeRecordAudit:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['finance:rechargeRecordAudit:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['finance:rechargeRecordAudit:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="rechargeRecordAuditList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="id" align="center" prop="id" v-if="true" />
        <el-table-column label="充值单号" align="center" prop="rechargeNo" />
        <el-table-column label="申请人ID" align="center" prop="userId" />
        <el-table-column label="用户填写的申请充值金额" align="center" prop="applyAmount" />
        <el-table-column label="财务实际核准到账的金额" align="center" prop="actualAmount" />
        <el-table-column label="支付凭证(转账截图)URL" align="center" prop="voucherImgUrl" width="100">
          <template #default="scope">
            <image-preview :src="scope.row.voucherImgUrl" :width="50" :height="50"/>
          </template>
        </el-table-column>
        <el-table-column label="审核状态: 0=待审核, 1=已通过, 2=已驳回" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="finance_recharge_audit_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="审核/驳回备注说明" align="center" prop="auditRemark" />
        <el-table-column label="审核人ID" align="center" prop="auditBy" />
        <el-table-column label="审核时间" align="center" prop="auditTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.auditTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="乐观锁版本号" align="center" prop="version" />
        <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:rechargeRecordAudit:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:rechargeRecordAudit:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改充值申请审核对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="rechargeRecordAuditFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="充值单号" prop="rechargeNo">
          <el-input v-model="form.rechargeNo" placeholder="请输入充值单号" />
        </el-form-item>
        <el-form-item label="申请人ID" prop="userId">
          <el-input v-model="form.userId" placeholder="请输入申请人ID" />
        </el-form-item>
        <el-form-item label="用户填写的申请充值金额" prop="applyAmount">
          <el-input v-model="form.applyAmount" placeholder="请输入用户填写的申请充值金额" />
        </el-form-item>
        <el-form-item label="财务实际核准到账的金额" prop="actualAmount">
          <el-input v-model="form.actualAmount" placeholder="请输入财务实际核准到账的金额" />
        </el-form-item>
        <el-form-item label="支付凭证(转账截图)URL" prop="voucherImg">
          <image-upload v-model="form.voucherImg"/>
        </el-form-item>
        <el-form-item label="审核状态: 0=待审核, 1=已通过, 2=已驳回" prop="status">
          <el-select v-model="form.status" placeholder="请选择审核状态: 0=待审核, 1=已通过, 2=已驳回">
            <el-option
                v-for="dict in finance_recharge_audit_status"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核/驳回备注说明" prop="auditRemark">
          <el-input v-model="form.auditRemark" placeholder="请输入审核/驳回备注说明" />
        </el-form-item>
        <el-form-item label="审核人ID" prop="auditBy">
          <el-input v-model="form.auditBy" placeholder="请输入审核人ID" />
        </el-form-item>
        <el-form-item label="审核时间" prop="auditTime">
          <el-date-picker clearable
            v-model="form.auditTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择审核时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="乐观锁版本号" prop="version">
          <el-input v-model="form.version" placeholder="请输入乐观锁版本号" />
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

<script setup name="RechargeRecordAudit" lang="ts">
import { listRechargeRecordAudit, getRechargeRecordAudit, delRechargeRecordAudit, addRechargeRecordAudit, updateRechargeRecordAudit } from '@/api/finance/rechargeRecordAudit';
import { RechargeRecordAuditVO, RechargeRecordAuditQuery, RechargeRecordAuditForm } from '@/api/finance/rechargeRecordAudit/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { finance_recharge_audit_status } = toRefs<any>(proxy?.useDict('finance_recharge_audit_status'));

const rechargeRecordAuditList = ref<RechargeRecordAuditVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const rechargeRecordAuditFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: RechargeRecordAuditForm = {
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
const data = reactive<PageData<RechargeRecordAuditForm, RechargeRecordAuditQuery>>({
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

/** 查询充值申请审核列表 */
const getList = async () => {
  loading.value = true;
  const res = await listRechargeRecordAudit(queryParams.value);
  rechargeRecordAuditList.value = res.rows;
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
  rechargeRecordAuditFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: RechargeRecordAuditVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加充值申请审核";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: RechargeRecordAuditVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getRechargeRecordAudit(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改充值申请审核";
}

/** 提交按钮 */
const submitForm = () => {
  rechargeRecordAuditFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateRechargeRecordAudit(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addRechargeRecordAudit(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: RechargeRecordAuditVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除充值申请审核编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delRechargeRecordAudit(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('finance/rechargeRecordAudit/export', {
    ...queryParams.value
  }, `rechargeRecordAudit_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
