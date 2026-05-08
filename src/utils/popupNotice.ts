import { listUnreadPopupNotices, readPopupNotice } from '@/api/system/notice';
import { ElMessageBox } from 'element-plus';
import type { NoticeVO } from '@/api/system/notice/types';

let popupNoticeLoaded = false;
let popupNoticeLoading = false;
const forceReadSeconds = 10;

const updateConfirmButton = (seconds: number) => {
  const button = document.querySelector<HTMLButtonElement>('.popup-notice-message-box .el-message-box__btns .el-button--primary');
  if (!button) {
    return;
  }
  const disabled = seconds > 0;
  button.disabled = disabled;
  button.classList.toggle('is-disabled', disabled);
  button.setAttribute('aria-disabled', String(disabled));
  const label = seconds > 0 ? `我知道了(${seconds}s)` : '我知道了';
  const labelNode = button.querySelector('span');
  if (labelNode) {
    labelNode.textContent = label;
  } else {
    button.textContent = label;
  }
};

const showPopupNotice = async (notice: NoticeVO) => {
  let remainingSeconds = forceReadSeconds;
  let countdownTimer: ReturnType<typeof setInterval> | undefined;

  const messageBoxPromise = ElMessageBox.alert(notice.noticeContent || '', notice.noticeTitle || '通知', {
    dangerouslyUseHTMLString: true,
    confirmButtonText: `我知道了(${remainingSeconds}s)`,
    closeOnClickModal: false,
    closeOnPressEscape: false,
    showClose: false,
    customClass: 'popup-notice-message-box',
    beforeClose: (action, _instance, done) => {
      if (action === 'confirm' && remainingSeconds > 0) {
        return;
      }
      done();
    }
  });

  window.setTimeout(() => {
    updateConfirmButton(remainingSeconds);
    countdownTimer = setInterval(() => {
      remainingSeconds -= 1;
      updateConfirmButton(remainingSeconds);
      if (remainingSeconds <= 0 && countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = undefined;
      }
    }, 1000);
  });

  await messageBoxPromise.finally(() => {
    if (countdownTimer) {
      clearInterval(countdownTimer);
    }
  });
  await readPopupNotice(notice.noticeId);
};

export const loadPopupNotices = async () => {
  if (popupNoticeLoaded || popupNoticeLoading) {
    return;
  }
  popupNoticeLoading = true;
  try {
    const res: any = await listUnreadPopupNotices();
    const notices = res.rows || res.data || [];
    for (const notice of notices) {
      await showPopupNotice(notice);
    }
    popupNoticeLoaded = true;
  } catch (error) {
    console.warn('加载登录弹窗通知失败', error);
  } finally {
    popupNoticeLoading = false;
  }
};

export const resetPopupNoticeLoaded = () => {
  popupNoticeLoaded = false;
};
