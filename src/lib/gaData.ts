import { getMasterCatalogue, readCategoryData } from './bmData';

export interface GAQuestion {
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
  answer?: {
    source?: string;
    status?: string;
    value?: string | number | null | string[];
    minimum?: number | null;
    maximum?: number | null;
    original_representation?: string;
    [key: string]: unknown;
  };
  explanation?: { source?: string; text?: string; [key: string]: unknown } | string;
  contains_image?: boolean;
  image_assets?: unknown[];
  year?: number;
  paper_code?: string;
  is_general_aptitude?: boolean;
  hide?: boolean;
  [key: string]: unknown;
}

export interface GASubtopicGroup {
  topic_id: string;
  topic_name: string;
  questions: GAQuestion[];
}

export interface GAYearQuestionsData {
  year: number;
  questions: GAQuestion[];
}

let gaQuestionsCache: GAQuestion[] | null = null;

/**
 * Dynamically scans and collects General Aptitude questions across all engineering branch
 * question bank files in Cloudflare R2 registered in the master catalogue.
 * Preserves each question's original ID, year, paper_code, topics, answers, and explanations.
 * Eliminates duplicate questions by question_id.
 */
export async function collectAllGAQuestions(): Promise<GAQuestion[]> {
  if (gaQuestionsCache) {
    return gaQuestionsCache;
  }

  const catalogue = await getMasterCatalogue();
  const engineeringBranches = catalogue
    .filter((c) => c.type === 'engineering' && c.enabled !== false)
    .map((c) => c.code);

  const branchesToScan = engineeringBranches.length > 0 ? engineeringBranches : ['BM'];
  const collectedMap = new Map<string, GAQuestion>();

  for (const code of branchesToScan) {
    const data = await readCategoryData(code);
    if (data && Array.isArray(data.questions)) {
      for (const q of data.questions) {
        if (q.hide) continue;

        const isGA =
          q.is_general_aptitude === true ||
          q.section_id === 'BM-S03' ||
          q.section_name?.toLowerCase() === 'general aptitude';

        if (isGA && !collectedMap.has(q.question_id)) {
          collectedMap.set(q.question_id, {
            ...q,
            paper_code: q.paper_code || code.toUpperCase(),
            section_name: 'General Aptitude',
          });
        }
      }
    }
  }

  const result = Array.from(collectedMap.values());
  gaQuestionsCache = result;
  return result;
}

/**
 * Returns available examination years for General Aptitude dynamically from R2.
 */
export async function getAvailableGAYears(): Promise<number[]> {
  const questions = await collectAllGAQuestions();
  const yearsSet = new Set<number>();

  for (const q of questions) {
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

export async function getGASubtopicGroups(): Promise<GASubtopicGroup[]> {
  return getGATopicQuestions();
}

/**
 * Returns GA questions organized strictly by the 3 specified subtopics:
 * 1. Quantitative Aptitude
 * 2. Data Interpretation
 * 3. Verbal Ability
 */
export async function getGATopicQuestions(): Promise<GASubtopicGroup[]> {
  const questions = await collectAllGAQuestions();

  const quantitative: GAQuestion[] = [];
  const dataInterpretation: GAQuestion[] = [];
  const verbal: GAQuestion[] = [];

  for (const q of questions) {
    const topicName = (q.topic_name || '').toLowerCase();
    const topicId = (q.topic_id || '').toLowerCase();

    if (
      topicName.includes('verbal') ||
      topicName.includes('english') ||
      topicId.includes('verbal')
    ) {
      verbal.push(q);
    } else if (
      topicName.includes('data interpretation') ||
      topicName.includes('interpretation') ||
      topicId.includes('di')
    ) {
      dataInterpretation.push(q);
    } else {
      quantitative.push(q);
    }
  }

  const sortByYearDesc = (a: GAQuestion, b: GAQuestion) => {
    const yA = typeof a.year === 'number' ? a.year : parseInt(String(a.year || 0), 10);
    const yB = typeof b.year === 'number' ? b.year : parseInt(String(b.year || 0), 10);
    return yB - yA;
  };

  quantitative.sort(sortByYearDesc);
  dataInterpretation.sort(sortByYearDesc);
  verbal.sort(sortByYearDesc);

  return [
    {
      topic_id: 'quantitative-aptitude',
      topic_name: 'Quantitative Aptitude',
      questions: quantitative,
    },
    {
      topic_id: 'data-interpretation',
      topic_name: 'Data Interpretation',
      questions: dataInterpretation,
    },
    {
      topic_id: 'verbal-ability',
      topic_name: 'Verbal Ability',
      questions: verbal,
    },
  ];
}

/**
 * Returns all GA questions for a specific examination year from R2.
 */
export async function getGAQuestionsForYear(yearNum: number): Promise<GAYearQuestionsData | null> {
  const allGA = await collectAllGAQuestions();
  const yearQuestions = allGA.filter((q) => {
    const qYear = typeof q.year === 'number' ? q.year : parseInt(String(q.year), 10);
    return qYear === yearNum;
  });

  if (yearQuestions.length === 0) {
    return null;
  }

  return {
    year: yearNum,
    questions: yearQuestions,
  };
}
