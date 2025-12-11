# Changelog

## [2.3.1] - 2024-12-11

### Fixed 🐛

- **CRITICAL FIX: Part 2 now includes Part 1 + Part 2 together**
  - **Problem**: For Part 2, only Part 2 description was extracted
  - **Consequence**: Part 2 description is often just a **delta/modification** of Part 1; without Part 1 context, AI cannot solve it
  - **Example**: Part 2 says "count during rotation or at end", but DOESN'T explain dial, rotations, L/R, start position 50!
  
- **Solution**: For Part 2, we now ALWAYS join ALL articles (Part 1 + Part 2)
  - Part 1 description: Complete problem description
  - Part 2 description: Delta changes ("now count differently...")
  - AI receives BOTH → can correctly solve Part 2

### Technical Details

**Before:**
```typescript
if (part2) {
    // Searched for only Part 2 article
    articles.each((i, elem) => {
        if (text.includes("Part Two")) {
            statementText = text;  // ❌ Only Part 2, missing Part 1 context!
        }
    });
}
```

**After:**
```typescript
if (part2) {
    // For Part 2, we need the COMPLETE statement (Part 1 + Part 2)
    const articles = $("article.day-desc");
    const articleTexts: string[] = [];
    
    articles.each((i, elem) => {
        articleTexts.push($(elem).text());
    });
    
    // Join all articles (Part 1 + Part 2)
    statementText = articleTexts.join("\n\n");  // ✅ Part 1 + Part 2!
}
```

### Example (Day 1)

**Part 1 description contains:**
- Dial 0-99
- L/R rotations with numbers
- Start position 50
- Count when it ends on 0

**Part 2 description contains ONLY:**
- "method 0x434C49434B"
- "count during rotation or at end"
- Example with extra passes

**Without Part 1 context**, AI doesn't know what dial, L/R, 50, etc. are → cannot solve!

### Debug Log

New log shows both were extracted:
```
📝 Extracted FULL statement for Part 2 (8234 chars, 2 articles)
```

### Expected Results

**Before fix:**
```
Part 2 prompt contained ONLY:
"--- Part Two ---You're sure that's the right password..."
(missing Part 1 context)
```

**After fix:**
```
Part 2 prompt contains:
"--- Day 1: Secret Entrance ---The Elves have good news..."
(Part 1 - complete description)

"--- Part Two ---You're sure that's the right password..."
(Part 2 - delta changes)
```

---

## [2.3.0] - 2024-12-11

### Fixed 🐛

- **CRITICAL FIX: Proper Part 2 extraction from problem statement**
  - Problem: `$("article").first()` always returned only Part 1
  - Solution: Added `part2` parameter to distinguish Part 1 vs Part 2

---

## [2.2.0] - 2024-12-10

### Removed 🗑️

- **Removal of testing system** - Ineffective unit test system

---

## [2.0.0] - 2024-12-10

### Added ✨

- **Automatic Part 2 solving**
- **Kotlin code compilation and execution**
- **Automatic answer submission**

---

## [1.0.0] - Initial Version

### Features

- Download problem statements and input data from Advent of Code
- Generate Kotlin solutions using OpenAI GPT
- Save code and metadata to files
- Automatic execution via GitHub Actions

