<template>
  <el-dialog v-model="visible" title="客户签署链接" width="440px" append-to-body>
    <div class="signing-link-dialog">
      <div class="qrcode-panel">
        <QrcodeVue v-if="url" :value="url" :size="248" level="M" render-as="canvas" />
      </div>
      <p>客户可使用微信或浏览器扫码进入免登录签署页面，也可以复制下方链接转发。</p>
      <el-input :model-value="url" type="textarea" :rows="3" readonly />
    </div>
    <template #footer>
      <el-button @click="visible = false">关 闭</el-button>
      <el-button type="primary" @click="copyLink">复制链接</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElMessage } from 'element-plus';
import QrcodeVue from 'qrcode.vue';

const props = defineProps<{
  modelValue: boolean;
  url: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const visible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
});

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(props.url);
    ElMessage.success('签署链接已复制，可直接转发给客户');
  } catch {
    ElMessage.warning('自动复制失败，请选中链接手动复制');
  }
};
</script>

<style scoped>
.signing-link-dialog {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.qrcode-panel {
  align-self: center;
  padding: 12px;
  line-height: 0;
  background: #fff;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.signing-link-dialog p {
  margin: 0;
  color: var(--el-text-color-secondary);
  line-height: 1.7;
}
</style>
