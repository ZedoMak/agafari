export interface Service {
  id: string;
  name_en: string;
  name_am: string;
  category: string;
  office_info: string;
  fee: string;
  processing_time: string;
  coordinates?: { lat: number; lng: number };
  tags: string[];
  steps?: ServiceStep[];
  documents?: ServiceDocument[];
  last_verified: string;
}

export interface ServiceStep {
  id: string;
  service_id: string;
  order_num: number;
  title_en: string;
  title_am: string;
  desc_en: string;
  desc_am: string;
}

export interface ServiceDocument {
  id: string;
  service_id: string;
  title_en: string;
  title_am: string;
  desc_en?: string;
  desc_am?: string;
  is_mandatory: boolean;
}
