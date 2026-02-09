# City Holder Daily API

This Cloudflare Worker provides API endpoints for the City Holder Daily quiz game.

## Setup

### 1. Create D1 Database

```bash
cd city-holder-daily
wrangler d1 create city-holder-db
```

Copy the database ID to `wrangler.toml` under `database_id`.

### 2. Apply Database Schema

```bash
wrangler d1 execute city-holder-db --file=schema.sql
```

### 3. Extract and Seed Data

```bash
node extract-and-seed.js
wrangler d1 execute city-holder-db --file=seed.sql
```

### 4. Deploy Worker

```bash
wrangler deploy
```

## API Endpoints

### Get Questions by Date

```bash
GET /api/by-date/2026-02-10
```

Returns all 10 questions for the specified date.

### Get Questions by Day Number

```bash
GET /api/by-number/380
```

Returns all 10 questions for day number 380.

### Search Questions

```bash
GET /api/search?q=Matrix
```

Searches questions and answers for the query string.

## Local Development

```bash
wrangler dev
```

## Response Format

```json
{
  "date": "2026-02-10",
  "day_number": 380,
  "total_questions": 10,
  "questions": [
    {
      "day_number": 380,
      "date": "2026-02-10",
      "question_number": 1,
      "question": "What year was Pimp My Ride first aired?",
      "answer": "2004",
      "options": ["2004", "2002", "2006", "2005"]
    }
  ]
}
```
