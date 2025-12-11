import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import { load as loadHtml } from "cheerio";
import OpenAI from "openai";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

const YEAR = parseInt(process.env.YEAR || "2025", 10);

function getDay(): number {
    const override = process.env.DAY_OVERRIDE;
    if (override && override.trim().length > 0) {
        return parseInt(override, 10);
    }

    const now = new Date();
    const month = now.getUTCMonth() + 1;
    const day = now.getUTCDate();

    if (month !== 12) {
        console.log("Not December, defaulting to day=1 (override DAY_OVERRIDE to change).");
        return 1;
    }
    return day;
}

async function fetchAocInputAndDescription(day: number, session: string, part2: boolean = false): Promise<{
    inputText: string;
    statementText: string;
}> {
    const baseUrl = `https://adventofcode.com/${YEAR}/day/${day}`;
    const inputUrl = `${baseUrl}/input`;

    const headers = {
        Cookie: `session=${session}`,
        "User-Agent": "github-actions-aoc-agent (https://github.com/yourname/yourrepo)",
    };

    // Fetch input
    const respIn = await axios.get(inputUrl, { headers });
    const inputText = (respIn.data as string).trimEnd();

    // Fetch problem statement
    const respHtml = await axios.get(baseUrl, { headers });
    const html = respHtml.data as string;

    const $ = loadHtml(html);

    let statementText = "";

    if (part2) {
        // For Part 2, we need the COMPLETE statement (Part 1 + Part 2)
        // Because Part 2 is typically just a delta/modification of Part 1
        const articles = $("article.day-desc");
        const articleTexts: string[] = [];

        articles.each((i, elem) => {
            articleTexts.push($(elem).text());
        });

        // Join all articles (Part 1 + Part 2)
        statementText = articleTexts.join("\n\n");

        console.log(`📝 Extracted FULL statement for Part 2 (${statementText.length} chars, ${articleTexts.length} articles)`);
    } else {
        // For Part 1, the first article is sufficient
        const article = $("article").first();
        statementText = article.length ? article.text() : $.root().text();
    }

    return { inputText, statementText };
}

type SolverResult = {
    kotlinCode: string;
    raw: any;
};

async function callOpenAISolver(
    day: number,
    inputText: string,
    statementText: string,
    part2Only: boolean = false,
    previousKotlinCode?: string
): Promise<SolverResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY");
    }

    const client = new OpenAI({ apiKey });

    const trimmedStatement = statementText.slice(0, 12000);

    let instructions: string;
    let userPrompt: string;

    if (part2Only && previousKotlinCode) {
        instructions = `
You are an expert competitive programming assistant solving Advent of Code ${YEAR}.

You previously solved Part 1 of this puzzle. Now Part 2 has been revealed.

CRITICAL INSTRUCTIONS:
1. Read the FULL problem statement INCLUDING Part 2 very carefully
2. Part 2 typically MODIFIES the rules from Part 1 - look for phrases like:
   - "Now, you need to..." / "Actually, you should..."
   - "Instead of..." / "But now..."
   - "The new rules are..." / "Using these new rules..."
   - "Using password method..." / "Now, an ID is invalid if..."
3. Part 2 will have a DIFFERENT answer than Part 1 for the same input
4. Common Part 2 patterns:
   - Count differently (e.g., "during rotation" vs "after rotation")
   - Additional constraints or rules
   - Different calculation method
   - Extended simulation
5. Part 2 is described usualy after the "--- Part Two ---" separator 

Your task:
- Identify the EXACT difference between Part 1 and Part 2 logic
- Modify the existing Kotlin solution to solve BOTH Part 1 AND Part 2
- The solution should:
  - Read input from a file path passed as command line argument (args[0])
  - Keep Part 1 logic working correctly
  - Add Part 2 logic (modified calculation/counting method)
  - Print results as "Part 1: <answer>" and "Part 2: <answer>"
- Use idiomatic Kotlin with proper error handling
- Include necessary imports
- Make sure the code compiles and runs correctly

Output format:
Respond with ONLY the complete Kotlin code, no markdown, no explanation, no code fences.
        `.trim();

        const sampleInput = inputText.slice(0, 200);

        userPrompt = `
Advent of Code ${YEAR}, day ${day} - Part 2.

=== FULL PROBLEM STATEMENT (including Part 2) ===
${trimmedStatement}

=== SAMPLE INPUT (for format understanding) ===
${sampleInput}

=== YOUR PREVIOUS SOLUTION (Part 1 only) ===
${previousKotlinCode}

CRITICAL: 
- Read Part 2 description carefully to understand HOW it differs from Part 1
- Part 2 will produce a DIFFERENT answer than Part 1 for the same input
- Update the solution to solve both parts correctly

Update this solution to solve both Part 1 and Part 2 correctly.
        `.trim();
    } else {
        instructions = `
You are an expert competitive programming assistant solving Advent of Code ${YEAR}.

Your task:
- Carefully analyze what the puzzle asks for
- Write a complete, working Kotlin solution that:
  - Reads input from a file path passed as command line argument (args[0])
  - Implements both part 1 and part 2 (if part 2 is visible, otherwise just part 1)
  - Prints results as "Part 1: <answer>" and "Part 2: <answer>"
- Use idiomatic Kotlin with proper error handling
- Include necessary imports
- Make sure the code compiles and runs correctly

Output format:
Respond with ONLY the Kotlin code, no markdown, no explanation, no code fences.
        `.trim();

        const sampleInput = inputText.slice(0, 2000);

        userPrompt = `
Advent of Code ${YEAR}, day ${day}.

=== PROBLEM STATEMENT ===
${trimmedStatement}

=== SAMPLE INPUT (for format understanding) ===
${sampleInput}
        `.trim();
    }

    const response = await client.chat.completions.create({
        model: "gpt-5.1",
        messages: [
            { role: "system", content: instructions },
            { role: "user", content: userPrompt },
        ],
    });

    const outputText = (response.choices[0]?.message?.content || "").trim();

    let kotlinCode = outputText
        .replace(/^```kotlin\n?/i, "")
        .replace(/^```\n?/, "")
        .replace(/\n?```$/, "")
        .trim();

    return { kotlinCode, raw: { originalOutput: outputText } };
}

function ensureDirs() {
    const dirs = ["inputs", "solutions"];
    for (const d of dirs) {
        if (!fs.existsSync(d)) {
            fs.mkdirSync(d);
        }
    }
}

async function compileAndRunKotlin(day: number, kotlinPath: string, inputPath: string): Promise<{ part1?: string | undefined; part2?: string | undefined }> {
    const jarPath = `Day${day.toString().padStart(2, "0")}.jar`;

    console.log(`Compiling Kotlin solution: ${kotlinPath}...`);
    try {
        const compileCmd = `kotlinc ${kotlinPath} -include-runtime -d ${jarPath}`;
        await execAsync(compileCmd);
        console.log(`Compilation successful: ${jarPath}`);
    } catch (err: any) {
        console.error("Kotlin compilation failed:", err.stderr || err.message);
        throw new Error("Kotlin compilation failed");
    }

    console.log(`Running solution with input: ${inputPath}...`);
    try {
        const runCmd = `java -jar ${jarPath} ${inputPath}`;
        const { stdout, stderr } = await execAsync(runCmd);

        if (stderr) {
            console.error("Stderr from Kotlin execution:", stderr);
        }

        console.log("Solution output:", stdout);

        const part1Match = stdout.match(/Part 1:\s*(\S+)/i);
        const part2Match = stdout.match(/Part 2:\s*(\S+)/i);

        return {
            part1: part1Match?.[1],
            part2: part2Match?.[1],
        };
    } catch (err: any) {
        console.error("Kotlin execution failed:", err.stderr || err.message);
        throw new Error("Kotlin execution failed");
    }
}

async function submitAnswer(day: number, level: number, answer: string, session: string): Promise<{ success: boolean; message: string }> {
    const submitUrl = `https://adventofcode.com/${YEAR}/day/${day}/answer`;

    console.log(`Submitting answer for Part ${level}: ${answer}`);

    try {
        const response = await axios.post(
            submitUrl,
            `level=${level}&answer=${encodeURIComponent(answer)}`,
            {
                headers: {
                    Cookie: `session=${session}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "github-actions-aoc-agent (https://github.com/yourname/yourrepo)",
                },
            }
        );

        const html = response.data as string;
        const $ = loadHtml(html);
        const article = $("article").first();
        const responseText = article.length ? article.text() : "";

        console.log("AoC response snippet:", responseText.slice(0, 200));

        if (responseText.includes("That's the right answer") || responseText.includes("You got rank")) {
            return { success: true, message: "Correct answer!" };
        } else if (responseText.includes("That's not the right answer")) {
            return { success: false, message: "Wrong answer" };
        } else if (responseText.includes("You gave an answer too recently")) {
            return { success: false, message: "Rate limited - wait before submitting again" };
        } else if (responseText.includes("Did you already complete it")) {
            return { success: true, message: "Already completed" };
        } else {
            return { success: false, message: "Unknown response: " + responseText.slice(0, 100) };
        }
    } catch (err: any) {
        console.error("Failed to submit answer:", err.message);
        throw new Error("Submit failed: " + err.message);
    }
}

async function main() {
    try {
        const session = process.env.AOC_SESSION;
        if (!session) {
            throw new Error("Missing AOC_SESSION env var");
        }

        const day = getDay();
        console.log(`\n🎄 Solving Advent of Code ${YEAR} day ${day}...`);

        ensureDirs();

        // === PART 1 ===
        console.log("\n=== PART 1 ===");

        const { inputText, statementText } = await fetchAocInputAndDescription(day, session);

        const inputPath = path.join("inputs", `day${day.toString().padStart(2, "0")}.txt`);
        fs.writeFileSync(inputPath, inputText + "\n", { encoding: "utf-8" });
        console.log(`✓ Downloaded input to ${inputPath}`);

        console.log("🤖 Generating Kotlin solution for Part 1...");
        const result1 = await callOpenAISolver(day, inputText, statementText);

        const kotlinPath = path.join("solutions", `Day${day.toString().padStart(2, "0")}.kt`);
        fs.writeFileSync(kotlinPath, result1.kotlinCode, { encoding: "utf-8" });
        console.log(`✓ Saved Kotlin solution to ${kotlinPath}`);

        console.log("\n🔨 Compiling and running Part 1...");
        const runResult1 = await compileAndRunKotlin(day, kotlinPath, inputPath);

        if (!runResult1.part1) {
            console.error("❌ Could not extract Part 1 answer from output");
            const jsonPath = path.join("solutions", `day${day.toString().padStart(2, "0")}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify({
                part1: { kotlinCode: result1.kotlinCode, answer: null, submitted: false },
            }, null, 2), { encoding: "utf-8" });
            return;
        }

        console.log(`✓ Part 1 answer: ${runResult1.part1}`);

        console.log("\n📤 Submitting Part 1 answer...");
        const submitResult1 = await submitAnswer(day, 1, runResult1.part1, session);
        console.log(`${submitResult1.success ? "✅" : "❌"} ${submitResult1.message}`);

        if (!submitResult1.success) {
            console.log("⚠️  Part 1 submission failed, stopping here.");
            const jsonPath = path.join("solutions", `day${day.toString().padStart(2, "0")}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify({
                part1: {
                    kotlinCode: result1.kotlinCode,
                    answer: runResult1.part1,
                    submitted: false,
                    message: submitResult1.message
                },
            }, null, 2), { encoding: "utf-8" });
            return;
        }

        // === PART 2 ===
        console.log("\n=== PART 2 ===");

        console.log("⏳ Waiting 2 seconds before fetching Part 2...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log("📥 Fetching Part 2 description...");
        const { statementText: statementText2 } = await fetchAocInputAndDescription(day, session, true);

        console.log("🤖 Generating Kotlin solution for Part 2...");
        const result2 = await callOpenAISolver(day, inputText, statementText2, true, result1.kotlinCode);

        fs.writeFileSync(kotlinPath, result2.kotlinCode, { encoding: "utf-8" });
        console.log(`✓ Updated Kotlin solution in ${kotlinPath}`);

        console.log("\n🔨 Compiling and running Part 2...");
        const runResult2 = await compileAndRunKotlin(day, kotlinPath, inputPath);

        if (!runResult2.part2) {
            console.error("❌ Could not extract Part 2 answer from output");
            console.log("Part 1 and Part 2 answers from output:", runResult2);

            const jsonPath = path.join("solutions", `day${day.toString().padStart(2, "0")}.json`);
            fs.writeFileSync(jsonPath, JSON.stringify({
                part1: {
                    kotlinCode: result1.kotlinCode,
                    answer: runResult1.part1,
                    submitted: true
                },
                part2: {
                    kotlinCode: result2.kotlinCode,
                    answer: null,
                    submitted: false
                },
            }, null, 2), { encoding: "utf-8" });
            return;
        }

        console.log(`✓ Part 2 answer: ${runResult2.part2}`);

        console.log("\n📤 Submitting Part 2 answer...");
        const submitResult2 = await submitAnswer(day, 2, runResult2.part2, session);
        console.log(`${submitResult2.success ? "✅" : "❌"} ${submitResult2.message}`);

        const jsonPath = path.join("solutions", `day${day.toString().padStart(2, "0")}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify({
            part1: {
                kotlinCode: result1.kotlinCode,
                answer: runResult1.part1,
                submitted: true,
                message: submitResult1.message
            },
            part2: {
                kotlinCode: result2.kotlinCode,
                answer: runResult2.part2,
                submitted: submitResult2.success,
                message: submitResult2.message
            },
        }, null, 2), { encoding: "utf-8" });
        console.log(`✓ Saved metadata to ${jsonPath}`);

        console.log("\n🎉 Done!");

    } catch (err) {
        console.error("❌ Error in AoC solver:", err);
        process.exit(1);
    }
}

main();
