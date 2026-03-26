const queries = [
    { 
        name: "Exact Match (Partial)", 
        q: "PM Early Career", 
        expected: "Prime Minister's Early Career Research Grant" 
    },
    { 
        name: "Fuzzy/Typos", 
        q: "Scholorship for B.Tech", 
        expected: "Scholarships" 
    },
    { 
        name: "Semantic Meaning", 
        q: "Money for scientific farming", 
        expected: "Agriculture/Research/Grants" 
    },
    { 
        name: "State Restriction Test", 
        q: "Tamil Nadu Scheme", 
        expected: "None (should be filtered out for Gujarat user)" 
    },
    { 
        name: "Cross-Category", 
        q: "Startup funding for students", 
        expected: "Business/Education" 
    }
];

async function runTests() {
    console.log("🧪 Starting Hybrid Search Integration Tests...\n");
    
    for (const test of queries) {
        console.log(`🔍 [${test.name}] searching: "${test.q}"`);
        try {
            const res = await fetch('http://localhost:3000/api/schemes/search/v2', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Cookie': 'sb-access-token=mock_token' 
                },
                body: JSON.stringify({ query: test.q, limit: 3 })
            });
            
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            
            console.log(`   ✅ Found ${data.length} results`);
            data.slice(0, 2).forEach((s: any, i: number) => {
                console.log(`      ${i+1}. ${s.title} (Score: ${s.matchScore}, Type: ${s.source})`);
            });
            console.log("");
        } catch (e: any) {
            console.log(`   ❌ Failed: ${e.message}\n`);
        }
    }
}

runTests();
