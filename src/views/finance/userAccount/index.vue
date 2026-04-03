<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="用户账号" prop="userName">
              <el-input v-model="queryParams.userName" placeholder="请输入用户账号" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="用户姓名" prop="userNickName">
              <el-input v-model="queryParams.userNickName" placeholder="请输入用户姓名" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <!-- <el-form-item label="可用充值余额" prop="balance">
              <el-input v-model="queryParams.balance" placeholder="请输入可用充值余额" clearable @keyup.enter="handleQuery" />
            </el-form-item> -->
            <el-form-item label="账户状态" prop="status">
              <el-select v-model="queryParams.status" placeholder="请选择账户状态" clearable >
                <el-option v-for="dict in finance_account_status" :key="dict.value" :label="dict.label" :value="dict.value"/>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['finance:userAccount:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['finance:userAccount:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['finance:userAccount:remove']">删除</el-button>
          </el-col> -->
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['finance:userAccount:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" border :data="userAccountList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="用户ID" align="center" prop="userId" v-if="true" />
        <el-table-column label="用户账号" align="center" prop="userName" />
        <el-table-column label="用户姓名" align="center" prop="userNickName" />
        <el-table-column label="可用余额" align="center" prop="balance" />
        <el-table-column label="账户状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="finance_account_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <!-- <el-table-column label="乐观锁版本号" align="center" prop="version" /> -->
        <!-- <el-table-column label="操作" align="center" fixed="right"  class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['finance:userAccount:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['finance:userAccount:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column> -->
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改账户信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="userAccountFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="用户编号" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户编号" />
        </el-form-item>
        <el-form-item label="用户姓名" prop="userNickName">
          <el-input v-model="form.userNickName" placeholder="请输入用户姓名" />
        </el-form-item>
        <el-form-item label="可用充值余额" prop="balance">
          <el-input v-model="form.balance" placeholder="请输入可用充值余额" />
        </el-form-item>
        <el-form-item label="账户状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择账户状态">
            <el-option
                v-for="dict in finance_account_status"
                :key="dict.value"
                :label="dict.label"
                :value="parseInt(dict.value)"
            ></el-option>
          </el-select>
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

<script setup name="UserAccount" lang="ts">
import { listUserAccount, getUserAccount, delUserAccount, addUserAccount, updateUserAccount } from '@/api/finance/userAccount';
import { UserAccountVO, UserAccountQuery, UserAccountForm } from '@/api/finance/userAccount/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { finance_account_status } = toRefs<any>(proxy?.useDict('finance_account_status'));

const userAccountList = ref<UserAccountVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const userAccountFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: UserAccountForm = {
  userId: undefined,
  userName: undefined,
  userNickName: undefined,
  balance: undefined,
  status: undefined,
  version: undefined,
}
const data = reactive<PageData<UserAccountForm, UserAccountQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    userName: undefined,
    userNickName: undefined,
    balance: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    userId: [
      { required: true, message: "用户ID不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询账户信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listUserAccount(queryParams.value);
  userAccountList.value = res.rows;
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
  userAccountFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: UserAccountVO[]) => {
  ids.value = selection.map(item => item.userId);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加账户信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: UserAccountVO) => {
  reset();
  const _userId = row?.userId || ids.value[0]
  const res = await getUserAccount(_userId);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改账户信息";
}

/** 提交按钮 */
const submitForm = () => {
  userAccountFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.userId) {
        await updateUserAccount(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addUserAccount(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: UserAccountVO) => {
  const _userIds = row?.userId || ids.value;
  await proxy?.$modal.confirm('是否确认删除账户信息编号为"' + _userIds + '"的数据项？').finally(() => loading.value = false);
  await delUserAccount(_userIds);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('finance/userAccount/export', {
    ...queryParams.value
  }, `userAccount_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
