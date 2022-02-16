function loadFile(event) {
    event.target.files[0].text().then(rawData => {
        let data = d3.csvParse(rawData, (m) => {
            console.log(m.Month);
            return {
                Month: d3.timeParse("%Y-%m-%d")(m.Month),
                Education: +m.Education,
                Finance: +m.Finance,
                Government: +m.Government,
                Healthcare: +m.Healthcare,
                Logistics: +m.Logistics,
                Manufacturing: +m.Manufacturing,
                Other: +m.Other,
                Retail: +m.Retail,
                Services: +m.Services,
                Technology: +m.Technology,
                Transport: +m.Transport,
                Utilities: +m.Utilities,
            }

        });

        //List of SubGroups
        const subGroups = data.columns.slice(1)

        const groups = data.map(d => d.Month)

        const x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m")).tickSizeOuter(0))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("stroke-dasharray", "2,2")
            .attr("transform", "rotate(-65)");

        const y = d3.scaleLinear()
            .domain([0, 35])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        const color = d3.scaleOrdinal()
            .domain(subGroups)
            .range(["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#ffffbf", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2", "#fe4b83"])
        const stackedData = d3.stack()
            .keys(subGroups)
            (data)

        // ----------------
        // Create a tooltip
        // ----------------
        const tooltip = d3.select("#my_dataviz")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("position", "absolute")
            .style("padding", "10px")

        // Three function that change the tooltip when user hover / move / leave a cell
        const mouseover = function(event, d) {
            const subgroupName = d3.select(this.parentNode).datum().key;
            const subgroupValue = d.data[subgroupName];
            tooltip
                .html("Subgroup: " + subgroupName + "<br>" + "Value: " + subgroupValue)
                .style("opacity", 1)

        }
        const mousemove = function(event, d) {
            tooltip.style("transform", "translateY(-55%)")
                .style("left", (event.x) / 2 + "px")
                .style("top", (event.y) / 2 - 30 + "px")
        }
        const mouseleave = function(event, d) {
            tooltip
                .style("opacity", 0)
        }

        // Show the bars
        svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .join("g")
            .attr("fill", d => color(d.key))
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(d => d)
            .join("rect")
            .attr("x", d => x(d.data.Month))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]))
            .attr("width", x.bandwidth())
            .attr("stroke", "grey")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

    });
}

document.getElementById('fileInput').addEventListener('change', loadFile);

const margin = {
        top: 10,
        right: 30,
        bottom: 100,
        left: 60
    },
    width = 900 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;


// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);