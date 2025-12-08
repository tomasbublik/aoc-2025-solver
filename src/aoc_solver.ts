import axios from "axios";
import * as fs from "fs";
import * as path from "path";
import * as process from "process";
import { load as loadHtml } from "cheerio";
import OpenAI from "openai";

const YEAR = parseInt(process.env.YEAR || "2025", 10);

function getDay(): number {
    const override = process.env.DAY_OVERRIDE;
    if (override && override.trim().length > 0) {
        return parseInt(override, 10);
    }

    const now = new Date(); // UTC v runneru
    const month = now.getUTCMonth() + 1; // 0-11 => 1-12
    const day = now.getUTCDate();

    if (month !== 12) {
        console.log("Not December, defaulting to day=1 (override DAY_OVERRIDE to change).");
        return 1;
    }
    return day;
}

async function fetchAocInputAndDescription(day: number, session: string): Promise<{ inputText: string; statementText: string }> {
    const baseUrl = `https://adventofcode.com/${YEAR}/day/${day}`;
    const inputUrl = `${baseUrl}/input`;

    const headers = {
        Cookie: `session=${session}`,
        "User-Agent": "github-actions-aoc-agent (https://github.com/yourname/yourrepo)",
    };

    // input
    const respIn = await axios.get(inputUrl, { headers });
    const inputText = (respIn.data as string).trimEnd();

    // zadání
    const respHtml = await axios.get(baseUrl, { headers });
    const html = respHtml.data as string;

    const $ = loadHtml(html);
    const article = $("article").first();
    const statementText = article.length ? article.text() : $.root().text();

    return { inputText, statementText };
}

type SolverResult = {
    kotlinCode: string;
    raw: any;
};

async function callOpenAISolver(day: number, inputText: string, statementText: string): Promise<SolverResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing OPENAI_API_KEY");
    }

    const client = new OpenAI({ apiKey });

    const trimmedStatement = statementText.slice(0, 12000);

    const instructions = `
You are an expert competitive programming assistant solving Advent of Code ${YEAR}.

You will be given:
1) The problem statement text (possibly slightly noisy).
2) A sample of the puzzle input to understand the format.

Your task:
- Carefully analyze what the puzzle asks for.
- Write a complete, working Kotlin solution that:
  - Reads input from a file path passed as command line argument (args[0])
  - Implements both part 1 and part 2
  - Prints results as "Part 1: <answer>" and "Part 2: <answer>"
- Use idiomatic Kotlin with proper error handling.
- Include necessary imports.
- Make sure the code compiles and runs correctly.

Output format:
Respond with ONLY the Kotlin code, no markdown, no explanation, no code fences.
  `.trim();

    const sampleInput = inputText.slice(0, 2000); // jen vzorek pro pochopení formátu

    const userPrompt = `
Advent of Code ${YEAR}, day ${day}.

=== PROBLEM STATEMENT ===
${trimmedStatement}

=== SAMPLE INPUT (for format understanding) ===
${sampleInput}
  `.trim();

    const response = await client.chat.completions.create({
        model: "gpt-5.1",
        messages: [
            { role: "system", content: instructions },
            { role: "user", content: userPrompt },
        ],
    });

    // Získání textu z odpovědi
    const outputText = (response.choices[0]?.message?.content || "").trim();

    // Odstranění případných markdown bloků
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

async function main() {
    try {
        const session = process.env.AOC_SESSION;
        if (!session) {
            throw new Error("Missing AOC_SESSION env var");
        }

        const day = getDay();
        console.log(`Generating Kotlin solution for Advent of Code ${YEAR} day ${day}...`);

        ensureDirs();

        const { inputText, statementText } = await fetchAocInputAndDescription(day, session);

        const inputPath = path.join("inputs", `day${day.toString().padStart(2, "0")}.txt`);
        fs.writeFileSync(inputPath, inputText + "\n", { encoding: "utf-8" });
        console.log(`Downloaded input to ${inputPath}`);

        const result = await callOpenAISolver(day, inputText, statementText);

        // Uložit Kotlin kód
        const kotlinPath = path.join("solutions", `Day${day.toString().padStart(2, "0")}.kt`);
        fs.writeFileSync(kotlinPath, result.kotlinCode, { encoding: "utf-8" });
        console.log(`Saved Kotlin solution to ${kotlinPath}`);

        // Uložit i JSON s metadaty
        const jsonPath = path.join("solutions", `day${day.toString().padStart(2, "0")}.json`);
        fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2), { encoding: "utf-8" });
        console.log(`Saved metadata to ${jsonPath}`);
    } catch (err) {
        console.error("Error in AoC solver:", err);
        process.exit(1);
    }
}

main();
