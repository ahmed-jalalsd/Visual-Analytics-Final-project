
// added today
if (screen.width >= 600 && screen.width <= 1440) {
    width = 400;
    height = 255.83;
    marginTrans = 8;
}

if (screen.width >= 1441) {
    width = 450;
    height = 275.83;
    marginTrans = 40;
    // console.log("width >= 1441");
}

// width = 450;
// height = 275.83;
margin = 50;
duration = 250;

lineOpacity = "0.25";
lineOpacityHover = "0.85";
otherLinesOpacityHover = "0.1";
lineStroke = "1.5px";
lineStrokeHover = "2.5px";

circleOpacity = '0.85';
circleOpacityOnLineHover = "0.25"
circleRadius = 3;
circleRadiusHover = 6;

/* Scale */
xScale = d3.scaleTime().range([0, width - margin]);


yScale = d3.scaleLinear().range([height - margin, 0]);
yScale.domain([450, 1])


linexAxis = d3.axisBottom(xScale).ticks(5);
lineyAxis = d3.axisLeft(yScale).ticks(10);

/* Add svg1 */
svg1 = d3.select("#chart").append("svg")
    .attr("width", (width + margin) + "px")
    .attr("height", (height + margin) + "px")
    .attr("transform", "translate(20,0)")
    .append('g')
    .attr("transform", `translate(${margin}, ${marginTrans})`);

/* Add Axis into svg1 */


linexAxisl = svg1.append("g")
    .attr("class", "x axis")
    .attr("transform", `translate(0, ${height - margin})`)
    .call(linexAxis);

lineyAxis1 = svg1.append("g")
    .attr("class", "y axis")
    .call(lineyAxis)
    .append('text')
    .attr("y", 15)
    .attr("transform", "rotate(-90)")
    .attr("fill", "#000")

svg1.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin_scatter.left - 10)
    .attr("x", 0 - (height_scatter / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Ranking");

svg1.append("text")
    .attr("y", 250)
    .attr("x", 176)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Year")

function lineChart(dataLine) {

    if (dataLine == null) {
        $(".line-group").css({
            "display": "none"
        });
        $(".lineCircle").css({
            "display": "none"
        });
    }
    else {
        $("#chart").css({
            "display": "block"
        });

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    buu = [];
    //Helper array having 6 positions, one per each year
    frieza = [
        [],
        [],
        [],
        [],
        [],
        []
    ];

    //Loop through each university in the filtered data
    dataLine.forEach(function (uni) {
        //Extract all data related to that university from the whole data set
        brokenLineData = wholeData.filter(function (d) {
            return (uni.university_name == d.university_name)
        });
        //Loop through those related data to place each one in its position in values array
        brokenLineData.forEach(function (gohan) {

            if (gohan.year == 2011) {
                frieza[0] = {
                    date: gohan.year,
                    rank: gohan.world_rank
                }
            } else if (gohan.year == 2012) {
                frieza[1] = {
                    date: gohan.year,
                    rank: gohan.world_rank
                }
            } else if (gohan.year == 2013) {
                frieza[2] = {
                    date: gohan.year,
                    rank: gohan.world_rank
                }
            } else if (gohan.year == 2014) {
                frieza[3] = {
                    date: gohan.year,
                    rank: gohan.world_rank
                }
            } else if (gohan.year == 2015) {
                frieza[4] = {
                    date: gohan.year,
                    rank: gohan.world_rank
                }
            } else if (gohan.year == 2016) {
                frieza[5] = {
                    date: gohan.year,
                    rank: gohan.world_rank
                }
            }


        });

        //If a university misses the ranking in that year, it is given the rank 450
        if (frieza[0].length == 0) {
            frieza[0] = {
                date: 2011,
                rank: 450
            }
        }
        if (frieza[1].length == 0) {
            frieza[1] = {
                date: 2012,
                rank: 450
            }
        }
        if (frieza[2].length == 0) {
            frieza[2] = {
                date: 2013,
                rank: 450
            }
        }
        if (frieza[3].length == 0) {
            frieza[3] = {
                date: 2014,
                rank: 450
            }
        }
        if (frieza[4].length == 0) {
            frieza[4] = {
                date: 2015,
                rank: 450
            }
        }
        if (frieza[5].length == 0) {
            frieza[5] = {
                date: 2016,
                rank: 450
            }
        }

        buu.push({
            name: uni.university_name,
            values: frieza
        })
        //Flush the array to be used again for the next element of the filtered data
        frieza = [
            [],
            [],
            [],
            [],
            [],
            []
        ];

    });

    data = buu;

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



    colorLine = d3.scaleOrdinal(d3.schemeCategory10);


    /* Format Data */
    var parseDate = d3.timeParse("%Y");
    data.forEach(function (d) {
        d.values.forEach(function (d) {
            d.date = parseDate(d.date);
            d.rank = +d.rank;
        });
    });
    line = d3.line()
        .x(function (d) {
            return xScale(d.date)
        })
        .y(function (d) {
            if (d.rank == 450) { }
            return yScale(d.rank)

        });

    svg1.selectAll(".lines").remove();
    xScale.domain(d3.extent(data[0].values, d => d.date))

    linexAxis.scale(xScale);
    linexAxisl.transition().call(linexAxis);
    lineyAxis.scale(yScale);
    lineyAxis1.transition().call(lineyAxis);


    /* Add line into svg1 */

    lines = svg1.append('g')
        .attr('class', 'lines');


    lines.selectAll('.line-group')
        .data(data).enter()
        .append('g')
        .attr('class', 'line-group')
        .on("mouseover", function (d, b) {
            svg1.append("text")
                .attr("class", "title-text")
                .style("fill", colorLine(b))
                .text(d.name)
                .attr("text-anchor", "middle")
                .attr("x", (width - margin) / 2)
                .attr("y", 5);
        })
        .on("mouseout", function (d) {
            svg1.select(".title-text").remove();
        })
        .append('path')
        .attr('class', 'line')
        .attr('d', function (d, i) {
            return line(d.values)
        })
        .style('stroke', (d, b) => colorLine(b))
        .style('opacity', lineOpacity)
        .on("mouseover", function (d) {
            d3.selectAll('.line')
                .style('opacity', otherLinesOpacityHover);
            d3.selectAll('.circle')
                .style('opacity', circleOpacityOnLineHover);
            d3.select(this)
                .style('opacity', lineOpacityHover)
                .style("stroke-width", lineStrokeHover)
                .style("cursor", "pointer");
        })
        .on("mouseout", function (d) {
            d3.selectAll(".line")
                .style('opacity', lineOpacity);
            d3.selectAll('.circle')
                .style('opacity', circleOpacity);
            d3.select(this)
                .style("stroke-width", lineStroke)
                .style("cursor", "none");
        });


    /* Add circles in the line */
    lines.selectAll("circle-group")
        .data(data).enter()
        .append("g")
        .style("fill", (d, b) => colorLine(b))
        .selectAll("circle")
        .data(d => d.values).enter()
        .append("g")
        .attr("class", "lineCircle")
        .on("mouseover", function (d) {
            d3.select(this)
                .style("cursor", "pointer")
                .append("text")
                .attr("class", "text")
                .text(`${d.rank}`)
                .attr("x", d => xScale(d.date) + 5)
                .attr("y", d => yScale(d.rank) - 10);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("cursor", "none")
                .transition()
                .duration(duration)
                .selectAll(".text").remove();
        })
        .append("circle")
        .attr("cx", d => xScale(d.date))
        .attr("cy", d => yScale(d.rank))
        .attr("r", circleRadius)
        .style('opacity', circleOpacity)
        .on("mouseover", function (d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadiusHover);
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .transition()
                .duration(duration)
                .attr("r", circleRadius);
        });



}

}