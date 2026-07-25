# Agafari AI Backend 🚀

A high-performance, asynchronous FastAPI platform powering the **Agafari** citizen-services intelligence platform. It features vector-based hybrid RAG search, AI-driven change detection, admin approval workflows, and background service summarization built over NeonDB (PostgreSQL + pgvector).

---

## 🛠️ Tech Stack & Setup
- **Framework**: FastAPI (Python 3.12)
- **Database**: NeonDB (PostgreSQL + `pgvector`) via `psycopg` (v3) & SQLAlchemy Async
- **LLM / AI Orchestration**: Addis AI (`gpt-4o-mini`), OpenRouter Embeddings (`text-embedding-3-small`)

### Local Development Setup

1. **Activate Virtual Environment**:
   ```bash
   source .venv/bin/activate
   ```
2. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```
3. **Environment Variables (`.env`)**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql+psycopg://username:password@ep-example-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
   ADDIS_AI_API_KEY=your_addis_ai_key
   ADDIS_AI_BASE_URL=https://api.addis.ai/v1
   OPENROUTER_API_KEY=your_openrouter_key
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
   EMBEDDING_MODEL=text-embedding-3-small
   ```
4. **Run Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

---

## 📡 API Endpoint Guide for Frontend Developers

Base URL: `http://localhost:8000/api/v1`

### 1. Citizen Service Feed & Details

#### `GET /services`
Returns a lightweight list of public government services for the main catalog/feed.
- **Query Params**:
  - `category` (optional): Filter by category string (e.g. `"Identity & Travel"`).
  - `q` (optional): Case-insensitive search query term.
- **Response**: Array of `ServiceFeedSchema` objects.

#### `GET /services/{slug}`
Returns the full service guide (requirements, fee, processing time, verification status, and sources).
- **Path Param**: `slug` (e.g., `passport-renewal`, `fayda-national-id`).
- **Response**: Complete `ServiceDetailSchema` object.

---

### 2. Service-Aware RAG Chatbot 💬

#### `POST /services/{service_id}/chat`
Sends a message to the AI chatbot specifically contextualized for a given government service using hybrid RAG (cosine vector similarity + keyword search with RRF fusion).

- **Path Param**: `service_id` (UUID string)
- **Request Body**:
  ```json
  {
    "message": "What is the fee for renewing my passport urgently?"
  }
  ```
- **Response**:
  ```json
  {
    "reply": "የፓስፖርት እድሳት አዲሱ ክፍያ 5000 ብር ነው።...",
    "cited_sources": [
      {
        "source_id": "uuid-here",
        "source_title": "Directive 2026/05 - Fee Update",
        "source_url": "https://..."
      }
    ]
  }
  ```

---

### 3. Automatic Background Summarizer ⚡

#### `POST /services/{service_id}/generate-summary`
Triggers an asynchronous background worker using FastAPI `BackgroundTasks`. The AI reads all service requirements, fees, and directives, synthesizes a concise Amharic summary, and updates the `ai_summary` field in NeonDB.

- **Path Param**: `service_id` (UUID string)
- **Status Code**: `202 Accepted`
- **Response**:
  ```json
  {
    "message": "Summary generation started in the background."
  }
  ```

---

### 4. Admin Change Log & Verification Workflow 🛡️

#### `GET /admin/change-logs`
Fetches all pending, AI-detected policy changes that require human approval.
- **Response**: Array of pending `ChangeLogSchema` items containing `old_data_snapshot`, `new_data_snapshot`, and `ai_change_summary`.

#### `POST /admin/change-logs/{log_id}/approve`
Approves an AI-detected policy change.
- Updates the change log status to `APPROVED`.
- Restores the service's `verification_status` to `VERIFIED` and sets `last_verified_at` to the current timestamp.

#### `POST /admin/change-logs/{log_id}/reject`
Rejects an unverified or invalid policy report.

---

### 5. Document Ingestion & Directives 📄

#### `POST /sources`
Ingests an official notice, directive, or user report. Automatically chunks, embeds, and indexes the document into `pgvector` while triggering AI-driven change detection.

- **Request Body**:
  ```json
  {
    "agency_id": "agency-uuid",
    "service_id": "service-uuid",
    "source_type": "PDF_DIRECTIVE",
    "title": "Directive 2026/05 - Fee Update",
    "source_url": "https://...",
    "raw_text_content": "Official text content..."
  }
  ```

---

## 🧪 Testing

To run the automated End-to-End tests:
```bash
source .venv/bin/activate
python scripts/test_e2e.py
python scripts/test_summarizer.py
```
