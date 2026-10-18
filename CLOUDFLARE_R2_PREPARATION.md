# Cloudflare R2 Preparation & Architecture Guide

This document outlines the architecture, data schemas, directory conventions, and future integration steps for Cloudflare R2 private bucket integration.

---

## 1. Planned R2 Storage Structure

The private Cloudflare R2 bucket contains three primary components:

```text
<bucket-root>/
├── master.json                          # Global master catalogue of all categories/branches
├── questions/
│   ├── BM.json                          # Biomedical Engineering question bank (technical + GA)
│   └── <BRANCH_CODE>.json               # Any future engineering branch (e.g. CS.json, ME.json, EC.json)
└── images/
    ├── branches/
    │   ├── GA.webp                      # General Aptitude cover card visual
    │   ├── BM.webp                      # Biomedical Engineering cover visual
    │   └── <BRANCH_CODE>.webp           # Future branch cover visuals
    ├── questions/
    │   ├── BM-2022-S1-Q015.webp         # Question images named by original question_id
    │   └── <QUESTION_ID>.webp           # All diagrammatic and formula question assets
    └── error.webp                       # Universal fallback image
```

> **Important**: There is **no separate `GA.json` file**. Engineering branch question banks (`BM.json`, `CS.json`, etc.) contain both technical questions and General Aptitude questions. The GA category dynamically aggregates General Aptitude questions across all available branch question banks.

---

## 2. Master Catalogue (`master.json`)

The master catalogue serves as the single source of truth for categories and their display order.

### Schema:
```json
{
  "version": "1.0",
  "updated_at": "2026-10-18T22:00:00Z",
  "categories": [
    {
      "code": "GA",
      "name": "General Aptitude",
      "type": "shared",
      "description": "General Aptitude questions across all GATE disciplines",
      "image": "/generalaptitude.webp",
      "r2_image_path": "images/branches/GA.webp",
      "is_always_first": true,
      "is_aggregated": true,
      "enabled": true
    },
    {
      "code": "BM",
      "name": "Biomedical Engineering",
      "type": "engineering",
      "description": "Biomedical Engineering GATE preparation",
      "image": "/biomedical.webp",
      "r2_image_path": "images/branches/BM.webp",
      "data_file": "questions/BM.json",
      "is_always_first": false,
      "is_aggregated": false,
      "enabled": true
    }
  ]
}
```

- **General Aptitude (GA) Priority**: GA is designated with `is_always_first: true`. The data layer guarantees GA always appears first in the homepage category list.
- **Aggregated Category**: GA has `is_aggregated: true` and **does not point to a nonexistent `questions/GA.json` file**. Instead, it dynamically collects GA questions across all engineering branch question files.

---

## 3. Engineering Branch Question Bank Schema (`questions/<BRANCH_CODE>.json`)

Each engineering branch has its own question bank file containing both technical questions and General Aptitude questions:

```json
{
  "metadata": {
    "exam": "GATE",
    "paper_code": "BM",
    "paper_name": "Biomedical Engineering",
    "topics": [
      {
        "section_id": "BM-S01",
        "section_name": "Engineering Mathematics",
        "subtopics": [
          {
            "topic_id": "BM-S01-T01",
            "topic_name": "Linear Algebra"
          }
        ]
      },
      {
        "section_id": "BM-S02",
        "section_name": "Biomedical Engineering Core",
        "subtopics": [ ... ]
      },
      {
        "section_id": "BM-S03",
        "section_name": "General Aptitude",
        "subtopics": [
          { "topic_id": "BM-S03-T01", "topic_name": "Quantitative Aptitude" },
          { "topic_id": "BM-S03-T02", "topic_name": "Data Interpretation" },
          { "topic_id": "BM-S03-T03", "topic_name": "Verbal Ability" }
        ]
      }
    ]
  },
  "questions": [
    {
      "question_id": "BM-2022-S1-Q001",
      "original_question_number": "1",
      "pdf_page": 3,
      "section_id": "BM-S03",
      "section_name": "General Aptitude",
      "topic_id": "BM-S03-T03",
      "topic_name": "Verbal Ability",
      "question_type": "MCQ",
      "marks": 1,
      "original_text": "...",
      "display_text": "...",
      "options": ["(A)", "(B)", "(C)", "(D)"],
      "answer": {
        "source": "official_answer_key",
        "status": "available",
        "value": "D",
        "minimum": null,
        "maximum": null,
        "original_representation": "D"
      },
      "explanation": {
        "source": "AI-generated",
        "text": "..."
      },
      "contains_image": false,
      "image_assets": [],
      "is_general_aptitude": true,
      "include_in_initial_practice_bank": false,
      "hide": false,
      "review_required": false,
      "review_notes": [],
      "year": 2022
    }
  ]
}
```

---

## 4. How General Aptitude (GA) Operates

1. **No Duplicated Storage**: There is no separate `GA.json`. Questions are not duplicated.
2. **Dynamic Aggregation**: When a student practices GA (by topic or by year), the application dynamically queries the question banks of all active engineering branches in `master.json`.
3. **Identification**: Questions are identified as GA using the approved metadata criteria:
   - `is_general_aptitude === true`
   - or `section_id === 'BM-S03'` (or corresponding GA section ID for new branches)
   - or `section_name.toLowerCase() === 'general aptitude'`
4. **Metadata Preservation**: Every aggregated question retains its original `question_id`, `year`, `paper_code` (e.g. `BM`), topics, answers, explanations, image references, and `hide` flag.
5. **Standardized Subtopics**: Questions are grouped under the three standard GA topics:
   - `Quantitative Aptitude`
   - `Data Interpretation`
   - `Verbal Ability`
6. **Automatic Expansion**: When a new branch (e.g. `CS.json`) is added to `master.json`, its General Aptitude questions are **automatically included** in GA practice mode without requiring any frontend code changes.

---

## 5. Question Images and Loop-Proof Fallback

- **Naming Convention**:
  All question images in R2 are named using the original `question_id`:
  `images/questions/<QUESTION_ID>.webp` (e.g. `images/questions/BM-2022-S1-Q015.webp`).
- **Decoupled from Display Numbers**: Never named after display numbers (`Q1`, `Q2`), preserving image integrity regardless of user filters.
- **Infinite Loop-Proof Fallback**:
  - The `QuestionImage` component attempts to load `/images/questions/<QUESTION_ID>.webp`.
  - If it fails, it attempts fallback to `/error.webp`.
  - If `/error.webp` fails, it halts further requests and renders a clean bordered placeholder, preventing recursive browser network cascades.

---

## 6. How to Configure Environment Variables (`.env.local`)

1. Open `.env.local` in `gate-portal/`:
   ```dotenv
   R2_ACCOUNT_ID=
   R2_ACCESS_KEY_ID=
   R2_SECRET_ACCESS_KEY=
   R2_BUCKET_NAME=
   R2_ENDPOINT_URL=
   ```
2. Insert your Cloudflare R2 bucket credentials:
   - `R2_ACCOUNT_ID`: Cloudflare Account ID.
   - `R2_ACCESS_KEY_ID`: Cloudflare R2 API token Access Key ID.
   - `R2_SECRET_ACCESS_KEY`: Cloudflare R2 API token Secret Access Key.
   - `R2_BUCKET_NAME`: Name of your private R2 bucket.
   - `R2_ENDPOINT_URL`: `https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com`.
3. `.gitignore` is already configured to prevent `.env.local` and `.env*.local` from being tracked.

---

## 7. How to Add a New Branch Without Changing Frontend Code

When deploying new branches in the future:
1. Upload the branch question bank to R2:
   `questions/<NEW_CODE>.json` (e.g. `questions/CS.json`)
2. Upload the branch card visual to R2:
   `images/branches/<NEW_CODE>.webp` (e.g. `images/branches/CS.webp`)
3. Add an entry to `master.json`:
   ```json
   {
     "code": "CS",
     "name": "Computer Science & Information Technology",
     "type": "engineering",
     "image": "/images/branches/CS.webp",
     "data_file": "questions/CS.json",
     "is_always_first": false,
     "is_aggregated": false,
     "enabled": true
   }
   ```
4. **Automatic Effects**:
   - The new branch card appears automatically in the homepage 2-column grid.
   - Engineering practice for `CS` uses `questions/CS.json`.
   - General Aptitude questions inside `CS.json` are **automatically aggregated** into GA practice mode.

---

## 8. What Remains for the Future Cloudflare Phase

The following will be done in the subsequent Cloudflare implementation phase:
- Install `@aws-sdk/client-s3` (S3-compatible client for R2).
- Implement server-side R2 fetchers with S3 SDK / Signed URLs for private image access.
- Upload `master.json`, `questions/<BRANCH>.json`, and `images/**` to the private R2 bucket.
- Connect Next.js cache / revalidation tags (`next: { revalidate: 3600 }`) to avoid hitting R2 on every request.
