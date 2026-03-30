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
  max_devices_override?: number | null;
  phone_mask?: string;
  created_at: string;
}

export interface AppUserDetailItem extends AppUserListItem {
  updated_at: string;
}

export interface DevicePolicy {
  max_devices_default: number;
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
  parent_id?: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/** 绘本（管理列表/详情，与后端 model.Book 对齐主要字段） */
export interface AdminBook {
  id: number;
  title: string;
  description: string;
  cover_image: string;
  author_id: number;
  book_gen_task_id?: number | null;
  age_group: string;
  theme: string;
  experience_mode: number;
  status: number;
  created_at: string;
  updated_at: string;
  author?: { id: number; nickname: string; avatar: string };
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
  request_params?: Record<string, unknown> | null;
  story_script?: Record<string, unknown> | null;
  page_images?: Record<string, unknown> | null;
  book_id?: number | null;
  error_message: string;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
  user?: { id: number; nickname: string; avatar: string };
  book?: AdminBook;
}
