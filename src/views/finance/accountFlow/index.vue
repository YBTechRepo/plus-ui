<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="用户ID" prop="userId">
              <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="关联业务单号" prop="bizNo">
              <el-input v-model="queryParams.bizNo" placeholder="请输入关联业务单号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="流水类型" prop="flowType">
              <el-select v-model="queryParams.flowType" placeholder="请选择流水类型" clearable>
                <el-option v-for="dict in finance_account_flow_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['finance:accountFlow:add']">新增</el-button>
          </el-col>
          <!-- <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['finance:accountFlow:edit']">修改</el-button>
          </el-col> -->
          <!-- <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['finance:accountFlow:remove']">删除</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['finance:accountFlow:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="accountFlowList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <!-- <el-table-column label="id" align="center" prop="id" v-if="true" /> -->
        <el-table-column label="租户号" align="center" prop="tenantId" width="110" />
        <el-table-column label="租户名称" align="center" prop="tenantName" width="160" show-overflow-tooltip />
        <el-table-column label="用户ID" align="center" prop="userId" />
        <el-table-column label="用户账号" align="center" prop="userName" />
        <el-table-column label="用户姓名" align="center" prop="userNickName" />
        <!-- <el-table-column label="流水类型" align="center" prop="flowType" /> -->
        <el-table-column label="流水类型" align="center" prop="flowType" >
          <template #default="scope">
            <dict-tag :options="finance_account_flow_type" :value="scope.row.flowType"/>
          </template>
        </el-table-column>
        <el-table-column label="变动金额" align="center" prop="amount" />
        <el-table-column label="变动后的账户总余额" align="center" prop="balanceAfter" />
        <el-table-column label="关联业务单号" align="center" prop="bizNo" />
        <el-table-column label="流水摘要说明" align="center" prop="remark" />
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <!-- <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:accountFlow:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:accountFlow:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column> -->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改账户明细对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="accountFlowFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="选择用户" prop="userId" v-if="!form.id">
          <el-select v-model="form.userId" placeholder="请选择用户" filterable @change="handleUserChange" style="width: 100%">
            <el-option
              v-for="user in userAccountOptions"
              :key="user.userId"
              :label="`${user.userNickName} (${user.userName})`"
              :value="user.userId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="当前账户余额" v-if="form.userId">
          <el-text type="primary" strong>￥ {{ currentBalance.toFixed(2) }}</el-text>
        </el-form-item>
        <el-form-item label="流水类型" prop="flowType">
          <el-select v-model="form.flowType" placeholder="请选择流水类型" style="width: 100%">
            <el-option
              v-for="dict in filteredFlowTypes"
              :key="dict.value"
              :label="dict.label"
              :value="parseInt(dict.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="变动金额" prop="amount">
          <el-input-number v-model="form.amount" :precision="2" :step="10" :min="0.01" placeholder="请输入变动金额" style="width: 100%" />
        </el-form-item>
        <el-form-item label="变动后总余额" v-if="form.flowType && form.amount">
          <el-text :type="balanceAfter >= 0 ? 'success' : 'danger'" strong>￥ {{ balanceAfter.toFixed(2) }}</el-text>
        </el-form-item>
        <el-form-item label="流水摘要" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入流水变动摘要说明" />
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

<script setup name="AccountFlow" lang="ts">
import {
  listAccountFlow,
  listAccountFlowAdmin,
  getAccountFlow,
  delAccountFlow,
  addAccountFlow,
  updateAccountFlow,
  adjustBalance
} from '@/api/finance/accountFlow';
import { listUserAccountAdmin } from '@/api/finance/userAccount';
import { AccountFlowVO, AccountFlowQuery, AccountFlowForm, AccountAdjustReqDTO } from '@/api/finance/accountFlow/types';
import { UserAccountVO } from '@/api/finance/userAccount/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { finance_account_flow_type } = toRefs<any>(proxy?.useDict('finance_account_flow_type'));

// 用户账户选项
const userAccountOptions = ref<UserAccountVO[]>([]);

const currentBalance = ref(0);
const balanceAfter = computed(() => {
  if (!form.value.amount || !form.value.flowType) return Number(currentBalance.value);
  const amount = Number(form.value.amount);
  const current = Number(currentBalance.value);
  if (form.value.flowType === 4) return current + amount;
  if (form.value.flowType === 5) return current - amount;
  return current;
});

const filteredFlowTypes = computed(() => {
  return finance_account_flow_type.value.filter((item: any) => item.value === '4' || item.value === '5');
});

const handleUserChange = (val: any) => {
  const user = userAccountOptions.value.find((u) => u.userId === val);
  currentBalance.value = user ? Number(user.balance) : 0;
};

const accountFlowList = ref<AccountFlowVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const accountFlowFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: AccountFlowForm = {
  id: undefined,
  userId: undefined,
  flowType: undefined,
  amount: undefined,
  balanceAfter: undefined,
  bizNo: undefined,
  remark: undefined,
}
const data = reactive<PageData<AccountFlowForm, AccountFlowQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userId: undefined,
    bizNo: undefined,
    flowType: undefined,
    params: {
    }
  },
  rules: {
    userId: [{ required: true, message: '用户不能为空', trigger: 'change' }],
    flowType: [{ required: true, message: '流水类型不能为空', trigger: 'change' }],
    amount: [{ required: true, message: '变动金额不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询账户明细列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAccountFlowAdmin(queryParams.value);
  accountFlowList.value = res.rows;
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
  accountFlowFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: AccountFlowVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = async () => {
  reset();
  currentBalance.value = 0;
  const res = await listUserAccountAdmin();
  userAccountOptions.value = res.data;
  dialog.visible = true;
  dialog.title = '调整账户余额';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: AccountFlowVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getAccountFlow(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '修改账户明细';
};

/** 提交按钮 */
const submitForm = () => {
  accountFlowFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateAccountFlow(form.value).finally(() => (buttonLoading.value = false));
        proxy?.$modal.msgSuccess('操作成功');
        dialog.visible = false;
        await getList();
      } else {
        const req: AccountAdjustReqDTO = {
          userId: form.value.userId!,
          flowType: form.value.flowType!,
          amount: form.value.amount!,
          remark: form.value.remark!
        };
        await adjustBalance(req).finally(() => (buttonLoading.value = false));
        proxy?.$modal.msgSuccess('调账成功');
        dialog.visible = false;
        await getList();
      }
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: AccountFlowVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除账户明细编号为"' + _ids + '"的数据项？').finally(() => (loading.value = false));
  await delAccountFlow(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'finance/accountFlow/export',
    {
      ...queryParams.value
    },
    `accountFlow_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>
