function init() {
    const value = document.querySelector("#value");
    const input = document.querySelector("#threshold");
    value.textContent = input.value;

    input.addEventListener("input", (event) => {
        value.textContent = event.target.value;
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newThreshold: event.target.value })
        };
        fetch('/updateAlarmThreshold', requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to update the threshold. Status: ' + response.status);
                }
                return response.text();
            })
            .then(data => {
                console.log('Threshold updated:', data);
            })
            .catch(error => console.error('Error:', error));
    });

    const width = 550, height = 310, padding = 60;

    // Initialize charts for light, humidity, temperature, and moisture
    const chartLight = createChartComponent('#chart-light', 'light_levels', width, height, padding);
    const chartHumidity = createChartComponent('#chart-humidity', 'humidity', width, height, padding);
    const chartTemperature = createChartComponent('#chart-temperature', 'temperature', width, height, padding);
    const chartMoisture = createChartComponent('#chart-moisture', 'moisture_levels', width, height, padding);  // New moisture chart

    // WebSocket setup
    const ws = new WebSocket('ws://20.42.87.166:3000');

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.message) {
            const messageData = JSON.parse(data.message);

            const newData = {
                date: new Date(messageData.time),
                light_levels: +parseFloat(messageData.light_levels),
                humidity: +parseFloat(messageData.humidity_levels),
                temperature: +parseFloat(messageData.temperature_levels),
                moisture_levels: +(parseFloat(messageData.moisture_levels) / 1023 * 100)
            };

            console.log('New data received:', newData);  // Debug statement

            chartLight.updateChart([newData]);
            chartHumidity.updateChart([newData]);
            chartTemperature.updateChart([newData]);
            chartMoisture.updateChart([newData]);  // Update moisture chart
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
    const svg = d3.select(svgSelector)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'card');

    const xScale = d3.scaleTime()
        .range([padding, width - padding]);
    const yScale = d3.scaleLinear()
        .range([height - padding, padding]);

    const timeFormat = d3.timeFormat("%H:%M:%S");

    const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(d[dataKey]));

    let dataset = [];

    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`);

    svg.append('g')
        .attr('class', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`);

    svg.append('path')
        .attr('class', 'line')
        .attr('d', line([]))
        .attr('fill', 'none')
        .attr('stroke', 'black')
        .attr('stroke-width', 1.5);

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', padding / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .text(formatAxisLabel(dataKey));

    function updateChart(newData) {
        dataset = dataset.concat(newData).slice(-50); // Keep only the last 50 data points

        xScale.domain(d3.extent(dataset, d => d.date));
        const maxY = d3.max(dataset, d => d[dataKey]);
        const minY = d3.min(dataset, d => d[dataKey]);
        yScale.domain([minY, maxY]);

        console.log(`Updating chart for ${dataKey}:`, dataset);  // Debug statement

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
