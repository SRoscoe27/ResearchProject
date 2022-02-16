function loadFile(event) {
    console.log(event.target);
    // event.target.files.forEach(element =>{
    //     if(element.name.includes("attacks")){

    //     } else {

    //     }
    // })
    event.target.files[0].text().then(rawData => {
        let data = d3.csvParse(rawData, (m) => {
            return {
                ID: +m.ID,
                Ref: m.Ref,
                Country: m.Country,
                RansomwareName: m.RansomwareName,
                RansomwareType: m.RansomwareType,
                Group: m.Group,
                Sector: m.Sector.trim(),
                SectorDetailed: m.SectorDetailed.trim(),
                Description: m.Description.replace(/"/g, ""),
                ArticleDate: d3.timeParse("%Y-%m-%d")(m.ArticleDate),
                AttackDate: d3.timeParse("%Y-%m-%d")(m.AttackDate)
            }

        });

        const dataCovid = [];
        const dataRan = [];

        data.forEach(element => {

            if (element.Sector != "Covid") { dataRan[dataRan.length] = element; } else { dataCovid[dataCovid.length] = element; }
        });

        dataRan.sort(function(a, b) {
            return a["AttackDate"] - b["AttackDate"];
        })

        const lockdownDates = [
            ["2020-03-23", "2020-07-04"],
            ["2020-11-05", "2020-12-02"],
        ];

        // Add X axis
        const x = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.AttackDate; }))
            .range([0, width]).nice();
        var xAxis = svg.append("g")
            .attr("class", "axis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).ticks(d3.utcMonth, 1).tickFormat(d3.timeFormat("%Y-%m-%d")))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("stroke-dasharray", "2,2")
            .attr("transform", "rotate(-65)");

        // Add Y axis
        const y = d3.scalePoint()
            .range([0, height])
            .padding(0.4)
            .domain(dataRan.map(function(d) { if (d.Sector != "Covid") { return d.Sector; } }));
        var yAxis = svg.append("g")
            .call(d3.axisLeft(y).ticks(10));

        svg.selectAll(".tick line").attr("stroke", "black")

        // Add X axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("x", width / 2 + margin.left)
            .attr("y", height + margin.top + 80)
            .text("Date");

        // Y axis label:
        svg.append("text")
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left + 20)
            .attr("x", -margin.top - height / 2 + 20)
            .text("Sectors")

        var color = d3.scaleOrdinal()
            .domain(["ReEvil", "ReEvil(?)", "Sodinokibi", "Sodinokibi(?)", "ReEvil/Sodinokibi",
                "ReEvil/Sodinokibi(?)", "Ryuk", "Ryuk(?)", "Netwalker/MaliTo", "Netwalker", "Netwalker(?)", "Clop", "Clop(?)",
                "CXK_NMSL", "Dharma/Crysis", "Maze", "Maze(?)", "Ragnarok Locker", "Ragnarok Locker(?)",
                "Snake/Ekans", "Snake(?)", "Netfilim", "Netfilim(?)", "Prolock", "Prolock(?)",
                "RansomEXX", "RansomEXX(?)", "DopplePaymer", "DopplePaymer(?)", "WastedLocker",
                "WastedLocker(?)", "DarkSide", "DarkSide(?)", "Conti", "Conti(?)", "SunCrypt", "SunCrypt(?)",
                "OldGremlin", "OldGremlin(?)", "Egregor", "Egregor(?)", "LockBit", "LockBit(?)",
                "LockBit 2.0", "LockBit 2.0(?)", "Mount Locker", "Mount Locker(?)", "Pay2Key", "Hades",
                "BlackShadow", "BlackShadow(?)", "PYSA", "PYSA(?)", "Babuk", "Babuk(?)", "Cuba", "Cuba(?)",
                "Hello Kitty", "Ronggolawe", "Ronggolawe(?)", "Pheonix CryptoLocker", "SynAck", "SynAck(?)",
                "QBot", "QBot(?)", "Cozy Bear", "AvosLocker", "AvosLocker(?)", "?"
            ])
            .range(["#f54242", "#f54242", "#f54242", "#f54242", "#f54242", "#f54242", "#f58742", "#f58742",
                "#f5b342", "#f5b342", "#f5b342", "#f5f542", "#f5f542", "#cbf542", "#8af542", "#42f545", "#42f545",
                "#42f581", "#42f581", "#42f5bf", "#42f5bf", "#42f5f2", "#42f5f2",
                "#42b9f5", "#42b9f5", "#0033ff", "#0033ff", "#9003fc", "#9003fc", "#db03fc", "#db03fc",
                "#fc03db", "#fc03db", "#fc03a9", "#fc03a9", "#fc0303", "#fc0303", "#520000", "#520000", "#523b00", "#523b00",
                "#4d5200", "#4d5200", "#2c5200", "#2c5200", "#005213", "#005213", "#005234", "#00524b",
                "#002a52", "#002a52", "#400052", "#400052", "#520024", "#520024", "#d69f9f", "#d69f9f",
                "#d6c69f", "#b0cc97", "#b0cc97", "#c1e6dc", "#c1cee6", "#c1cee6", "#c1c7e6", "#c1c7e6",
                "#dec1e6", "#f2c4e8", "#f2c4e8", "#000000"
            ])

        // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
        // Its opacity is set to 0: we don't see it by default.
        const tooltip = d3.select("#my_dataviz")
            .append("div")
            .style("opacity", 0)
            .attr("id", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("position", "absolute")
            .style("padding", "10px");

        // Add a clipPath: everything out of this area won't be drawn.
        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", width)
            .attr("height", height)
            .attr("x", 0)
            .attr("y", 0);

        // Create the scatter variable: where both the circles and the brush take place
        var scatter = svg.append('g')
            .attr("clip-path", "url(#clip)")

        // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
        var zoom = d3.zoom()
            .scaleExtent([.5, 20]) // This control how much you can unzoom (x0.5) and zoom (x20)
            .extent([
                [0, 0],
                [width, height]
            ])
            .on("zoom", updateChart);

        // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "none")
            .attr("transform",
                `translate(0,0)`)
            .call(zoom);

        // now the user can zoom and it will trigger the function called updateChart
        svg.call(zoom);
        // A function that updates the chart when the user zoom and thus new boundaries are available
        function updateChart(event) {

            // recover the new scale
            var newX = event.transform.rescaleX(x);

            // update axes with these new boundaries
            xAxis.call(d3.axisBottom(newX))

            // update circle position
            scatter
                .selectAll("circle")
                .attr('cx', function(d) { return newX(d.AttackDate) })
                // scatter
                //     .selectAll("rect")
                //     .attr('cx', function(d) { return newX(d.AttackDate) })
            scatter
                .selectAll("rect")
                .attr('cx', function(d) { return newX(d.AttackDate) })

        }


        //Reset Zoom 
        d3.select("button")
            .on("click", resetted);

        function resetted() {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        }

        // A function that change this tooltip when the user hover a point.
        // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
        const mouseover = function(event, d) {
            tooltip
                .style("opacity", 1)
        }

        const mousemove = function(event, d) {
            tooltip
                .html(`<b>Attack Number: ${d.ID}</b><br> <b> Ransomware Name: </b> ${d.RansomwareName} by the ${d.Group} Group <br> <b> Description: </b> ${d.Description} <br> <b> Attack Date: </b> ${d.AttackDate} (Article dated to ${d.ArticleDate} ${d.Ref})`)
                .style("left", (event.x) + 70 / 2 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
                .style("top", (event.y) - 50 / 2 + "px")
        }

        // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
        const mouseleave = function(event, d) {
            tooltip
                .transition()
                .duration(200)
                .style("opacity", 0)
        }

        // Add dots
        //svg.append('g')
        scatter.selectAll("circle")
            .data(dataRan.filter(function(d, i) {
                return i < 400
            })) // the .filter part is just to keep a few dots on the chart, not all of them
            .enter()

        .append("circle")
            .attr("cx", function(d) {
                return x(d.AttackDate);
            })
            .attr("cy", function(d) {
                return y(d.Sector);
            })
            .attr("r", 7)
            .style("fill", function(d) {
                return color(d.RansomwareName)
            })
            .style("opacity", 0.6)
            .style("stroke", "white")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)

        scatter.selectAll("dot")
            .data(lockdownDates) // the .filter part is just to keep a few dots on the chart, not all of them
            .enter()
            .append("rect")
            .attr("x", function(d) {
                // console.log(d);
                // console.log(d3.timeParse("%Y-%m-%d")(d[0]));
                return x(d3.timeParse("%Y-%m-%d")(d[0]))
            })
            .attr("width", function(d) {
                // console.log(d);
                // console.log(d3.timeParse("%Y-%m-%d")(d[0]));
                return x(d3.timeParse("%Y-%m-%d")(d[1])) - x(d3.timeParse("%Y-%m-%d")(d[0]))
            })
            .attr("y", 0)
            .attr("height", height)
            .attr("fill", "blue")
            .attr("opacity", "0.05")
            .on("mouseover", mouseover)
            .on("mousemove", mousemove)
            .on("mouseleave", mouseleave)
    });
}

document.getElementById('fileInput').addEventListener('change', loadFile);

// set the dimensions and margins of the graph
const margin = {
        top: 10,
        right: 30,
        bottom: 100,
        left: 100
    },
    width = 860 - margin.left - margin.right,
    height = 650 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        `translate(${margin.left}, ${margin.top})`);