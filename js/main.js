// ========================================
// GLOBAL VARIABLES
// ========================================

let ndx; // Crossfilter instance
let allData = [];
let dailyData = [];
let mapInstance;
let currentPollutant = 'pm25';
let currentYear = 'all';
let currentContinent = 'all';

// Color scales
const colorScales = {
    pm25: d3.scaleThreshold()
        .domain([12, 35.4, 55.4, 150.4])
        .range(['#10b981', '#fbbf24', '#f97316', '#ef4444', '#dc2626']),
    pm10: d3.scaleThreshold()
        .domain([50, 100, 150, 250])
        .range(['#10b981', '#fbbf24', '#f97316', '#ef4444', '#dc2626']),
    no2: d3.scaleThreshold()
        .domain([40, 80, 180, 280])
        .range(['#10b981', '#fbbf24', '#f97316', '#ef4444', '#dc2626']),
    o3: d3.scaleThreshold()
        .domain([50, 100, 130, 240])
        .range(['#10b981', '#fbbf24', '#f97316', '#ef4444', '#dc2626']),
    so2: d3.scaleThreshold()
        .domain([20, 80, 250, 350])
        .range(['#10b981', '#fbbf24', '#f97316', '#ef4444', '#dc2626']),
    aqi: d3.scaleThreshold()
        .domain([50, 100, 150, 200])
        .range(['#10b981', '#fbbf24', '#f97316', '#ef4444', '#dc2626'])
};

// City colors for time series (expandido para 30 cores)
const cityColors = [
    '#00d9ff', '#ff006e', '#10b981', '#fbbf24', '#f97316',
    '#ef4444', '#a855f7', '#06b6d4', '#84cc16', '#f43f5e',
    '#8b5cf6', '#14b8a6', '#fb923c', '#ec4899', '#6366f1',
    '#22d3ee', '#fb7185', '#34d399', '#fde047', '#fdba74',
    '#f87171', '#c084fc', '#38bdf8', '#a3e635', '#fb7da1',
    '#a78bfa', '#2dd4bf', '#fca5a5', '#e879f9', '#60a5fa'
];

// ========================================
// DATA LOADING
// ========================================

async function loadData() {
    try {
        // Load monthly averages for main charts
        const monthlyData = await d3.csv('data/monthly_averages.csv');
        
        // Load daily data for heatmap
        dailyData = await d3.json('data/daily_data.json');
        
        // Process monthly data
        monthlyData.forEach(d => {
            d.pm25 = +d.pm25;
            d.pm10 = +d.pm10;
            d.no2 = +d.no2;
            d.o3 = +d.o3;
            d.so2 = +d.so2;
            d.aqi = +d.aqi;
            d.month = +d.month;
            d.date = new Date(d.year_month + '-01');
        });
        
        allData = monthlyData;
        
        // Initialize crossfilter
        ndx = crossfilter(allData);
        
        // Initialize visualizations
        initializeFilters();
        createBarChart();
        createTimeSeriesChart();
        createMap();
        createCalendarHeatmap();
        
        console.log('✓ Dados carregados e visualizações inicializadas');
        
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        document.body.innerHTML = '<div class="loading">Erro ao carregar dados. Verifique o console.</div>';
    }
}

// ========================================
// FILTERS
// ========================================

function initializeFilters() {
    // Pollutant filter
    d3.select('#pollutant-select').on('change', function() {
        currentPollutant = this.value;
        updateAllCharts();
    });
    
    // Year filter
    d3.select('#year-select').on('change', function() {
        currentYear = this.value;
        updateAllCharts();
    });
    
    // Continent filter
    d3.select('#continent-select').on('change', function() {
        currentContinent = this.value;
        updateAllCharts();
    });
    
    // Reset button
    d3.select('#reset-btn').on('click', function() {
        currentPollutant = 'pm25';
        currentYear = 'all';
        currentContinent = 'all';
        
        d3.select('#pollutant-select').property('value', 'pm25');
        d3.select('#year-select').property('value', 'all');
        d3.select('#continent-select').property('value', 'all');
        
        updateAllCharts();
    });
}

function getFilteredData() {
    return allData.filter(d => {
        const yearMatch = currentYear === 'all' || d.date.getFullYear() === +currentYear;
        const continentMatch = currentContinent === 'all' || d.continent === currentContinent;
        return yearMatch && continentMatch;
    });
}

function updateAllCharts() {
    createBarChart();
    createTimeSeriesChart();
    createMap();
    createCalendarHeatmap();
}

// ========================================
// CHART 1: BAR CHART
// ========================================

function createBarChart() {
    const container = d3.select('#bar-chart');
    container.selectAll('*').remove();
    
    const filteredData = getFilteredData();
    
    // Aggregate by city
    const cityData = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d[currentPollutant]),
        d => d.city
    );
    
    const data = Array.from(cityData, ([city, value]) => ({ city, value }))
        .sort((a, b) => d3.descending(a.value, b.value))
        .slice(0, 20);  // Top 20 cidades
    
    // Dimensions
    const margin = { top: 20, right: 30, bottom: 120, left: 80 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleBand()
        .domain(data.map(d => d.city))
        .range([0, width])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);
    
    // Axes
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');
    
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));
    
    // Grid lines
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(''))
        .selectAll('line')
        .attr('class', 'grid-line');
    
    // Bars
    const bars = svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.city))
        .attr('width', x.bandwidth())
        .attr('y', height)
        .attr('height', 0)
        .attr('fill', d => colorScales[currentPollutant](d.value))
        .attr('rx', 4);
    
    // Animate bars
    bars.transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr('y', d => y(d.value))
        .attr('height', d => height - y(d.value));
    
    // Tooltips
    bars.on('mouseover', function(event, d) {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 0.7);
        
        showTooltip(event, `
            <strong>${d.city}</strong><br/>
            ${getPollutantLabel(currentPollutant)}: ${d.value.toFixed(2)} µg/m³
        `);
    })
    .on('mouseout', function() {
        d3.select(this)
            .transition()
            .duration(200)
            .attr('opacity', 1);
        hideTooltip();
    });
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('fill', '#9ca3af')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '12px')
        .text('CIDADE');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .style('fill', '#9ca3af')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '12px')
        .text(`${getPollutantLabel(currentPollutant).toUpperCase()} (µg/m³)`);
}

// ========================================
// CHART 2: TIME SERIES
// ========================================

function createTimeSeriesChart() {
    const container = d3.select('#time-chart');
    container.selectAll('*').remove();
    
    const filteredData = getFilteredData();
    
    // Get top cities
    const cityAverages = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d[currentPollutant]),
        d => d.city
    );
    
    const topCities = Array.from(cityAverages, ([city, value]) => ({ city, value }))
        .sort((a, b) => d3.descending(a.value, b.value))
        .slice(0, 10)  // Top 10 cidades
        .map(d => d.city);
    
    const dataForChart = filteredData.filter(d => topCities.includes(d.city));
    
    // Group by city
    const cityGroups = d3.group(dataForChart, d => d.city);
    
    // Dimensions
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const x = d3.scaleTime()
        .domain(d3.extent(dataForChart, d => d.date))
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(dataForChart, d => d[currentPollutant])])
        .nice()
        .range([height, 0]);
    
    // Axes
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10));
    
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));
    
    // Grid
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(''))
        .selectAll('line')
        .attr('class', 'grid-line');
    
    // Line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d[currentPollutant]))
        .curve(d3.curveMonotoneX);
    
    // Draw lines
    cityGroups.forEach((values, city) => {
        const cityIndex = topCities.indexOf(city);
        const color = cityColors[cityIndex % cityColors.length];
        
        const path = svg.append('path')
            .datum(values.sort((a, b) => a.date - b.date))
            .attr('class', 'line')
            .attr('d', line)
            .attr('stroke', color)
            .attr('stroke-width', 2.5)
            .attr('fill', 'none')
            .attr('opacity', 0.8);
        
        // Animate line
        const totalLength = path.node().getTotalLength();
        path
            .attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);
    });
    
    // Labels
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('fill', '#9ca3af')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '12px')
        .text('PERÍODO');
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .style('fill', '#9ca3af')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '12px')
        .text(`${getPollutantLabel(currentPollutant).toUpperCase()} (µg/m³)`);
    
    // Create legend
    createTimeLegend(topCities);
}

function createTimeLegend(cities) {
    const legendContainer = d3.select('#legend-container');
    legendContainer.selectAll('*').remove();
    
    cities.forEach((city, i) => {
        const item = legendContainer.append('div')
            .attr('class', 'legend-item');
        
        item.append('div')
            .attr('class', 'legend-color-box')
            .style('background-color', cityColors[i % cityColors.length]);
        
        item.append('span')
            .text(city);
    });
}

// ========================================
// CHART 3: INTERACTIVE MAP (SPECIAL)
// ========================================

async function createMap() {
    const mapData = await d3.json('data/map_data.json');
    
    // Remove existing map
    if (mapInstance) {
        mapInstance.remove();
    }
    
    // Initialize map
    mapInstance = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: true
    });
    
    // Dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapInstance);
    mapData.forEach(city => {
    // 1. Pega o valor bruto do poluente selecionado
    const rawValue = city[currentPollutant];

    // 2. Validação robusta: verifica se não é nulo/undefined, 
    // converte para número e checa se é um número válido e positivo
    const value = parseFloat(rawValue);

    if (isNaN(value) || value <= 0) {
        return; // Pula esta cidade sem quebrar o mapa
    }

    // 3. Define a cor com base na escala (garantindo que o valor existe)
    const color = colorScales[currentPollutant](value);

    // 4. Define o raio (evita que valores muito pequenos desapareçam)
    const radius = Math.max(5, Math.sqrt(value) * 2.5);

    const circle = L.circleMarker([city.latitude, city.longitude], {
        radius: radius,
        fillColor: color,
        color: '#ffffff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.7
    }).addTo(mapInstance);

    // Bind do Popup (usando o valor validado)
    circle.bindPopup(`
        <div style="font-family: sans-serif; padding: 5px;">
            <strong style="text-transform: uppercase;">${city.city}</strong><br/>
            <span>${getPollutantLabel(currentPollutant)}: <b>${value.toFixed(2)}</b> µg/m³</span>
        </div>
    `);

    // Efeitos de Hover
    circle.on('mouseover', function() {
        this.setStyle({ weight: 3, fillOpacity: 1 });
    });
    circle.on('mouseout', function() {
        this.setStyle({ weight: 1.5, fillOpacity: 0.7 });
    });
});
        
}

// ========================================
// CHART 4: CALENDAR HEATMAP (SPECIAL)
// ========================================

function createCalendarHeatmap() {
    // Populate city selector
    const citySelect = d3.select('#heatmap-city-select');
    const cities = [...new Set(dailyData.map(d => d.city))].sort();
    
    if (citySelect.selectAll('option').empty()) {
        cities.forEach(city => {
            citySelect.append('option')
                .attr('value', city)
                .text(city);
        });
        
        citySelect.on('change', function() {
            renderCalendarHeatmap(this.value);
        });
    }
    
    // Render with first city
    renderCalendarHeatmap(cities[0]);
}

function renderCalendarHeatmap(cityName) {
    const container = d3.select('#calendar-heatmap');
    container.selectAll('*').remove();
    
    // Filter data for selected city
    const cityData = dailyData
        .filter(d => d.city === cityName)
        .map(d => ({
            ...d,
            date: new Date(d.date)
        }));
    
    // Group by year
    const years = [...new Set(cityData.map(d => d.date.getFullYear()))].sort();
    
    // Dimensions
    const cellSize = 15;
    const yearHeight = cellSize * 8;
    const yearSpacing = 40;
    const margin = { top: 30, right: 30, bottom: 10, left: 60 };
    const width = 900;
    const height = years.length * (yearHeight + yearSpacing) + margin.top + margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Color scale
    const extent = d3.extent(cityData, d => d[currentPollutant]);
    const colorScale = d3.scaleSequential()
        .domain(extent)
        .interpolator(d3.interpolateRgb('#10b981', '#ef4444'));
    
    // Create heatmap for each year
    years.forEach((year, yearIndex) => {
        const yearData = cityData.filter(d => d.date.getFullYear() === year);
        const yearGroup = svg.append('g')
            .attr('transform', `translate(0,${yearIndex * (yearHeight + yearSpacing)})`);
        
        // Year label
        yearGroup.append('text')
            .attr('x', -10)
            .attr('y', yearHeight / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .style('fill', '#9ca3af')
            .style('font-family', 'Bebas Neue, sans-serif')
            .style('font-size', '18px')
            .text(year);
        
        // Create cells
        const firstDay = new Date(year, 0, 1);
        const lastDay = new Date(year, 11, 31);
        
        const daysInYear = d3.timeDays(firstDay, d3.timeDay.offset(lastDay, 1));
        
        yearGroup.selectAll('.day-cell')
            .data(daysInYear)
            .enter()
            .append('rect')
            .attr('class', 'day-cell')
            .attr('x', d => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
            .attr('y', d => d.getDay() * cellSize)
            .attr('width', cellSize - 2)
            .attr('height', cellSize - 2)
            .attr('rx', 2)
            .attr('fill', d => {
                const dataPoint = yearData.find(item => 
                    item.date.toDateString() === d.toDateString()
                );
                return dataPoint ? colorScale(dataPoint[currentPollutant]) : '#1a1f36';
            })
            .attr('stroke', '#0a0e1a')
            .attr('stroke-width', 1)
            .on('mouseover', function(event, d) {
                const dataPoint = yearData.find(item => 
                    item.date.toDateString() === d.toDateString()
                );
                
                if (dataPoint) {
                    d3.select(this)
                        .attr('stroke', '#00d9ff')
                        .attr('stroke-width', 2);
                    
                    showTooltip(event, `
                        <strong>${d.toLocaleDateString('pt-BR')}</strong><br/>
                        ${getPollutantLabel(currentPollutant)}: ${dataPoint[currentPollutant].toFixed(2)} µg/m³
                    `);
                }
            })
            .on('mouseout', function() {
                d3.select(this)
                    .attr('stroke', '#0a0e1a')
                    .attr('stroke-width', 1);
                hideTooltip();
            });
        
        // Month labels
        const months = d3.timeMonths(firstDay, lastDay);
        yearGroup.selectAll('.month-label')
            .data(months)
            .enter()
            .append('text')
            .attr('class', 'month-label')
            .attr('x', d => d3.timeWeek.count(d3.timeYear(d), d) * cellSize)
            .attr('y', -5)
            .style('fill', '#6b7280')
            .style('font-family', 'JetBrains Mono, monospace')
            .style('font-size', '10px')
            .text(d => d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase());
    });
}



function getPollutantLabel(pollutant) {
    const labels = {
        pm25: 'PM2.5',
        pm10: 'PM10',
        no2: 'NO₂',
        o3: 'O₃',
        so2: 'SO₂',
        aqi: 'AQI'
    };
    return labels[pollutant] || pollutant;
}

let tooltip;

function showTooltip(event, html) {
    if (!tooltip) {
        tooltip = d3.select('body')
            .append('div')
            .style('position', 'absolute')
            .style('background', 'rgba(10, 14, 26, 0.95)')
            .style('color', '#e5e7eb')
            .style('padding', '12px')
            .style('border-radius', '8px')
            .style('border', '1px solid #252d47')
            .style('font-family', 'Crimson Pro, serif')
            .style('font-size', '14px')
            .style('pointer-events', 'none')
            .style('z-index', '10000')
            .style('backdrop-filter', 'blur(10px)')
            .style('box-shadow', '0 4px 6px rgba(0, 0, 0, 0.4)');
    }
    
    tooltip
        .html(html)
        .style('opacity', 1)
        .style('left', (event.pageX + 15) + 'px')
        .style('top', (event.pageY - 28) + 'px');
}

function hideTooltip() {
    if (tooltip) {
        tooltip.style('opacity', 0);
    }
}



document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Smooth scroll for scroll indicator
    document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
        document.querySelector('.filters-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
});
