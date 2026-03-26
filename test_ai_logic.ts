import { AIService } from './lib/ai-service';

async function testFetch() {
    const userProfile = {
        occupation: "Student",
        annualIncome: "200000",
        state: "Maharashtra",
        caste: "General",
        location: "Mumbai"
    };

    const schemes = [
        {
            id: "1",
            title: "Central Sector Scholarship for University Students",
            benefits: "prizes and maintenance grants"
        }
    ];

    console.log("Testing generateReasons...");
    const reasons = await AIService.generateReasons(userProfile, schemes);
    console.log("Result:", JSON.stringify(reasons, null, 2));
}

testFetch().catch(console.error);
