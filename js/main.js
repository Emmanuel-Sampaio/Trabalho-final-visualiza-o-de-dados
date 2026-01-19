let ndx;
let allData = [];
let dailyData = [];
let mapInstance;
let currentPollutant = 'pm25';
let currentYear = 'all';
let currentContinent = 'all';
let currentCountry = 'all';
let selectedCities = []; // Array de cidades selecionadas

// Mapa de continentes para países
const continentCountries = {
    'all': [],
    'Asia': [],
    'Europe': [],
    'North America': [],
    'South America': [],
    'Africa': [],
    'Oceania': []
};

// Mapa de países para cidades
const countryCities = {};

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

const cityColors = [
    '#00d9ff', '#ff006e', '#10b981', '#fbbf24', '#f97316',
    '#ef4444', '#a855f7', '#06b6d4', '#84cc16', '#f43f5e',
    '#8b5cf6', '#14b8a6', '#fb923c', '#ec4899', '#6366f1',
    '#22d3ee', '#fb7185', '#34d399', '#fde047', '#fdba74',
    '#f87171', '#c084fc', '#38bdf8', '#a3e635', '#fb7da1',
    '#a78bfa', '#2dd4bf', '#fca5a5', '#e879f9', '#60a5fa'
];

async function loadData() {
    try {
        const monthlyData = await d3.csv('data/monthly_averages.csv');
        dailyData = await d3.json('data/daily_data.json');
        
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
        ndx = crossfilter(allData);
        
        // Construir mapa de continentes e países
        buildContinentCountryMap();
        
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

function buildContinentCountryMap() {
    // Limpar os mapas
    Object.keys(continentCountries).forEach(key => {
        continentCountries[key] = [];
    });
    Object.keys(countryCities).forEach(key => {
        delete countryCities[key];
    });
    
    // Construir mapa de continentes para países e país para cidades
    const uniqueData = new Map();
    allData.forEach(d => {
        const key = `${d.continent}-${d.country}`;
        if (!uniqueData.has(key)) {
            uniqueData.set(key, { continent: d.continent, country: d.country, city: d.city });
        }
        // Construir mapa de país para cidades
        if (!countryCities[d.country]) {
            countryCities[d.country] = [];
        }
        if (!countryCities[d.country].includes(d.city)) {
            countryCities[d.country].push(d.city);
        }
    });
    
    // Agrupar países por continente
    uniqueData.forEach(item => {
        if (continentCountries[item.continent]) {
            continentCountries[item.continent].push(item.country);
        }
        continentCountries['all'].push(item.country);
    });
    
    // Ordenar países alfabeticamente
    Object.keys(continentCountries).forEach(continent => {
        continentCountries[continent] = [...new Set(continentCountries[continent])].sort();
    });
    
    // Ordenar cidades alfabeticamente
    Object.keys(countryCities).forEach(country => {
        countryCities[country] = countryCities[country].sort();
    });
    
    console.log('Mapa de continentes e países:', continentCountries);
    console.log('Mapa de países e cidades:', countryCities);
}

function initializeFilters() {
    d3.select('#pollutant-select').on('change', function() {
        currentPollutant = this.value;
        updateAllCharts();
    });
    
    d3.select('#year-select').on('change', function() {
        currentYear = this.value;
        updateAllCharts();
    });
    
    d3.select('#continent-select').on('change', function() {
        currentContinent = this.value;
        currentCountry = 'all'; // Resetar país ao mudar continente
        selectedCities = []; // Limpar cidades selecionadas ao mudar continente
        updateCountrySelect();
        updateCitySelect();
        updateCityDisplay();
        updateFilterStates();
        updateAllCharts();
    });
    
    d3.select('#country-select').on('change', function() {
        currentCountry = this.value;
        updateCitySelect();
        updateFilterStates();
        updateAllCharts();
    });
    
    d3.select('#city-select').on('change', function() {
        const selectedCity = this.value;
        if (selectedCity && !selectedCities.includes(selectedCity)) {
            selectedCities.push(selectedCity);
            updateCityDisplay();
            updateFilterStates();
            updateAllCharts();
            this.value = ''; // Resetar o select para permitir nova seleção
        }
    });
    
    d3.select('#reset-btn').on('click', function() {
        currentPollutant = 'pm25';
        currentYear = 'all';
        currentContinent = 'all';
        currentCountry = 'all';
        selectedCities = [];
        
        d3.select('#pollutant-select').property('value', 'pm25');
        d3.select('#year-select').property('value', 'all');
        d3.select('#continent-select').property('value', 'all');
        d3.select('#city-select').property('value', '');
        
        updateCountrySelect();
        updateCitySelect();
        updateCityDisplay();
        updateFilterStates();
        updateAllCharts();
    });
    
    // Inicializar os selects de país e cidade
    updateCountrySelect();
    updateCitySelect();
    updateFilterStates();
}

function updateCountrySelect() {
    const countrySelect = d3.select('#country-select');
    
    // Se continente é 'all', desabilitar o select
    if (currentContinent === 'all') {
        countrySelect.property('disabled', true);
        countrySelect.html('<option value="all" selected>Selecione um continente</option>');
        return;
    }
    
    // Abilitar o select e preencher com países do continente selecionado
    countrySelect.property('disabled', false);
    
    const countries = continentCountries[currentContinent] || [];
    
    countrySelect.html('');
    countrySelect.append('option')
        .attr('value', 'all')
        .property('selected', currentCountry === 'all')
        .text('Todos os Países');
    
    countries.forEach(country => {
        countrySelect.append('option')
            .attr('value', country)
            .property('selected', currentCountry === country)
            .text(country);
    });
}

function updateCitySelect() {
    const citySelect = d3.select('#city-select');
    
    // Se não houver seleção de país ou continente, permitir adicionar cidades de qualquer país
    if (currentCountry === 'all' || !currentCountry) {
        citySelect.property('disabled', false);
        
        // Obter todas as cidades únicas dos dados
        const allCities = [...new Set(allData.map(d => d.city))].sort();
        
        citySelect.html('');
        citySelect.append('option')
            .attr('value', '')
            .text('Adicionar cidade');
        
        allCities.forEach(city => {
            if (!selectedCities.includes(city)) {
                citySelect.append('option')
                    .attr('value', city)
                    .text(city);
            }
        });
    } else {
        // Se houver seleção de país, mostrar cidades do país
        citySelect.property('disabled', false);
        
        const cities = countryCities[currentCountry] || [];
        
        citySelect.html('');
        citySelect.append('option')
            .attr('value', '')
            .text('Adicionar cidade');
        
        cities.forEach(city => {
            if (!selectedCities.includes(city)) {
                citySelect.append('option')
                    .attr('value', city)
                    .text(city);
            }
        });
    }
}

function updateCityDisplay() {
    const filterCard = document.querySelector('.filter-card:has(#city-select)');
    if (!filterCard) return;
    
    // Remover display antigo se existir
    const oldDisplay = filterCard.querySelector('.selected-cities');
    if (oldDisplay) oldDisplay.remove();
    
    if (selectedCities.length > 0) {
        const citiesDiv = document.createElement('div');
        citiesDiv.className = 'selected-cities';
        
        selectedCities.forEach(city => {
            const tag = document.createElement('div');
            tag.className = 'city-tag';
            
            const span = document.createElement('span');
            span.textContent = city;
            tag.appendChild(span);
            
            const btn = document.createElement('button');
            btn.className = 'remove-city-btn';
            btn.textContent = '✕';
            btn.addEventListener('click', () => {
                selectedCities = selectedCities.filter(c => c !== city);
                updateCityDisplay();
                updateCitySelect();
                updateFilterStates();
                updateAllCharts();
            });
            tag.appendChild(btn);
            
            citiesDiv.appendChild(tag);
        });
        
        filterCard.appendChild(citiesDiv);
    }
}

function updateFilterStates() {
    // Continente sempre habilitado
    d3.select('#continent-select').property('disabled', false);
    
    // País desabilitado se continente é 'all'
    if (currentContinent === 'all') {
        d3.select('#country-select').property('disabled', true);
    } else {
        d3.select('#country-select').property('disabled', false);
    }
    
    // Cidade sempre habilitada
    d3.select('#city-select').property('disabled', false);
}

function getFilteredData() {
    return allData.filter(d => {
        const yearMatch = currentYear === 'all' || d.date.getFullYear() === +currentYear;
        
        // Se houver cidades selecionadas, usar apenas essas cidades (ignorar continente/país)
        if (selectedCities.length > 0) {
            return yearMatch && selectedCities.includes(d.city);
        }
        
        // Caso contrário, usar filtros de continente e país
        const continentMatch = currentContinent === 'all' || d.continent === currentContinent;
        const countryMatch = currentCountry === 'all' || d.country === currentCountry;
        return yearMatch && continentMatch && countryMatch;
    });
}

function updateAllCharts() {
    updateStatisticsSection();
    createBarChart();
    createTimeSeriesChart();
    createMap();
    createCalendarHeatmap();
    createViolinChart();
    createRidgelineChart();
    updateCityClassification();
    updateOMSExceedance();
}

function updateStatisticsSection() {
    const filteredData = getFilteredData();
    
    // Calcular poluição média
    const avgPollution = d3.mean(filteredData, d => d[currentPollutant]);
    
    // Encontrar cidade mais poluída e mais limpa
    const cityData = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d[currentPollutant]),
        d => d.city
    );
    
    const citiesArray = Array.from(cityData, ([city, value]) => ({ city, value }))
        .sort((a, b) => d3.descending(a.value, b.value));
    
    const mostPolluted = citiesArray[0];
    const mostClean = citiesArray[citiesArray.length - 1];
    
    // Calcular tendência (comparar com período anterior)
    let trendDirection = '↔';
    let trendPercent = '0%';
    let trendColor = '#9ca3af';
    
    if (currentYear !== 'all') {
        const year = parseInt(currentYear);
        const previousYear = year - 1;
        
        const currentYearData = allData.filter(d => 
            d.date.getFullYear() === year &&
            (currentContinent === 'all' || d.continent === currentContinent) &&
            (currentCountry === 'all' || d.country === currentCountry) &&
            (selectedCities.length === 0 || selectedCities.includes(d.city))
        );
        
        const previousYearData = allData.filter(d => 
            d.date.getFullYear() === previousYear &&
            (currentContinent === 'all' || d.continent === currentContinent) &&
            (currentCountry === 'all' || d.country === currentCountry) &&
            (selectedCities.length === 0 || selectedCities.includes(d.city))
        );
        
        if (currentYearData.length > 0 && previousYearData.length > 0) {
            const currentAvg = d3.mean(currentYearData, d => d[currentPollutant]);
            const previousAvg = d3.mean(previousYearData, d => d[currentPollutant]);
            const percentChange = ((currentAvg - previousAvg) / previousAvg) * 100;
            
            if (Math.abs(percentChange) > 0.5) {
                trendDirection = percentChange > 0 ? '↑' : '↓';
                trendPercent = Math.abs(percentChange).toFixed(1) + '%';
                trendColor = percentChange > 0 ? '#ef4444' : '#10b981';
            }
        }
    }
    
    // Atualizar DOM
    d3.select('#avg-pollution').text(avgPollution.toFixed(1));
    d3.select('#most-polluted').text(mostPolluted ? mostPolluted.city : '--');
    d3.select('#most-polluted-value').text(mostPolluted ? `${mostPolluted.value.toFixed(1)} µg/m³` : '--');
    d3.select('#most-clean').text(mostClean ? mostClean.city : '--');
    d3.select('#most-clean-value').text(mostClean ? `${mostClean.value.toFixed(1)} µg/m³` : '--');
    d3.select('#trend-direction')
        .text(trendDirection)
        .style('color', trendColor);
    d3.select('#trend-percent')
        .text(trendPercent)
        .style('color', trendColor);
}

function createBarChart() {
    const container = d3.select('#bar-chart');
    container.selectAll('*').remove();
    
    const filteredData = getFilteredData();
    
    const cityData = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d[currentPollutant]),
        d => d.city
    );
    
    const data = Array.from(cityData, ([city, value]) => ({ city, value }))
        .sort((a, b) => d3.descending(a.value, b.value))
        .slice(0, 20);
    
    const margin = { top: 20, right: 30, bottom: 120, left: 80 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleBand()
        .domain(data.map(d => d.city))
        .range([0, width])
        .padding(0.2);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .nice()
        .range([height, 0]);
    
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
    
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(''))
        .selectAll('line')
        .attr('class', 'grid-line');
    
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
    
    bars.transition()
        .duration(800)
        .delay((d, i) => i * 50)
        .attr('y', d => y(d.value))
        .attr('height', d => height - y(d.value));
    
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

function createTimeSeriesChart() {
    const container = d3.select('#time-chart');
    container.selectAll('*').remove();
    
    const filteredData = getFilteredData();
    
    const cityAverages = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d[currentPollutant]),
        d => d.city
    );
    
    const topCities = Array.from(cityAverages, ([city, value]) => ({ city, value }))
        .sort((a, b) => d3.descending(a.value, b.value))
        .slice(0, 10)
        .map(d => d.city);
    
    const dataForChart = filteredData.filter(d => topCities.includes(d.city));
    
    const cityGroups = d3.group(dataForChart, d => d.city);
    
    const margin = { top: 20, right: 30, bottom: 60, left: 80 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const x = d3.scaleTime()
        .domain(d3.extent(dataForChart, d => d.date))
        .range([0, width]);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(dataForChart, d => d[currentPollutant])])
        .nice()
        .range([height, 0]);
    
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10));
    
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));
    
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(''))
        .selectAll('line')
        .attr('class', 'grid-line');
    
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d[currentPollutant]))
        .curve(d3.curveMonotoneX);
    
    let hoveredCity = null;
    
    // Função para interpolar valores entre dois pontos
    function interpolateValue(point1, point2, targetDate, pollutant) {
        const t = (targetDate - point1.date) / (point2.date - point1.date);
        const value1 = point1[pollutant];
        const value2 = point2[pollutant];
        return value1 + (value2 - value1) * t;
    }
    
    cityGroups.forEach((values, city) => {
        const cityIndex = topCities.indexOf(city);
        const color = cityColors[cityIndex % cityColors.length];
        
        const sortedValues = values.sort((a, b) => a.date - b.date);
        
        const path = svg.append('path')
            .datum(sortedValues)
            .attr('class', 'line')
            .attr('d', line)
            .attr('stroke', color)
            .attr('stroke-width', 2.5)
            .attr('fill', 'none')
            .attr('opacity', 0.8);
        
        path.on('mouseover', function(event) {
            hoveredCity = city;
            d3.select(this)
                .attr('stroke-width', 4)
                .attr('opacity', 1);
        })
        .on('mousemove', function(event) {
            if (hoveredCity !== city) return;
            
            const xPos = d3.pointer(event, svg.node())[0];
            const date = x.invert(xPos);
            
            // Encontrar os dois pontos mais próximos
            const bisect = d3.bisector(d => d.date).left;
            const idx = bisect(sortedValues, date);
            
            let value, displayDate;
            
            if (idx === 0) {
                value = sortedValues[0][currentPollutant];
                displayDate = sortedValues[0].date;
            } else if (idx === sortedValues.length) {
                value = sortedValues[sortedValues.length - 1][currentPollutant];
                displayDate = sortedValues[sortedValues.length - 1].date;
            } else {
                // Interpolar entre os dois pontos
                const point1 = sortedValues[idx - 1];
                const point2 = sortedValues[idx];
                value = interpolateValue(point1, point2, date, currentPollutant);
                displayDate = date;
            }
            
            const dateStr = new Date(displayDate).toLocaleDateString('pt-BR');
            
            showTooltip(event, `
                <strong>${city}</strong><br/>
                ${getPollutantLabel(currentPollutant)}: ${value.toFixed(2)} µg/m³<br/>
                <span style="font-size: 12px; color: #9ca3af;">${dateStr}</span>
            `);
        })
        .on('mouseout', function(event) {
            d3.select(this)
                .attr('stroke-width', 2.5)
                .attr('opacity', 0.8);
            hideTooltip();
            hoveredCity = null;
        });
        
        const totalLength = path.node().getTotalLength();
        path
            .attr('stroke-dasharray', totalLength + ' ' + totalLength)
            .attr('stroke-dashoffset', totalLength)
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0);
    });
    
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

async function createMap() {
    const mapData = await d3.json('data/map_data.json');
    
    if (mapInstance) {
        mapInstance.remove();
    }
    
    mapInstance = L.map('map', {
        center: [20, 0],
        zoom: 2,
        minZoom: 2,
        maxZoom: 10,
        zoomControl: true
    });
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '©OpenStreetMap, ©CartoDB',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(mapInstance);
    
    mapData.forEach(city => {
        const rawValue = city[currentPollutant];
        const value = parseFloat(rawValue);

        if (isNaN(value) || value <= 0) {
            return;
        }

        const color = colorScales[currentPollutant](value);
        const radius = Math.max(5, Math.sqrt(value) * 2.5);

        const circle = L.circleMarker([city.latitude, city.longitude], {
            radius: radius,
            fillColor: color,
            color: '#ffffff',
            weight: 1.5,
            opacity: 0.9,
            fillOpacity: 0.7
        }).addTo(mapInstance);

        circle.bindPopup(`
            <div style="font-family: sans-serif; padding: 5px;">
                <strong style="text-transform: uppercase;">${city.city}</strong><br/>
                <span>${getPollutantLabel(currentPollutant)}: <b>${value.toFixed(2)}</b> µg/m³</span>
            </div>
        `);

        circle.on('mouseover', function() {
            this.setStyle({ weight: 3, fillOpacity: 1 });
        });
        circle.on('mouseout', function() {
            this.setStyle({ weight: 1.5, fillOpacity: 0.7 });
        });
    });
}

function createCalendarHeatmap() {
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
    
    renderCalendarHeatmap(cities[0]);
}

function renderCalendarHeatmap(cityName) {
    const container = d3.select('#calendar-heatmap');
    container.selectAll('*').remove();
    
    const cityData = dailyData
        .filter(d => d.city === cityName)
        .map(d => ({
            ...d,
            date: new Date(d.date)
        }));
    
    const years = [...new Set(cityData.map(d => d.date.getFullYear()))].sort();
    
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
    
    const extent = d3.extent(cityData, d => d[currentPollutant]);
    const colorScale = d3.scaleSequential()
        .domain(extent)
        .interpolator(d3.interpolateRgb('#10b981', '#ef4444'));
    
    years.forEach((year, yearIndex) => {
        const yearData = cityData.filter(d => d.date.getFullYear() === year);
        const yearGroup = svg.append('g')
            .attr('transform', `translate(0,${yearIndex * (yearHeight + yearSpacing)})`);
        
        yearGroup.append('text')
            .attr('x', -10)
            .attr('y', yearHeight / 2)
            .attr('text-anchor', 'end')
            .attr('dominant-baseline', 'middle')
            .style('fill', '#9ca3af')
            .style('font-family', 'Bebas Neue, sans-serif')
            .style('font-size', '18px')
            .text(year);
        
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

function updateCityClassification() {
    const filteredData = getFilteredData();
    
    // Agregar por cidade
    const cityAverages = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d[currentPollutant]),
        d => d.city
    );
    
    // Converter para array e ordenar
    const cities = Array.from(cityAverages).map(([city, value]) => ({ city, value }));
    
    // Definir thresholds baseado no poluente
    const thresholds = {
        pm25: { veryHigh: 80, high: 50, moderate: 30 },
        pm10: { veryHigh: 150, high: 100, moderate: 50 },
        no2: { veryHigh: 100, high: 60, moderate: 40 },
        o3: { veryHigh: 120, high: 80, moderate: 50 },
        so2: { veryHigh: 80, high: 50, moderate: 30 },
        aqi: { veryHigh: 200, high: 100, moderate: 50 }
    };
    
    const limits = thresholds[currentPollutant] || thresholds.pm25;
    
    // Classificar cidades
    const classification = {
        veryHigh: cities.filter(d => d.value > limits.veryHigh),
        high: cities.filter(d => d.value > limits.high && d.value <= limits.veryHigh),
        moderate: cities.filter(d => d.value > limits.moderate && d.value <= limits.high),
        good: cities.filter(d => d.value <= limits.moderate)
    };
    
    // Gerar HTML
    const grid = d3.select('#classification-grid');
    grid.selectAll('*').remove();
    
    const categories = [
        { key: 'veryHigh', label: 'Muito Alto', class: 'danger' },
        { key: 'high', label: 'Alto', class: 'warning' },
        { key: 'moderate', label: 'Moderado', class: 'moderate' },
        { key: 'good', label: 'Bom', class: 'good' }
    ];
    
    categories.forEach(cat => {
        const data = classification[cat.key];
        const cityNames = data.map(d => d.city).join(', ');
        const displayNames = cityNames.length > 50 ? cityNames.substring(0, 50) + '...' : cityNames;
        
        grid.append('div')
            .attr('class', `classification-item ${cat.class}`)
            .html(`
                <span class="classification-label">${cat.label}</span>
                <span class="classification-value">${data.length} ${data.length === 1 ? 'cidade' : 'cidades'}</span>
                <span class="classification-detail">${getPollutantLabel(currentPollutant)}: ${limits[cat.key === 'veryHigh' ? 'veryHigh' : cat.key === 'high' ? 'high' : cat.key === 'moderate' ? 'moderate' : 0]} µg/m³</span>
                <p class="classification-cities">${displayNames || '—'}</p>
            `);
    });
}

function updateOMSExceedance() {
    // Usar todos os dados, não apenas os filtrados
    // para contar cidades acima do limite OMS globalmente
    if (allData.length === 0) {
        d3.select('#cities-exceeding-oms').text('0');
        return;
    }
    
    // Agregar PM2.5 por cidade usando TODOS os dados
    const cityAverages = d3.rollup(
        allData,
        v => d3.mean(v, d => d.pm25), // Sempre PM2.5 para OMS
        d => d.city
    );
    
    // Limite da OMS para PM2.5: 15 µg/m³ (média anual)
    const omsLimit = 15;
    let citiesExceeding = 0;
    
    cityAverages.forEach(value => {
        if (value > omsLimit) {
            citiesExceeding++;
        }
    });
    
    d3.select('#cities-exceeding-oms').text(citiesExceeding);
}

function createViolinChart() {
    const container = d3.select('#donut-chart');
    container.selectAll('*').remove();
    
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
        container.append('div')
            .attr('class', 'loading')
            .text('Nenhum dado disponível');
        return;
    }
    
    // Obter top 8 cidades por poluição média
    const cityAverages = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d[currentPollutant]),
        d => d.city
    );
    
    const topCities = Array.from(cityAverages, ([city, value]) => ({ city, value }))
        .sort((a, b) => d3.descending(a.value, b.value))
        .slice(0, 8)
        .map(d => d.city);
    
    // Cores para as cidades
    const cityColors = [
        '#00d9ff', '#ff006e', '#10b981', '#fbbf24', '#f97316',
        '#ef4444', '#a855f7', '#06b6d4'
    ];
    
    const margin = { top: 30, right: 30, bottom: 80, left: 80 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 450 - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Escalas
    const x = d3.scaleBand()
        .domain(topCities)
        .range([0, width])
        .padding(0.4);
    
    const y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d[currentPollutant]) * 1.1])
        .range([height, 0]);
    
    // Função para calcular densidade (kernel density estimation)
    function getDensity(city, bandwidthValue = 3) {
        const cityData = filteredData.filter(d => d.city === city).map(d => d[currentPollutant]);
        
        if (cityData.length === 0) return [];
        
        const density = [];
        const min = 0;
        const max = d3.max(filteredData, d => d[currentPollutant]) * 1.1;
        const step = (max - min) / 30;
        
        for (let i = min; i <= max; i += step) {
            let sum = 0;
            cityData.forEach(value => {
                const distance = Math.abs(value - i);
                sum += Math.exp(-(distance * distance) / (2 * bandwidthValue * bandwidthValue));
            });
            density.push({ x: i, y: sum / cityData.length });
        }
        
        return density;
    }
    
    // Encontrar o máximo de densidade para normalizar
    const maxDensity = d3.max(topCities, city => {
        const density = getDensity(city);
        return d3.max(density, d => d.y) || 0;
    });
    
    // Desenhar grid horizontal
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(''))
        .selectAll('line')
        .attr('class', 'grid-line');
    
    // Desenhar eixos
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
    
    // Tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'violin-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(10, 14, 26, 0.95)')
        .style('color', '#e5e7eb')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('border', '1px solid #252d47')
        .style('font-family', 'Crimson Pro, serif')
        .style('font-size', '13px')
        .style('pointer-events', 'none')
        .style('z-index', '10000')
        .style('opacity', 0);
    
    // Desenhar os violins
    topCities.forEach((city, idx) => {
        const density = getDensity(city);
        const color = cityColors[idx % cityColors.length];
        const xPos = x(city) + x.bandwidth() / 2;
        
        // Escala para a largura do violin (densidade normalizada)
        const violinScale = d3.scaleLinear()
            .domain([0, maxDensity])
            .range([0, x.bandwidth() / 2.5]);
        
        // Desenhar as duas metades do violin (esquerda e direita)
        const line = d3.line()
            .x(d => violinScale(d.y))
            .y(d => y(d.x));
        
        const lineLeft = d3.line()
            .x(d => -violinScale(d.y))
            .y(d => y(d.x));
        
        // Lado direito
        svg.append('path')
            .datum(density)
            .attr('class', 'violin-path')
            .attr('d', line)
            .attr('transform', `translate(${xPos},0)`)
            .attr('fill', color)
            .attr('opacity', 0.6)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);
        
        // Lado esquerdo (espelho)
        svg.append('path')
            .datum(density)
            .attr('class', 'violin-path')
            .attr('d', lineLeft)
            .attr('transform', `translate(${xPos},0)`)
            .attr('fill', color)
            .attr('opacity', 0.6)
            .attr('stroke', color)
            .attr('stroke-width', 1.5);
        
        // Adicionar linha central (median/quartiles)
        const quartiles = [0.25, 0.5, 0.75].map(p => {
            const sorted = filteredData.filter(d => d.city === city)
                .map(d => d[currentPollutant])
                .sort((a, b) => a - b);
            const idx = Math.floor(sorted.length * p);
            return sorted[idx];
        });
        
        svg.append('line')
            .attr('class', 'violin-median')
            .attr('x1', xPos - x.bandwidth() / 2.5)
            .attr('x2', xPos + x.bandwidth() / 2.5)
            .attr('y1', y(quartiles[1]))
            .attr('y2', y(quartiles[1]))
            .attr('stroke', color)
            .attr('stroke-width', 2);
        
        // Adicionar pontos quartis
        [quartiles[0], quartiles[2]].forEach(q => {
            svg.append('circle')
                .attr('cx', xPos)
                .attr('cy', y(q))
                .attr('r', 3)
                .attr('fill', color)
                .attr('stroke', '#fff')
                .attr('stroke-width', 1);
        });
        
        // Interatividade
        svg.append('rect')
            .attr('class', `violin-hover-${idx}`)
            .attr('x', xPos - x.bandwidth() / 2)
            .attr('y', 0)
            .attr('width', x.bandwidth())
            .attr('height', height)
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', function() {
                svg.selectAll('.violin-path')
                    .style('opacity', 0.2);
                svg.selectAll('.violin-median')
                    .style('opacity', 0.2);
                
                svg.selectAll(`.violin-hover-${idx}`)
                    .style('opacity', 0);
                
                // Destacar este violin
                const parentGroup = d3.select(this.parentNode);
                parentGroup.selectAll('.violin-path')
                    .filter(() => {
                        const transform = d3.select(this).attr('transform');
                        return transform && transform.includes(xPos);
                    })
                    .style('opacity', 0.8);
                
                parentGroup.selectAll('.violin-median')
                    .filter(() => {
                        const x1 = d3.select(this).attr('x1');
                        return x1 && parseFloat(x1) === xPos - x.bandwidth() / 2.5;
                    })
                    .style('opacity', 1);
                
                const stats = filteredData.filter(d => d.city === city)
                    .map(d => d[currentPollutant]);
                const mean = d3.mean(stats);
                const median = quartiles[1];
                const min = d3.min(stats);
                const max = d3.max(stats);
                
                tooltip.html(`
                    <strong>${city}</strong><br/>
                    Média: ${mean.toFixed(2)}<br/>
                    Mediana: ${median.toFixed(2)}<br/>
                    Mín: ${min.toFixed(2)} | Máx: ${max.toFixed(2)}
                `)
                    .style('opacity', 1);
            })
            .on('mousemove', function(event) {
                tooltip
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseout', function() {
                svg.selectAll('.violin-path')
                    .style('opacity', 0.6);
                svg.selectAll('.violin-median')
                    .style('opacity', 1);
                tooltip.style('opacity', 0);
            });
    });
    
    // Legenda
    const legend = d3.select('#donut-legend');
    legend.selectAll('*').remove();
    
    topCities.forEach((city, idx) => {
        const item = legend.append('div')
            .attr('class', 'donut-legend-item');
        
        item.append('div')
            .attr('class', 'donut-legend-color')
            .style('background-color', cityColors[idx % cityColors.length]);
        
        item.append('span')
            .text(city);
    });
    
    // Rótulos dos eixos
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

function createRidgelineChart() {
    const container = d3.select('#radar-chart');
    container.selectAll('*').remove();
    
    const filteredData = getFilteredData();
    
    if (filteredData.length === 0) {
        container.append('div')
            .attr('class', 'loading')
            .text('Nenhum dado disponível');
        return;
    }
    
    // Obter top 10 cidades por poluição média
    const cityAverages = d3.rollup(
        filteredData,
        v => d3.mean(v, d => d[currentPollutant]),
        d => d.city
    );
    
    const topCities = Array.from(cityAverages, ([city, value]) => ({ city, value }))
        .sort((a, b) => d3.descending(a.value, b.value))
        .slice(0, 10)
        .map(d => d.city);
    
    // Cores para as cidades
    const cityColors = [
        '#00d9ff', '#ff006e', '#10b981', '#fbbf24', '#f97316',
        '#ef4444', '#a855f7', '#06b6d4', '#84cc16', '#f43f5e'
    ];
    
    const margin = { top: 30, right: 30, bottom: 60, left: 80 };
    const width = container.node().getBoundingClientRect().width - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    const svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Escalas
    const x = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => d[currentPollutant]) * 1.1])
        .range([0, width]);
    
    const y = d3.scaleBand()
        .domain(topCities)
        .range([height, 0])
        .padding(0.5);
    
    // Função para calcular densidade (histograma suavizado)
    function getDensity(city, bandwidthValue = 5) {
        const cityData = filteredData.filter(d => d.city === city).map(d => d[currentPollutant]);
        
        if (cityData.length === 0) return [];
        
        const density = [];
        const min = 0;
        const max = d3.max(filteredData, d => d[currentPollutant]) * 1.1;
        const step = (max - min) / 30;
        
        for (let i = min; i <= max; i += step) {
            let sum = 0;
            cityData.forEach(value => {
                const distance = Math.abs(value - i);
                sum += Math.exp(-(distance * distance) / (2 * bandwidthValue * bandwidthValue));
            });
            density.push({ x: i, y: sum / cityData.length });
        }
        
        return density;
    }
    
    // Escala para a altura das ridges (densidade)
    const yMax = d3.max(topCities, city => {
        const density = getDensity(city);
        return d3.max(density, d => d.y) || 0;
    });
    
    // Desenhar grid horizontal
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat(''))
        .selectAll('line')
        .attr('class', 'grid-line');
    
    // Desenhar eixos
    svg.append('g')
        .attr('class', 'axis')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(6));
    
    svg.append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(y));
    
    // Tooltip
    const tooltip = d3.select('body')
        .append('div')
        .attr('class', 'ridgeline-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(10, 14, 26, 0.95)')
        .style('color', '#e5e7eb')
        .style('padding', '8px 12px')
        .style('border-radius', '6px')
        .style('border', '1px solid #252d47')
        .style('font-family', 'Crimson Pro, serif')
        .style('font-size', '13px')
        .style('pointer-events', 'none')
        .style('z-index', '10000')
        .style('opacity', 0);
    
    // Linha para desenhar a densidade
    const line = d3.line()
        .x(d => x(d.x))
        .y(d => y.bandwidth() / 2 - (d.y / yMax) * (y.bandwidth() / 2.5));
    
    // Desenhar as ridges para cada cidade
    topCities.forEach((city, idx) => {
        const density = getDensity(city);
        const color = cityColors[idx % cityColors.length];
        
        // Desenhar a área preenchida
        const area = d3.area()
            .x(d => x(d.x))
            .y0(y.bandwidth() / 2)
            .y1(d => y.bandwidth() / 2 - (d.y / yMax) * (y.bandwidth() / 2.5));
        
        svg.append('path')
            .datum(density)
            .attr('class', 'ridgeline-area')
            .attr('d', area)
            .attr('transform', `translate(0,${y(city)})`)
            .attr('fill', color)
            .attr('opacity', 0.6);
        
        // Desenhar a linha do contorno
        svg.append('path')
            .datum(density)
            .attr('class', 'ridgeline-path')
            .attr('d', line)
            .attr('transform', `translate(0,${y(city)})`)
            .attr('stroke', color)
            .attr('stroke-width', 2)
            .attr('fill', 'none');
        
        // Adicionar interatividade
        svg.selectAll(`.ridgeline-area-${idx}`)
            .data([null])
            .enter()
            .append('rect')
            .attr('class', `ridgeline-area-${idx}`)
            .attr('x', 0)
            .attr('y', y(city) - y.bandwidth() / 2)
            .attr('width', width)
            .attr('height', y.bandwidth())
            .attr('fill', 'transparent')
            .attr('cursor', 'pointer')
            .on('mouseover', function() {
                // Destacar esta ridge
                svg.selectAll('.ridgeline-path')
                    .style('opacity', 0.2);
                svg.selectAll('.ridgeline-area')
                    .style('opacity', 0.15);
                
                svg.selectAll('.ridgeline-path:nth-child(n)')
                    .filter(() => {
                        const currentCity = this.__data__ ? this.__data__.city : null;
                        return currentCity === city;
                    });
            })
            .on('mouseout', function() {
                svg.selectAll('.ridgeline-path')
                    .style('opacity', 1);
                svg.selectAll('.ridgeline-area')
                    .style('opacity', 0.6);
            });
    });
    
    // Legenda
    const legend = d3.select('#radar-legend');
    legend.selectAll('*').remove();
    
    topCities.forEach((city, idx) => {
        const item = legend.append('div')
            .attr('class', 'radar-legend-item');
        
        item.append('div')
            .attr('class', 'radar-legend-color')
            .style('background-color', cityColors[idx % cityColors.length]);
        
        item.append('span')
            .text(city);
    });
    
    // Rótulos dos eixos
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .style('fill', '#9ca3af')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '12px')
        .text(`${getPollutantLabel(currentPollutant).toUpperCase()} (µg/m³)`);
    
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 20)
        .attr('text-anchor', 'middle')
        .style('fill', '#9ca3af')
        .style('font-family', 'JetBrains Mono, monospace')
        .style('font-size', '12px')
        .text('CIDADES');
}

function calculatePearsonCorrelation(arr1, arr2) {
    if (arr1.length !== arr2.length || arr1.length === 0) return 0;
    
    const n = arr1.length;
    const mean1 = d3.mean(arr1);
    const mean2 = d3.mean(arr2);
    
    let numerator = 0;
    let denominator1 = 0;
    let denominator2 = 0;
    
    for (let i = 0; i < n; i++) {
        const diff1 = arr1[i] - mean1;
        const diff2 = arr2[i] - mean2;
        
        numerator += diff1 * diff2;
        denominator1 += diff1 * diff1;
        denominator2 += diff2 * diff2;
    }
    
    const denominator = Math.sqrt(denominator1 * denominator2);
    
    return denominator === 0 ? 0 : numerator / denominator;
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    document.querySelector('.scroll-indicator')?.addEventListener('click', () => {
        document.querySelector('.filters-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });
});