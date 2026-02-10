
import { db } from "../db/index";
import { schemes } from "../db/schemas/scheme";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const generateDescription = (title: string, category: string, details: string) => {
    // Unique sentences based on category to prevent overlap in keyword matching
    let categorySpecificFocus = "";
    if (category === "Healthcare") categorySpecificFocus = "This initiative prioritizes public health outcomes, medical equity, and the strengthening of clinical infrastructure.";
    if (category === "Education") categorySpecificFocus = "The focus remains on academic excellence, student empowerment, and the removal of financial barriers to learning.";
    if (category === "Agriculture") categorySpecificFocus = "Supporting the backbone of our economy, this scheme targets farmers, crop yields, and rural sustainability.";
    if (category === "Business") categorySpecificFocus = "Empowering entrepreneurs and startups, this program drives economic growth and industrial innovation.";
    if (category === "Housing") categorySpecificFocus = "Aimed at providing dignity through shelter, this project focuses on affordable residential development.";
    if (category === "Technology") categorySpecificFocus = "Driving the Digital India vision, this scheme fosters high-tech R&D and digital infrastructure.";
    if (category === "Finance") categorySpecificFocus = "Enhancing financial inclusion, this scheme provides savings, insurance, and long-term fiscal security.";
    if (category === "Social Welfare") categorySpecificFocus = "Serving the most vulnerable, this program ensures social justice, pensions, and basic safety nets.";

    return `The ${title} is a signature government initiative designed to revolutionize the ${category} sector by providing targeted support to citizens across the nation. This comprehensive scheme is built on the pillars of accessibility, transparency, and impact, ensuring that the benefits reach every eligible individual at the last mile. 

Historically, individuals in the ${category} domain have faced significant systemic hurdles, ranging from high costs of entry to limited resources for growth. The ${title} addresses these root causes by offering a multi-faceted approach. Whether it's through direct financial transfers, subsidized services, or infrastructure support, the scheme creates a robust safety net that empowers beneficiaries to achieve their potential.

At its core, the ${title} is about ${details}. This means not just providing a one-time relief, but building a sustainable ecosystem where individuals can thrive. ${categorySpecificFocus} The scheme's ${category} orientation ensures that it is tailored to the specific local needs of diverse demographic groups.

Furthermore, the implementation of ${title} leverages state-of-the-art digital infrastructure, such as the Direct Benefit Transfer (DBT) mechanism and Aadhaar-linked verification, to eliminate leakages and minimize bureaucratic delays. Applicants can track their status in real-time, ensuring a sense of ownership and accountability. The government has committed substantial budgetary allocations to ensure the scheme's longevity and scalability.

By participating in the ${title}, citizens are not just beneficiaries; they are partners in the nation's journey towards self-reliance (Atmanirbharta). The success stories flowing from this initiative highlight its role in transforming lives and providing a platform for sustainable growth. Keywords: ${title} benefits, ${category} government scheme, eligibility for ${title}, how to apply for ${title}, direct benefit transfer, ${category} assistance India, central government initiatives 2024.`;
};

const educationSchemes = [
    { title: "Central Sector Scholarship for University Students", category: "Education", details: "providing annual maintenance grants to college students based on their Class 12 performance" },
    { title: "Post Matric Scholarship for Minorities", category: "Education", details: "supporting students from minority communities for higher education after matriculation" },
    { title: "AICTE Pragati Scholarship for Girls", category: "Education", details: "empowering women in technical education through annual financial rewards" },
    { title: "Prime Minister's Research Fellowship (PMRF)", category: "Education", details: "attracting high-quality researchers to doctoral programs with massive stipends" },
    { title: "National Means-cum-Merit Scholarship", category: "Education", details: "reducing school dropouts by providing merit scholarships to class 9-12 students" },
    { title: "Begum Hazrat Mahal National Scholarship", category: "Education", details: "specifically funding the education of minority girl students in secondary schools" },
    { title: "Dr. Ambedkar Post Matric Scholarship for EBC", category: "Education", details: "providing post-matric financial aid to students from economically backward classes" },
    { title: "Vidya Lakshmi Education Loan Portal", category: "Education", details: "offering a single-window portal for students to apply for bank loans and scholarships" },
    { title: "National Overseas Scholarship for SC Candidates", category: "Education", details: "fully funding masters and PhD studies in top foreign universities for SC students" },
    { title: "Top Class Education Scheme for SC Students", category: "Education", details: "covering full fees for SC students admitted to premier institutes like IITs and IIMs" },
    { title: "Free Coaching Scheme for SC and OBC Students", category: "Education", details: "offering free high-quality coaching for competitive exams like UPSC, JEE, and NEET" },
    { title: "Ishan Uday Scholarship for North Eastern Region", category: "Education", details: "improving the gross enrollment ratio in India's North East via dedicated grants" },
    { title: "Swarna Jayanti Fellowships for Young Scientists", category: "Education", details: "funding frontier research by outstanding young scientists in India" },
    { title: "Kalpana Chawla Chatravriti Yojna", category: "Education", details: "rewarding meritorious girls in the science stream in Himachal Pradesh" },
    { title: "Swami Vivekananda Merit Cum Means Scholarship", category: "Education", details: "a West Bengal flagship program supporting students from low-income families" },
    { title: "Chief Minister's Scholarship Scheme (Punjab)", category: "Education", details: "providing fee waivers to students in government colleges across Punjab" },
    { title: "Kishore Vaigyanik Protsahan Yojana (KVPY)", category: "Education", details: "identifying and nurturing early scientific talent through fellowships" },
    { title: "Digital India Internship Scheme", category: "Education", details: "offering tech students exposure to government policy making via internships" },
    { title: "Inspire Fellowship for Research", category: "Education", details: "inviting top rankers to pursue research in basic and applied sciences" },
    { title: "National Merit Scholarship Scheme", category: "Education", details: "supporting talented students from rural secondary schools for higher studies" }
].map(s => ({
    ...s,
    ministry: "Ministry of Education",
    type: "Scholarship",
    description: generateDescription(s.title, s.category, s.details),
    state: "Central",
    benefits: "Full tuition fee coverage and monthly maintenance allowance.",
    eligibility: "Meritorious students from low-income families meeting specific criteria.",
    documentsRequired: ["Aadhar Card", "Mark Sheets", "Income Certificate"],
    amount: 50000,
    gender: "All",
    ageMin: 15,
    ageMax: 30,
    incomeLimit: 600000,
    caste: ["General", "OBC", "SC", "ST"],
    residence: "Both",
    status: "active",
    tags: ["education", "scholarship", "student"]
}));

const healthcareSchemes = [
    { title: "Ayushman Bharat PM-JAY", category: "Healthcare", details: "providing health insurance coverage up to ₹5 Lakhs per family per year for secondary and tertiary care" },
    { title: "Jan Aushadhi Yojana", category: "Healthcare", details: "making quality generic medicines available at affordable prices to all" },
    { title: "PM Matru Vandana Yojana", category: "Healthcare", details: "providing cash incentives for pregnant women and lactating mothers" },
    { title: "Mission Indradhanush", category: "Healthcare", details: "ensuring full immunization coverage for children and pregnant women" },
    { title: "National Health Mission", category: "Healthcare", details: "strengthening rural and urban health systems across India" },
    { title: "Chief Minister Comprehensive Health Insurance (TN)", category: "Healthcare", details: "state-level insurance for catastrophic health expenses in Tamil Nadu" },
    { title: "Rashtriya Bal Swasthya Karyakram", category: "Healthcare", details: "early identification and intervention for children from birth to 18 years" },
    { title: "PM Atmanirbhar Swasth Bharat Yojana", category: "Healthcare", details: "developing capacities of primary, secondary, and tertiary health systems" },
    { title: "National Tuberculosis Elimination Program", category: "Healthcare", details: "striving to end TB in India through free diagnosis and treatment" },
    { title: "National Mental Health Programme", category: "Healthcare", details: "increasing awareness and access to mental health services across districts" },
    { title: "Janani Suraksha Yojana", category: "Healthcare", details: "encouraging institutional delivery among poor pregnant women" },
    { title: "National Leprosy Eradication Programme", category: "Healthcare", details: "identifying and treating leprosy early to prevent disabilities" },
    { title: "National Vector Borne Disease Control", category: "Healthcare", details: "controlling malaria, dengue, and other vector-borne diseases" },
    { title: "PM Bhartiya Janaushadhi Pariyojana", category: "Healthcare", details: "providing affordable generic medicine through dedicated outlets" },
    { title: "Integrated Child Development Services (ICDS)", category: "Healthcare", details: "improving nutritional and health status of children below 6 years" },
    { title: "PM Swasthya Suraksha Yojana", category: "Healthcare", details: "correcting regional imbalances in the availability of tertiary healthcare" },
    { title: "National Program for Health Care of Elderly", category: "Healthcare", details: "providing dedicated healthcare facilities for senior citizens" },
    { title: "Rashtriya Kishor Swasthya Karyakram", category: "Healthcare", details: "addressing the health and developmental needs of adolescents" },
    { title: "PM National Dialysis Program", category: "Healthcare", details: "offering free dialysis services to renal failure patients" },
    { title: "Ayushman Bharat Digital Mission", category: "Healthcare", details: "creating a seamless digital health ecosystem for Indian citizens" }
].map(s => ({
    ...s,
    ministry: "Ministry of Health and Family Welfare",
    type: "Healthcare Support",
    description: generateDescription(s.title, s.category, s.details),
    state: "Central",
    benefits: "Free medical treatment and high-quality medication support.",
    eligibility: "Targeted at BPL families and specific vulnerable demographic groups.",
    documentsRequired: ["Aadhar Card", "Ration Card", "Medical Reports"],
    amount: 5000,
    gender: "All",
    ageMin: 0,
    ageMax: 100,
    incomeLimit: 250000,
    caste: ["General", "OBC", "SC", "ST"],
    residence: "Both",
    status: "active",
    tags: ["health", "medical", "insurance"]
}));

const agricultureSchemes = [
    { title: "PM-KISAN", category: "Agriculture", details: "transferring ₹6,000 annually in three installments directly to farmers' bank accounts" },
    { title: "PM Fasal Bima Yojana", category: "Agriculture", details: "providing comprehensive crop insurance against non-preventable natural risks" },
    { title: "PM Krishi Sinchai Yojana", category: "Agriculture", details: "improving water use efficiency through 'Per Drop More Crop' initiatives" },
    { title: "Paramparagat Krishi Vikas Yojana", category: "Agriculture", details: "promoting organic farming through cluster-based approaches" },
    { title: "PM Kisan Maandhan Yojana", category: "Agriculture", details: "a pension scheme for small and marginal farmers to ensure old-age security" },
    { title: "Soil Health Card Scheme", category: "Agriculture", details: "providing farmers with soil nutrient status to optimize fertilizer usage" },
    { title: "National Mission for Sustainable Agriculture", category: "Agriculture", details: "promoting climate-resilient practices and resource conservation" },
    { title: "National Livestock Mission", category: "Agriculture", details: "ensuring sustainable development of the livestock sector and animal health" },
    { title: "PM Annadata Aay Sanraksan Abhiyan", category: "Agriculture", details: "ensuring remunerative prices to farmers for their produce" },
    { title: "National Food Security Mission", category: "Agriculture", details: "increasing production of rice, wheat, and pulses through area expansion" }
].map(s => ({
    ...s,
    ministry: "Ministry of Agriculture and Farmers Welfare",
    type: "Subsidies",
    description: generateDescription(s.title, s.category, s.details),
    state: "Central",
    benefits: "Direct financial assistance and subsidized crop protection assets.",
    eligibility: "Small and marginal farmers owning cultivable land.",
    documentsRequired: ["Land Documents", "Aadhar Card", "Bank Account Details"],
    amount: 6000,
    gender: "All",
    ageMin: 18,
    ageMax: 60,
    incomeLimit: null,
    caste: ["General", "OBC", "SC", "ST"],
    residence: "Rural",
    status: "active",
    tags: ["agriculture", "farmer", "subsidy"]
}));

const businessSchemes = [
    { title: "PM Mudra Yojana", category: "Business", details: "providing loans up to ₹10 Lakhs to non-corporate, non-farm small/micro enterprises" },
    { title: "Stand Up India", category: "Business", details: "facilitating bank loans for SC, ST, and women entrepreneurs for greenfield projects" },
    { title: "Startup India Seed Fund Scheme", category: "Business", details: "providing financial assistance to startups for proof of concept and prototype development" },
    { title: "PM SVANidhi", category: "Business", details: "offering working capital loans to street vendors to resume their livelihoods" },
    { title: "PM Employment Generation Programme", category: "Business", details: "generating self-employment opportunities through micro-enterprise setup" },
    { title: "PM Vishwakarma Scheme", category: "Business", details: "supporting traditional artisans and craftspeople through skill and financial aid" },
    { title: "MSME Innovative Scheme", category: "Business", details: "promoting innovation and design thinking in micro, small, and medium enterprises" },
    { title: "SIDBI SMILE Loan Fund", category: "Business", details: "offering soft loans with low-interest rates to MSMEs in the manufacturing sector" },
    { title: "National SC-ST Hub", category: "Business", details: "providing handholding support to SC-ST entrepreneurs for government procurement" },
    { title: "Zero Defect Zero Effect (ZED) Scheme", category: "Business", details: "encouraging MSMEs to adopt world-class manufacturing standards" },
    { title: "PM Kisan Sampada Yojana", category: "Business", details: "creating modern infrastructure for food processing and supply chain management" },
    { title: "Production Linked Incentive (PLI) Scheme", category: "Business", details: "boosting domestic manufacturing in electronics, medicine, and auto sectors" },
    { title: "Raising and Accelerating MSME Performance (RAMP)", category: "Business", details: "strengthening MSME institutions and governance across states" },
    { title: "ASPIRE Scheme", category: "Business", details: "promoting innovation, entrepreneurship, and agro-industry incubation" },
    { title: "SFURTI Scheme", category: "Business", details: "organizing traditional industries into clusters for better competitiveness" },
    { title: "Credit Linked Capital Subsidy for Tech Upgradation", category: "Business", details: "helping MSMEs upgrade their technology with capital subsidies" },
    { title: "Support for International Patent Protection", category: "Business", details: "reimbursing expenses for international patent filing for Indian MSMEs" },
    { title: "PM e-Bus Sewa Scheme", category: "Business", details: "promoting electric bus manufacturing and green urban transport" },
    { title: "Export Promotion Capital Goods Scheme", category: "Business", details: "allowing import of capital goods for pre-production at zero custom duty" },
    { title: "Credit Guarantee Fund Trust for MSMEs", category: "Business", details: "providing collateral-free credit to the micro and small enterprise sector" }
].map(s => ({
    ...s,
    ministry: "Ministry of MSME",
    type: "Financial Assistance",
    description: generateDescription(s.title, s.category, s.details),
    state: "Central",
    benefits: "Interest subvention and collateral-free loan access.",
    eligibility: "Entrepreneurs, startups, and existing MSME business owners.",
    documentsRequired: ["GST Certificate", "Pancard", "Project Report"],
    amount: 1000000,
    gender: "All",
    ageMin: 18,
    ageMax: 65,
    incomeLimit: null,
    caste: ["General", "OBC", "SC", "ST"],
    residence: "Both",
    status: "active",
    tags: ["business", "msme", "entrepreneur", "startup"]
}));

const housingSchemes = [
    { title: "PM Awas Yojana (Urban)", category: "Housing", details: "providing affordable housing for the urban poor with interest subsidies" },
    { title: "PM Awas Yojana (Gramin)", category: "Housing", details: "granting financial assistance to rural BPL families for constructing pucca houses" },
    { title: "DDA Housing Scheme", category: "Housing", details: "offering residential apartments at subsidized rates in Delhi" },
    { title: "MHADA Lottery Scheme", category: "Housing", details: "providing low-cost housing options for various income groups in Maharashtra" },
    { title: "HUDA Affordable Housing", category: "Housing", details: "facilitating residential plots and flats in Haryana at controlled prices" },
    { title: "Rajasthan Housing Board Scheme", category: "Housing", details: "offering affordable homes to residents of Rajasthan under various categories" },
    { title: "UP Awas Vikas Yojana", category: "Housing", details: "developing modern townships and affordable housing projects in Uttar Pradesh" },
    { title: "NTR Housing Scheme", category: "Housing", details: "providing permanent houses to homeless people in Andhra Pradesh" },
    { title: "Karnataka Housing Board Scheme", category: "Housing", details: "offering residential sites and houses to citizens of Karnataka" },
    { title: "Biju Pucca Ghar Yojana", category: "Housing", details: "converting kutcha houses to pucca houses in rural areas of Odisha" }
].map(s => ({
    ...s,
    ministry: "Ministry of Housing and Urban Affairs",
    type: "Housing Subsidy",
    description: generateDescription(s.title, s.category, s.details),
    state: "Central",
    benefits: "Financial grants for construction and interest subvention on home loans.",
    eligibility: "Homeless citizens or those living in kutcha houses with low income.",
    documentsRequired: ["Income Certificate", "Land Registry", "Aadhar Card"],
    amount: 250000,
    gender: "All",
    ageMin: 18,
    ageMax: 70,
    incomeLimit: 600000,
    caste: ["General", "OBC", "SC", "ST"],
    residence: "Both",
    status: "active",
    tags: ["housing", "home", "subsidy", "construction"]
}));

const technologySchemes = [
    { title: "Digital India Mission", category: "Technology", details: "transforming India into a digitally empowered society and knowledge economy" },
    { title: "Semicon India Program", category: "Technology", details: "developing the semiconductor and display manufacturing ecosystem in India" },
    { title: "National AI Mission", category: "Technology", details: "promoting the development and adoption of artificial intelligence across sectors" },
    { title: "National Quantum Mission", category: "Technology", details: "accelerating quantum technology-led economic growth in India" },
    { title: "Cyber Surakshit Bharat", category: "Technology", details: "strengthening the cyber security ecosystem for government departments" },
    { title: "MeitY Startup Hub", category: "Technology", details: "building a holistic ecosystem for tech startups and innovation" },
    { title: "Modified Electronics Manufacturing Clusters", category: "Technology", details: "providing world-class infrastructure for electronics manufacturing" },
    { title: "Design Linked Incentive (DLI) Scheme", category: "Technology", details: "offering financial and infrastructure support for semiconductor design" },
    { title: "National Supercomputing Mission", category: "Technology", details: "connecting national academic and R&D institutions with a supercomputing grid" },
    { title: "Bhashini Mission", category: "Technology", details: "building a public digital platform for languages using AI" }
].map(s => ({
    ...s,
    ministry: "Ministry of Electronics and IT",
    type: "Tech Support",
    description: generateDescription(s.title, s.category, s.details),
    state: "Central",
    benefits: "Infrastructure support, design incentives, and R&D grants.",
    eligibility: "Researchers, tech startups, and electronics manufacturing units.",
    documentsRequired: ["Project Proposal", "Company Registration", "Technical Certifications"],
    amount: 5000000,
    gender: "All",
    ageMin: 18,
    ageMax: 60,
    incomeLimit: null,
    caste: ["General", "OBC", "SC", "ST"],
    residence: "Both",
    status: "active",
    tags: ["technology", "digital", "innovation", "it"]
}));

const financeSchemes = [
    { title: "PM Jan Dhan Yojana", category: "Finance", details: "ensuring access to financial services like savings accounts, credit, and insurance" },
    { title: "Sukanya Samriddhi Yojana", category: "Finance", details: "a small deposit scheme for the girl child as part of 'Beti Bachao Beti Padhao'" },
    { title: "Atal Pension Yojana", category: "Finance", details: "providing a guaranteed pension for workers in the unorganized sector" },
    { title: "PM Jeevan Jyoti Bima Yojana", category: "Finance", details: "offering a one-year life insurance cover renewable from year to year" },
    { title: "PM Suraksha Bima Yojana", category: "Finance", details: "providing accidental death and disability insurance at a very low premium" },
    { title: "Sovereign Gold Bond Scheme", category: "Finance", details: "allowing investors to buy digital gold as an alternative to physical gold" },
    { title: "Kisan Vikas Patra", category: "Finance", details: "a long-term savings instrument for farmers and small investors" },
    { title: "Public Provident Fund (PPF)", category: "Finance", details: "a popular long-term savings-cum-tax-saving instrument in India" },
    { title: "Senior Citizens Savings Scheme", category: "Finance", details: "offering high interest rates for citizens aged 60 years and above" },
    { title: "National Savings Certificate", category: "Finance", details: "a fixed income post office savings scheme for middle-income investors" }
].map(s => ({
    ...s,
    ministry: "Ministry of Finance",
    type: "Financial Product",
    description: generateDescription(s.title, s.category, s.details),
    state: "Central",
    benefits: "High interest rates, insurance cover, and financial security in old age.",
    eligibility: "All Indian citizens meeting the specific age and investment criteria.",
    documentsRequired: ["Aadhar Card", "Pancard", "Bank Passbook"],
    amount: 100000,
    gender: "All",
    ageMin: 0,
    ageMax: 100,
    incomeLimit: null,
    caste: ["General", "OBC", "SC", "ST"],
    residence: "Both",
    status: "active",
    tags: ["finance", "savings", "insurance", "pension"]
}));

const socialWelfareSchemes = [
    { title: "Antyodaya Anna Yojana", category: "Social Welfare", details: "providing highly subsidized food grains to the poorest of the poor" },
    { title: "Indira Gandhi National Old Age Pension", category: "Social Welfare", details: "granting monthly pension to senior citizens from BPL households" },
    { title: "PM Shram Yogi Maandhan", category: "Social Welfare", details: "a voluntary and contributory pension scheme for unorganized workers" },
    { title: "National Family Benefit Scheme", category: "Social Welfare", details: "providing a lump sum grant to BPL households on the death of a primary breadwinner" },
    { title: "Swadhar Greh Scheme", category: "Social Welfare", details: "providing shelter and support to women in difficult circumstances" },
    { title: "National Disability Pension Scheme", category: "Social Welfare", details: "offering monthly financial support to persons with severe disabilities" },
    { title: "Widow Pension Scheme", category: "Social Welfare", details: "providing financial assistance to widows for a dignified living" },
    { title: "One Nation One Ration Card", category: "Social Welfare", details: "allowing migrants to claim food grains from any fair price shop in India" },
    { title: "PM Daksh Yojana", category: "Social Welfare", details: "providing skill development training to marginalized social groups" },
    { title: "National Safai Karamcharis Finance Corp", category: "Social Welfare", details: "providing low-interest loans for the socio-economic upliftment of safai karamcharis" }
].map(s => ({
    ...s,
    ministry: "Ministry of Social Justice and Empowerment",
    type: "Welfare Support",
    description: generateDescription(s.title, s.category, s.details),
    state: "Central",
    benefits: "Direct financial support, food security, and social protection.",
    eligibility: "BPL families, senior citizens, widows, and persons with disabilities.",
    documentsRequired: ["BPL Card", "Aadhar Card", "Disability/Death Certificate"],
    amount: 2000,
    gender: "All",
    ageMin: 0,
    ageMax: 100,
    incomeLimit: 100000,
    caste: ["General", "OBC", "SC", "ST"],
    residence: "Both",
    status: "active",
    tags: ["social", "welfare", "pension", "poor"]
}));

async function seed() {
    console.log("🌱 Cleaning and Seeding 110 unique schemes...");
    const allData = [
        ...educationSchemes, 
        ...healthcareSchemes, 
        ...agricultureSchemes, 
        ...businessSchemes,
        ...housingSchemes,
        ...technologySchemes,
        ...financeSchemes,
        ...socialWelfareSchemes
    ];
    
    try {
        const usersList = await db.query.users.findMany({ limit: 1 });
        const adminId = usersList.length > 0 ? usersList[0].id : null;

        const formatted = allData.map(s => ({
            ...s,
            createdBy: adminId,
            createdAt: new Date(),
            updatedAt: new Date(),
            applicationsCount: 0
        }));

        await db.delete(schemes);
        const result = await db.insert(schemes).values(formatted as any).returning();
        console.log(`✅ Successfully seeded ${result.length} schemes!`);
    } catch (e) {
        console.error("❌ Seeding failed:", e);
    }
    process.exit(0);
}

seed();
