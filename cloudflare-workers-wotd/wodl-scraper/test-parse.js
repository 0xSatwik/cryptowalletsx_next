const fs = require('fs');
const path = require('path');

function parseWodl(html) {
    const wordsByLength = [];
    let theme = "";

    // Extract Theme - Robust regex for various patterns
    const themePatterns = [
        /theme\s*[‘'“"]([^’'”"]+)[’'”"]/i,
        /theme\s+is\s+["']([^"']+)["']/i,
        /Binance\s+WODL\s+theme\s+[^‘'“"]*[‘'“"]([^’'”"]+)[’'”"]/i,
        /class="font-extrabold">.*?theme\s+[^‘'“"]*[‘'“"]([^’'”"]+)[’'”"]/si
    ];

    for (const pattern of themePatterns) {
        const match = html.match(pattern);
        if (match) {
            theme = match[1].trim();
            break;
        }
    }

    // List of CSS IDs to check
    const lengths = [3, 4, 5, 6, 7, 8];

    for (const len of lengths) {
        const id = `${len}-letter-words`;
        const idRegex = new RegExp(`id=["']${id}["'][^>]*>(.*?)<\/section>`, 'si');
        const match = html.match(idRegex);

        let sectionContent = "";
        if (match) {
            sectionContent = match[1];
            console.log(`Found ID match for ${len} letters`);
        } else {
            // Fallback: Search by text label
            const textLabelRegex = new RegExp(`${len}\\s*Letter\\s*WODL\\s*Words.*?<ul[^>]*>(.*?)<\/ul>`, 'si');
            const textMatch = html.match(textLabelRegex);
            if (textMatch) {
                sectionContent = textMatch[1];
                console.log(`Found Text Fallback match for ${len} letters`);
            }
        }

        if (sectionContent) {
            const words = [...sectionContent.matchAll(/<li[^>]*>(.*?)<\/li>/gi)]
                .map(m => m[1].replace(/<[^>]*>/g, '').replace(/←/g, '').trim())
                .filter(w => w && w.length === len);

            if (words.length > 0) {
                wordsByLength.push({ length: len, words });
            }
        }
    }

    return { theme, words: wordsByLength };
}

// Read the saved HTML from the earlier tool call summary if it were saved, 
// but since I have it in the tool response, I'll just use a representative snippet 
// or read the actual file if I had saved it. 
// For now, I'll create a mock HTML based on what I saw.

const mockHtml = `
<section id="answer-solution">
<h3 class="font-extrabold">Get all five words correctly for this week’s Binance WODL theme ‘Stablecoins’ and share 500000 points.</h3>
<section id="3-letter-words">
<li class="uppercase font-bold">BTC<span class="font-medium"> ←</span></li>
<li class="uppercase font-bold">KEY<span class="font-medium"> ←</span></li>
</section>
<section id="4-letter-words">
<li class="uppercase font-bold">CARD<span class="font-medium"> ←</span></li>
</section>
</section>
`;

const result = parseWodl(mockHtml);
console.log("Parsed Result:", JSON.stringify(result, null, 2));

if (result.theme === "Stablecoins" && result.words.length === 2 && result.words[0].words.includes("BTC")) {
    console.log("TEST PASSED");
} else {
    console.log("TEST FAILED");
    process.exit(1);
}
