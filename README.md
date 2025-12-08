# 🎄 Advent of Code 2025 – AI Kotlin Solver

Automatic Kotlin solution generator for [Advent of Code 2025](https://adventofcode.com/2025) powered by OpenAI GPT.

---

## 📖 About the Project

This project automatically:

1. **Downloads the puzzle** and input data from Advent of Code
2. **Generates a Kotlin solution** using the OpenAI GPT model
3. **Saves the code** to the `solutions/` directory
4. **Commits and pushes** the results back to the repository

The entire process runs automatically via GitHub Actions every day from 1st to 12th December 2025 at **00:01 CET**.

---

## 🏗️ Project Structure

```
aoc-2025-solver/
├── src/
│   └── aoc_solver.ts      # Main TypeScript solver
├── inputs/                 # Downloaded inputs (gitignore)
│   ├── day01.txt
│   ├── day02.txt
│   └── ...
├── solutions/              # Generated Kotlin solutions (gitignore)
│   ├── Day01.kt
│   ├── Day02.kt
│   └── ...
├── .github/workflows/
│   └── aoc-2025-solver.yml # GitHub Actions workflow
├── package.json
├── tsconfig.json
└── README.md
```

---

## ⚙️ How It Works

### 1. Downloading Data from AoC

The solver connects to `adventofcode.com` using a session cookie and downloads:
- **Puzzle description** (HTML → text)
- **Input data** for the given day

### 2. Generating Kotlin Code

The OpenAI GPT model receives:
- The puzzle description
- A sample of the input data

And generates a complete Kotlin solution that:
- Reads input from a file (passed as an argument)
- Solves both parts (Part 1 & Part 2)
- Outputs results in the format `Part 1: <answer>` and `Part 2: <answer>`

### 3. Saving the Results

- Kotlin code → `solutions/DayXX.kt`
- Input data → `inputs/dayXX.txt`
- Metadata (JSON) → `solutions/dayXX.json`

---

## 🚀 Running the Solver

### Local Execution

```bash
# Install dependencies
npm install

# Set environment variables
export AOC_SESSION="your_aoc_session_cookie"
export OPENAI_API_KEY="your_openai_api_key"
export DAY_OVERRIDE="1"  # Optional: overrides the day

# Run the solver
npm start
# or
npx ts-node src/aoc_solver.ts
```

### Via GitHub Actions

The workflow runs automatically:
- **When:** Every day at 00:01 CET (23:01 UTC the previous day)
- **Period:** 1st – 12th December 2025

#### Manual Execution

1. Go to **Actions** → **Advent of Code 2025 solver (TS)**
2. Click on **Run workflow**
3. Optionally enter a day (1-25) in the `day_override` field
4. Click on **Run workflow**

#### Required Secrets

The following secrets must be configured in the repository:

| Secret | Description |
|--------|-------------|
| `AOC_SESSION` | Session cookie from adventofcode.com (after logging in) |
| `OPENAI_API_KEY` | API key for OpenAI |

---

## 🔧 Running the Generated Kotlin Solution

After generating the Kotlin code, you can compile and run it:

### Compilation and Execution

```bash
# Compile to JAR file
kotlinc solutions/Day01.kt -include-runtime -d Day01.jar

# Run with input file
java -jar Day01.jar inputs/day01.txt
```

### Direct Execution (without JAR)

```bash
kotlin solutions/Day01.kt inputs/day01.txt
```

### Installing Kotlin (macOS)

```bash
brew install kotlin
```

---

## 📅 Scheduling (Cron)

```yaml
schedule:
  - cron: "1 23 30 11 *"    # 1st December 00:01 CET
  - cron: "1 23 1-11 12 *"  # 2nd–12th December 00:01 CET
```

---

## 🛠️ Technologies

- **TypeScript** – main solver language
- **OpenAI GPT** – Kotlin code generation
- **Kotlin** – target solution language
- **GitHub Actions** – automation
- **Cheerio** – HTML parsing of puzzle descriptions
- **Axios** – HTTP requests

---

## 📝 Notes

- The generated code may not always be 100% correct – AI can make mistakes
- It is recommended to review and adjust the solution if necessary
- The AoC session cookie expires over time – it needs to be renewed

---

## 📜 Licence

MIT

---

**🎅 Happy Advent of Code 2025 solving!**
