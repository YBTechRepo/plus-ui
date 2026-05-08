export interface NoticeVO extends BaseEntity {
  noticeId: number;
  noticeTitle: string;
  noticeType: string;
  noticeContent: string;
  clientId: string;
  clientKey?: string;
  status: string;
  popupFlag: string;
  popupStartTime?: string;
  popupEndTime?: string;
  remark: string;
  createByName: string;
}

export interface NoticeQuery extends PageQuery {
  noticeTitle: string;
  createByName: string;
  status: string;
  noticeType: string;
  clientId?: string;
  popupFlag?: string;
}

export interface NoticeForm {
  noticeId: number | string | undefined;
  noticeTitle: string;
  noticeType: string;
  noticeContent: string;
  clientId: string;
  status: string;
  popupFlag: string;
  popupStartTime?: string;
  popupEndTime?: string;
  remark: string;
  createByName: string;
}
