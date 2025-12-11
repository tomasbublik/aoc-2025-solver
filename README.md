# 🎄 Advent of Code 2025 – AI Kotlin Solver

Automatic Kotlin solution generator for [Advent of Code 2025](https://adventofcode.com/2025) powered by OpenAI GPT.

**✨ NEW:** Now automatically solves **both Part 1 and Part 2**!

## 📚 Quick Links

- **[🚀 Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[📋 Changelog](CHANGELOG.md)** - Version history and updates

---

## 📖 About the Project

This project automatically:

1. **Downloads the puzzle** and input data from Advent of Code
2. **Generates a Kotlin solution for Part 1** using the OpenAI GPT model
3. **Compiles and runs the solution** to get the answer
4. **Submits Part 1 answer** to Advent of Code
5. **Downloads Part 2** description after successful submission
6. **Generates updated solution** for both Part 1 and Part 2
7. **Compiles, runs, and submits Part 2** answer
8. **Saves the code and results** to the `solutions/` directory
9. **Commits and pushes** the results back to the repository

The entire process runs automatically via GitHub Actions every day from 1st to 12th December 2025 at **06:00 CET** (5:00 UTC).

## ✨ Key Features

- 🤖 **AI-Powered** - Uses GPT-5.1 to understand and solve puzzles
- 🔄 **Full Automation** - Works for both Part 1 and Part 2
- 📊 **Metadata Tracking** - Saves results and submission status
- 🧹 **Clean Output** - Organised solutions and inputs
- ⏰ **Daily Schedule** - Runs at 6am CET automatically

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
│   ├── day01.json         # Metadata with results
│   ├── day02.json
│   └── ...
├── .github/workflows/
│   └── aoc-2025-solver.yml # GitHub Actions workflow (6am CET)
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
- The complete problem statement (for Part 2: includes both Part 1 and Part 2)
- A sample of the input
- For Part 2: the previous Part 1 solution

It generates a complete Kotlin programme that:
- Reads input from a file
- Implements the solution logic
- Prints results as `Part 1: <answer>` and `Part 2: <answer>`

### 3. Compilation and Execution

The generated Kotlin code is:
1. Compiled using `kotlinc` to a JAR file
2. Executed with the downloaded input
3. Output parsed to extract Part 1 and Part 2 answers

### 4. Submission

Answers are automatically submitted to Advent of Code and the response is logged:
- ✅ Correct answer
- ❌ Wrong answer
- ⏳ Rate limited
- 🔒 Already completed

### 5. Part 2 Process

After successful Part 1 submission:
1. Wait 2 seconds (to be polite to AoC servers)
2. Fetch updated page with Part 2 description
3. **Extract BOTH Part 1 and Part 2** descriptions (Part 2 is often just delta/changes)
4. Generate updated solution with both parts
5. Compile, run, and submit Part 2

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- Kotlin compiler (`kotlinc`)
- Java 17+ (to run compiled Kotlin)
- OpenAI API key
- Advent of Code session cookie

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd aoc-2025-solver
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**
   ```bash
   export AOC_SESSION="your_session_cookie"
   export OPENAI_API_KEY="sk-..."
   export DAY_OVERRIDE="1"  # Optional: override day
   ```

4. **Run the solver**
   ```bash
   npm run solve
   ```

### GitHub Actions Setup

1. **Add secrets to your repository**
   - Go to Settings → Secrets and variables → Actions
   - Add `OPENAI_API_KEY` with your OpenAI API key
   - Add `AOC_SESSION` with your AoC session cookie

2. **Enable GitHub Actions**
   - The workflow runs automatically at **06:00 CET** (5:00 UTC) daily
   - Or trigger manually via Actions tab → Run workflow

---

## 🔧 Running the Generated Kotlin Solution

After the solver generates Kotlin code, you can compile and run it manually to verify the solution.

### Compilation and Execution

```bash
# Compile to JAR file
kotlinc solutions/Day01.kt -include-runtime -d Day01.jar

# Run with input file
java -jar Day01.jar inputs/day01.txt
```

### Direct Execution (without JAR)

```bash
# Run directly with Kotlin interpreter
kotlin solutions/Day01.kt inputs/day01.txt
```

### Installing Kotlin

**macOS:**
```bash
brew install kotlin
```

**Linux:**
```bash
curl -s https://get.sdkman.io | bash
source "$HOME/.sdkman/bin/sdkman-init.sh"
sdk install kotlin
```

**Windows:**
```powershell
choco install kotlin
```

### Verifying Installation

```bash
kotlinc -version
# Should output: Kotlinc-JVM 1.9.x (or higher)

java -version
# Should output: Java 17 or higher
```

---

## 📅 Schedule

The workflow runs:
- **Daily at 06:00 CET** (5:00 UTC)
- From **30th November** to **11th December** UTC
- Which corresponds to **1st-12th December** CET

```yaml
schedule:
  - cron: "0 5 30 11 *"  # 30 Nov at 5:00 UTC
  - cron: "0 5 1-11 12 *"  # 1-11 Dec at 5:00 UTC
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | ✅ Yes |
| `AOC_SESSION` | Advent of Code session cookie | ✅ Yes |
| `DAY_OVERRIDE` | Override day (1-25) for testing | ❌ No |
| `YEAR` | Year (default: 2025) | ❌ No |

### Finding Your Session Cookie

1. Log in to [adventofcode.com](https://adventofcode.com)
2. Open DevTools (F12)
3. Go to Application → Cookies → `https://adventofcode.com`
4. Copy the value of the `session` cookie

---

## 📂 Output Files

### Solutions Directory

Each day generates:
- `DayXX.kt` - Kotlin source code
- `dayXX.json` - Metadata with results

Example `day01.json`:
```json
{
  "part1": {
    "kotlinCode": "...",
    "answer": "1182",
    "submitted": true,
    "message": "Correct answer!"
  },
  "part2": {
    "kotlinCode": "...",
    "answer": "6907",
    "submitted": true,
    "message": "Correct answer!"
  }
}
```

---

## 🐛 Troubleshooting

### "Missing AOC_SESSION"
- Ensure you've added the session cookie as a GitHub secret
- Check the cookie is still valid (they expire after ~1 month)

### "Kotlin compilation failed"
- Verify Kotlin compiler is installed: `kotlinc -version`
- Check the generated Kotlin code for syntax errors

### "Could not extract Part 1/2 answer"
- Check the Kotlin code prints in format: `Part 1: <answer>`
- Review the solution output in the workflow logs

### Part 2 has same answer as Part 1
- This was fixed in v2.3.1
- Part 2 now receives both Part 1 and Part 2 descriptions
- AI understands the delta/changes properly

---

## 📜 Licence

MIT Licence - feel free to use this for your own Advent of Code adventures!

---

## 🙏 Credits

- [Advent of Code](https://adventofcode.com) by Eric Wastl
- [OpenAI GPT](https://openai.com) for solution generation
- [Kotlin](https://kotlinlang.org) programming language

---

## 📝 Version History

See [CHANGELOG.md](CHANGELOG.md) for full version history.

**Current version: 2.3.1**
- ✅ Proper Part 2 extraction (includes Part 1 + Part 2 context)
- ✅ Runs at 06:00 CET daily
- ✅ Full automation for both parts

---

**Happy Advent of Code! 🎄✨**
