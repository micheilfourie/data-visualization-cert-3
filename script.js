document.addEventListener('DOMContentLoaded', () => {
    fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json")
        .then(response => response.json())
        .then(data => {

            d3.select("body").append("h1").text("Monthly Global Land-Surface Temperature").attr("id", "title")
            d3.select("body").append("h3").text("1753 - 2015: base temperature 8.66℃").attr("id", "description")

            const width = 1200;
            const height = 700;
            const padding = 100;
            const monthArr = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            const dataset = data.monthlyVariance;
            const baseTemp = data.baseTemperature;

            console.log(JSON.stringify(data, null, 2));

            const processTemp = (pos) => {
                return ((d3.max(dataset, d => d.variance) + baseTemp) / 9) * pos
            }

            const xScale = d3.scaleLinear()
                .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
                .range([padding, width - padding]);

            const yScale = d3.scaleLinear()
                .domain([d3.max(dataset, d => d.month), d3.min(dataset, d => d.month)])
                .range([height - padding, padding]);

            const colorScale = d3.scaleLinear()
                .domain([processTemp(1), processTemp(2), processTemp(3), processTemp(4), processTemp(5), processTemp(6), processTemp(7), processTemp(8), processTemp(9)])
                .range(["blue", "#74ADD1", "#AAD8E8", "white", "#FFF8BF", "#FEE090", "#FCAE60", "coral", "red"]);

            const svg = d3.select("body").append("svg")
                .attr("width", width)
                .attr("height", height)
                .style("margin-top", "50px")

            const xAxis = d3.axisBottom(xScale)
                .tickFormat(d => d);

            const yAxis = d3.axisLeft(yScale)
                .tickFormat(d => monthArr[d - 1]);

            svg.append("g")
                .attr("transform", `translate(0, ${height - padding})`)
                .style("font-size", "15px")
                .attr("id", "x-axis")
                .call(xAxis)

            svg.append("g")
                .attr("transform", `translate(${padding}, -${(height / 12) / 2})`)
                .style("font-size", "15px")
                .attr("id", "y-axis")
                .call(yAxis);

            svg.selectAll("rect")
                .data(dataset)
                .enter()
                .append("rect")
                .classed("cell", true)
                .attr("x", d => xScale(d.year))
                .attr("y", d => yScale(d.month - 1))
                .attr("data-month", d => d.month - 1)
                .attr("data-year", d => d.year)
                .attr("data-temp", d => d.variance + baseTemp)
                .attr("width", d => xScale(d.year) - xScale(d.year - 1))
                .attr("height", d => yScale(d.month) - yScale(d.month - 1))
                .attr("fill", d => colorScale(d.variance + baseTemp))
                .on("mouseover", onMouseOver)
                .on("mouseout", onMouseOut)

            const tooltip = d3.select("body")
                .append("div")
                .attr("id", "tooltip")

            function onMouseOver(event, d) {
                const year = d.year;
                const month = monthArr[d.month - 1];
                const variance = d3.format(".2f")(d.variance);
                const temp = d3.format(".2f")(d.variance + baseTemp);
                const x = event.clientX + 10;
                const y = event.clientY + 10;
                tooltip.style("display", "block")
                    .style("left", `${x}px`)
                    .style("top", `${y}px`)
                    .html(`${year} - ${month}<br/>${temp}℃<br/>${variance > 0 ? "+" + variance : variance}℃`);
            }

            function onMouseOut() {
                tooltip
                    .style("display", "none")
            }

            const legendHeight = 100
            const legendWidth = 300
            const legendPadding = 20

            const legendSvg = d3.select("body")
                .append("svg")
                .attr("width", legendWidth)
                .attr("height", legendHeight)
                .attr("id", "legend")

            const legendScale = d3.scaleLinear()
                .domain([d3.min(colorScale.ticks()), d3.max(colorScale.ticks())])
                .range([legendPadding, legendWidth - legendPadding])

            const legendAxis = d3.axisBottom(legendScale)
                .ticks(10)
                .tickFormat(d3.format(".1f"))

            legendSvg.append("g")
                .attr("transform", `translate(0, ${legendHeight - legendPadding})`)
                .call(legendAxis)

            legendSvg.selectAll("rect")
                .data(colorScale.range())
                .enter()
                .append("rect")
                .attr("x", (d, i) => (i + 0.5) * ((legendWidth - 2 * legendPadding) / 9) + 7)
                .attr("y", legendHeight - 30 - legendPadding)
                .attr("width", ((legendWidth - 2 * legendPadding) / 9) - 1)
                .attr("height", 30)
                .attr("stroke", "black")
                .attr("fill", (d) => d)

        })
})