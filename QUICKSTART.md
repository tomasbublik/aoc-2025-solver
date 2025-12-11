# 🚀 Quick Start Guide

Get your Advent of Code 2025 AI solver running in 5 minutes!

---

## Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js 20+** installed
- ✅ **Kotlin compiler** (`kotlinc`) installed
- ✅ **Java 17+** installed
- ✅ **OpenAI API key**
- ✅ **Advent of Code session cookie**

---

## 🎯 Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd aoc-2025-solver

# Install dependencies
npm install
```

---

## 🔑 Step 2: Get Your Credentials

### OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Copy the key (starts with `sk-...`)

### Advent of Code Session Cookie

1. Log in to [adventofcode.com](https://adventofcode.com)
2. Open browser DevTools (F12)
3. Go to **Application** → **Cookies** → `https://adventofcode.com`
4. Copy the value of the `session` cookie

---

## 🎮 Step 3: Local Testing

```bash
# Set environment variables
export AOC_SESSION="your_session_cookie_here"
export OPENAI_API_KEY="sk-your_api_key_here"
export DAY_OVERRIDE="1"  # Test with day 1

# Run the solver
npm run solve
```

You should see output like:
```
🎄 Solving Advent of Code 2025 day 1...

=== PART 1 ===
✓ Downloaded input to inputs/day01.txt
🤖 Generating Kotlin solution for Part 1...
✓ Saved Kotlin solution to solutions/Day01.kt
🔨 Compiling and running Part 1...
✓ Part 1 answer: 1182
📤 Submitting Part 1 answer...
✅ Correct answer!

=== PART 2 ===
📥 Fetching Part 2 description...
📝 Extracted FULL statement for Part 2 (8234 chars, 2 articles)
🤖 Generating Kotlin solution for Part 2...
✓ Updated Kotlin solution in solutions/Day01.kt
🔨 Compiling and running Part 2...
✓ Part 2 answer: 6907
📤 Submitting Part 2 answer...
✅ Correct answer!

🎉 Done!
```

---

## ☁️ Step 4: GitHub Actions Setup

### Add Secrets

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `AOC_SESSION` | Your AoC session cookie |

### Enable Workflow

The workflow is configured to run automatically:
- **Daily at 06:00 CET** (5:00 UTC)
- From 1st to 12th December 2025

You can also run it manually:
1. Go to **Actions** tab
2. Select "Advent of Code 2025 Solver"
3. Click **Run workflow**
4. Optionally specify a day to override

---

## 📂 Check the Results

After running, check:

### Local Files
```
inputs/
  day01.txt          # Downloaded input
solutions/
  Day01.kt           # Generated Kotlin code
  day01.json         # Metadata with results
```

### GitHub Repository
- Results are automatically committed and pushed
- Check the **Actions** tab for workflow logs
- Review commits for daily solutions

---

## 🎯 What Happens Automatically

1. ✅ Downloads puzzle and input from AoC
2. ✅ Generates Kotlin solution for Part 1
3. ✅ Compiles and runs the code
4. ✅ Submits Part 1 answer
5. ✅ Fetches Part 2 description (includes Part 1 + Part 2 context)
6. ✅ Generates updated solution for both parts
7. ✅ Compiles, runs, and submits Part 2
8. ✅ Saves everything and commits to repository

---

## 🐛 Common Issues

### "Missing AOC_SESSION env var"
- **Solution**: Set the environment variable or add as GitHub secret

### "Kotlin compilation failed"
- **Solution**: Ensure `kotlinc` is installed and in PATH
- Check: `kotlinc -version`

### "Could not extract Part 1 answer"
- **Solution**: Check the generated Kotlin code in `solutions/DayXX.kt`
- Ensure it prints: `Part 1: <answer>`

### Part 2 answer same as Part 1
- **Solution**: This is fixed in v2.3.1
- Update to latest version
- Part 2 now receives full context (Part 1 + Part 2)

---

## 📝 Next Steps

- **[Read the full documentation](README.md)** for more details
- **[Check the changelog](CHANGELOG.md)** for version history
- **[Review workflow logs](../../actions)** on GitHub

---

## 🎄 Tips for Success

- ✨ Run locally first to test everything works
- ✨ Check your session cookie hasn't expired (they last ~1 month)
- ✨ Monitor the GitHub Actions runs for any issues
- ✨ The solver runs at 6am CET - puzzles unlock at midnight EST (6am CET)

---

**Happy solving! 🚀✨**

