export interface Run {
  id: string;
  folder_path: string;
  started: string;
  finished?: string | null;
  screenshots?: PageScreeenshotsData[];
}

export interface PageScreeenshotsData {
  page_name: string;
  url: string;
  screenshot_files?: ScreenshotFiles;
  comparison_score?: ComparisonScores;
}

export type ComparisonScores = {
  prod_after_vs_prod_before?: number;
  staging_vs_prod_before?: number;
  m_staging_vs_prod_before?: number;
  m_prod_after_vs_prod_before?: number;
};

export type ScreenshotFiles = {
  staging?: string;
  prod_before_update?: string;
  prod_after_update?: string;
  m_staging?: string;
  m_prod_after_update?: string;
  m_prod_before_update?: string;
  staging_vs_prod_before?: string;
  prod_after_vs_prod_before?: string;
  m_staging_vs_prod_before?: string;
  m_prod_after_vs_prod_before?: string;
};
