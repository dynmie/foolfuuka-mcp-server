export interface Media {
  media_id: string;
  spoiler: "0" | "1";
  preview_orig: string | null;
  media: string | null;
  preview_op: string | null;
  preview_reply: string | null;
  preview_w: string | null;
  preview_h: string | null;
  media_filename: string | null;
  media_w: string | null;
  media_h: string | null;
  media_size: string | null;
  media_hash: string | null;
  media_orig: string | null;
  total: string;
  banned: "0" | "1";
  media_status: string;
  remote_media_link: string | null;
  media_link: string | null;
  thumb_link: string | null;
  media_filename_processed: string | null;
}

export interface Post {
  doc_id: string;
  num: string;
  subnum: string;
  thread_num: string;
  op: "0" | "1";
  timestamp: number | string;
  capcode: string;
  email: string | null;
  name: string;
  trip: string | null;
  title: string | null;
  comment: string | null;
  comment_sanitized: string;
  comment_processed: string;
  poster_hash: string | null;
  poster_country: string | null;
  sticky: "0" | "1";
  locked: "0" | "1";
  deleted: "0" | "1";
  nreplies: number | string | null;
  nimages: number | string | null;
  fourchan_date: string;
  formatted: boolean;
  media: Media | null;
  board?: BoardInfo;
}

export interface BoardInfo {
  name: string;
  shortname: string;
}

export interface Site {
  url: string;
  name: string;
  title: string;
  global_search_enabled: boolean;
}

export interface SearchMeta {
  total_found: number;
  max_results: number;
  search_title: string;
}

export interface SearchResponse {
  "0": { posts: Post[] };
  meta?: SearchMeta;
}

export interface ThreadResponse {
  [threadNum: string]: {
    op: Post;
    posts: { [postNum: string]: Post };
  };
}

export interface BoardsResponse {
  site: Site;
  boards: Record<string, BoardRaw>;
}

export interface BoardRaw {
  name: string;
  shortname: string;
  board_url: string;
  threads_per_page: string;
  search_enabled: boolean;
  is_nsfw: boolean;
}

export interface SearchParams {
  text?: string;
  boards?: string;
  subject?: string;
  username?: string;
  tripcode?: string;
  capcode?: string;
  filename?: string;
  image?: string;
  uid?: string;
  country?: string;
  deleted?: string;
  ghost?: string;
  filter?: string;
  type?: string;
  start?: string;
  end?: string;
  results?: string;
  order?: string;
  page?: number;
}

export interface ThreadParams {
  board: string;
  num: number;
  latest_doc_id?: number;
  last_limit?: number;
}

export interface PostParams {
  board: string;
  num: string;
}
