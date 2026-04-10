/** Go pkg/response.PageData */
export interface PageData<T> {
  list: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface AppUserListItem {
  id: number;
  nickname: string;
  avatar: string;
  status: number;
  max_devices_override?: null | number;
  phone_mask?: string;
  created_at: string;
}

export interface AppUserDetailItem extends AppUserListItem {
  updated_at: string;
  /** 账号级阅读偏好 */
  child_age_band?: null | string;
  preferred_themes?: string[];
  device_onboarding_completed_count?: number;
  last_device_onboarding_at?: null | string;
}

/** 某日阅读累计秒数（与后端 dto.ReadingDayPoint 对齐） */
export interface ReadingDayPoint {
  local_date: string;
  total_sec: number;
}

/** GET /app-users/:id/reading-summary */
export interface AdminReadingSummaryResp {
  user_id: number;
  streak_days: number;
  today_sec: number;
  last_30_days: ReadingDayPoint[];
  total_sessions: number;
  total_duration_sec: number;
  total_books_read: number;
}

/** GET /app-users/:id/reading-sessions 列表项 */
export interface AdminReadingSessionItem {
  id: number;
  book_id: number;
  book_title?: string;
  started_at: string;
  ended_at: string;
  duration_sec: number;
  local_date: string;
  timezone_iana: string;
  created_at: string;
}

export interface DevicePolicy {
  max_devices_default: number;
}

/** GET /feedbacks 列表行（无 image_urls，仅有 image_count） */
export interface AdminFeedbackRow {
  id: number;
  user_id: number;
  nickname: string;
  phone_mask: string;
  content: string;
  image_count: number;
  contact: string;
  client_platform: string;
  created_at: string;
}

/** GET /feedbacks/:id */
export interface AdminFeedbackDetail extends AdminFeedbackRow {
  image_urls?: string[];
}

export interface AdminStats {
  app_users: number;
  books: number;
  book_gen_tasks: number;
  published_books: number;
}

export interface AdminUserRow {
  id: number;
  username: string;
  real_name: string;
  avatar: string;
  status: number;
  roles: string[];
  created_at: string;
}

export interface AdminUserDetail extends AdminUserRow {
  role_ids: number[];
}

export interface AdminRole {
  id: number;
  code: string;
  name: string;
  description: string;
  is_builtin: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  permissions?: AdminPermission[];
}

export interface AdminPermission {
  id: number;
  code: string;
  name: string;
  kind: string;
  description: string;
  parent_id?: null | number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** 绘本（管理列表/详情，与后端 model.Book 对齐主要字段） */
/** GET /books/recommendations */
export interface AdminBookRecommendationItem {
  book_id: number;
  sort_order: number;
  title: string;
  cover_image: string;
  author_id: number;
}

/** POST /books/recommendations/suggest 候选 */
export interface BookRecommendSuggestionItem {
  book_id: number;
  title: string;
  cover_image: string;
  session_count: number;
  favorite_count: number;
  total_read_sec: number;
  score: number;
}

export interface AdminBook {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  author_id: number;
  book_gen_task_id?: null | number;
  age_group: string;
  theme: string;
  experience_mode: number;
  status: number;
  created_at: string;
  updated_at: string;
  author?: { avatar: string; id: number; nickname: string };
  pages?: AdminBookPage[];
}

export interface AdminBookPage {
  id: number;
  book_id: number;
  page_num: number;
  content: string;
  scene: string;
  illustration_prompt: string;
  image_url: string;
  audio_url: string;
  created_at: string;
  updated_at: string;
}

export interface BookGenTask {
  id: number;
  user_id: number;
  status: number;
  progress: number;
  request_params?: null | Record<string, unknown>;
  story_script?: null | Record<string, unknown>;
  page_images?: null | Record<string, unknown>;
  book_id?: null | number;
  error_message: string;
  error_detail: string;
  started_at?: null | string;
  completed_at?: null | string;
  created_at: string;
  updated_at: string;
  user?: { avatar: string; id: number; nickname: string };
  book?: AdminBook;
}
