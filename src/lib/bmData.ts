import { fetchJsonFromR2 } from './r2Client';

export interface CategoryCatalogueItem {
  code: string;
  name: string;
  type: 'shared' | 'engineering';
  description?: string;
  image: string;
  r2_image_path?: string;
  data_file?: string;
  is_always_first?: boolean;
  is_aggregated?: boolean;
  enabled?: boolean;
}

export interface MasterCatalogue {
  version: string;
  updated_at?: string;
  categories: CategoryCatalogueItem[];
}

export interface BMAnswer {
  source?: string;
  status?: string;
  value?: string | number | null | string[];
  minimum?: number | null;
  maximum?: number | null;
  original_representation?: string;
  [key: string]: unknown;
}

export interface BMExplanation {
  source?: string;
  text?: string;
  [key: string]: unknown;
}

export interface BMQuestion {
  question_id: string;
  original_question_number?: string;
  pdf_page?: number;
  section_id?: string;
  section_name?: string;
  topic_id?: string;
  topic_name?: string;
  question_type?: string;
  marks?: number;
  original_text?: string;
  display_text?: string;
  options?: string[];
  answer?: BMAnswer;
  explanation?: BMExplanation | string;
  contains_image?: boolean;
  image_assets?: unknown[];
  year?: number;
  paper_code?: string;
  hide?: boolean;
  [key: string]: unknown;
}

export interface BMSubtopic {
  topic_id: string;
  topic_name: string;
}

export interface BMTopicSection {
  section_id: string;
  section_name: string;
  subtopics?: BMSubtopic[];
  [key: string]: unknown;
}

export interface BMMetadata {
  exam?: string;
  paper_code?: string;
  paper_name?: string;
  topics?: BMTopicSection[];
  [key: string]: unknown;
}

export interface BMData {
  metadata?: BMMetadata;
  questions?: BMQuestion[];
}

// In-memory TTL cache for loaded branch data (60 seconds)
const CACHE_TTL_MS = 60 * 1000;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const categoryDataCache = new Map<string, CacheEntry<BMData>>();
let masterCatalogueCacheEntry: CacheEntry<CategoryCatalogueItem[]> | null = null;

/**
 * Loads the master catalogue (master.json) directly from Cloudflare R2.
 * Enforces that GA (General Aptitude) always appears first.
 */
export async function getMasterCatalogue(): Promise<CategoryCatalogueItem[]> {
  const now = Date.now();
  if (masterCatalogueCacheEntry && now - masterCatalogueCacheEntry.timestamp < CACHE_TTL_MS) {
    return masterCatalogueCacheEntry.data;
  }

  try {
    const catalogue = await fetchJsonFromR2<MasterCatalogue>('master.json');
    if (!catalogue || !Array.isArray(catalogue.categories)) {
      return [];
    }

    const categories = catalogue.categories.filter((c) => c.enabled !== false);

    // Guarantee General Aptitude (GA) is always first
    const sorted = categories.sort((a, b) => {
      if (a.code.toUpperCase() === 'GA' || a.is_always_first) return -1;
      if (b.code.toUpperCase() === 'GA' || b.is_always_first) return 1;
      return 0;
    });

    masterCatalogueCacheEntry = { data: sorted, timestamp: now };
    return sorted;
  } catch (error) {
    console.error('Failed to read master catalogue from R2:', error);
    return [];
  }
}

/**
 * Reads a category's question-bank file directly from Cloudflare R2.
 * Resolves by key "questions/<CODE>.json" (e.g. questions/BM.json).
 * Automatically refetches from R2 once the cache TTL expires (60 seconds).
 */
export async function readCategoryData(categoryCode: string): Promise<BMData | null> {
  const codeUpper = categoryCode.toUpperCase();
  const cacheKey = codeUpper;
  const now = Date.now();

  const cached = categoryDataCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const r2Key = `questions/${codeUpper}.json`;
    const data = await fetchJsonFromR2<BMData>(r2Key);
    if (data) {
      categoryDataCache.set(cacheKey, { data, timestamp: now });
      return data;
    }
  } catch (error) {
    console.error(`Failed to read/parse R2 data for category ${categoryCode}:`, error);
  }

  return null;
}

/**
 * Dynamically extracts all unique examination years for a given category from R2.
 * Sorted chronologically descending.
 */
export async function getAvailableYears(categoryCode = 'BM'): Promise<number[]> {
  const data = await readCategoryData(categoryCode);
  if (!data || !Array.isArray(data.questions)) return [];

  const yearsSet = new Set<number>();
  for (const q of data.questions) {
    if (q.hide) continue;
    if (typeof q.year === 'number') {
      yearsSet.add(q.year);
    } else if (typeof q.year === 'string') {
      const parsed = parseInt(q.year, 10);
      if (!isNaN(parsed)) {
        yearsSet.add(parsed);
      }
    }
  }

  return Array.from(yearsSet).sort((a, b) => b - a);
}

/**
 * Dynamically extracts only the section entries defined in the metadata for a category from R2.
 */
export async function getAvailableSections(
  categoryCode = 'BM'
): Promise<Array<{ section_id: string; section_name: string }>> {
  const data = await readCategoryData(categoryCode);
  if (!data || !data.metadata || !Array.isArray(data.metadata.topics)) {
    return [];
  }

  const sections: Array<{ section_id: string; section_name: string }> = [];
  for (const topic of data.metadata.topics) {
    if (topic && typeof topic.section_name === 'string' && topic.section_name.trim()) {
      sections.push({
        section_id: topic.section_id,
        section_name: topic.section_name.trim(),
      });
    }
  }

  return sections;
}

export interface SubtopicGroup {
  topic_id: string;
  topic_name: string;
  questions: BMQuestion[];
}

export interface SectionQuestionsData {
  section_id: string;
  section_name: string;
  subtopicGroups: SubtopicGroup[];
}

/**
 * Retrieves questions for a specific section within a category from R2.
 */
export async function getQuestionsForSection(
  sectionIdOrSlug: string,
  categoryCode = 'BM'
): Promise<SectionQuestionsData | null> {
  const data = await readCategoryData(categoryCode);
  if (!data || !data.metadata || !Array.isArray(data.metadata.topics) || !Array.isArray(data.questions)) {
    return null;
  }

  const targetTopic = data.metadata.topics.find((t) => {
    if (!t) return false;
    return (
      t.section_id.toLowerCase() === sectionIdOrSlug.toLowerCase() ||
      t.section_id.toLowerCase().replace(/[^a-z0-9]/g, '-') === sectionIdOrSlug.toLowerCase()
    );
  });

  if (!targetTopic) {
    return null;
  }

  const sectionQuestions = data.questions.filter(
    (q) => !q.hide && q.section_id === targetTopic.section_id
  );
  const definedSubtopics = Array.isArray(targetTopic.subtopics) ? targetTopic.subtopics : [];
  const subtopicGroups: SubtopicGroup[] = [];

  for (const sub of definedSubtopics) {
    const questionsForSub = sectionQuestions
      .filter((q) => q.topic_id === sub.topic_id)
      .slice()
      .sort((a, b) => {
        const yearA = typeof a.year === 'number' ? a.year : 0;
        const yearB = typeof b.year === 'number' ? b.year : 0;
        return yearB - yearA;
      });

    subtopicGroups.push({
      topic_id: sub.topic_id,
      topic_name: sub.topic_name,
      questions: questionsForSub,
    });
  }

  const listedTopicIds = new Set(definedSubtopics.map((s) => s.topic_id));
  const otherQuestions = sectionQuestions
    .filter((q) => !q.topic_id || !listedTopicIds.has(q.topic_id))
    .slice()
    .sort((a, b) => {
      const yearA = typeof a.year === 'number' ? a.year : 0;
      const yearB = typeof b.year === 'number' ? b.year : 0;
      return yearB - yearA;
    });

  if (otherQuestions.length > 0) {
    subtopicGroups.push({
      topic_id: `${targetTopic.section_id}-other`,
      topic_name: 'General / Unclassified',
      questions: otherQuestions,
    });
  }

  return {
    section_id: targetTopic.section_id,
    section_name: targetTopic.section_name,
    subtopicGroups,
  };
}

export interface YearSectionGroup {
  section_id: string;
  section_name: string;
  questions: BMQuestion[];
}

export interface YearQuestionsData {
  year: number;
  sections: YearSectionGroup[];
}

/**
 * Retrieves all questions for a selected examination year for any category from R2.
 */
export async function getQuestionsForYear(
  yearNum: number,
  categoryCode = 'BM'
): Promise<YearQuestionsData | null> {
  const data = await readCategoryData(categoryCode);
  if (!data || !data.metadata || !Array.isArray(data.metadata.topics) || !Array.isArray(data.questions)) {
    return null;
  }

  const yearQuestions = data.questions.filter((q) => {
    if (q.hide) return false;
    const qYear = typeof q.year === 'number' ? q.year : parseInt(String(q.year), 10);
    return qYear === yearNum;
  });

  if (yearQuestions.length === 0) {
    return null;
  }

  const definedTopics = data.metadata.topics;
  const sections: YearSectionGroup[] = [];

  for (const topic of definedTopics) {
    const questionsForSection = yearQuestions.filter((q) => q.section_id === topic.section_id);
    if (questionsForSection.length > 0) {
      sections.push({
        section_id: topic.section_id,
        section_name: topic.section_name,
        questions: questionsForSection,
      });
    }
  }

  const knownSectionIds = new Set(definedTopics.map((t) => t.section_id));
  const unclassified = yearQuestions.filter((q) => !q.section_id || !knownSectionIds.has(q.section_id));
  if (unclassified.length > 0) {
    sections.push({
      section_id: 'other',
      section_name: 'General / Other',
      questions: unclassified,
    });
  }

  return {
    year: yearNum,
    sections,
  };
}
