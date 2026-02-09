#!/usr/bin/env node

/**
 * City Holder Data Extraction and Seed Script
 * 
 * This script:
 * 1. Reads the City Holder JS bundle
 * 2. Extracts all quiz questions and answers
 * 3. Generates SQL INSERT statements
 * 4. Outputs to seed.sql file for database seeding
 */

const fs = require('fs');
const path = require('path');

// Path to the JS bundle
const BUNDLE_PATH = path.join(__dirname, 'index-CBnSJ83P.js');

// Output SQL file
const OUTPUT_PATH = path.join(__dirname, 'seed.sql');

console.log('🔍 Reading City Holder JS bundle...');

// Read the bundle file
const bundleContent = fs.readFileSync(BUNDLE_PATH, 'utf-8');

console.log('📦 Bundle size:', (bundleContent.length / 1024 / 1024).toFixed(2), 'MB');

// Find the quiz data object (e$)
// Looking for the pattern: e$ = { 360: { 1: { 1: { title: "..." }, ...
const quizDataMatch = bundleContent.match(/,\s*e\$\s*=\s*\{([\s\S]+?)\}\s*,\s*t\$/);

if (!quizDataMatch) {
    console.error('❌ Could not find quiz data in bundle');
    process.exit(1);
}

console.log('✅ Found quiz data object');

const quizDataStr = '{' + quizDataMatch[1] + '}';

// Parse the quiz data
// We need to convert the JS object notation to valid JSON
let jsonStr = quizDataStr
    .replace(/(\d+):\s*\{/g, '"$1":{')  // Quote keys
    .replace(/title:\s*"([^"]+)"/g, '"title":"$1"')  // Fix title property
    .replace(/title:\s*'([^']+)'/g, '"title":"$1"')  // Fix single quotes
    .replace(/,(\s*[}\]])/g, '$1');  // Remove trailing commas

let quizData;
try {
    quizData = eval('(' + quizDataStr + ')');
    console.log('✅ Successfully parsed quiz data');
} catch (error) {
    console.error('❌ Error parsing quiz data:', error.message);
    process.exit(1);
}

// Extract all questions and generate SQL inserts
const sqlStatements = [];
let totalQuestions = 0;

// Reference date for day 380 (Feb 10, 2026)
const referenceDay = 380;
const referenceDate = new Date('2026-02-10');

for (const dayNumber in quizData) {
    const dayData = quizData[dayNumber];

    // Skip if not a valid day object (should have questions 1-10)
    if (typeof dayData !== 'object' || !dayData[1]) continue;

    // Calculate the date for this day number
    const dayOffset = parseInt(dayNumber) - referenceDay;
    const currentDate = new Date(referenceDate);
    currentDate.setDate(currentDate.getDate() + dayOffset);
    const dateStr = currentDate.toISOString().split('T')[0];

    // Process each question (1-10)
    for (let questionNum = 1; questionNum <= 10; questionNum++) {
        const questionData = dayData[questionNum];

        if (!questionData || !questionData.title) continue;

        const questionText = questionData.title.replace(/'/g, "''");  // Escape single quotes
        const correctAnswer = questionData[1]?.title?.replace(/'/g, "''") || '';
        const option2 = questionData[2]?.title?.replace(/'/g, "''") || '';
        const option3 = questionData[3]?.title?.replace(/'/g, "''") || '';
        const option4 = questionData[4]?.title?.replace(/'/g, "''") || '';

        const sql = `INSERT INTO city_holder_answers (day_number, date, question_number, question_text, correct_answer, option_2, option_3, option_4) VALUES (${dayNumber}, '${dateStr}', ${questionNum}, '${questionText}', '${correctAnswer}', '${option2}', '${option3}', '${option4}');`;

        sqlStatements.push(sql);
        totalQuestions++;
    }
}

console.log(`📊 Extracted ${totalQuestions} questions from ${Object.keys(quizData).length} days`);

// Write SQL file
const sqlContent = `-- City Holder Quiz Data Seed
-- Generated on ${new Date().toISOString()}
-- Total records: ${totalQuestions}

${sqlStatements.join('\n')}
`;

fs.writeFileSync(OUTPUT_PATH, sqlContent, 'utf-8');

console.log('✅ Seed file created:', OUTPUT_PATH);
console.log('');
console.log('Next steps:');
console.log('1. Create D1 database: wrangler d1 create city-holder-db');
console.log('2. Apply schema: wrangler d1 execute city-holder-db --file=schema.sql');
console.log('3. Seed data: wrangler d1 execute city-holder-db --file=seed.sql');
