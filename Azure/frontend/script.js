function init() {
    const value = document.querySelector("#value");
    const input = document.querySelector("#threshold");
    value.textContent = input.value;
    
    input.addEventListener("input", (event) => {
        value.textContent = event.target.value;
        const requestOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newThreshold: event.target.value })
        };
        fetch('http://raspberrypi:3000/updateAlarmThreshold', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update the threshold. Status: ' + response.status);
                }
                return response.text();
            })
            .catch(error => console.error('Error:', error));
    });

    var width = 550, height = 310, padding = 60;

    // Initialize charts for light, humidity, temperature, and moisture
    var chartLight = createChartComponent('#chart-light', 'light_levels', width, height, padding);
    var chartHumidity = createChartComponent('#chart-humidity', 'humidity', width, height, padding);
    var chartTemperature = createChartComponent('#chart-temperature', 'temperature', width, height, padding);
    var chartMoisture = createChartComponent('#chart-moisture', 'moisture_levels', width, height, padding);  // New moisture chart

    // WebSocket setup
    const ws = new WebSocket('ws://20.42.87.166:3000');

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.message) {
            const messageData = JSON.parse(data.message);

            const newData = [{
                date: new Date(messageData.time),
                light_levels: +parseFloat(messageData.light_levels),
                humidity: +parseFloat(messageData.humidity_levels),
                temperature: +parseFloat(messageData.temperature_levels),
                moisture_levels: +(parseFloat(messageData.moisture_levels) / 1023 * 100)
            }];

            chartLight.updateChart(newData.map(d => ({date: d.date, light_levels: d.light_levels})));
            chartHumidity.updateChart(newData.map(d => ({date: d.date, humidity: d.humidity})));
            chartTemperature.updateChart(newData.map(d => ({date: d.date, temperature: d.temperature})));
            chartMoisture.updateChart(newData.map(d => ({date: d.date, moisture_levels: d.moisture_levels})));  // Update moisture chart
        } else {
            console.error('Received data is not in expected format:', data);
        }
    };

    ws.onerror = (error) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };
}

function createChartComponent(svgSelector, dataKey, width, height, padding) {

    var svg = d3.select(svgSelector)
                .append('svg')
                .attr('width', width)
                .attr('height', height)
                .attr('class', 'card');

    var xScale = d3.scaleTime()
                    .range([padding, width - padding]);
    var yScale = d3.scaleLinear()
                    .range([height - padding, padding]);

    var timeFormat = d3.timeFormat("%H:%M:%S");

    var line = d3.line()
                .x(d => xScale(d.date))
                .y(d => yScale(d[dataKey]));

    var dataset = [];

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`);

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`);

    svg.append('path')
        .attr('class', 'line')
        .attr('d', line([]));

    var yAxis = svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`);

    svg.append('text')
        .attr('x', width / 2) 
        .attr('y', padding / 2) 
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text(formatAxisLabel(dataKey));

    function updateChart(newData) {
        dataset.push(...newData);

        while (dataset.length > 50) dataset.shift();

        xScale.domain(d3.extent(dataset, d => d.date));
        var maxY = d3.max(dataset, d => d[dataKey]);
        var minY = d3.min(dataset, d => d[dataKey]);
        yScale.domain([minY, maxY]);

        svg.select('.line')
            .datum(dataset)
            .attr('d', line);

        svg.select('.x-axis')
            .call(d3.axisBottom(xScale)
                .tickFormat(timeFormat))
            .selectAll("text")  // Select all text elements for the x-axis
            .style("text-anchor", "end")  // Change the anchor to the end
            .attr("dx", "-.8em")  // Adjust the x position of the text
            .attr("dy", ".15em")
            .style('font-size', '12px')  // Adjust the y position of the text
            .attr("transform", "rotate(-90)");  // Rotate text by -90 degrees

        svg.select('.y-axis')
            .call(d3.axisLeft(yScale));
    }

    function formatAxisLabel(key) {
        let label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        switch (key) {
            case 'temperature':
                label += ' (°C)';
                break;
            case 'humidity':
                label += ' (%)';
                break;
            case 'light_levels':
                label += ' (Lux)';
                break;
            case 'moisture_levels':  // Add label formatting for moisture
                label += ' (%)';  // Assuming moisture is measured in percentage
                break;
            default:
                break;
        }
        return label;
    }

    return { updateChart };
}

window.onload = init;
