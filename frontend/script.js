// Initialize the data visualization on page load
function init() {
  const value = document.querySelector("#value");
  const input = document.querySelector("#threshold");
  value.textContent = input.value;

  input.addEventListener("input", (event) => {
    value.textContent = event.target.value;
    const requestOptions = {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

  const width = 550, height = 310, padding = 60;

  // Initialize charts for light, humidity, temperature, and moisture
  chartLight = createChartComponent('#chart-light', 'light_levels', width, height, padding);
  chartHumidity = createChartComponent('#chart-humidity', 'humidity', width, height, padding);
  chartTemperature = createChartComponent('#chart-temperature', 'temperature', width, height, padding);
  chartMoisture = createChartComponent('#chart-moisture', 'moisture_levels', width, height, padding);  // New moisture chart

  // Fetch data and update charts every second
  setInterval(fetchDataAndUpdateCharts, 1000);
}

// Update all charts with data from MQTT messages
function updateAllCharts(data) {
  const newData = [{
    date: new Date(),
    light_levels: data.light_levels,
    humidity: data.humidity,
    temperature: data.temperature,
    moisture_levels: data.moisture_levels / 1023 * 100
  }];

  chartLight.updateChart(newData.map(d => ({ date: d.date, light_levels: d.light_levels })));
  chartHumidity.updateChart(newData.map(d => ({ date: d.date, humidity: d.humidity })));
  chartTemperature.updateChart(newData.map(d => ({ date: d.date, temperature: d.temperature })));
  chartMoisture.updateChart(newData.map(d => ({ date: d.date, moisture_levels: d.moisture_levels })));
}

function createChartComponent(svgSelector, dataKey, width, height, padding) {
  const svg = d3.select(svgSelector)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'card');

  const xScale = d3.scaleTime().range([padding, width - padding]);
  const yScale = d3.scaleLinear().range([height - padding, padding]);
  const timeFormat = d3.timeFormat("%H:%M:%S");

  const line = d3.line().x(d => xScale(d.date)).y(d => yScale(d[dataKey]));

  const dataset = [];
  svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0, ${height - padding})`);
  svg.append('g').attr('class', 'y-axis').attr('transform', `translate(${padding}, 0)`);
  svg.append('path').attr('class', 'line').attr('d', line([]));

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
    const maxY = d3.max(dataset, d => d[dataKey]);
    const minY = d3.min(dataset, d => d[dataKey]);
    yScale.domain([minY, maxY]);

    svg.select('.line').datum(dataset).attr('d', line);

    svg.select('.x-axis')
      .call(d3.axisBottom(xScale).tickFormat(timeFormat))
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .style('font-size', '12px')
      .attr("transform", "rotate(-90)");

    svg.select('.y-axis').call(d3.axisLeft(yScale));
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
      case 'moisture_levels':
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
