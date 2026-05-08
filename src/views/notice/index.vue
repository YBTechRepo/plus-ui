<template>
  <div class="p-2 notice-center">
    <el-card shadow="hover">
      <template #header>
        <div class="notice-center__header">
          <span>通知公告</span>
          <el-button icon="Refresh" :loading="loading" @click="getList">刷新</el-button>
        </div>
      </template>

      <div v-loading="loading" class="notice-center__layout">
        <div class="notice-center__list">
          <template v-if="noticeList.length > 0">
            <div
              v-for="item in noticeList"
              :key="item.noticeId"
              class="notice-center__item"
              :class="{ 'is-active': item.noticeId === activeNotice?.noticeId }"
              @click="selectNotice(item)"
            >
              <div class="notice-center__item-title">{{ item.noticeTitle }}</div>
              <div class="notice-center__item-meta">
                <dict-tag :options="sys_notice_type" :value="item.noticeType" />
                <span>{{ proxy.parseTime(item.createTime, '{y}-{m}-{d}') || '-' }}</span>
              </div>
            </div>
          </template>
          <el-empty v-else description="暂无公告" />
        </div>

        <div class="notice-center__detail">
          <template v-if="activeNotice">
            <div class="notice-center__detail-title">{{ activeNotice.noticeTitle }}</div>
            <div class="notice-center__detail-meta">
              <dict-tag :options="sys_notice_type" :value="activeNotice.noticeType" />
              <span>{{ proxy.parseTime(activeNotice.createTime, '{y}-{m}-{d} {h}:{i}:{s}') || '-' }}</span>
            </div>
            <el-divider />
            <div v-if="activeNotice.noticeContent" class="notice-center__content" v-html="activeNotice.noticeContent"></div>
            <el-empty v-else description="暂无内容" />
          </template>
          <el-empty v-else description="请选择公告" />
        </div>
      </div>

      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </el-card>
  </div>
</template>

<script setup name="NoticeCenter" lang="ts">
import { getUserNotice, listUserNotice } from '@/api/system/notice';
import { NoticeQuery, NoticeVO } from '@/api/system/notice/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_notice_type } = toRefs<any>(proxy?.useDict('sys_notice_type'));

const loading = ref(false);
const noticeList = ref<NoticeVO[]>([]);
const activeNotice = ref<NoticeVO>();
const total = ref(0);
const queryParams = ref<NoticeQuery>({
  pageNum: 1,
  pageSize: 10,
  noticeTitle: '',
  createByName: '',
  status: '0',
  noticeType: '',
  clientId: import.meta.env.VITE_APP_CLIENT_ID
});

const selectNotice = async (notice: NoticeVO) => {
  activeNotice.value = notice;
  const { data } = await getUserNotice(notice.noticeId);
  activeNotice.value = data;
};

const getList = async () => {
  loading.value = true;
  try {
    const res = await listUserNotice(queryParams.value);
    noticeList.value = res.rows || res.data || [];
    total.value = res.total || noticeList.value.length;
    if (noticeList.value.length > 0) {
      await selectNotice(noticeList.value[0]);
    } else {
      activeNotice.value = undefined;
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.notice-center {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 600;
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
    min-height: calc(100vh - 190px);
    margin-bottom: 16px;
    border: 1px solid var(--el-border-color-lighter);
  }

  &__list {
    overflow-y: auto;
    border-right: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-lighter);
  }

  &__item {
    padding: 14px 16px;
    cursor: pointer;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-bg-color);

    &:hover,
    &.is-active {
      background: var(--el-color-primary-light-9);
    }
  }

  &__item-title {
    overflow: hidden;
    color: var(--el-text-color-primary);
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-meta,
  &__detail-meta {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-top: 8px;
    color: var(--el-text-color-secondary);
    font-size: 13px;
  }

  &__detail {
    min-width: 0;
    padding: 24px;
    background: var(--el-bg-color);
  }

  &__detail-title {
    color: var(--el-text-color-primary);
    font-size: 22px;
    font-weight: 600;
    line-height: 1.4;
  }

  &__content {
    min-height: 260px;
    overflow-x: auto;
    color: var(--el-text-color-regular);
    line-height: 1.8;

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}

@media (max-width: 768px) {
  .notice-center {
    &__layout {
      display: block;
    }

    &__list {
      max-height: 280px;
      border-right: 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }
}
</style>
