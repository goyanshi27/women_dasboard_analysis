/**
 * India Women Safety & Justice Analytics Dashboard - Main Controller
 */

document.addEventListener("DOMContentLoaded", function () {
    // ----------------------------------------------------
    // State Management
    // ----------------------------------------------------
    const state = {
        filters: {
            year: "2025",
            state: "All",
            region: "All",
            crimeType: "All",
            ageGroup: "All",
            urbanRural: "All"
        },
        activeTab: "overview",
        map: null,
        geoJsonLayer: null,
        charts: {},
        currentForecastModel: "prophet",
        currentForecastMetric: "rapeCases",
        decompActiveNode: null,
        decompActiveCol2: null,
        quotes: [
            "\"A nation is truly developed when its women can walk freely and fearlessly.\"",
            "\"Women's safety is not a privilege; it is a fundamental right.\"",
            "\"Justice delayed is justice denied.\"",
            "\"Empowered women empower nations.\"",
            "\"The strength of a society is measured by the safety of its women.\""
        ],
        quoteIndex: 0
    };

    // GeoJSON state normalization mapping
    const geojsonStateMap = {
        "Andaman and Nicobar": "Andaman & Nicobar Islands",
        "Andhra Pradesh": "Andhra Pradesh",
        "Arunachal Pradesh": "Arunachal Pradesh",
        "Assam": "Assam",
        "Bihar": "Bihar",
        "Chandigarh": "Chandigarh",
        "Chhattisgarh": "Chhattisgarh",
        "Dadra and Nagar Haveli": "Dadra & Nagar Haveli and Daman & Diu",
        "Daman and Diu": "Dadra & Nagar Haveli and Daman & Diu",
        "Delhi": "Delhi",
        "Goa": "Goa",
        "Gujarat": "Gujarat",
        "Haryana": "Haryana",
        "Himachal Pradesh": "Himachal Pradesh",
        "Jammu and Kashmir": "Jammu & Kashmir",
        "Jharkhand": "Jharkhand",
        "Karnataka": "Karnataka",
        "Kerala": "Kerala",
        "Lakshadweep": "Lakshadweep",
        "Madhya Pradesh": "Madhya Pradesh",
        "Maharashtra": "Maharashtra",
        "Manipur": "Manipur",
        "Meghalaya": "Meghalaya",
        "Mizoram": "Mizoram",
        "Nagaland": "Nagaland",
        "Orissa": "Odisha",
        "Puducherry": "Puducherry",
        "Punjab": "Punjab",
        "Rajasthan": "Rajasthan",
        "Sikkim": "Sikkim",
        "Tamil Nadu": "Tamil Nadu",
        "Tripura": "Tripura",
        "Uttar Pradesh": "Uttar Pradesh",
        "Uttaranchal": "Uttarakhand",
        "West Bengal": "West Bengal"
    };

    // ----------------------------------------------------
    // Initialization
    // ----------------------------------------------------
    function init() {
        initTabs();
        initThemeToggle();
        initQuotesRotation();
        initFilterControls();
        
        // Initial data query
        const data = runDataQuery();
        
        // Initialize Map & Charts
        initMap();
        initOverviewCharts(data);
        
        // Initial render of all visual elements
        renderAll(data);
    }

    // Tab Navigation
    function initTabs() {
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", function (e) {
                e.preventDefault();
                const targetPage = this.getAttribute("data-page");
                
                document.querySelectorAll(".nav-item").forEach(item => item.classList.remove("active"));
                this.parentElement.classList.add("active");
                
                document.querySelectorAll(".dashboard-page").forEach(page => page.classList.remove("active"));
                const activePage = document.getElementById(`page-${targetPage}`);
                if (activePage) {
                    activePage.classList.add("active");
                }
                
                state.activeTab = targetPage;
                
                // Triggers map sizing fixes if showing map tab
                if (targetPage === "statewise" && state.map) {
                    setTimeout(() => state.map.invalidateSize(), 100);
                }

                // Render tab-specific elements
                const data = runDataQuery();
                renderTabSpecific(targetPage, data);
            });
        });
    }

    // Light/Dark Theme Switcher
    function initThemeToggle() {
        const toggleBtn = document.getElementById("theme-toggle");
        toggleBtn.addEventListener("click", function () {
            document.body.classList.toggle("light-theme");
            // Re-render map tiles & charts to match theme
            const data = runDataQuery();
            recreateAllCharts(data);
            if (state.map) {
                updateMapColors(data);
            }
        });
    }

    // Rotating Quotes
    function initQuotesRotation() {
        const quoteTextEl = document.getElementById("rotating-quote");
        setInterval(() => {
            state.quoteIndex = (state.quoteIndex + 1) % state.quotes.length;
            quoteTextEl.style.opacity = 0;
            setTimeout(() => {
                quoteTextEl.textContent = state.quotes[state.quoteIndex];
                quoteTextEl.style.opacity = 1;
            }, 300);
        }, 10000);
    }

    // Global Filter Dropdowns Setup
    function initFilterControls() {
        const yearSelect = document.getElementById("filter-year");
        const stateSelect = document.getElementById("filter-state");
        const regionSelect = document.getElementById("filter-region");
        const crimeSelect = document.getElementById("filter-crime-type");
        const ageSelect = document.getElementById("filter-age-group");
        const urSelect = document.getElementById("filter-urban-rural");

        // Populate Years (2014-2025)
        for (let y = 2025; y >= 2014; y--) {
            const opt = document.createElement("option");
            opt.value = y;
            opt.textContent = y;
            yearSelect.appendChild(opt);
        }

        // Populate States
        DashboardData.getStates().forEach(st => {
            const opt = document.createElement("option");
            opt.value = st;
            opt.textContent = st;
            stateSelect.appendChild(opt);
        });

        // Populate Regions
        DashboardData.getRegions().forEach(rg => {
            const opt = document.createElement("option");
            opt.value = rg;
            opt.textContent = rg;
            regionSelect.appendChild(opt);
        });

        // Filter events
        const triggerUpdate = () => {
            state.filters.year = yearSelect.value;
            state.filters.state = stateSelect.value;
            state.filters.region = regionSelect.value;
            state.filters.crimeType = crimeSelect.value;
            state.filters.ageGroup = ageSelect.value;
            state.filters.urbanRural = urSelect.value;
            
            const data = runDataQuery();
            renderAll(data);
        };

        yearSelect.addEventListener("change", triggerUpdate);
        stateSelect.addEventListener("change", triggerUpdate);
        regionSelect.addEventListener("change", triggerUpdate);
        crimeSelect.addEventListener("change", triggerUpdate);
        ageSelect.addEventListener("change", triggerUpdate);
        urSelect.addEventListener("change", triggerUpdate);

        document.getElementById("clear-filters").addEventListener("click", () => {
            yearSelect.value = "2025";
            stateSelect.value = "All";
            regionSelect.value = "All";
            crimeSelect.value = "All";
            ageSelect.value = "All";
            urSelect.value = "All";
            triggerUpdate();
        });
    }

    // Run Query on Data module
    function runDataQuery() {
        return DashboardData.query(state.filters);
    }

    // ----------------------------------------------------
    // Chart Creation & Updating Helpers
    // ----------------------------------------------------
    function getThemeColor(variable) {
        return getComputedStyle(document.body).getPropertyValue(variable).trim();
    }

    function destroyChart(name) {
        if (state.charts[name]) {
            state.charts[name].destroy();
            delete state.charts[name];
        }
    }

    function recreateAllCharts(data) {
        destroyChart("crimeTrend");
        destroyChart("topStates");
        destroyChart("bottomStates");
        destroyChart("pendencyDonut");
        destroyChart("resolutionTrend");
        destroyChart("ageDistribution");
        destroyChart("safetyRadar");
        destroyChart("forecastChart");
        
        initOverviewCharts(data);
        renderTabSpecific(state.activeTab, data);
    }

    // ----------------------------------------------------
    // Leaflet Choropleth Map Setup
    // ----------------------------------------------------
    function initMap() {
        const mapContainer = document.getElementById("choropleth-map");
        if (!mapContainer) return;

        // Initialize Leaflet Map
        state.map = L.map("choropleth-map", {
            zoomSnap: 0.25,
            scrollWheelZoom: false,
            zoomControl: true,
            attributionControl: false
        }).setView([21.8, 78.8], 4.5);

        // Load the local boundary layers from our script variable
        if (window.indiaGeoJSON) {
            updateMapLayers();
        } else {
            console.error("India GeoJSON not loaded correctly.");
        }
    }

    function getMapMetricValue(stateName, data, metric) {
        const normName = stateName.trim();
        const found = data.stateWise.find(s => s.name === normName);
        
        // Handle special split mappings (e.g. Jammu & Kashmir contains Ladakh in the pre-2019 polygon)
        if (!found && normName === "Jammu & Kashmir") {
            const ladakh = data.stateWise.find(s => s.name === "Ladakh");
            const jk = data.stateWise.find(s => s.name === "Jammu & Kashmir");
            return ((jk ? jk[metric] : 0) + (ladakh ? ladakh[metric] : 0));
        }
        
        return found ? found[metric] : 0;
    }

    function getMapColor(value, metric, maxVal) {
        // Color scale: Saffron-to-DarkBlue gradient based on theme
        // Let's create an elegant heat-map representation
        const ratio = maxVal > 0 ? value / maxVal : 0;
        
        // Interpolate colors
        let r, g, b;
        if (metric === "convictionRate" || metric === "score") {
            // Good metric (Conviction/Safety Score): Green gradient (Light green to Forest green)
            r = Math.round(180 - ratio * 150);
            g = Math.round(240 - ratio * 120);
            b = Math.round(180 - ratio * 150);
        } else {
            // Bad metric (Crimes/Rape/Pendency): Saffron/Orange gradient (Soft cream to deep red-saffron)
            r = Math.round(250 - ratio * 70);
            g = Math.round(230 - ratio * 180);
            b = Math.round(210 - ratio * 180);
        }
        return `rgb(${r}, ${g}, ${b})`;
    }

    function updateMapLayers() {
        if (!state.map || !window.indiaGeoJSON) return;

        const activeMapMetric = document.getElementById("map-metric-select").value; // crimes, crimeRate, convictionRate, pendencyRate, score
        const data = runDataQuery();
        
        // Find max value in states for scaling
        let maxVal = 0;
        data.stateWise.forEach(s => {
            if (s[activeMapMetric] > maxVal) maxVal = s[activeMapMetric];
        });
        if (maxVal === 0) maxVal = 1;

        if (state.geoJsonLayer) {
            state.map.removeLayer(state.geoJsonLayer);
        }

        // Feature styling
        function style(feature) {
            const geojsonName = feature.properties.NAME_1;
            const mappedName = geojsonStateMap[geojsonName] || geojsonName;
            const val = getMapMetricValue(mappedName, data, activeMapMetric);
            
            return {
                fillColor: getMapColor(val, activeMapMetric, maxVal),
                weight: 1.2,
                opacity: 1,
                color: getThemeColor("--border-color"),
                fillOpacity: 0.85
            };
        }

        // Hover listeners
        function onEachFeature(feature, layer) {
            const geojsonName = feature.properties.NAME_1;
            const mappedName = geojsonStateMap[geojsonName] || geojsonName;
            const val = getMapMetricValue(mappedName, data, activeMapMetric);
            
            // Build nice HTML popup/tooltip
            const metricLabels = {
                crimes: "Reported Cases",
                crimeRate: "Crime Rate per Lakh Women",
                convictionRate: "Conviction Rate %",
                pendencyRate: "Court Pendency Rate %",
                score: "Safety Score"
            };

            let unit = "";
            if (activeMapMetric === "convictionRate" || activeMapMetric === "pendencyRate") unit = "%";

            layer.on({
                mouseover: function (e) {
                    const layer = e.target;
                    layer.setStyle({
                        weight: 2.5,
                        color: getThemeColor("--primary-accent"),
                        fillOpacity: 0.95
                    });
                    layer.bringToFront();
                    
                    // Show custom tooltip
                    const tooltipContent = `
                        <div class="custom-tooltip">
                            <strong>${mappedName}</strong><br/>
                            ${metricLabels[activeMapMetric]}: <strong>${val.toLocaleString()}${unit}</strong>
                        </div>
                    `;
                    layer.bindTooltip(tooltipContent, { sticky: true, direction: "top", opacity: 0.95 }).openTooltip();
                },
                mouseout: function (e) {
                    state.geoJsonLayer.resetStyle(e.target);
                },
                click: function (e) {
                    // Filter dashboard by this state
                    const stateSelect = document.getElementById("filter-state");
                    if (stateSelect) {
                        stateSelect.value = mappedName;
                        stateSelect.dispatchEvent(new Event("change"));
                    }
                }
            });
        }

        state.geoJsonLayer = L.geoJson(window.indiaGeoJSON, {
            style: style,
            onEachFeature: onEachFeature
        }).addTo(state.map);

        // Add metric select change listener
        const select = document.getElementById("map-metric-select");
        select.onchange = function () {
            updateMapLayers();
        };
    }

    function updateMapColors(data) {
        updateMapLayers();
    }

    // ----------------------------------------------------
    // Section 1: India Overview Charts (Initial tab)
    // ----------------------------------------------------
    function initOverviewCharts(data) {
        // 1. India Crime Trend Line Chart
        const trendCanvas = document.getElementById("trend-chart");
        if (trendCanvas) {
            const trendData = DashboardData.getNationalTrend();
            const years = trendData.map(d => d.year);
            const rape = trendData.map(d => d.rapeCases);
            const total = trendData.map(d => d.totalCrimes);
            const pocso = trendData.map(d => d.pocsoCases);

            state.charts.crimeTrend = new Chart(trendCanvas, {
                type: "line",
                data: {
                    labels: years,
                    datasets: [
                        {
                            label: "Total Crimes Against Women",
                            data: total,
                            borderColor: getThemeColor("--secondary-accent"),
                            backgroundColor: "rgba(29, 155, 240, 0.05)",
                            yAxisID: "y-total",
                            borderWidth: 3,
                            fill: true,
                            tension: 0.2
                        },
                        {
                            label: "Rape Cases Registered",
                            data: rape,
                            borderColor: getThemeColor("--primary-accent"),
                            backgroundColor: "transparent",
                            yAxisID: "y-rape",
                            borderWidth: 2.5,
                            tension: 0.2
                        },
                        {
                            label: "POCSO Cases Registered",
                            data: pocso,
                            borderColor: getThemeColor("--accent-yellow"),
                            backgroundColor: "transparent",
                            yAxisID: "y-rape",
                            borderWidth: 2,
                            tension: 0.2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: getThemeColor("--text-primary"), font: { family: "Inter" } }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: getThemeColor("--border-color") },
                            ticks: { color: getThemeColor("--text-secondary") }
                        },
                        "y-total": {
                            type: "linear",
                            position: "left",
                            grid: { color: getThemeColor("--border-color") },
                            ticks: { color: getThemeColor("--text-secondary") },
                            title: { display: true, text: "Total Crimes", color: getThemeColor("--text-secondary") }
                        },
                        "y-rape": {
                            type: "linear",
                            position: "right",
                            grid: { drawOnChartArea: false },
                            ticks: { color: getThemeColor("--text-secondary") },
                            title: { display: true, text: "Rape & POCSO", color: getThemeColor("--text-secondary") }
                        }
                    }
                }
            });
        }
    }

    // ----------------------------------------------------
    // Section 2: Top / Bottom States Charts
    // ----------------------------------------------------
    function renderStatewiseCharts(data) {
        const metricSelect = document.getElementById("top-states-metric");
        if (!metricSelect) return;
        const activeMetric = metricSelect.value; // crimes, crimeRate, convictionRate, score

        // Sort data for Top 10
        const sortedDesc = [...data.stateWise].sort((a, b) => b[activeMetric] - a[activeMetric]);
        const top10 = sortedDesc.slice(0, 10);
        
        // Sort data for Bottom 10 (Safest/lowest crime, or highest conviction)
        const sortedAsc = [...data.stateWise].sort((a, b) => a[activeMetric] - b[activeMetric]);
        const bottom10 = sortedAsc.slice(0, 10);

        const metricLabels = {
            crimes: "Cases Count",
            crimeRate: "Rate per Lakh",
            convictionRate: "Conviction %",
            score: "Safety Index"
        };

        // Render Top 10
        const topCanvas = document.getElementById("top-states-chart");
        if (topCanvas) {
            destroyChart("topStates");
            state.charts.topStates = new Chart(topCanvas, {
                type: "bar",
                data: {
                    labels: top10.map(s => s.name),
                    datasets: [{
                        label: `Top States by ${metricLabels[activeMetric]}`,
                        data: top10.map(s => s[activeMetric]),
                        backgroundColor: getThemeColor("--primary-accent"),
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y",
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { color: getThemeColor("--border-color") },
                            ticks: { color: getThemeColor("--text-secondary") }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: getThemeColor("--text-secondary") }
                        }
                    }
                }
            });
        }

        // Render Bottom 10
        const bottomCanvas = document.getElementById("bottom-states-chart");
        if (bottomCanvas) {
            destroyChart("bottomStates");
            state.charts.bottomStates = new Chart(bottomCanvas, {
                type: "bar",
                data: {
                    labels: bottom10.map(s => s.name),
                    datasets: [{
                        label: `Bottom States by ${metricLabels[activeMetric]}`,
                        data: bottom10.map(s => s[activeMetric]),
                        backgroundColor: getThemeColor("--secondary-accent"),
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y",
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        x: {
                            grid: { color: getThemeColor("--border-color") },
                            ticks: { color: getThemeColor("--text-secondary") }
                        },
                        y: {
                            grid: { display: false },
                            ticks: { color: getThemeColor("--text-secondary") }
                        }
                    }
                }
            });
        }

        // Trigger listener on select
        metricSelect.onchange = function () {
            renderStatewiseCharts(data);
        };
    }

    // ----------------------------------------------------
    // Section 3: Justice Delivery Analysis
    // ----------------------------------------------------
    function renderJusticeCharts(data) {
        // 1. Funnel Chart Conversion Rates
        const funnelContainer = document.getElementById("justice-funnel");
        if (funnelContainer) {
            const sum = data.summary;
            const stages = [
                { name: "FIR Registered", value: sum.totalCrimes, ratio: 100 },
                { name: "Cases Chargesheeted", value: sum.casesChargesheeted, ratio: Math.round(sum.chargesheetRatePct) },
                { name: "Trial Started", value: sum.casesChargesheeted, ratio: Math.round(sum.chargesheetRatePct) }, // chargesheeted begins trial
                { name: "Cases Resolved", value: sum.casesConvicted + sum.casesAcquitted, ratio: Math.round(sum.casesChargesheeted > 0 ? ((sum.casesConvicted + sum.casesAcquitted) / sum.casesChargesheeted) * 100 : 0) },
                { name: "Cases Convicted", value: sum.casesConvicted, ratio: Math.round(sum.casesChargesheeted > 0 ? (sum.casesConvicted / sum.casesChargesheeted) * 100 : 0) }
            ];

            let html = '<div class="funnel-container">';
            stages.forEach((st, idx) => {
                const prev = idx > 0 ? stages[idx - 1].value : st.value;
                const convRate = prev > 0 ? Math.round((st.value / prev) * 100) : 0;
                const widthPct = Math.max(10, Math.round((st.value / stages[0].value) * 100));

                html += `
                    <div class="funnel-stage">
                        <div class="funnel-bar-container">
                            <div class="funnel-bar" style="width: ${widthPct}%"></div>
                            <span class="funnel-stage-label">${st.name}</span>
                            <span class="funnel-stage-metrics">${st.value.toLocaleString()}</span>
                        </div>
                        <div class="funnel-conversion">
                            ${idx === 0 ? "100%" : convRate + "% ↓"}
                        </div>
                    </div>
                `;
            });
            html += "</div>";
            funnelContainer.innerHTML = html;
        }

        // 2. Donut Chart
        const donutCanvas = document.getElementById("pendency-donut");
        if (donutCanvas) {
            const sum = data.summary;
            const resolved = sum.casesConvicted + sum.casesAcquitted;
            const pending = sum.casesPendingTrial + sum.casesPendingInvestigation;

            destroyChart("pendencyDonut");
            state.charts.pendencyDonut = new Chart(donutCanvas, {
                type: "doughnut",
                data: {
                    labels: ["Resolved Cases", "Pending Cases"],
                    datasets: [{
                        data: [resolved, pending],
                        backgroundColor: [getThemeColor("--accent-green"), getThemeColor("--accent-red")],
                        borderWidth: 1,
                        borderColor: getThemeColor("--bg-card")
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: "bottom",
                            labels: { color: getThemeColor("--text-primary") }
                        }
                    }
                }
            });
        }

        // 3. Case Resolution Trend
        const resCanvas = document.getElementById("resolution-trend-chart");
        if (resCanvas) {
            const trendData = DashboardData.getNationalTrend();
            destroyChart("resolutionTrend");
            state.charts.resolutionTrend = new Chart(resCanvas, {
                type: "line",
                data: {
                    labels: trendData.map(d => d.year),
                    datasets: [
                        {
                            label: "Pending Cases",
                            data: trendData.map(d => d.pendingCases),
                            borderColor: getThemeColor("--accent-red"),
                            backgroundColor: "transparent",
                            borderWidth: 2
                        },
                        {
                            label: "Resolved Cases",
                            data: trendData.map(d => d.resolvedCases),
                            borderColor: getThemeColor("--accent-green"),
                            backgroundColor: "transparent",
                            borderWidth: 2
                        },
                        {
                            label: "Conviction Rate %",
                            data: trendData.map(d => d.convictionRatePct),
                            borderColor: getThemeColor("--accent-yellow"),
                            backgroundColor: "transparent",
                            borderWidth: 1.5,
                            borderDash: [5, 5],
                            yAxisID: "y-rate"
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { grid: { color: getThemeColor("--border-color") }, ticks: { color: getThemeColor("--text-secondary") } },
                        y: { grid: { color: getThemeColor("--border-color") }, ticks: { color: getThemeColor("--text-secondary") } },
                        "y-rate": {
                            type: "linear",
                            position: "right",
                            min: 0,
                            max: 100,
                            grid: { drawOnChartArea: false },
                            ticks: { color: getThemeColor("--text-secondary") }
                        }
                    }
                }
            });
        }
    }

    // ----------------------------------------------------
    // Section 4: Victim Analysis
    // ----------------------------------------------------
    function renderVictimCharts(data) {
        // 1. Age Group Analysis
        const ageCanvas = document.getElementById("age-group-chart");
        if (ageCanvas) {
            const ageData = data.victimAge;
            destroyChart("ageDistribution");
            state.charts.ageDistribution = new Chart(ageCanvas, {
                type: "bar",
                data: {
                    labels: ["Under 12", "12–18", "18–25", "26–40", "40+"],
                    datasets: [{
                        label: "Victim Count",
                        data: [ageData.under12, ageData.age12_18, ageData.age18_25, ageData.age26_40, ageData.above40],
                        backgroundColor: getThemeColor("--primary-accent"),
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false }, ticks: { color: getThemeColor("--text-secondary") } },
                        y: { grid: { color: getThemeColor("--border-color") }, ticks: { color: getThemeColor("--text-secondary") } }
                    }
                }
            });
        }

        // 2. Urban vs Rural Compare Table
        const urContainer = document.getElementById("urban-rural-compare");
        if (urContainer) {
            const ur = data.urbanRural;
            const urTotal = ur.urban.cases + ur.rural.cases;
            const uConvRate = ur.urban.cases > 0 ? Math.round((ur.urban.convictions / ur.urban.cases) * 100) : 0;
            const rConvRate = ur.rural.cases > 0 ? Math.round((ur.rural.convictions / ur.rural.cases) * 100) : 0;
            const uPendRate = ur.urban.cases > 0 ? Math.round((ur.urban.pendency / ur.urban.cases) * 100) : 0;
            const rPendRate = ur.rural.cases > 0 ? Math.round((ur.rural.pendency / ur.rural.cases) * 100) : 0;

            urContainer.innerHTML = `
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Region Type</th>
                            <th>Reported Cases</th>
                            <th>% Share</th>
                            <th>Est. Conviction Rate</th>
                            <th>Est. Pendency Rate</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>Urban Area</strong></td>
                            <td>${ur.urban.cases.toLocaleString()}</td>
                            <td>${Math.round((ur.urban.cases / (urTotal || 1)) * 100)}%</td>
                            <td><span class="badge" style="background-color: rgba(var(--primary-accent-rgb),0.1); color: var(--primary-accent)">${uConvRate}%</span></td>
                            <td>${uPendRate}%</td>
                        </tr>
                        <tr>
                            <td><strong>Rural Area</strong></td>
                            <td>${ur.rural.cases.toLocaleString()}</td>
                            <td>${Math.round((ur.rural.cases / (urTotal || 1)) * 100)}%</td>
                            <td><span class="badge" style="background-color: rgba(var(--primary-accent-rgb),0.1); color: var(--primary-accent)">${rConvRate}%</span></td>
                            <td>${rPendRate}%</td>
                        </tr>
                    </tbody>
                </table>
            `;
        }

        // 3. Victim-Offender Relationship Treemap (Custom Layout)
        const treemapContainer = document.getElementById("offender-treemap");
        if (treemapContainer) {
            const rel = data.relationship;
            const total = Object.values(rel).reduce((sum, v) => sum + v, 0);

            // Structure data and compute cell sizes
            const cells = [
                { name: "Family Member", value: rel.familyMember, color: "#0B2545" },
                { name: "Relative", value: rel.relative, color: "#134074" },
                { name: "Neighbor", value: rel.neighbor, color: "#C2410C" },
                { name: "Friend/Acquaintance", value: rel.friend, color: "#D35400" },
                { name: "Employer/Colleague", value: rel.employer, color: "#FBBF24" },
                { name: "Stranger", value: rel.stranger, color: "#64748B" }
            ].sort((a, b) => b.value - a.value);

            let html = '<div class="treemap-container">';
            cells.forEach(cell => {
                const pct = total > 0 ? (cell.value / total) * 100 : 0;
                if (pct <= 0) return;
                
                // Set flex-basis to control proportion layout
                html += `
                    <div class="treemap-cell" style="flex: 1 1 ${Math.max(15, Math.round(pct * 0.95)) - 1}%; background-color: ${cell.color}">
                        <span class="treemap-cell-title">${cell.name}</span>
                        <span class="treemap-cell-val">${cell.value.toLocaleString()} (${Math.round(pct * 10) / 10}%)</span>
                    </div>
                `;
            });
            html += "</div>";
            treemapContainer.innerHTML = html;
        }
    }

    // ----------------------------------------------------
    // Section 5: Women Safety Index
    // ----------------------------------------------------
    function renderSafetyIndexTab(data) {
        // 1. Safety Index Table Grid
        const tableContainer = document.getElementById("safety-index-table");
        if (tableContainer) {
            const rankList = DashboardData.getSafetyIndexRanking(state.filters.year);
            let html = `
                <table class="custom-table">
                    <thead>
                        <tr>
                            <th>Rank</th>
                            <th>State Name</th>
                            <th>Crime Rate</th>
                            <th>Conviction %</th>
                            <th>FTC Count</th>
                            <th>WPS Count</th>
                            <th>CCTV Coverage</th>
                            <th>Safety Score</th>
                            <th>Category</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            rankList.forEach((st, idx) => {
                html += `
                    <tr>
                        <td><strong>#${idx + 1}</strong></td>
                        <td><strong>${st.stateName}</strong></td>
                        <td>${st.crimeRate}</td>
                        <td>${st.convictionRate}%</td>
                        <td>${st.ftcCount}</td>
                        <td>${st.wpsCount}</td>
                        <td>${st.cctvCoverage}%</td>
                        <td><strong>${st.score}</strong></td>
                        <td><span class="badge ${st.classColor}">${st.category}</span></td>
                    </tr>
                `;
            });

            html += "</tbody></table>";
            tableContainer.innerHTML = html;
        }

        // 2. Radar Chart - Parameter Comparison
        const radarCanvas = document.getElementById("safety-radar-chart");
        if (radarCanvas) {
            // Compare first rank (safest) vs selected state (or average)
            const rankList = DashboardData.getSafetyIndexRanking(state.filters.year);
            const safest = rankList[0];
            
            // Get selected state or middle state as comparison
            const compareName = state.filters.state !== "All" ? state.filters.state : rankList[Math.round(rankList.length / 2)].stateName;
            const compareState = rankList.find(s => s.stateName === compareName) || rankList[1];

            // Normalize scores (0-100)
            const labels = ["Low Crime Rate", "Conviction Rate", "Police Strength", "FTCs Scale", "WPS Count", "CCTV", "Helpline"];
            
            // Map parameters
            const safestData = [
                Math.max(0, 100 - safest.crimeRate * 2), // scale crime rate inversion
                safest.convictionRate,
                Math.min(100, (safest.policeStrength / 250) * 100),
                Math.min(100, safest.ftcCount * 2),
                Math.min(100, safest.wpsCount * 2),
                safest.cctvCoverage,
                safest.helplineAvailability
            ];

            const compareData = [
                Math.max(0, 100 - compareState.crimeRate * 2),
                compareState.convictionRate,
                Math.min(100, (compareState.policeStrength / 250) * 100),
                Math.min(100, compareState.ftcCount * 2),
                Math.min(100, compareState.wpsCount * 2),
                compareState.cctvCoverage,
                compareState.helplineAvailability
            ];

            destroyChart("safetyRadar");
            state.charts.safetyRadar = new Chart(radarCanvas, {
                type: "radar",
                data: {
                    labels,
                    datasets: [
                        {
                            label: `${safest.stateName} (Rank #1)`,
                            data: safestData,
                            backgroundColor: "rgba(100, 255, 218, 0.15)",
                            borderColor: getThemeColor("--accent-green"),
                            borderWidth: 2
                        },
                        {
                            label: `${compareState.stateName}`,
                            data: compareData,
                            backgroundColor: "rgba(255, 126, 71, 0.15)",
                            borderColor: getThemeColor("--primary-accent"),
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: getThemeColor("--text-primary") } }
                    },
                    scales: {
                        r: {
                            angleLines: { color: getThemeColor("--border-color") },
                            grid: { color: getThemeColor("--border-color") },
                            pointLabels: { color: getThemeColor("--text-secondary") },
                            ticks: { backdropColor: "transparent", color: getThemeColor("--text-secondary") },
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }
                }
            });
        }
    }

    // ----------------------------------------------------
    // Section 6: Government Initiatives Tab
    // ----------------------------------------------------
    function renderInitiativesTab(data) {
        const grid = document.getElementById("initiatives-grid");
        if (!grid) return;
        const sum = data.summary;

        // Custom Nirbhaya funding and program cards
        grid.innerHTML = `
            <div class="init-card">
                <div class="init-card-header">
                    <div class="init-card-icon">💰</div>
                    <div class="init-card-title">
                        <h4>Nirbhaya Fund</h4>
                        <p>Central safety allocation scheme</p>
                    </div>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Total Fund Allocated</span>
                    <span class="init-stat-val">₹${(sum.nirbhayaAllocated / 10000000).toFixed(1)} Cr</span>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Fund Utilized</span>
                    <span class="init-stat-val">₹${(sum.nirbhayaUtilized / 10000000).toFixed(1)} Cr</span>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Utilization %</span>
                    <span class="init-stat-val" style="color: ${sum.nirbhayaUtilizedPct < 50 ? 'var(--accent-orange)' : 'var(--accent-green)'}">
                        ${sum.nirbhayaUtilizedPct}%
                    </span>
                </div>
            </div>

            <div class="init-card">
                <div class="init-card-header">
                    <div class="init-card-icon">📞</div>
                    <div class="init-card-title">
                        <h4>Women Helpline (181)</h4>
                        <p>24x7 emergency distress line</p>
                    </div>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Calls Logged</span>
                    <span class="init-stat-val">${sum.helplineCallsReceived.toLocaleString()}</span>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Cases Resolved</span>
                    <span class="init-stat-val">${sum.helplineCallsResolved.toLocaleString()}</span>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Resolution Rate %</span>
                    <span class="init-stat-val" style="color: var(--accent-green)">${sum.helplineResolvePct}%</span>
                </div>
            </div>

            <div class="init-card">
                <div class="init-card-header">
                    <div class="init-card-icon">🏢</div>
                    <div class="init-card-title">
                        <h4>One Stop Centers (OSC)</h4>
                        <p>Integrated assistance booths</p>
                    </div>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Active Centers</span>
                    <span class="init-stat-val">${sum.oneStopCenters}</span>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Women Assisted</span>
                    <span class="init-stat-val">${sum.oneStopWomenAssisted.toLocaleString()}</span>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Safety Initiatives</span>
                    <span class="init-stat-val">Active</span>
                </div>
            </div>

            <div class="init-card">
                <div class="init-card-header">
                    <div class="init-card-icon">🛡️</div>
                    <div class="init-card-title">
                        <h4>Self Defence Programs</h4>
                        <p>School and college trainings</p>
                    </div>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Total Trained</span>
                    <span class="init-stat-val">${sum.selfDefenceBeneficiaries.toLocaleString()}</span>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">WPS Active Count</span>
                    <span class="init-stat-val">${sum.womenPoliceStations}</span>
                </div>
                <div class="init-stat-row">
                    <span class="init-stat-label">Focus Cities</span>
                    <span class="init-stat-val">8 Metro Safe Cities</span>
                </div>
            </div>
        `;
    }

    // ----------------------------------------------------
    // Section 7: Predictive Analytics
    // ----------------------------------------------------
    function renderPredictiveTab(data) {
        const modelBtnGroup = document.getElementById("forecast-model-selector");
        const metricBtnGroup = document.getElementById("forecast-metric-selector");
        if (!modelBtnGroup || !metricBtnGroup) return;

        // Set active filters listeners
        modelBtnGroup.querySelectorAll("button").forEach(btn => {
            btn.onclick = function () {
                modelBtnGroup.querySelectorAll("button").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                state.currentForecastModel = this.getAttribute("data-model");
                calculateAndRenderForecast();
            };
        });

        metricBtnGroup.querySelectorAll("button").forEach(btn => {
            btn.onclick = function () {
                metricBtnGroup.querySelectorAll("button").forEach(b => b.classList.remove("active"));
                this.classList.add("active");
                state.currentForecastMetric = this.getAttribute("data-metric");
                calculateAndRenderForecast();
            };
        });

        calculateAndRenderForecast();
    }

    function calculateAndRenderForecast() {
        const forecastCanvas = document.getElementById("forecast-chart");
        if (!forecastCanvas) return;

        const trendData = DashboardData.getNationalTrend();
        const history = trendData.map(d => d[state.currentForecastMetric]);
        
        // Generate predictions
        const results = DashboardForecast.generateForecast(history, state.currentForecastModel);
        
        // Render Line + confidence interval
        destroyChart("forecastChart");

        // Combine labels
        const allLabels = [...results.historyYears, ...results.futureYears];
        
        // Construct datasets:
        // History dataset
        const historyDataset = {
            label: "Historical Actuals",
            data: [...results.historyValues, ...new Array(5).fill(null)],
            borderColor: getThemeColor("--secondary-accent"),
            backgroundColor: "transparent",
            borderWidth: 3,
            tension: 0.15
        };

        // Forecast dataset
        const forecastDataset = {
            label: "Model Forecast",
            data: [...new Array(results.historyValues.length - 1).fill(null), results.historyValues[results.historyValues.length - 1], ...results.predictions],
            borderColor: getThemeColor("--primary-accent"),
            borderWidth: 2.5,
            borderDash: [5, 5],
            backgroundColor: "transparent",
            tension: 0.15
        };

        // Lower CI
        const lowerCIDataset = {
            label: "Confidence Lower Bound",
            data: [...new Array(results.historyValues.length - 1).fill(null), results.historyValues[results.historyValues.length - 1], ...results.lowerCI],
            borderColor: "transparent",
            backgroundColor: "transparent",
            fill: false,
            pointRadius: 0
        };

        // Upper CI (fills area between lower and upper)
        const upperCIDataset = {
            label: "95% Confidence Band",
            data: [...new Array(results.historyValues.length - 1).fill(null), results.historyValues[results.historyValues.length - 1], ...results.upperCI],
            borderColor: "transparent",
            backgroundColor: "rgba(255, 126, 71, 0.12)",
            fill: "-1", // fill to previous dataset (lowerCIDataset index must match)
            pointRadius: 0
        };

        state.charts.forecastChart = new Chart(forecastCanvas, {
            type: "line",
            data: {
                labels: allLabels,
                datasets: [historyDataset, forecastDataset, lowerCIDataset, upperCIDataset]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            filter: function (item) {
                                // Hide lower CI label in legend
                                return item.text !== "Confidence Lower Bound";
                            },
                            color: getThemeColor("--text-primary")
                        }
                    }
                },
                scales: {
                    x: { grid: { color: getThemeColor("--border-color") }, ticks: { color: getThemeColor("--text-secondary") } },
                    y: { grid: { color: getThemeColor("--border-color") }, ticks: { color: getThemeColor("--text-secondary") } }
                }
            }
        });
    }

    // ----------------------------------------------------
    // Section 8: AI Insights & Recommendations
    // ----------------------------------------------------
    function renderInsightsTab(data) {
        const container = document.getElementById("ai-insights-panel");
        if (!container) return;

        // Compile real statistics in the text
        const rankList = DashboardData.getSafetyIndexRanking(state.filters.year);
        const safest = rankList[0];
        const concerning = rankList.filter(s => s.category === "Concerning" || s.category === "High Risk");
        
        let hotspotsText = concerning.slice(0, 3).map(s => `<strong>${s.stateName}</strong> (Safety Score: ${s.score})`).join(", ");
        if (!hotspotsText) hotspotsText = "No severe hotspots detected.";

        container.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div class="details-panel" style="border-left: 4px solid var(--accent-green)">
                    <h4 style="color: var(--accent-green); margin-bottom: 8px;">🟢 Key Safe Zone Insights</h4>
                    <p>
                        <strong>${safest.stateName}</strong> leads the National Safety Index ranking with a safety score of <strong>${safest.score}</strong>. 
                        The primary drivers of this ranking are a high conviction rate of <strong>${safest.convictionRate}%</strong> and an active fast-track court disposition pipeline. 
                        Policies from this state regarding fast-track judicial delivery should be institutionalized as blueprint models nationwide.
                    </p>
                </div>

                <div class="details-panel" style="border-left: 4px solid var(--accent-orange)">
                    <h4 style="color: var(--accent-orange); margin-bottom: 8px;">🟠 Critical Hotspots & Interventions Required</h4>
                    <p>
                        Current high-risk areas showing higher crimes and high court pendency: ${hotspotsText}. 
                        For instance, <strong>${concerning[0] ? concerning[0].stateName : 'N/A'}</strong> exhibits a court pendency rate exceeding <strong>${concerning[0] ? concerning[0].pendencyRate : 85}%</strong>, leading to extensive delays.
                    </p>
                </div>

                <div class="details-panel" style="border-left: 4px solid var(--secondary-accent)">
                    <h4 style="color: var(--secondary-accent); margin-bottom: 8px;">🛡️ Policy Recommendations</h4>
                    <ul>
                        <li style="margin-bottom: 6px;"><strong>Judicial Capacity:</strong> Establish localized Fast Track Special Courts (FTSC) specifically for POCSO and Rape cases in high-density corridors to reduce pendency ratios below 50%.</li>
                        <li style="margin-bottom: 6px;"><strong>Infrastructure Utilization:</strong> Direct Nirbhaya fund allocations specifically into expanding CCTV Coverage and Helpline 181 integration at rural block levels.</li>
                        <li><strong>Police Reform:</strong> Boost the strength of Women Police Stations (WPS) to a minimum of 1 WPS per 50,000 female population in high-crime districts.</li>
                    </ul>
                </div>
            </div>
        `;
    }

    // ----------------------------------------------------
    // Section 3: Gauges SVG Rendering
    // ----------------------------------------------------
    function renderGauges(data) {
        const sum = data.summary;
        drawGauge("gauge-conviction", sum.convictionRatePct, "Conviction Rate %", getThemeColor("--accent-green"));
        drawGauge("gauge-pendency", sum.courtPendencyPct, "Court Pendency %", getThemeColor("--accent-red"));
        drawGauge("gauge-nirbhaya", sum.nirbhayaUtilizedPct, "Nirbhaya Utilized %", getThemeColor("--primary-accent"));
    }

    function drawGauge(containerId, value, label, color) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Semi-circle gauge (180 degrees)
        // radius = 80, stroke-width = 14
        // Arc length = PI * R = 3.14159 * 80 = 251.3
        const radius = 80;
        const totalArc = Math.PI * radius;
        const strokeDashOffset = totalArc - (value / 100) * totalArc;
        
        // Needle rotation: -90 degrees (for 0%) to +90 degrees (for 100%)
        const rotationAngle = -90 + (value / 100) * 180;

        container.innerHTML = `
            <div class="gauge-container">
                <svg class="gauge-svg" viewBox="0 0 200 120">
                    <!-- Base Arc -->
                    <path class="gauge-bg-arc" d="M 20,100 A 80,80 0 0,1 180,100" />
                    <!-- Colored Fill Arc -->
                    <path class="gauge-fill-arc" d="M 20,100 A 80,80 0 0,1 180,100" 
                          style="stroke: ${color}; stroke-dasharray: ${totalArc}; stroke-dashoffset: ${strokeDashOffset};" />
                    <!-- Needle -->
                    <polygon class="gauge-needle" points="97,100 103,100 100,30" 
                             style="transform: rotate(${rotationAngle}deg); fill: ${getThemeColor('--text-primary')};" />
                    <!-- Center Pivot -->
                    <circle class="gauge-center-pivot" cx="100" cy="100" r="6" style="fill: ${getThemeColor('--text-primary')};" />
                </svg>
                <div class="gauge-val">${value}%</div>
                <div class="gauge-label">${label}</div>
            </div>
        `;
    }

    // ----------------------------------------------------
    // Section 3: Sankey SVG Rendering
    // ----------------------------------------------------
    function renderSankey() {
        const container = document.getElementById("sankey-diagram");
        if (!container) return;

        const data = runDataQuery();
        const sum = data.summary;

        // Flows values
        const registered = sum.totalCrimes;
        const chargesheeted = sum.casesChargesheeted;
        const pendingInv = sum.casesPendingInvestigation;
        const pendingTrial = sum.casesPendingTrial;
        const convicted = sum.casesConvicted;
        const acquitted = sum.casesAcquitted;
        const resolved = convicted + acquitted;

        if (registered === 0) {
            container.innerHTML = '<div style="padding: 20px; text-align: center;">No cases registered for current filter.</div>';
            return;
        }

        // SVG dimensions
        const width = 750;
        const height = 360;
        
        // Columns X position
        const col0X = 40;
        const col1X = 260;
        const col2X = 490;
        const col3X = 710;
        const nodeW = 16;

        // Scaling factor: map cases count to pixels (leave space for margins)
        const totalH = height - 100;
        const scale = totalH / registered;

        // Calculate node heights
        const hReg = registered * scale;
        const hChg = chargesheeted * scale;
        const hPenI = pendingInv * scale;
        const hPenT = pendingTrial * scale;
        const hRes = resolved * scale;
        const hConv = convicted * scale;
        const hAcq = acquitted * scale;

        // Node Y positions
        const yReg = 30;

        const yChg = 30;
        const yPenI = yChg + hChg + 40;

        const yPenT = 30;
        const yRes = yPenT + hPenT + 40;

        const yConv = yRes;
        const yAcq = yConv + hConv + 20;

        // Link cubic bezier path helper
        function drawLinkPath(x0, y0, x1, y1, w) {
            const dx = (x1 - x0) / 2;
            const hW = w / 2;
            return `M ${x0} ${y0 + hW} C ${x0 + dx} ${y0 + hW}, ${x1 - dx} ${y1 + hW}, ${x1} ${y1 + hW}`;
        }

        // Generate SVG content
        let svg = `<svg viewBox="0 0 ${width} ${height}" style="width:100%; height:100%;">
            <!-- Gradients -->
            <defs>
                <linearGradient id="grad-reg-chg" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="var(--secondary-accent)" />
                    <stop offset="100%" stop-color="var(--primary-accent)" />
                </linearGradient>
                <linearGradient id="grad-reg-peni" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="var(--secondary-accent)" />
                    <stop offset="100%" stop-color="var(--accent-red)" />
                </linearGradient>
                <linearGradient id="grad-chg-pent" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="var(--primary-accent)" />
                    <stop offset="100%" stop-color="var(--accent-orange)" />
                </linearGradient>
                <linearGradient id="grad-chg-res" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="var(--primary-accent)" />
                    <stop offset="100%" stop-color="var(--accent-green)" />
                </linearGradient>
                <linearGradient id="grad-res-conv" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="var(--accent-green)" />
                    <stop offset="100%" stop-color="var(--accent-yellow)" />
                </linearGradient>
                <linearGradient id="grad-res-acq" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stop-color="var(--accent-green)" />
                    <stop offset="100%" stop-color="var(--text-secondary)" />
                </linearGradient>
            </defs>

            <!-- Links (Paths) -->
            <!-- Registered -> Chargesheeted -->
            <path class="sankey-link" d="${drawLinkPath(col0X + nodeW, yReg, col1X, yChg, hChg)}" 
                  stroke="url(#grad-reg-chg)" stroke-width="${hChg}" />
            
            <!-- Registered -> Pending Investigation -->
            <path class="sankey-link" d="${drawLinkPath(col0X + nodeW, yReg + hChg, col1X, yPenI, hPenI)}" 
                  stroke="url(#grad-reg-peni)" stroke-width="${hPenI}" />

            <!-- Chargesheeted -> Pending Trial -->
            <path class="sankey-link" d="${drawLinkPath(col1X + nodeW, yChg, col2X, yPenT, hPenT)}" 
                  stroke="url(#grad-chg-pent)" stroke-width="${hPenT}" />
            
            <!-- Chargesheeted -> Resolved -->
            <path class="sankey-link" d="${drawLinkPath(col1X + nodeW, yChg + hPenT, col2X, yRes, hRes)}" 
                  stroke="url(#grad-chg-res)" stroke-width="${hRes}" />

            <!-- Resolved -> Convicted -->
            <path class="sankey-link" d="${drawLinkPath(col2X + nodeW, yRes, col3X, yConv, hConv)}" 
                  stroke="url(#grad-res-conv)" stroke-width="${hConv}" />

            <!-- Resolved -> Acquitted -->
            <path class="sankey-link" d="${drawLinkPath(col2X + nodeW, yRes + hConv, col3X, yAcq, hAcq)}" 
                  stroke="url(#grad-res-acq)" stroke-width="${hAcq}" />

            <!-- Nodes (Rectangles) -->
            <!-- Column 0 -->
            <g class="sankey-node">
                <rect x="${col0X}" y="${yReg}" width="${nodeW}" height="${hReg}" fill="var(--secondary-accent)" />
                <text x="${col0X - 10}" y="${yReg + hReg / 2}" text-anchor="end" dominant-baseline="middle">Registered: ${registered.toLocaleString()}</text>
            </g>

            <!-- Column 1 -->
            <g class="sankey-node">
                <rect x="${col1X}" y="${yChg}" width="${nodeW}" height="${hChg}" fill="var(--primary-accent)" />
                <text x="${col1X + 24}" y="${yChg + hChg / 2}" dominant-baseline="middle">Chargesheeted</text>
                
                <rect x="${col1X}" y="${yPenI}" width="${nodeW}" height="${hPenI}" fill="var(--accent-red)" />
                <text x="${col1X + 24}" y="${yPenI + hPenI / 2}" dominant-baseline="middle">Pending Inv: ${pendingInv.toLocaleString()}</text>
            </g>

            <!-- Column 2 -->
            <g class="sankey-node">
                <rect x="${col2X}" y="${yPenT}" width="${nodeW}" height="${hPenT}" fill="var(--accent-orange)" />
                <text x="${col2X - 10}" y="${yPenT + hPenT / 2}" text-anchor="end" dominant-baseline="middle">Pending Trial: ${pendingTrial.toLocaleString()}</text>
                
                <rect x="${col2X}" y="${yRes}" width="${nodeW}" height="${hRes}" fill="var(--accent-green)" />
                <text x="${col2X + 24}" y="${yRes + hRes / 2}" dominant-baseline="middle">Resolved</text>
            </g>

            <!-- Column 3 -->
            <g class="sankey-node">
                <rect x="${col3X}" y="${yConv}" width="${nodeW}" height="${hConv}" fill="var(--accent-yellow)" />
                <text x="${col3X + 22}" y="${yConv + hConv / 2}" dominant-baseline="middle">Convicted: ${convicted.toLocaleString()}</text>
                
                <rect x="${col3X}" y="${yAcq}" width="${nodeW}" height="${hAcq}" fill="var(--text-secondary)" />
                <text x="${col3X + 22}" y="${yAcq + hAcq / 2}" dominant-baseline="middle">Acquitted: ${acquitted.toLocaleString()}</text>
            </g>
        </svg>`;

        container.innerHTML = svg;
    }

    // ----------------------------------------------------
    // Section 1: Monthly Crime Distribution Heatmap
    // ----------------------------------------------------
    function renderHeatmap(data) {
        const heatmapContainer = document.getElementById("monthly-heatmap");
        if (!heatmapContainer) return;

        const maxVal = Math.max(...data.monthlyDistribution);
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        let html = '<div class="heatmap-container">';
        months.forEach((m, idx) => {
            const val = data.monthlyDistribution[idx];
            const ratio = maxVal > 0 ? val / maxVal : 0;
            
            // Build cell background color (Saffron/Orange heat gradient)
            const alpha = 0.15 + ratio * 0.85;
            const bg = `rgba(255, 126, 71, ${alpha})`;
            const textCol = alpha > 0.6 ? '#fff' : 'var(--text-primary)';
            
            html += `
                <div class="heatmap-cell" style="background-color: ${bg}; color: ${textCol}"
                     data-tooltip="${m}: ${val.toLocaleString()} cases">
                    ${m}<br/>${Math.round(val / 100) / 10}k
                </div>
            `;
        });
        html += "</div>";
        heatmapContainer.innerHTML = html;
    }

    // ----------------------------------------------------
    // Section 1: CAGR & Growth Summary Card
    // ----------------------------------------------------
    function renderGrowthSummary(data) {
        const container = document.getElementById("growth-metrics");
        if (!container) return;

        const trend = DashboardData.getNationalTrend();
        
        // Calculate YoY growth
        const currentYearVal = trend[trend.length - 1].totalCrimes;
        const prevYearVal = trend[trend.length - 2].totalCrimes;
        const yoyGrowth = ((currentYearVal - prevYearVal) / prevYearVal) * 100;

        // CAGR from 2014 to 2025
        const firstVal = trend[0].totalCrimes;
        const yearsDiff = 2025 - 2014;
        const cagr = (Math.pow(currentYearVal / firstVal, 1 / yearsDiff) - 1) * 100;

        container.innerHTML = `
            <div class="init-stat-row" style="margin-bottom: 12px;">
                <span class="init-stat-label">YoY Growth (2024–2025)</span>
                <span class="init-stat-val ${yoyGrowth < 0 ? 'positive' : 'negative'}" style="color: ${yoyGrowth < 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                    ${yoyGrowth > 0 ? '+' : ''}${yoyGrowth.toFixed(2)}%
                </span>
            </div>
            <div class="init-stat-row" style="margin-bottom: 12px;">
                <span class="init-stat-label">11-Year CAGR (2014–2025)</span>
                <span class="init-stat-val" style="color: var(--primary-accent)">${cagr.toFixed(2)}%</span>
            </div>
            <div class="init-stat-row">
                <span class="init-stat-label">Projected 2030 Crimes</span>
                <span class="init-stat-val" style="color: var(--secondary-accent)">
                    ${Math.round(currentYearVal * Math.pow(1 + cagr/100, 5)).toLocaleString()} (est)
                </span>
            </div>
        `;
    }

    // ----------------------------------------------------
    // Section 3: Decomposition Tree (Interactive Drill Down)
    // ----------------------------------------------------
    function renderDecompTree() {
        const container = document.getElementById("decomposition-tree");
        if (!container) return;

        const data = runDataQuery();
        const sum = data.summary;

        // Level 1: Selected Scope
        const scopeName = state.filters.state !== "All" ? state.filters.state : "National India";
        const totalScopeVal = sum.totalCrimes;

        // Level 2: Crime Type breakdown
        const level2Categories = [
            { name: "Domestic Violence", val: sum.domesticViolence },
            { name: "Kidnapping & Abduction", val: sum.kidnappingAbduction },
            { name: "Rape Cases", val: sum.rapeCases },
            { name: "POCSO Cases", val: sum.pocsoCases },
            { name: "Attempt to Rape", val: sum.attemptToRape },
            { name: "Acid Attack", val: sum.acidAttacks }
        ].sort((a, b) => b.val - a.val);

        if (!state.decompActiveCol2) {
            state.decompActiveCol2 = level2Categories[0].name;
        }

        // Level 3: Age Group breakdown of selected Level 2 Category
        const selectedCat = level2Categories.find(c => c.name === state.decompActiveCol2) || level2Categories[0];
        
        // Approximate age group scaling for selected category based on current ratios
        const ageRatio = data.victimAge;
        const totalRapeVal = data.summary.rapeCases || 1;
        const level3Data = [
            { name: "Under 12 Years", val: Math.round(selectedCat.val * (ageRatio.under12 / totalRapeVal)) },
            { name: "12–18 Years", val: Math.round(selectedCat.val * (ageRatio.age12_18 / totalRapeVal)) },
            { name: "18–25 Years", val: Math.round(selectedCat.val * (ageRatio.age18_25 / totalRapeVal)) },
            { name: "26–40 Years", val: Math.round(selectedCat.val * (ageRatio.age26_40 / totalRapeVal)) },
            { name: "Above 40 Years", val: Math.max(0, selectedCat.val - Math.round(selectedCat.val * ((ageRatio.under12 + ageRatio.age12_18 + ageRatio.age18_25 + ageRatio.age26_40) / totalRapeVal))) }
        ].sort((a, b) => b.val - a.val);

        let html = `
            <div class="decomp-wrapper">
                <!-- Column 1: Scope -->
                <div class="decomp-column">
                    <div class="decomp-column-header">Scope</div>
                    <div class="decomp-node active">
                        <div class="decomp-node-title">${scopeName}</div>
                        <div class="decomp-node-val">${totalScopeVal.toLocaleString()}</div>
                    </div>
                </div>

                <!-- Column 2: Crime Type -->
                <div class="decomp-column">
                    <div class="decomp-column-header">Crime Category</div>
        `;

        level2Categories.forEach(cat => {
            const isActive = cat.name === state.decompActiveCol2;
            html += `
                <div class="decomp-node ${isActive ? 'active' : ''}" data-category="${cat.name}">
                    <div class="decomp-node-title">${cat.name}</div>
                    <div class="decomp-node-val">${cat.val.toLocaleString()}</div>
                </div>
            `;
        });

        html += `
                </div>

                <!-- Column 3: Age Group Breakdown -->
                <div class="decomp-column">
                    <div class="decomp-column-header">Age Cohort breakdown</div>
        `;

        level3Data.forEach(cohort => {
            html += `
                <div class="decomp-node">
                    <div class="decomp-node-title">${cohort.name}</div>
                    <div class="decomp-node-val">${cohort.val.toLocaleString()}</div>
                </div>
            `;
        });

        html += `
                </div>
            </div>
        `;

        container.innerHTML = html;

        // Bind click listeners
        container.querySelectorAll(".decomp-column:nth-child(2) .decomp-node").forEach(node => {
            node.addEventListener("click", function () {
                state.decompActiveCol2 = this.getAttribute("data-category");
                renderDecompTree();
            });
        });
    }

    // ----------------------------------------------------
    // Section 3: Key Influencers Analysis
    // ----------------------------------------------------
    function renderKeyInfluencers() {
        const container = document.getElementById("key-influencers");
        if (!container) return;

        const data = runDataQuery();
        const sum = data.summary;

        // Calculate custom dynamic influencer insights based on rates
        const pendency = sum.courtPendencyPct;
        const convRate = sum.convictionRatePct;
        const police = sum.policeStrengthPerLakh;
        const ftc = sum.fastTrackCourts;

        const influencers = [];

        // Rules mock analysis
        if (ftc < 50) {
            influencers.push({
                val: "1.8x",
                text: "When <strong>Fast Track Court availability</strong> is Low, the likelihood of <strong>High Court Pendency (>80%)</strong> increases by",
                pct: 82
            });
        } else {
            influencers.push({
                val: "2.1x",
                text: "When <strong>Fast Track Courts count</strong> is High, the likelihood of <strong>High Case Resolution</strong> increases by",
                pct: 75
            });
        }

        if (police < 130) {
            influencers.push({
                val: "1.4x",
                text: "When <strong>Police Strength</strong> drops below 130 per Lakh, the rate of <strong>Unresolved Investigations</strong> increases by",
                pct: 65
            });
        }

        if (convRate > 50) {
            influencers.push({
                val: "2.4x",
                text: "When <strong>Conviction Rate</strong> exceeds 50%, the likelihood of a state landing in the <strong>🟢 Safe Category</strong> increases by",
                pct: 90
            });
        } else {
            influencers.push({
                val: "1.7x",
                text: "When <strong>Conviction Rate</strong> is below 35%, the likelihood of a state landing in <strong>🔴 High Risk</strong> increases by",
                pct: 70
            });
        }

        let html = '<div class="influencer-list">';
        influencers.forEach(item => {
            html += `
                <div class="influencer-item">
                    <div class="influencer-badge">${item.val}</div>
                    <div class="influencer-text">${item.text}</div>
                    <div class="influencer-chart-mini">
                        <div class="influencer-chart-fill" style="width: ${item.pct}%"></div>
                    </div>
                </div>
            `;
        });
        html += '</div>';

        container.innerHTML = html;
    }

    // ----------------------------------------------------
    // Dashboard KPI Card Rendering
    // ----------------------------------------------------
    function renderKPIs(data) {
        const sum = data.summary;

        // Helper to safely write val
        const setVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.textContent = val.toLocaleString();
        };

        // Crime KPIs
        setVal("kpi-rape-cases", sum.rapeCases);
        setVal("kpi-total-crimes", sum.totalCrimes);
        setVal("kpi-attempt-rape", sum.attemptToRape);
        setVal("kpi-pocso-cases", sum.pocsoCases);
        setVal("kpi-domestic-violence", sum.domesticViolence);
        setVal("kpi-kidnapping", sum.kidnappingAbduction);
        setVal("kpi-acid-attacks", sum.acidAttacks);

        // Justice KPIs
        setVal("kpi-chargesheeted", sum.casesChargesheeted);
        setVal("kpi-convicted", sum.casesConvicted);
        setVal("kpi-acquitted", sum.casesAcquitted);
        setVal("kpi-pending-investigation", sum.casesPendingInvestigation);
        setVal("kpi-pending-trial", sum.casesPendingTrial);
        
        // Percentages
        document.getElementById("kpi-conviction-rate").textContent = `${sum.convictionRatePct}%`;
        document.getElementById("kpi-chargesheet-rate").textContent = `${sum.chargesheetRatePct}%`;
        document.getElementById("kpi-court-pendency").textContent = `${sum.courtPendencyPct}%`;

        // Safety Infrastructure KPIs
        setVal("kpi-ftcs", sum.fastTrackCourts);
        setVal("kpi-helplines", 181); // standard national helpline
        setVal("kpi-one-stop-centers", sum.oneStopCenters);
        document.getElementById("kpi-nirbhaya-util").textContent = `${sum.nirbhayaUtilizedPct}%`;
        setVal("kpi-wps", sum.womenPoliceStations);
        setVal("kpi-safe-city", sum.oneStopCenters > 10 ? 8 : 2); // mockup covered cities
    }

    // ----------------------------------------------------
    // Tab-Specific Content Render Router
    // ----------------------------------------------------
    function renderTabSpecific(tabName, data) {
        if (tabName === "overview") {
            renderHeatmap(data);
            renderGrowthSummary(data);
        } else if (tabName === "statewise") {
            renderStatewiseCharts(data);
        } else if (tabName === "justice") {
            renderJusticeCharts(data);
            renderGauges(data);
            renderDecompTree();
            renderKeyInfluencers();
            renderSankey();
        } else if (tabName === "victim") {
            renderVictimCharts(data);
        } else if (tabName === "safetyindex") {
            renderSafetyIndexTab(data);
        } else if (tabName === "initiatives") {
            renderInitiativesTab(data);
        } else if (tabName === "predictive") {
            renderPredictiveTab(data);
        } else if (tabName === "insights") {
            renderInsightsTab(data);
        }
    }

    // Global Render trigger
    function renderAll(data) {
        renderKPIs(data);
        
        if (state.map) {
            updateMapColors(data);
        }

        renderTabSpecific(state.activeTab, data);
    }

    // Run Initialization
    init();
});
