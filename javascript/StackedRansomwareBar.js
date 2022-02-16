function loadFile(event) {
    event.target.files[0].text().then(rawData => {
        let data = d3.csvParse(rawData, (m) => {
            console.log(m.Month);
            return {
                Month: d3.timeParse("%Y-%m-%d")(m.Month),
                Unknown: +m.Unknown,
                AvosLocker: +m.AvosLocker,
                Babuk: +m.Babuk,
                BlackShadow: +m.BlackShadow,
                Clop: +m.Clop,
                Conti: +m.Conti,
                CozyBear: +m.CozyBear,
                Cuba: +m.Cuba,
                CXK_NMSL: +m.CXK_NMSL,
                DarkSide: +m.DarkSide,
                DharmaCrysis: +m.DharmaCrysis,
                DopplePaymer: +m.DopplePaymer,
                Egergor: +m.Egergor,
                Hades: +m.Hades,
                HelloKitty: +m.HelloKitty,
                LockBit: +m.LockBit,
                LockBit20: +m.LockBit20,
                Maze: +m.Maze,
                MountLocker: +m.MountLocker,
                Netfilm: +m.Netfilm,
                Netwalker: +m.Netwalker,
                OldGremlin: +m.OldGremlin,
                Pay2Key: +m.Pay2Key,
                PhoenixCryptoLocker: +m.PhoenixCryptoLocker,
                ProLock: +m.ProLock,
                PYSA: +m.PYSA,
                QBot: +m.QBot,
                RagnarLocker: +m.RagnarLocker,
                RansomEXX: +m.RansomEXX,
                RevilSodinokibi: +m.RevilSodinokibi,
                Ronggolawe: +m.Ronggolawe,
                Ryuk: +m.Ryuk,
                SnakeEkans: +m.SnakeEkans,
                SunCrypt: +m.SunCrypt,
                SynAck: +m.SynAck,
                WastedLocker: +m.WastedLocker
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
            .domain([0, 40])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        const color = d3.scaleOrdinal()
            .domain(subGroups)
            .range(["#fdffb6", "#606c38", "#6d6875", "#370617", "#6a040f", "#9d0208", "#d00000", "#dc2f02", "#e85d04", "#f48c06", "#faa307", "#ffba08", "#f72585", "#b5179e", "#7209b7", "#560bad", "#3a0ca3", "#3f37c9", "#4361ee", "#4895ef", "#4cc9f0", "#d9ed92", "#b5e48c", "#99d98c", "#76c893", "#52b69a", "#34a0a4", "#168aad", "#1a759f", "#ffcbf2", "#f3c4fb", "#c8e7ff", "#c0fdff"])
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