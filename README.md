# EduVerse AI — The Adaptive Learning Universe

> **Tagline:** Learn Differently. Understand Deeply. Master Anything.
>
> **Hackathon Edition:** International AI Education Hackathon Project
>
> **Stack:** React 18, TypeScript, Vite, Tailwind CSS, FastAPI, SQLite / SQLAlchemy, Mistral 7B Cloud API (`open-mistral-7b`)

---

## 1. Project Overview & Core Innovation

**EduVerse AI** is an intelligent full-stack learning platform that connects three specialized AI engines through a **shared student learning profile** and a **concept dependency graph**:

1. **LumiLearn AI** — *AI Learning Debugger*
   - Investigates *why* a student is struggling.
   - Evaluates student responses and explicit reasoning along with 1-to-5 confidence ratings.
   - Diagnoses conceptual misconceptions, off-by-one errors, and boundary slips using predefined rules and Mistral 7B structured reasoning.
   - Recommends targeted remedial simulations and reassesses learning on fresh, unmemorized questions.

2. **LearnMorph AI** — *Multimodal Learning Transformer*
   - Transforms educational topics or uploaded PDF lessons into **9 adaptive formats**:
     1. Simple text explanation
     2. Step-by-step logical breakdown
     3. Visual ASCII / flowchart diagrams
     4. Worked examples with walkthroughs and solutions
     5. Practice questions
     6. Text-to-speech audio narration (Web Speech API)
     7. Regional-language explanations (**Tamil & Malayalam**)
     8. Real-world engineering applications
     9. High-yield revision notes

3. **ConceptVerse AI** — *Interactive Experiment Lab*
   - Students learn by experimenting rather than only reading.
   - **Deterministic Simulations:**
     - **C Programming Loop Visualizer:** Live variable state tracking (`i`, `count`), condition evaluation (`<` vs `<=`), iteration stepper, infinite-loop safety trip, and student prediction challenges.
     - **Ohm's Law Circuit Simulator:** Interactive schematic with battery voltage slider, load resistance slider, live current $I = V/R$ and power $P = V \times I$ calculation, and dynamic lightbulb filament glow.
     - **Binary Search Explorer:** Step-by-step array partition pointer visualization ($O(\log N)$).
   - Feeds telemetry back into the student profile with **"Send Results to LumiLearn"**.

---

## 2. The Connected Feedback Loop

```
   ┌─────────────────────────────────────────────────────────────────┐
   │                     Student Learning Profile                    │
   │  (Goals, Concept Masteries, Confidence Calibration, Telemetry)  │
   └────────────────┬───────────────────────────────▲────────────────┘
                    │                               │
                    ▼                               │
        [1. LearnMorph AI]                          │
        Multimodal Content                          │ [4. Reassessment]
        Transformation & Audio                      │ LumiLearn confirms
                    │                               │ conceptual recovery
                    ▼                               │
        [2. LumiLearn AI Debugger]                  │
        Diagnostic Question, Reasoning              │
        & 1-5 Confidence Calibration                │
                    │                               │
                    ▼ (Misconception Detected)      │
        [3. ConceptVerse Lab] ──────────────────────┘
        Targeted Interactive Simulation
        & Prediction Challenge
```

---

## 3. Technology Stack

- **Frontend:**
  - React 18, TypeScript, Vite
  - Tailwind CSS with custom Dark Indigo & Cyan/Violet motifs
  - Lucide React icons
  - Canvas Confetti for celebratory mastery milestones
  - Web Speech API for voice narration
- **Backend:**
  - Python 3.10+ / 3.14
  - FastAPI with high-performance asynchronous endpoints
  - Pydantic v2 schemas for strict input/output validation
  - SQLAlchemy ORM with SQLite (easy migration to PostgreSQL)
  - `pypdf` for extracting text from uploaded lesson PDFs
- **AI Engine:**
  - **Mistral 7B Cloud API** (`open-mistral-7b` / `mistral-tiny` / `mistral-small-latest`)
  - Strict JSON mode output schemas
  - **Transparent Fallback Mode:** If no API key is provided, EduVerse AI seamlessly operates with a deterministic curated knowledge base, ensuring zero demo failures during presentations.

---

## 4. Setup & Running Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+ (Optional if using pre-built frontend)

### Quick Start (Single Command)

1. Clone or navigate to the repository directory:
   ```bash
   cd "ai for students"
   ```

2. Install Python dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

3. Configure Environment Variables (Optional):
   ```bash
   cp backend/.env.example backend/.env
   ```
   Add your `MISTRAL_API_KEY` to `backend/.env`. If omitted, EduVerse operates in Standby Fallback Demo Mode.

4. Run the Full-Stack Application:
   ```bash
   python run.py
   ```
   - Web Platform: **http://localhost:8000**
   - Interactive API Docs: **http://localhost:8000/docs**

### Frontend Development Mode (Optional)
If modifying React source files:
```bash
cd frontend
npm install
npm run dev
```
Vite will run on `http://localhost:5173` with automatic API proxying to port `8000`.

---

## 5. Automated Tests

Run the backend verification suite:
```bash
$env:PYTHONPATH = "backend"; python -m pytest backend/tests
```
All 5 automated tests evaluate:
- Answer evaluation correctness
- Rule-based & diagnostic misconception detection
- C Loop deterministic execution & infinite loop safety
- Ohm's law physics calculations

Run end-to-end integration test:
```bash
python verify_all_endpoints.py
```

---

## 6. Required 3-Minute Hackathon Demonstration Script

1. **Step 1: Landing Page & Ecosystem Overview (0:00 - 0:30)**
   - Open `http://localhost:8000`.
   - Point out the 3 connected engines: **LumiLearn**, **LearnMorph**, and **ConceptVerse**.
   - Click **"Launch 3-Minute Hackathon Demo"** to start the guided top-banner tour.

2. **Step 2: LearnMorph Content Transformation (0:30 - 1:15)**
   - Topic: `C Programming Loops`.
   - Switch tabs to show **Step-by-Step**, **Visual Diagram**, **Worked Example**, and **Regional Language (Tamil / Malayalam)**.
   - Click **"Play Narration"** under **Audio Narration** to demonstrate text-to-speech.
   - Click **"Assess in LumiLearn →"**.

3. **Step 3: LumiLearn Diagnostic Assessment & Misconception (1:15 - 2:00)**
   - View question: *"What is the value of variable 'count' printed after the loop finishes?"*
   - Intentionally select Option 1: `8 (Executed 4 times: count increases by 2 four times)`.
   - Enter reasoning: *"I assumed the loop stops when i reaches 4 so it only ran 4 times."*
   - Set Confidence Rating to **Level 4 (Confident)**.
   - Click **"Submit to AI Debugger"**.
   - **Show the result:**
     - Error Type: `conceptual / off_by_one`.
     - Confidence Calibration: `High Confidence + Incorrect = Strong Misconception Flag`.
     - Misconception Hypothesis Card: `Assuming loop variable stops at the boundary value rather than advancing to fail the condition`.
     - Click **"Launch ConceptVerse Lab to Debug Misconception →"**.

4. **Step 4: ConceptVerse Lab Experiment (2:00 - 2:40)**
   - In the C Loop Visualizer, click **"Next Iteration"** step-by-step.
   - Observe Iteration #5: Variable `i` becomes `5`, condition `5 < 5` evaluates to `FALSE`, and the loop exits.
   - Highlight: The variable reached 5 to fail the condition! It did *not* stop at 4!
   - Click **"Send to LumiLearn"** to integrate experimental telemetry.
   - Click **"Reassess Now →"**.

5. **Step 5: LumiLearn Reassessment & Progress Update (2:40 - 3:00)**
   - Present the alternate problem (`while (k <= 4)`).
   - Select Option 2: `total=60, k=5`.
   - Submit: Watch the confetti explosion!
   - Navigate to **Progress**: Show the +40% mastery jump and updated cohort telemetry in the **Teacher Portal**.

---

## 7. Limitations & Future Roadmap

- **LLM Rate Limits:** Fallback engine provides reliable demo safety during high API traffic or network drops.
- **Simulations Expansion:** Future simulations will include Binary Search Tree rebalancing, Kirchhoff's current laws, and Sorting algorithms.
- **Database Scalability:** SQLite is used for lightweight local demo evaluation; database layer is fully decoupled via SQLAlchemy for immediate PostgreSQL deployment.

---

*EduVerse AI — Built for the International AI Education Hackathon.*
