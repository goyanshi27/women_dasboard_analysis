/**
 * India Women Safety & Justice Analytics Dashboard - Data Engine
 * Aligned with NCRB (National Crime Records Bureau) trends (2014–2025)
 */

(function () {
    const statesData = [
        { name: "Uttar Pradesh", region: "North", pop: 2300, urban: 22, baseCrime: 60000, reportFactor: 0.85, convRate: 62, pendencyRate: 88, ftcs: 180, wps: 150, osc: 75 },
        { name: "Maharashtra", region: "West", pop: 1250, urban: 45, baseCrime: 38000, reportFactor: 0.92, convRate: 28, pendencyRate: 82, ftcs: 95, wps: 90, osc: 52 },
        { name: "West Bengal", region: "East", pop: 980, urban: 32, baseCrime: 35000, reportFactor: 0.88, convRate: 18, pendencyRate: 91, ftcs: 88, wps: 85, osc: 46 },
        { name: "Madhya Pradesh", region: "Central", pop: 850, urban: 28, baseCrime: 30000, reportFactor: 0.90, convRate: 48, pendencyRate: 75, ftcs: 110, wps: 80, osc: 55 },
        { name: "Rajasthan", region: "North", pop: 810, urban: 25, baseCrime: 34000, reportFactor: 0.87, convRate: 45, pendencyRate: 68, ftcs: 85, wps: 78, osc: 48 },
        { name: "Bihar", region: "East", pop: 1260, urban: 12, baseCrime: 18000, reportFactor: 0.65, convRate: 32, pendencyRate: 92, ftcs: 75, wps: 70, osc: 40 },
        { name: "Tamil Nadu", region: "South", pop: 760, urban: 49, baseCrime: 8000, reportFactor: 0.95, convRate: 58, pendencyRate: 60, ftcs: 65, wps: 200, osc: 42 },
        { name: "Andhra Pradesh", region: "South", pop: 530, urban: 30, baseCrime: 16000, reportFactor: 0.91, convRate: 40, pendencyRate: 70, ftcs: 58, wps: 95, osc: 36 },
        { name: "Karnataka", region: "South", pop: 670, urban: 38, baseCrime: 15000, reportFactor: 0.92, convRate: 35, pendencyRate: 78, ftcs: 70, wps: 88, osc: 38 },
        { name: "Gujarat", region: "West", pop: 640, urban: 43, baseCrime: 9000, reportFactor: 0.90, convRate: 38, pendencyRate: 74, ftcs: 62, wps: 75, osc: 35 },
        { name: "Odisha", region: "East", pop: 460, urban: 17, baseCrime: 25000, reportFactor: 0.88, convRate: 9, pendencyRate: 94, ftcs: 52, wps: 45, osc: 32 },
        { name: "Telangana", region: "South", pop: 380, urban: 39, baseCrime: 17000, reportFactor: 0.93, convRate: 39, pendencyRate: 72, ftcs: 50, wps: 68, osc: 33 },
        { name: "Kerala", region: "South", pop: 350, urban: 48, baseCrime: 14000, reportFactor: 0.98, convRate: 85, pendencyRate: 55, ftcs: 56, wps: 42, osc: 28 },
        { name: "Jharkhand", region: "East", pop: 380, urban: 24, baseCrime: 9000, reportFactor: 0.72, convRate: 36, pendencyRate: 84, ftcs: 38, wps: 35, osc: 24 },
        { name: "Assam", region: "Northeast", pop: 350, urban: 15, baseCrime: 28000, reportFactor: 0.85, convRate: 12, pendencyRate: 86, ftcs: 42, wps: 32, osc: 27 },
        { name: "Punjab", region: "North", pop: 300, urban: 37, baseCrime: 6000, reportFactor: 0.88, convRate: 30, pendencyRate: 70, ftcs: 32, wps: 30, osc: 23 },
        { name: "Haryana", region: "North", pop: 280, urban: 35, baseCrime: 10000, reportFactor: 0.90, convRate: 42, pendencyRate: 75, ftcs: 35, wps: 33, osc: 24 },
        { name: "Chhattisgarh", region: "Central", pop: 290, urban: 23, baseCrime: 9000, reportFactor: 0.86, convRate: 50, pendencyRate: 65, ftcs: 30, wps: 28, osc: 27 },
        { name: "Jammu & Kashmir", region: "North", pop: 135, urban: 27, baseCrime: 3500, reportFactor: 0.82, convRate: 22, pendencyRate: 80, ftcs: 15, wps: 12, osc: 12 },
        { name: "Uttarakhand", region: "North", pop: 110, urban: 30, baseCrime: 2800, reportFactor: 0.88, convRate: 52, pendencyRate: 72, ftcs: 12, wps: 15, osc: 13 },
        { name: "Himachal Pradesh", region: "North", pop: 74, urban: 10, baseCrime: 1600, reportFactor: 0.94, convRate: 46, pendencyRate: 60, ftcs: 8, wps: 10, osc: 10 },
        { name: "Tripura", region: "Northeast", pop: 41, urban: 26, baseCrime: 1000, reportFactor: 0.85, convRate: 24, pendencyRate: 78, ftcs: 6, wps: 8, osc: 8 },
        { name: "Meghalaya", region: "Northeast", pop: 33, urban: 20, baseCrime: 700, reportFactor: 0.90, convRate: 15, pendencyRate: 82, ftcs: 5, wps: 6, osc: 6 },
        { name: "Manipur", region: "Northeast", pop: 31, urban: 30, baseCrime: 400, reportFactor: 0.75, convRate: 10, pendencyRate: 85, ftcs: 4, wps: 5, osc: 6 },
        { name: "Nagaland", region: "Northeast", pop: 22, urban: 29, baseCrime: 100, reportFactor: 0.95, convRate: 72, pendencyRate: 42, ftcs: 3, wps: 4, osc: 4 },
        { name: "Goa", region: "West", pop: 15, urban: 62, baseCrime: 500, reportFactor: 0.95, convRate: 32, pendencyRate: 65, ftcs: 4, wps: 5, osc: 4 },
        { name: "Arunachal Pradesh", region: "Northeast", pop: 16, urban: 23, baseCrime: 450, reportFactor: 0.88, convRate: 25, pendencyRate: 76, ftcs: 4, wps: 5, osc: 5 },
        { name: "Mizoram", region: "Northeast", pop: 12, urban: 52, baseCrime: 180, reportFactor: 0.96, convRate: 88, pendencyRate: 35, ftcs: 3, wps: 4, osc: 4 },
        { name: "Sikkim", region: "Northeast", pop: 7, urban: 25, baseCrime: 150, reportFactor: 0.94, convRate: 68, pendencyRate: 50, ftcs: 2, wps: 3, osc: 4 },
        { name: "Delhi", region: "North", pop: 210, urban: 98, baseCrime: 14000, reportFactor: 0.98, convRate: 48, pendencyRate: 80, ftcs: 25, wps: 22, osc: 15 },
        { name: "Puducherry", region: "South", pop: 16, urban: 68, baseCrime: 120, reportFactor: 0.95, convRate: 40, pendencyRate: 58, ftcs: 2, wps: 3, osc: 2 },
        { name: "Chandigarh", region: "North", pop: 12, urban: 97, baseCrime: 450, reportFactor: 0.96, convRate: 45, pendencyRate: 62, ftcs: 2, wps: 2, osc: 2 },
        { name: "Andaman & Nicobar Islands", region: "South", pop: 4, urban: 37, baseCrime: 160, reportFactor: 0.95, convRate: 55, pendencyRate: 52, ftcs: 2, wps: 2, osc: 2 },
        { name: "Dadra & Nagar Haveli and Daman & Diu", region: "West", pop: 6, urban: 46, baseCrime: 100, reportFactor: 0.88, convRate: 44, pendencyRate: 68, ftcs: 2, wps: 2, osc: 2 },
        { name: "Lakshadweep", region: "South", pop: 0.7, urban: 78, baseCrime: 10, reportFactor: 0.98, convRate: 90, pendencyRate: 20, ftcs: 1, wps: 1, osc: 1 },
        { name: "Ladakh", region: "North", pop: 3, urban: 22, baseCrime: 25, reportFactor: 0.92, convRate: 65, pendencyRate: 45, ftcs: 1, wps: 2, osc: 1 }
    ];

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    // Deterministic random generator based on a seed for reproducibility
    function seededRandom(seed) {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    function generateDataset() {
        const data = {};
        let seed = 12345;

        statesData.forEach(state => {
            data[state.name] = {
                name: state.name,
                region: state.region,
                population: state.pop * 100000, // actual scale
                urbanPct: state.urban,
                ruralPct: 100 - state.urban,
                ftcs: state.ftcs,
                wps: state.wps,
                osc: state.osc,
                policeStrengthPerLakh: Math.round(100 + seededRandom(seed++) * 150),
                cctvCoveragePct: Math.round(15 + seededRandom(seed++) * 60),
                helplineAvailabilityPct: Math.round(70 + seededRandom(seed++) * 29),
                
                // Nirbhaya and local initiatives
                nirbhayaAllocated: Math.round((state.pop * 5 + seededRandom(seed++) * 20) * 1000000), // INR
                nirbhayaUtilizedPct: Math.round(40 + seededRandom(seed++) * 50),
                helplineCallsReceived: Math.round(state.pop * 1200 + seededRandom(seed++) * 5000),
                selfDefenceBeneficiaries: Math.round(state.pop * 800 + seededRandom(seed++) * 3000),
                
                yearlyData: {}
            };

            const sData = data[state.name];
            sData.nirbhayaUtilized = Math.round(sData.nirbhayaAllocated * (sData.nirbhayaUtilizedPct / 100));
            sData.helplineCallsResolved = Math.round(sData.helplineCallsReceived * (0.85 + seededRandom(seed++) * 0.12));
            sData.oneStopWomenAssisted = Math.round(sData.osc * (150 + seededRandom(seed++) * 100));

            // Populate Years 2014 to 2025
            for (let year = 2014; year <= 2025; year++) {
                // Growth trend: upward from 2014 to 2019, drop in 2020 (Covid lockdown), rise again from 2021-2024, stabilizing in 2025.
                let trendMultiplier = 1.0;
                if (year <= 2019) {
                    trendMultiplier = 1.0 + (year - 2014) * 0.06; // ~6% YoY growth
                } else if (year === 2020) {
                    trendMultiplier = 1.15; // Covid drop in reporting overall, but domestic violence went up
                } else {
                    trendMultiplier = 1.25 + (year - 2021) * 0.04;
                }

                // Apply deterministic seed variations
                const variance = 0.92 + seededRandom(seed++) * 0.16;
                const totalCrimes = Math.round(state.baseCrime * trendMultiplier * variance);

                // Crime types breakdowns (approx. proportions)
                const rapeCases = Math.round(totalCrimes * 0.095);
                const attemptToRape = Math.round(rapeCases * 0.12);
                const domesticViolence = Math.round(totalCrimes * 0.35); // Domestic violence is usually the highest
                const kidnappingAbduction = Math.round(totalCrimes * 0.22);
                const pocsoCases = Math.round(rapeCases * 0.65); // Child abuse cases
                const acidAttacks = Math.max(0, Math.round(state.pop * 0.1 + seededRandom(seed++) * 2));
                const otherCrimes = totalCrimes - (rapeCases + attemptToRape + domesticViolence + kidnappingAbduction + pocsoCases + acidAttacks);

                // Judicial system metrics
                const chargesheetRatePct = Math.round(72 + seededRandom(seed++) * 18); // Chargesheet rate 72% - 90%
                const casesChargesheeted = Math.round(totalCrimes * (chargesheetRatePct / 100));
                
                // Out of chargesheeted, what happens?
                // Split outcomes
                const convictionRatePct = Math.max(5, Math.round(state.convRate + (seededRandom(seed++) * 10 - 5)));
                const pendencyRatePct = Math.min(98, Math.max(40, Math.round(state.pendencyRate + (seededRandom(seed++) * 8 - 4))));
                
                const casesResolved = Math.round(casesChargesheeted * ((100 - pendencyRatePct) / 100));
                const casesPendingTrial = casesChargesheeted - casesResolved;
                
                const casesConvicted = Math.round(casesResolved * (convictionRatePct / 100));
                const casesAcquitted = casesResolved - casesConvicted;
                const casesPendingInvestigation = totalCrimes - casesChargesheeted;

                // Victim age demographics
                const ageUnder12 = Math.round(rapeCases * 0.08);
                const age12_18 = Math.round(rapeCases * 0.28);
                const age18_25 = Math.round(rapeCases * 0.38);
                const age26_40 = Math.round(rapeCases * 0.20);
                const ageAbove40 = rapeCases - (ageUnder12 + age12_18 + age18_25 + age26_40);

                // Urban vs Rural split
                const urbanCases = Math.round(totalCrimes * (state.urban / 100) * (1.1 - seededRandom(seed++) * 0.2));
                const ruralCases = Math.max(0, totalCrimes - urbanCases);

                // Relationships (Treemap)
                // Family Member (~5%), Relative (~12%), Neighbor (~35%), Friend (~28%), Employer (~3%), Stranger (~17%)
                const familyMember = Math.round(rapeCases * 0.068);
                const relative = Math.round(rapeCases * 0.114);
                const neighbor = Math.round(rapeCases * 0.362);
                const friend = Math.round(rapeCases * 0.276);
                const employer = Math.round(rapeCases * 0.025);
                const stranger = rapeCases - (familyMember + relative + neighbor + friend + employer);

                // Monthly distributions (Heatmap)
                // Crime rates usually peak in summer months (May-Aug) and festival season (Oct-Nov)
                const baseMonthly = months.map((m, idx) => {
                    let weight = 1.0;
                    if (idx >= 4 && idx <= 7) weight = 1.15; // Summer / Monsoon peaks
                    if (idx === 9 || idx === 10) weight = 1.10; // Festive season peaks
                    if (idx === 11 || idx === 0) weight = 0.85; // Winter lows
                    return weight;
                });
                const monthlyDistribution = [];
                let runningSum = 0;
                baseMonthly.forEach(w => {
                    const noise = 0.9 + seededRandom(seed++) * 0.2;
                    const val = Math.round((totalCrimes / 12) * w * noise);
                    monthlyDistribution.push(val);
                    runningSum += val;
                });
                // Adjust discrepancy
                monthlyDistribution[5] += (totalCrimes - runningSum);

                sData.yearlyData[year] = {
                    totalCrimes,
                    rapeCases,
                    attemptToRape,
                    pocsoCases,
                    domesticViolence,
                    kidnappingAbduction,
                    acidAttacks,
                    otherCrimes,
                    
                    chargesheetRatePct,
                    convictionRatePct,
                    pendencyRatePct,
                    
                    casesChargesheeted,
                    casesConvicted,
                    casesAcquitted,
                    casesPendingInvestigation,
                    casesPendingTrial,
                    
                    victimAge: {
                        under12: ageUnder12,
                        age12_18: age12_18,
                        age18_25: age18_25,
                        age26_40: age26_40,
                        above40: ageAbove40
                    },
                    urbanRural: {
                        urban: {
                            cases: urbanCases,
                            convictions: Math.round(urbanCases * (convictionRatePct / 100) * 0.9),
                            pendency: Math.round(urbanCases * (pendencyRatePct / 100) * 1.02)
                        },
                        rural: {
                            cases: ruralCases,
                            convictions: Math.round(ruralCases * (convictionRatePct / 100) * 1.1),
                            pendency: Math.round(ruralCases * (pendencyRatePct / 100) * 0.98)
                        }
                    },
                    relationship: {
                        familyMember,
                        relative,
                        neighbor,
                        friend,
                        employer,
                        stranger
                    },
                    monthlyDistribution
                };
            }
        });

        return data;
    }

    // Generate data
    const database = generateDataset();

    // Custom Women Safety Index Generator
    function calculateSafetyIndex(stateName, year) {
        const state = database[stateName];
        if (!state) return null;
        const yData = state.yearlyData[year];
        if (!yData) return null;

        // Formula params
        // 1. Crime Rate per Lakh Women (Lower is better) - pop is total population, assume women pop is 48.5%
        const womenPopLakh = (state.population * 0.485) / 100000;
        const crimeRate = yData.totalCrimes / womenPopLakh;
        
        // Normalize crime rate (0 to 100, where 0 is worst, 100 is best)
        // High crime rate is ~400 per lakh, low is ~5 per lakh
        let crimeScore = 100 - (crimeRate / 400) * 100;
        crimeScore = Math.max(0, Math.min(100, crimeScore));

        // 2. Conviction Rate (Higher is better)
        const convScore = yData.convictionRatePct; // already 0-100

        // 3. Police Strength per Lakh (Higher is better, norm max 300)
        let policeScore = (state.policeStrengthPerLakh / 300) * 100;
        policeScore = Math.max(0, Math.min(100, policeScore));

        // 4. Fast Track Courts relative to population (norm: 1 court per 1 lakh population, max score 100)
        let ftcScore = (state.ftcs / (state.population / 100000)) * 25;
        ftcScore = Math.max(0, Math.min(100, ftcScore));

        // 5. Women Police Stations (relative to population)
        let wpsScore = (state.wps / (state.population / 100000)) * 20;
        wpsScore = Math.max(0, Math.min(100, wpsScore));

        // 6. CCTV Coverage
        const cctvScore = state.cctvCoveragePct;

        // 7. Helpline Availability
        const helplineScore = state.helplineAvailabilityPct;

        // Weighted Index: 
        // Crime Rate: 30%, Conviction Rate: 20%, Police Strength: 15%, FTCs: 10%, WPS: 10%, CCTV: 8%, Helpline: 7%
        const score = (
            (crimeScore * 0.30) +
            (convScore * 0.20) +
            (policeScore * 0.15) +
            (ftcScore * 0.10) +
            (wpsScore * 0.10) +
            (cctvScore * 0.08) +
            (helplineScore * 0.07)
        );

        let category = "Concerning";
        let color = "🟠";
        let classColor = "concerning";
        if (score >= 75) {
            category = "Safe";
            color = "🟢";
            classColor = "safe";
        } else if (score >= 55) {
            category = "Moderate";
            color = "🟡";
            classColor = "moderate";
        } else if (score < 40) {
            category = "High Risk";
            color = "🔴";
            classColor = "high-risk";
        }

        return {
            stateName,
            crimeRate: Math.round(crimeRate * 10) / 10,
            convictionRate: yData.convictionRatePct,
            policeStrength: state.policeStrengthPerLakh,
            ftcCount: state.ftcs,
            wpsCount: state.wps,
            cctvCoverage: state.cctvCoveragePct,
            helplineAvailability: state.helplineAvailabilityPct,
            score: Math.round(score * 10) / 10,
            category,
            color,
            classColor
        };
    }

    // Expose APIs to global window object
    window.DashboardData = {
        getStates: function () {
            return Object.keys(database).sort();
        },
        getStateDetails: function (stateName) {
            return database[stateName];
        },
        getRegions: function () {
            const regions = new Set();
            Object.values(database).forEach(s => regions.add(s.region));
            return Array.from(regions).sort();
        },
        
        // Main filtering engine
        query: function (filters = {}) {
            // Default filters
            const selectedYear = filters.year ? parseInt(filters.year) : 2025;
            const selectedState = filters.state || "All";
            const selectedRegion = filters.region || "All";
            const selectedCrimeType = filters.crimeType || "All";
            const selectedAgeGroup = filters.ageGroup || "All";
            const selectedUrbanRural = filters.urbanRural || "All";

            let statesToInclude = Object.values(database);

            // Filter states
            if (selectedState !== "All") {
                statesToInclude = statesToInclude.filter(s => s.name === selectedState);
            }
            if (selectedRegion !== "All") {
                statesToInclude = statesToInclude.filter(s => s.region === selectedRegion);
            }

            // Aggregation containers
            let totalRape = 0;
            let totalCrimes = 0;
            let totalAttempt = 0;
            let totalPocso = 0;
            let totalDomestic = 0;
            let totalKidnapping = 0;
            let totalAcid = 0;

            let totalChargesheeted = 0;
            let totalConvicted = 0;
            let totalAcquitted = 0;
            let totalPendingInv = 0;
            let totalPendingTrial = 0;

            let totalFTCs = 0;
            let totalWPS = 0;
            let totalOSC = 0;
            let totalNirbhayaAlloc = 0;
            let totalNirbhayaUtil = 0;
            let totalHelplineCalls = 0;
            let totalHelplineResolved = 0;
            let totalOSCAssisted = 0;
            let totalSelfDefenceBeneficiaries = 0;
            let totalPoliceStrengthSum = 0;

            const monthlySum = new Array(12).fill(0);
            const ageGroupSum = { under12: 0, age12_18: 0, age18_25: 0, age26_40: 0, above40: 0 };
            const relationshipSum = { familyMember: 0, relative: 0, neighbor: 0, friend: 0, employer: 0, stranger: 0 };
            const urbanRuralSum = {
                urban: { cases: 0, convictions: 0, pendency: 0 },
                rural: { cases: 0, convictions: 0, pendency: 0 }
            };

            const stateWiseAggregates = [];

            statesToInclude.forEach(state => {
                const yData = state.yearlyData[selectedYear];
                if (!yData) return;

                // State sums
                totalFTCs += state.ftcs;
                totalWPS += state.wps;
                totalOSC += state.osc;
                totalNirbhayaAlloc += state.nirbhayaAllocated;
                totalNirbhayaUtil += state.nirbhayaUtilized;
                totalHelplineCalls += state.helplineCallsReceived;
                totalHelplineResolved += state.helplineCallsResolved;
                totalOSCAssisted += state.oneStopWomenAssisted;
                totalSelfDefenceBeneficiaries += state.selfDefenceBeneficiaries;
                totalPoliceStrengthSum += state.policeStrengthPerLakh * state.population; // weighted sum

                // Filter-based crime numbers
                let stateCrimes = yData.totalCrimes;
                let stateRape = yData.rapeCases;
                let stateAttempt = yData.attemptToRape;
                let statePocso = yData.pocsoCases;
                let stateDomestic = yData.domesticViolence;
                let stateKidnapping = yData.kidnappingAbduction;
                let stateAcid = yData.acidAttacks;

                let stateChargesheeted = yData.casesChargesheeted;
                let stateConvicted = yData.casesConvicted;
                let stateAcquitted = yData.casesAcquitted;
                let statePendingInv = yData.casesPendingInvestigation;
                let statePendingTrial = yData.casesPendingTrial;

                // Handle Sub-Filters (Urban/Rural, Crime Type, Age Group)
                if (selectedUrbanRural !== "All") {
                    const activeUr = selectedUrbanRural.toLowerCase(); // 'urban' or 'rural'
                    const urData = yData.urbanRural[activeUr];
                    stateCrimes = urData.cases;
                    stateConvicted = urData.convictions;
                    statePendingTrial = urData.pendency;
                    // Proportional scaling for other subcomponents
                    const ratio = stateCrimes / yData.totalCrimes;
                    stateRape = Math.round(stateRape * ratio);
                    stateAttempt = Math.round(stateAttempt * ratio);
                    statePocso = Math.round(statePocso * ratio);
                    stateDomestic = Math.round(stateDomestic * ratio);
                    stateKidnapping = Math.round(stateKidnapping * ratio);
                    stateAcid = Math.round(stateAcid * ratio);
                    stateChargesheeted = Math.round(stateChargesheeted * ratio);
                    stateAcquitted = Math.round(stateAcquitted * ratio);
                    statePendingInv = Math.round(statePendingInv * ratio);
                }

                if (selectedAgeGroup !== "All") {
                    // Filter applies mainly to victims. Scale totals proportionally.
                    let ageProp = 0.2;
                    if (selectedAgeGroup === "Under 12") ageProp = yData.victimAge.under12 / yData.rapeCases;
                    else if (selectedAgeGroup === "12–18") ageProp = yData.victimAge.age12_18 / yData.rapeCases;
                    else if (selectedAgeGroup === "18–25") ageProp = yData.victimAge.age18_25 / yData.rapeCases;
                    else if (selectedAgeGroup === "26–40") ageProp = yData.victimAge.age26_40 / yData.rapeCases;
                    else if (selectedAgeGroup === "40+") ageProp = yData.victimAge.above40 / yData.rapeCases;

                    stateCrimes = Math.round(stateCrimes * ageProp);
                    stateRape = Math.round(stateRape * ageProp);
                    stateAttempt = Math.round(stateAttempt * ageProp);
                    statePocso = Math.round(statePocso * ageProp);
                    stateDomestic = Math.round(stateDomestic * ageProp);
                    stateKidnapping = Math.round(stateKidnapping * ageProp);
                    stateAcid = Math.round(stateAcid * ageProp);
                    stateChargesheeted = Math.round(stateChargesheeted * ageProp);
                    stateConvicted = Math.round(stateConvicted * ageProp);
                    stateAcquitted = Math.round(stateAcquitted * ageProp);
                    statePendingInv = Math.round(statePendingInv * ageProp);
                    statePendingTrial = Math.round(statePendingTrial * ageProp);
                }

                if (selectedCrimeType !== "All") {
                    // Filter to specific crime type
                    let crimeVal = 0;
                    if (selectedCrimeType === "Rape Cases") crimeVal = stateRape;
                    else if (selectedCrimeType === "Domestic Violence") crimeVal = stateDomestic;
                    else if (selectedCrimeType === "POCSO Cases") crimeVal = statePocso;
                    else if (selectedCrimeType === "Kidnapping & Abduction") crimeVal = stateKidnapping;
                    else if (selectedCrimeType === "Attempt to Rape") crimeVal = stateAttempt;
                    else if (selectedCrimeType === "Acid Attack") crimeVal = stateAcid;
                    else crimeVal = stateCrimes - (stateRape + stateDomestic + statePocso + stateKidnapping + stateAttempt + stateAcid);

                    const ratio = crimeVal / stateCrimes;
                    stateCrimes = crimeVal;
                    stateRape = selectedCrimeType === "Rape Cases" ? crimeVal : 0;
                    stateAttempt = selectedCrimeType === "Attempt to Rape" ? crimeVal : 0;
                    statePocso = selectedCrimeType === "POCSO Cases" ? crimeVal : 0;
                    stateDomestic = selectedCrimeType === "Domestic Violence" ? crimeVal : 0;
                    stateKidnapping = selectedCrimeType === "Kidnapping & Abduction" ? crimeVal : 0;
                    stateAcid = selectedCrimeType === "Acid Attack" ? crimeVal : 0;

                    stateChargesheeted = Math.round(stateChargesheeted * ratio);
                    stateConvicted = Math.round(stateConvicted * ratio);
                    stateAcquitted = Math.round(stateAcquitted * ratio);
                    statePendingInv = Math.round(statePendingInv * ratio);
                    statePendingTrial = Math.round(statePendingTrial * ratio);
                }

                // Add to sums
                totalCrimes += stateCrimes;
                totalRape += stateRape;
                totalAttempt += stateAttempt;
                totalPocso += statePocso;
                totalDomestic += stateDomestic;
                totalKidnapping += stateKidnapping;
                totalAcid += stateAcid;

                totalChargesheeted += stateChargesheeted;
                totalConvicted += stateConvicted;
                totalAcquitted += stateAcquitted;
                totalPendingInv += statePendingInv;
                totalPendingTrial += statePendingTrial;

                // Monthly distribution sums (scale proportionally if filters applied)
                const stateRatio = yData.totalCrimes > 0 ? stateCrimes / yData.totalCrimes : 0;
                for (let i = 0; i < 12; i++) {
                    monthlySum[i] += Math.round(yData.monthlyDistribution[i] * stateRatio);
                }

                // Victim age sums
                Object.keys(ageGroupSum).forEach(key => {
                    const ratio = yData.rapeCases > 0 ? stateRape / yData.rapeCases : 0;
                    ageGroupSum[key] += Math.round(yData.victimAge[key] * ratio);
                });

                // Relationship sums
                Object.keys(relationshipSum).forEach(key => {
                    const ratio = yData.rapeCases > 0 ? stateRape / yData.rapeCases : 0;
                    relationshipSum[key] += Math.round(yData.relationship[key] * ratio);
                });

                // Urban vs Rural
                Object.keys(urbanRuralSum).forEach(urKey => {
                    const ratio = yData.totalCrimes > 0 ? stateCrimes / yData.totalCrimes : 0;
                    urbanRuralSum[urKey].cases += Math.round(yData.urbanRural[urKey].cases * ratio);
                    urbanRuralSum[urKey].convictions += Math.round(yData.urbanRural[urKey].convictions * ratio);
                    urbanRuralSum[urKey].pendency += Math.round(yData.urbanRural[urKey].pendency * ratio);
                });

                // Calculate rates for state list
                const wLakh = (state.population * 0.485) / 100000;
                const cRate = stateCrimes / wLakh;
                const convRate = stateChargesheeted > 0 ? (stateConvicted / (stateConvicted + stateAcquitted || 1)) * 100 : 0;
                const pendencyRate = stateChargesheeted > 0 ? (statePendingTrial / stateChargesheeted) * 100 : 0;

                stateWiseAggregates.push({
                    name: state.name,
                    crimes: stateCrimes,
                    rape: stateRape,
                    crimeRate: Math.round(cRate * 10) / 10,
                    convictionRate: Math.round(convRate * 10) / 10,
                    pendencyRate: Math.round(pendencyRate * 10) / 10,
                    score: calculateSafetyIndex(state.name, selectedYear).score
                });
            });

            // Calculate overall national rates for active filter
            const nationalConvictionRate = totalChargesheeted > 0 ? (totalConvicted / (totalConvicted + totalAcquitted || 1)) * 100 : 0;
            const nationalChargesheetRate = totalCrimes > 0 ? (totalChargesheeted / totalCrimes) * 100 : 0;
            const nationalCourtPendency = totalChargesheeted > 0 ? (totalPendingTrial / totalChargesheeted) * 100 : 0;
            
            const totalPop = statesToInclude.reduce((sum, s) => sum + s.population, 0);
            const nationalPoliceStrength = totalPop > 0 ? Math.round(totalPoliceStrengthSum / totalPop) : 0;

            return {
                summary: {
                    totalCrimes,
                    rapeCases: totalRape,
                    attemptToRape: totalAttempt,
                    pocsoCases: totalPocso,
                    domesticViolence: totalDomestic,
                    kidnappingAbduction: totalKidnapping,
                    acidAttacks: totalAcid,
                    
                    casesChargesheeted: totalChargesheeted,
                    casesConvicted: totalConvicted,
                    casesAcquitted: totalAcquitted,
                    casesPendingInvestigation: totalPendingInv,
                    casesPendingTrial: totalPendingTrial,
                    
                    convictionRatePct: Math.round(nationalConvictionRate * 10) / 10,
                    chargesheetRatePct: Math.round(nationalChargesheetRate * 10) / 10,
                    courtPendencyPct: Math.round(nationalCourtPendency * 10) / 10,
                    
                    fastTrackCourts: totalFTCs,
                    womenPoliceStations: totalWPS,
                    oneStopCenters: totalOSC,
                    policeStrengthPerLakh: nationalPoliceStrength,
                    
                    nirbhayaAllocated: totalNirbhayaAlloc,
                    nirbhayaUtilized: totalNirbhayaUtil,
                    nirbhayaUtilizedPct: totalNirbhayaAlloc > 0 ? Math.round((totalNirbhayaUtil / totalNirbhayaAlloc) * 100) : 0,
                    
                    helplineCallsReceived: totalHelplineCalls,
                    helplineCallsResolved: totalHelplineResolved,
                    helplineResolvePct: totalHelplineCalls > 0 ? Math.round((totalHelplineResolved / totalHelplineCalls) * 100) : 0,
                    
                    oneStopWomenAssisted: totalOSCAssisted,
                    selfDefenceBeneficiaries: totalSelfDefenceBeneficiaries
                },
                monthlyDistribution: monthlySum,
                victimAge: ageGroupSum,
                relationship: relationshipSum,
                urbanRural: urbanRuralSum,
                stateWise: stateWiseAggregates
            };
        },

        // Helper for safety index ranking
        getSafetyIndexRanking: function (year) {
            const list = statesData.map(state => calculateSafetyIndex(state.name, year));
            return list.sort((a, b) => b.score - a.score); // highest score (safest) first
        },

        // Helper for national crime trend (2014-2025)
        getNationalTrend: function () {
            const trend = [];
            for (let year = 2014; year <= 2025; year++) {
                let yearRape = 0;
                let yearCrimes = 0;
                let yearPocso = 0;
                let yearPending = 0;
                let yearResolved = 0;
                let yearChargesheeted = 0;
                let yearConvicted = 0;
                let yearAcquitted = 0;

                Object.values(database).forEach(state => {
                    const yData = state.yearlyData[year];
                    if (yData) {
                        yearRape += yData.rapeCases;
                        yearCrimes += yData.totalCrimes;
                        yearPocso += yData.pocsoCases;
                        yearChargesheeted += yData.casesChargesheeted;
                        yearConvicted += yData.casesConvicted;
                        yearAcquitted += yData.casesAcquitted;
                        yearPending += yData.casesPendingTrial;
                    }
                });

                const convictionRate = yearChargesheeted > 0 ? (yearConvicted / (yearConvicted + yearAcquitted || 1)) * 100 : 0;

                trend.push({
                    year,
                    rapeCases: yearRape,
                    totalCrimes: yearCrimes,
                    pocsoCases: yearPocso,
                    pendingCases: yearPending,
                    resolvedCases: yearConvicted + yearAcquitted,
                    convictionRatePct: Math.round(convictionRate * 10) / 10
                });
            }
            return trend;
        }
    };
})();
