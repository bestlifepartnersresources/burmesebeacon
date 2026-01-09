export interface OverviewContent {
  id?: string;
  title: string;
  description?: string;
  video_url: string;
  created_at?: string;
}

export interface HomeCard {
  id?: string;
  title: string;
  description?: string;
  pdf_url: string;
  created_at?: string;
}

export interface SidebarContent {
  id?: string;
  category: 'Videos' | 'Musics' | 'Others';
  sub_category?: string;
  title: string;
  description?: string;
  content_url: string;
  created_at?: string;
}

export interface OverviewAds {
  id?: string;
  text_number: number;
  ad_text: string;
  is_displaying?: boolean;
  created_at?: string;
}

export interface HomeAds {
  id?: string;
  ad_text: string;
  created_at?: string;
}

export interface AdminSettings {
  id?: string;
  passcode_hash: string;
}

export interface AdminFormData {
  overview_content?: Partial<OverviewContent>;
  home_card?: Partial<HomeCard>;
  sidebar_contents?: Partial<SidebarContent>;
  overview_ads?: Partial<OverviewAds>;
  home_ads?: Partial<HomeAds>;
  [key: string]: any;
}

export interface DataState {
  overview_ads?: OverviewAds[];
  overview_content?: OverviewContent[];
  home_ads?: HomeAds[];
  home_card?: HomeCard[];
  sidebar_contents?: SidebarContent[];
  [key: string]: any;
}
