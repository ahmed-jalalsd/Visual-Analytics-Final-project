flag_s = false;
flag_once = false;
///////////////////// Var and options for the radar chart //////////////////////////////////// 
var margin_radar = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
},
    width_radar = Math.min(450, window.innerWidth - 10) - margin_radar.left - margin_radar.right,
    height_radar = Math.min(120, window.innerHeight - margin_radar.top - margin_radar.bottom - 20);

var color = d3.scaleOrdinal(d3.schemeCategory10);

var radarChartOptions = {
    w: width_radar,
    h: height_radar,
    margin: margin_radar,
    maxValue: 0.5,
    levels: 5,
    roundStrokes: true,
    color: color
};

///////////////////////Filtering the data based on the sliders /////////////////////////////
function datafilter() {

    // a var to hold the top ranking by the user
    rankingsSliderValues = $("#date-slider").slider("values");

    // a var to hold the top ranking by the user
    costSliderValues = $("#date2-slider").slider("values");

    // a var to hold the year chosen by the user
    yearSliderValues = $("#var-select").val();

    // an array to hold the checked continent
    getContinentCheckBox();
    // To remove all the old circles 
    g.selectAll("circle").remove();

    // To draw the points on the map, the scatter plot and the radar chart when the user uses the filter menu
    drawpointsv1();

    // Add the brush on the map when the user uses the filter menu
    gCoordinates = g.node().getBBox();
    brushmap = d3.brush().extent([
        [gCoordinates.x, gCoordinates.y],
        [gCoordinates.x + gCoordinates.width + 10, gCoordinates.y + gCoordinates.height + 10]
    ]).on("end", selectedmap);
    g.append("g").attr("class", "brushT").call(brushmap);

    //add brush toolbar
    showClearFilter();
}

filtered_data = [];

function drawpointsv1() {

    // read the data when the user uses the filter menu
    d3.json("data/csvjson.json", function (data) {
        wholeData = data;
        filtered_data = data.filter(function (d) {
            return (d.year == yearSliderValues && continentSliderValues.includes(d.continent) &&
                (d.world_rank >= rankingsSliderValues[0] && d.world_rank <= rankingsSliderValues[1]) &&
                (d.cost_of_living >= costSliderValues[0] && d.cost_of_living <= costSliderValues[1]))
        });

        // remove the legend from the scatter plot when the user uses the filter menu
        focus.selectAll(".legend").remove();

        // Draw the points on the map when the user uses the filter menu
        g.selectAll("circle")
            .data(filtered_data)
            .enter().append("circle", "image")
            .attr("r", 2)
            .style("fill", function (d) {
                if (flag_once === false) {
                    return "grey"
                } else {
                    return "red"
                }

            })
            .style("opacity", function (d) {
                if (flag_once === false) {
                    return 0.5;
                } else {
                    return 1
                }

            })
            .on("mousemove", showTooltip2)
            .on("mouseout", hideTooltip2)
            .attr("transform", function (d) {
                return "translate(" + projection([
                    +d.lon,
                    +d.lat,
                ]) + ")";
            })

        // Draw the points on the scatter plot when the user uses the filter menu
        drawScatter(filtered_data);

        // topTen = filtered_data.slice(0, 5);
        // console.log(topTen)

        // // Draw the radar chart when the user uses the filter menu
        // RadarChart(".radarChart", filtered_data, radarChartOptions);
        // // Draw the First ten top uni in the world when the windo load
        // // RadarChart(".radarChart", topTen, radarChartOptions);

        // lineChart(filtered_data);


    });
}


/////////////////////////////////////////////////// Draw the map //////////////////////////////////////////////////////////////

function draw(error, geo_data, names, ranking) {
    if (error) throw error;
    "use strict";

    // added today
    if (screen.width >= 600 && screen.width <= 1440) {
        var width = 819.56,
            height = 327.16;
    }
    else if (screen.width >= 1141) {
        var width = 546.39,
            height = 327.16;
    }

    // var width = 910.56,
    //     // height = 327.16,
    //     height = 420.16,
    var clicked_point;
    var offset = [width / 2, height / 1.5];
    var centered;


    projection = d3.geoMercator().scale(75).translate(offset);
    plane_path = d3.geoPath().projection(projection);

    svg = d3.select("body .wrapper .one .map-holder").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "map")
        .attr("class", "background");


    var path = d3.geoPath().projection(projection);


    g = svg.append("g").attr("transform", "translate(40,10)")

    var arcGroup = g.append('g');

    var countries = topojson.feature(geo_data, geo_data.objects.countries).features;

    // Joing two json files to associate country's id with their names
    var countriesWithCapitals = countries.filter(function (d) {
        return names.some(function (n) {
            if (d.id == n.id) return d.country = n.country;
        })
    });


    g.selectAll("path")
        .data(countriesWithCapitals)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", colorCountry)
        .on("click", clicked)
        .on("mousemove", showTooltipCountry)
        .on("mouseout", hideTooltip);

    tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip hidden");

    tooltip_point = d3.select("body")
        .append("div")
        .attr("class", "tooltip_point hidden");

    clearFilter = d3.select("body")
        .append("div")
        .attr("class", "tooltip_point hidden icon-custom");

    // select the main div selections to hide the filters
    var legend_cont = d3.select("body #selections");


    function clickedPoint(p) {
        if (p && clicked_point !== p) {
            hideTooltipPoint(clicked_point); // hide old tooltip
            showTooltipPoint(p);
            clicked_point = p;
        } else {
            hideTooltipPoint(p);
            clicked_point = null;
        }
    }

    function clickedOcean() {
        console.log("oceaan")
        var x, y, k;
        x = width / 2;
        y = height / 2;
        k = 1;
        centered = null;
        legend_cont.classed("hidden", false);

        // map transition
        g.transition()
            //.style("stroke-width", (0.75 / k) + "px")
            .duration(750)
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
            .on('end', function () {
                if (centered === null) {
                    g.selectAll("path")
                        .style("stroke-width", (0.75 / k) + "px");
                }
            });
        // remove all old points
        g.selectAll("image").remove()
    }

    ////////////////////////////////////////////////When user clicks on a country /////////////////////////////////////////////////

    function clicked(d) {

        // remove the circles from the scatter plot when the user clicks a country
        g.selectAll("circle").remove();

        // remove the legend from the scatter plot when the user clicks a country
        focus.selectAll(".legend").remove();

        // start of outer if
        if (tooltip_point.classed("hidden")) {
            var x, y;
            k = 0;

            // start of the first inner if
            if ((d && centered !== d)) {
                flag_s = true;
                g.selectAll('path')

                var centroid = path.centroid(d);
                var bounds = path.bounds(d);
                var dx = bounds[1][0] - bounds[0][0],
                    dy = bounds[1][1] - bounds[0][1];

                x = (bounds[0][0] + bounds[1][0]) / 2;
                y = (bounds[0][1] + bounds[1][1]) / 2;
                k = Math.min(width / dx, height / dy);
                centered = d;

                // to hide the filters menu
                legend_cont.classed("hidden-custom", true);
                // change the header color
                $("header").css({
                    "backgroundColor": "rgb(227, 231, 234)"
                });

                // Draw the brush on the map when the user clicks a country
                brushmap2 = d3.brush().extent([
                    [0, 0],
                    [500, 400]
                ]).on("end", selectedmap);
                g.append("g").attr("class", "brushT").call(brushmap2);

                // Show the brush toolbar when the user clicks a country
                showClearFilter();
            } else { // start of the first inner else
                flag_s = false;

                x = width / 2;
                y = height / 2;
                k = 1;
                centered = null;

                // Show the filters menu
                legend_cont.classed("hidden-custom", false);
                // change the header color
                $("header").css({
                    "backgroundColor": "#fff",
                    "transition": "opacity 1s ease-in-out"
                });
                // hide the brush toolbar
                hideClearFilter();
            } // End of the first inner else

            g.selectAll("path")
                .classed("active", centered && function (d) {
                    return d === centered;
                })

            // make contours thinner before zoom 
            if (centered !== null) {
                g.selectAll("path")
                    .style("stroke-width", (0.75 / k) + "px");
            }

            // map transition
            g.transition()
                //.style("stroke-width", (0.75 / k) + "px")
                .duration(750)
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                .on('end', function () {
                    if (centered === null) {
                        g.selectAll("path")
                            .style("stroke-width", (0.75 / k) + "px");
                    }
                });

            // draw points on the map based on the country selection
            drawpoints(d);

            // start of the second inner if
            if (centered !== null) {
                // Draw the points 
                g.selectAll("image")
                    .data(contained_points)
                    .enter().append("circle", "image")
                    .attr("r", 8 / (k))
                    .style("fill", "red")
                    .attr("transform", function (d) {
                        return "translate(" + projection([
                            d.lon,
                            d.lat,
                        ]) + ")";
                    })
                    .on("mousemove", showTooltip)
                    .on("mouseout", hideTooltip)
                    .on("click", showTooltipPoint)

                // added today
                topTen = contained_points.slice(0, 5);
                drawScatter(contained_points);
                RadarChart(".radarChart", topTen, radarChartOptions);
                lineChart(topTen);



            } else { // start of the second inner else
                focus.selectAll("circle").remove();
                g.selectAll("circle").remove();
                RadarChart(".radarChart", null, radarChartOptions);
            }
        } // end of the outer if 
        else { // start of the outer else
            hideTooltipPoint(d);
        } // end of the outer else
    } // end of fun

    function drawpoints(d) {
        yearSliderValues_1 = $("#var-select").val();
        contained_points = ranking.filter(function (point) {
            if (point.country == d.country && point.year == yearSliderValues_1) {
                return true;
            } else {
                return false;
            }
        });
    }
    var debug;

    // show country id on hover
    function showTooltipCountry(d) {
        // filter only points in the country
        var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });

        tooltip.classed('hidden', false)
            .html(d.country)
            .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 35) + 'px')
    };

    // hide tooltip
    function hideTooltip(d) {
        // Show the tooltip (unhide it) and set the name of the data entry.
        tooltip.classed('hidden', true);
    }

    // hide point tooltip
    function hideTooltipPoint(d) {
        // Show the tooltip (unhide it) and set the name of the data entry.
        tooltip_point.classed('hidden', true);
    }

    // show university name on hover
    function showTooltip(d) {
        var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });
        if (tooltip_point.classed("hidden")) {
            tooltip.classed('hidden', false)
                .html("<span id='close' onclick='hideTooltipPoint()'>x</span>" +
                    "<div class='inner_tooltip'>" +
                    "<p>" + d.university_name + "</p>" +
                    "</div><div>" + "</div>")
                .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 25) + 'px')
        };
    };

    // show point tooltip when the circle is clicked
    function showTooltipPoint(d) {
        var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });

        tooltip_point.classed('hidden', false)
            .html(`<span id='close' onclick='hideTooltipPoint()'>x</span>
                <div class='inner_tooltip'>
                <small><b>${d.university_name}</b></small>
                </div><hr><div class='details'> <small> World Ranking: </small> ${d.world_rank}
                </div> <div class='details'> <small> Number of Student: </small> ${d.num_students}
                </div> <div class='details'> <small> International Students: </small> ${d.international_students} </div>
                <div class='details'> <small> Cost of Living: </small>$${d.cost_of_living}</div>
                </div>`)
            .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 35) + 'px')
    };

    // color country
    function colorCountry(country) {
        if (country.id == '-99' & country.geometry.coordinates[0][0][0] != 20.590405904059054) {
            // return '#e7d8ad'
            return '#aabad2';
        } else {
            // return '#c8b98d';
            return '#aabad2';
        };
    };

    if (flag_once == false) {
        datafilter();
        // start the Radar on load
        onceForRadar = ranking.filter(function (d,i) {
            return (i==0 || i==1)
            });

        RadarChart(".radarChart", onceForRadar, radarChartOptions, false);
        setTimeout(function () {
            //do what you need here
            flag_once = true;
        }, 4000);

    }

}; // end of draw map

/*Use D3 to load the GeoJSON file */

d3.queue()
    .defer(d3.json, "https://unpkg.com/world-atlas@1/world/110m.json")
    .defer(d3.json, "data/datacountry.json")
    .defer(d3.json, "data/csvjson.json")
    .await(draw);

/////////////////////////////Top ranking slider//////////////////////////////
$("#date-slider").slider({
    range: true,
    min: 1,
    max: 400,
    values: [1, 400],
    step: 1,
    slide: function (event, ui) {
        $("#dateLabel1").text(ui.values[0]);
        $("#dateLabel2").text(ui.values[1]);


        getContinentCheckBox();
        if (!Array.isArray(continentSliderValues) || !continentSliderValues.length) {
            document.getElementById('errors').innerHTML = "<div class='alert alert-warning alert-dismissible fade show' role='alert'>Please choose at least one Contient!<button type='button' class='close' data-dismiss='alert' aria-label='Close'> <span aria-hidden='true'>&times;</span></button></div>";
            return false;
        } else {
            // Draw the points on the map, scatter and radar charts on the change of the filter
            datafilter();
        }
    }
});
//////////////////////////////Living cost slider///////////////////////////////////
$("#date2-slider").slider({
    range: true,
    min: 200,
    max: 1300,
    values: [200, 1300],
    step: 1,
    slide: function (event, ui) {
        $("#costLabel1").text("$" + ui.values[0]);
        $("#costLabel2").text("$" + ui.values[1]);

        getContinentCheckBox();
        if (!Array.isArray(continentSliderValues) || !continentSliderValues.length) {
            document.getElementById('errors').innerHTML = "<div class='alert alert-warning alert-dismissible fade show' role='alert'>Please choose at least one Contient!<button type='button' class='close' data-dismiss='alert' aria-label='Close'> <span aria-hidden='true'>&times;</span></button></div>";
            return false;
        } else {
            // Draw the points on the map, scatter and radar charts on the change of the filter
            datafilter();
        }
    }
});

function hideTooltipPoint() {
    document.getElementsByClassName('tooltip_point')[0].style.visibility = 'hidden';
}

///////////////////////////// Scatter plot options /////////////////////////////////////

margin_scatter = {
    top: 20,
    right: 20,
    bottom: 40,
    left: 40
},
    width_scatter = 380 - margin_scatter.left - margin_scatter.right,
    height_scatter = 300.16 - margin_scatter.top - margin_scatter.bottom,

    x_scatter = d3.scaleLinear().range([0, width_scatter]),
    y_scatter = d3.scaleLinear().range([height_scatter, 0]),

    xAxis_scatter = d3.axisBottom(x_scatter),
    yAxis_scatter = d3.axisLeft(y_scatter);


svg = d3.select("#scatterArea").append("svg")
    .attr("width", width_scatter + margin_scatter.left + margin_scatter.right)
    .attr("height", height_scatter + margin_scatter.top + margin_scatter.bottom)
    .attr("transform", "translate(" + 20 + "," + 0 + ")");

focus = svg.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin_scatter.left + "," + margin_scatter.top + ")");

xAxis = focus.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height_scatter + ")")
    .call(xAxis_scatter);

yAxis = focus.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis_scatter);

focus.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin_scatter.left)
    .attr("x", 0 - (height_scatter / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Y1");

svg.append("text")
    .attr("transform",
        "translate(" + ((width_scatter + margin_scatter.right + margin_scatter.left) / 2) + " ," +
        (height_scatter + margin_scatter.top + margin_scatter.bottom) + ")")
    .style("text-anchor", "middle")
    .text("Y2");



///////////////////////// function to draw the scatter plot /////////////////////////////

function drawScatter(data) {
    cValue = function (d) {
        return d.continent;
    }
    
    color = d3.scaleOrdinal(d3.schemeCategory10);
    //Update the scale
    var maxHeight = d3.max(data, function (d) {
        return Math.abs(d.Y2)
    });
    var minHeight = d3.min(data, function (d) {
        return Math.abs(d.Y2)
    })
    y_scatter.domain([maxHeight + 0.5, -maxHeight - 0.5]); //show negative
    var maxWidth = d3.max(data, function (d) {
        return Math.abs(d.Y1)
    });
    var minWidth = d3.min(data, function (d) {
        return Math.abs(d.Y1)
    })
    x_scatter.domain([maxWidth + 0.5, -maxWidth - 4]); //show negative

    // Update axes
    xAxis_scatter.scale(x_scatter);
    xAxis.transition().call(xAxis_scatter);
    yAxis_scatter.scale(y_scatter);
    yAxis.transition().call(yAxis_scatter);

    focus.selectAll("circle").remove();

    dots = focus.selectAll("circle").data(data);

    dots.enter().append("circle")
        .attr("r", 3)
        .attr("class", "knncircle")
        .style("fill", function (d) {
            if(flag_once == false) {
                return "grey";
            }else {
                return color(cValue(d));
            }
        })
        .attr("cx", function (d) {
            return x_scatter(d.Y1);
        })
        .attr("cy", function (d) {
            return y_scatter(d.Y2)
        })
        .on("mousemove", showTooltip2)
        .on("mouseout", hideTooltip2)
        .on("click", Knn)

    var legend = focus.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 17 + ")";
        });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width_scatter - 5)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width_scatter - 15)
        .attr("y", 6)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size", "0.8em")
        .text(function (d) {
            return d;
        })
}


////////////////////////// Brush initialization (scatter plot) /////////////////////////////////

brushTot = d3.brush()
    .extent([
        [0, 0],
        [width_scatter, height_scatter]
    ])
    .on("end", selected)

focus.append("g")
    .attr("class", "brushT")
    .call(brushTot);

///////////////////////selection function of brush (scatter plot) ///////////////////////////////

function selected() {
    dataSelection = []

    var selection = d3.event.selection;

    if (selection != null) {
        focus.selectAll("circle")
            .style("fill", function (d) {
                if (x_scatter(d.Y1) > selection[0][0] && x_scatter(d.Y1) < selection[1][0] &&
                    y_scatter(d.Y2) > selection[0][1] && y_scatter(d.Y2) < selection[1][1]) {

                    dataSelection.push(d);
                    return "green";
                } else {
                    return "red";
                }
            })

        g.selectAll("circle").remove();

        if (flag_s == false) {
            g.selectAll("circle")
                .data(dataSelection)
                .enter().append("circle", "image")
                .attr("r", 2)
                .style("fill", "red")
                .on("mousemove", showTooltip2)
                .on("mouseout", hideTooltip2)
                .attr("transform", function (d) {
                    return "translate(" + projection([
                        d.lon,
                        d.lat,
                    ]) + ")";
                })
        } else {
            g.selectAll("circle")
                .data(dataSelection)
                .enter().append("circle", "image")
                .attr("r", 8 / k)
                .style("fill", "green")
                .on("mousemove", showTooltip2)
                .on("mouseout", hideTooltip2)

                .attr("transform", function (d) {

                    return "translate(" + projection([
                        d.lon,
                        d.lat,

                    ]) + ")";
                })
        }
        RadarChart(".radarChart", dataSelection, radarChartOptions);
        lineChart(dataSelection);
    }
    //Nothing is selected by the brush
    else {
        dataSelection = [];

        focus.selectAll("circle")
            .style("fill", function (d) {
                return color(cValue(d));
            })

        console.log("reset");

        if (flag_s == false) {
            datap = filtered_data;
        } else {
            datap = contained_points;
        }

        g.selectAll("circle").remove();

        if (flag_s == false) {
            g.selectAll("circle")
                .data(datap)
                .enter().append("circle", "image")
                .attr("r", 2)
                .style("fill", "red")
                .on("mousemove", showTooltip2)
                .on("mouseout", hideTooltip2)

                .attr("transform", function (d) {
                    return "translate(" + projection([
                        d.lon,
                        d.lat,
                    ]) + ")";
                })
        } else {
            g.selectAll("circle")
                .data(datap)
                .enter().append("circle", "image")
                .attr("r", 8 / k)
                .style("fill", "red")
                .on("mousemove", showTooltip2)
                .on("mouseout", hideTooltip2)

                .attr("transform", function (d) {

                    return "translate(" + projection([
                        d.lon,
                        d.lat,

                    ]) + ")";
                })
        }
        //  remove the rader cgart when click on the empty area of the scatter plot
        onceForRadar_flag = false;
        RadarChart(".radarChart", onceForRadar, radarChartOptions, onceForRadar_flag);
        // remove the table
        d3.selectAll(".table-remove").remove();
        $(".html_table").css("display", "table");
        // remove the knn lines
        focus.selectAll(".knnline").remove()
        lineChart(null);
        //remove old lines 
        

        // put back the legend

        var legend = focus.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function (d, i) {
            return "translate(0," + i * 17 + ")";
        });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width_scatter - 5)
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width_scatter - 15)
        .attr("y", 6)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .style("font-size", "0.8em")
        .text(function (d) {
            return d;
        })
    }
}


/////////////////////// Brush2 initialization ////////////////////////////////////
////////////////////////selection function of brush (Map) /////////////////////////////

function selectedmap() {
    dataSelectionMap = []

    var selectionMap = d3.event.selection;

    if (selectionMap != null) {
        g.selectAll("circle")
            .style("fill", function (d) {
                coordinatesMap = projection([d.lon, d.lat]);
                coordinatesMap_x = coordinatesMap[0];
                coordinatesMap_y = coordinatesMap[1];
                if (coordinatesMap_x > selectionMap[0][0] && coordinatesMap_x < selectionMap[1][0] &&
                    coordinatesMap_y > selectionMap[0][1] && coordinatesMap_y < selectionMap[1][1]) {

                    dataSelectionMap.push(d);
                    return "green";
                } else {
                    return "red";
                }
            })

        focus.selectAll("circle").remove();
        focus.selectAll(".legend").style("visibility", "hidden");

        focus.selectAll("circle")
            .data(dataSelectionMap)
            .enter().append("circle", "image")
            .attr("r", 5)
            .style("fill", "green")
            .on("mousemove", showTooltip2)
            .on("mouseout", hideTooltip2)
            .attr("cx", function (d) {
                return x_scatter(d.Y1);
            })
            .attr("cy", function (d) {
                return y_scatter(d.Y2)
            })
        RadarChart(".radarChart", dataSelectionMap, radarChartOptions);
        lineChart(dataSelectionMap);
    } else { //Nothing is selected by the brush

        focus.selectAll(".legend").style("visibility", "visible");
        dataSelectionMap = [];

        g.selectAll("circle")
            .style("fill", "red")

        console.log("reset");

        focus.selectAll("circle").remove();

        if (flag_s == false) {
            focus.selectAll("circle")
                .data(filtered_data)
                .enter().append("circle", "knncircle")
                .attr("r", 3)
                .attr("class", "knncircle")
                .style("fill", function (d) {
                    return color(cValue(d));
                })
                .on("mousemove", showTooltip2)
                .on("mouseout", hideTooltip2)
                .on("click", Knn)
                .attr("cx", function (d) {
                    return x_scatter(d.Y1);
                })
                .attr("cy", function (d) {
                    return y_scatter(d.Y2)
                })
        } else {
            focus.selectAll("circle")
                .data(contained_points)
                .enter().append("circle", "knncircle")
                .attr("r", 3)
                .attr("class", "knncircle")
                .style("fill", function (d) {
                    return color(cValue(d));
                })
                .on("mousemove", showTooltip2)
                .on("mouseout", hideTooltip2)
                .on("click", Knn)
                .attr("cx", function (d) {
                    return x_scatter(d.Y1);
                })
                .attr("cy", function (d) {
                    return y_scatter(d.Y2)
                })
        }

        if (flag_s == false) {
            RadarChart(".radarChart", filtered_data, radarChartOptions);
        } else {
            RadarChart(".radarChart", contained_points, radarChartOptions);
        }
        
    }
}

function showTooltip2(d) {
    var mouse = d3.mouse(svg.node()).map(function (d) {
        return parseInt(d);
    });
    if (tooltip_point.classed("hidden")) {
        tooltip.classed('hidden', false)
            .html("<span id='close' onclick='hideTooltipPoint()'>x</span>" +
                "<div class='inner_tooltip'>" +
                "<p>" + d.university_name + "</p>" +
                "</div><div>" +
                //getIconsAndLinks(d) + 
                // 
                "</div>")
            .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 35) + 'px')
    };

};


function hideTooltip2(d) {
    // Show the tooltip (unhide it) and set the name of the data entry.
    tooltip.classed('hidden', true);
}

//////////////////////////Toolbar//////////////////////////////////////////

// show Filter tool bar
function showClearFilter() {
    if (flag_s == true) {
        var mouse = d3.mouse(svg.node()).map(function (d) {
            return parseInt(d);
        });
        clearFilter.classed('hidden', false)
            .html("<nav class='nav'>" +
                "<a class='nav-link active' onclick='addBrush(this);'  href='javascript:void(0);'>" +
                "<img src='img/Brush.png'> <p class='filter-text'> Brush</p>" + "</a>" +
                "<a class='nav-link active' onclick='clearBrush(this);'  href='javascript:void(0);'>" +
                "<img src='img/Un-Brush xD.png'>  <p class='filter-text'>Clear</p>" + "</a>" +
                "</nav>")
            .attr('style', 'left:' + (mouse[0] + 15) + 'px; top:' + (mouse[1] - 35) + 'px')
            .call(d3.drag().on("drag", dragged));

        // dragged function
        function dragged() {
            d3.select(this).attr('style', 'left:' + (d3.event.x) + 'px; top:' + (d3.event.y) + 'px');
        }
    } else {
        clearFilter.classed('hidden', false)
            .html("<nav class='nav'>" +
                "<a class='nav-link active' onclick='addBrush(this);'  href='javascript:void(0);'>" +
                "<img src='img/Brush.png'> <p class='filter-text'> Brush</p>" + "</a>" +
                "<a class='nav-link active' onclick='clearBrush(this);'  href='javascript:void(0);'>" +
                "<img src='img/Un-Brush xD.png'>  <p class='filter-text'>Clear</p>" + "</a>" +
                "</nav>")
            .attr('style', 'left:' + '20' + 'px; top:' + '70' + 'px')
    }
};

// hide Filter tool bar
function hideClearFilter() {
    // Show the tooltip (unhide it) and set the name of the data entry.
    clearFilter.classed('hidden', true);
}

function clearBrush() {
    g.select(".brushT").remove();

    if (flag_s == true) {
        drawScatter(contained_points);
        g.selectAll("circle").style("fill", "red");
    } else {
        drawScatter(filtered_data);
        g.selectAll("circle").style("fill", "red");
    }
}

function addBrush() {
    if (flag_s == false) {
        g.append("g")
            .attr("class", "brushT")
            .call(brushmap);
    } else {
        g.append("g")
            .attr("class", "brushT")
            .call(brushmap2);
    }
}

$(".continentValue").change(function () {
    datafilter();
});

$("#var-select").change(function () {
    datafilter();
});

function getContinentCheckBox() {
    continentSliderValues = [];

    var inputElements = document.getElementsByClassName('continentValue');
    for (var i = 0; inputElements[i]; ++i) {
        if (inputElements[i].checked) {
            continentSliderValues.push(inputElements[i].value);
        }
    }
}

function Knn(d) {
    // addList(false);
    var koora = d;
    // console.log(koora);
    dataTable = [];
    dataT = [];
    var k = 6,

        mouse = {
            x: d3.mouse(this)[0],
            y: d3.mouse(this)[1],
            c: koora.Y3,
            di: koora.Y4,
            e: koora.Y5,
            f: koora.Y6
        };

    knn = find_knn(mouse, k);
    // console.log(mouse);

    //remove old lines 
    focus.selectAll(".knnline").remove()
    //draw lines to nearest neighbours
    for (i = 0; i < knn.length; i++) {
        p = knn[i];
        dataT.push(p.name);

        focus.append("line")
            .attr('class', 'knnline')
            .attr("x1", p.x)
            .attr("y1", p.y)
            .attr("x2", p.x)
            .attr("y2", p.y)
            .transition()
            .duration(1000)
            .attr("x2", mouse.x)
            .attr("y2", mouse.y)
    }
    dataT1 = filtered_data.filter(function (d) {
        return (d.university_name == dataT[0] || d.university_name == dataT[1] ||
            d.university_name == dataT[2] || d.university_name == dataT[3] ||
            d.university_name == dataT[4] || d.university_name == dataT[5]);

    })
    // dataTable.push(dataT);

    console.log(dataT)
    tablefn(dataT1);
    // addList();

    // added today 
    RadarChart(".radarChart", dataT1, radarChartOptions);

    lineChart(dataT1);


}


function find_knn(mouse, k) { // return array of the k-nearest-neiboorghs
    var array_points = [];

    filtered_data.forEach(
        function (d) {

            array_points.push({
                x: x_scatter(d.Y1),
                y: y_scatter(d.Y2),
                name: d.university_name,
                distance: metrics(d, mouse)
            })
        }
    )
    // console.log(array_points)

    array_points = array_points.sort(function (a, b) {
        return a.distance - b.distance
    });
    // console.log(array_points)
    return array_points.slice(0, k)
}

metrics = function (d, mouse) {
    if (d.university_name == "Zhejiang University") {
        // console.log(d.Y3)
        // console.log(mouse.c)
        // console.log(d.Y3 - mouse.c)
        var c = Math.pow((d.Y3) - mouse.c, 2);
        console.log(c)
    }
    var a = Math.pow(x_scatter(d.Y1) - mouse.x, 2);
    var b = Math.pow(y_scatter(d.Y2) - mouse.y, 2);
    var c = Math.pow(d.Y3 - mouse.c, 2);
    var di = Math.pow(d.Y4 - mouse.di, 2);
    var e = Math.pow(d.Y5 - mouse.e, 2);
    var f = Math.pow(d.Y6 - mouse.f, 2);
    return (a + b + c + di + e + f)
}




////////////////////////////////////////////////////////////// table //////////////////////////////////////////////////////

// draw the table of universities
function tablefn(data) {
    d3.selectAll(".table-remove").remove();
    d3.selectAll(".legend_table").remove();
    // $(".html_table").hide();
    $(".html_table").css("display", "none");

    var table = d3.select(".four")
        .append("table")
        .attr("class", "fixed_header")
        .attr("class", "table-remove")
        .attr("transform", "translate(300px,300px)")



    thead = table.append("thead").attr("class", "thead")
    tbody = table.append("tbody").attr("class", "tbody")


    // filter year
    // Get every column value    
    var columns = Object.keys(data[0])
        .filter(function (d) {
            return ((d != "year" && d != "lat" && d != "lon" && d != "Y1" && d != "Y2" &&
                d != "international_ratio" && d != "female_ratio" &&
                d != "male_ratio" &&
                d != "income" && d != "international_students" && d != "total_score"
                && d != "Y3" && d != "Y4" && d != "Y5" && d != "Y6"
            ));
        });

    var header = thead.append("tr")
        .selectAll("th")
        .data(columns)
        .enter()
        .append("th")
        .attr("class", "td")
        .text(function (d) {
            if (d == "world_rank") {
                return "WR";
            }
            if (d == "university_name") {
                return "Name";
            }
            if (d == "country") {
                return "CN";
            }
            if (d == "teaching") {
                return "T";
            }
            if (d == "international") {
                return "I";
            }
            if (d == "research") {
                return "R";
            }
            if (d == "citations") {
                return "C";
            }
            if (d == "income") {
                return "$";
            }
            if (d == "total_score") {
                return "S";
            }
            if (d == "num_students") {
                return "N";
            }
            if (d == "student_staff_ratio") {
                return "SSR";
            }
            if (d == "international_students") {
                return "I%";
            }
            if (d == "continent") {
                return "Continent";
            }

            if (d == "cost_of_living") {
                return "C$";
            }
            return d;
        })
        .on("click", function (d) {
            if (d == "State") {
                rows.sort(function (a, b) {
                    if (a[d] < b[d]) {
                        return -1;
                    }
                    if (a[d] > b[d]) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
            } else if (d.split(" ")[0] == "Percent") {
                rows.sort(function (a, b) {
                    return +b[d].split("%")[0] - +a[d].split("%")[0];
                });
            } else {
                rows.sort(function (a, b) {
                    return b[d] - a[d];
                })
            }
        });

    var rows = tbody.selectAll("tr")
        .data(data)
        .enter()
        .append("tr")
        //.style("height","fit-content")
        .on("mouseover", function (d) {
            d3.select(this)
                .style("background-color", "lightblue");
        })
        .on("mouseout", function (d) {
            d3.select(this)
                .style("background-color", "transparent");
        });

    var cells = rows.selectAll("td")
        .data(function (row) {
            return columns.map(function (d, i) {
                return {
                    i: d,
                    value: row[d]
                };
            });
        })
        .enter()
        .append("td")
        .attr("class", "td")
        .html(function (d) {
            return d.value;
        });

        var list = d3.select(".four")
        .append("ul")

        // select the svg area

list.attr("class", "legend_table")
// Handmade legend

list.append("text").attr("x", 220).attr("y", 130).text("WR: World rank").style("font-size", "10px").style("font-weight", "bold").style("margin-left","4px").attr("alignment-baseline","middle")
list.append("text").attr("x", 220).attr("y", 160).text("T: Teaching").style("font-size", "10px").style("font-weight", "bold").style("margin-left","4px").attr("alignment-baseline","middle")
list.append("text").attr("x", 220).attr("y", 160).text("I: International").style("font-size", "10px").style("font-weight", "bold").style("margin-left","4px").attr("alignment-baseline","middle")
list.append("text").attr("x", 220).attr("y", 160).text(" R: Reasearch").style("font-size", "10px").style("font-weight", "bold").style("margin-left","4px").attr("alignment-baseline","middle")
list.append("text").attr("x", 220).attr("y", 160).text("C: Citations").style("font-size", "10px").style("font-weight", "bold").style("margin-left","4px").attr("alignment-baseline","middle")
list.append("text").attr("x", 220).attr("y", 160).text("N: Number of students").style("font-size", "10px").style("font-weight", "bold").style("margin-left","4px").attr("alignment-baseline","middle")
list.append("text").attr("x", 220).attr("y", 160).text("SSR: Student staff ratio").style("font-size", "10px").style("font-weight", "bold").style("margin-left","4px").attr("alignment-baseline","middle")
list.append("text").attr("x", 220).attr("y", 160).text("C$: Cost Of Living").style("font-size", "10px").style("font-weight", "bold").style("margin-left","4px").attr("alignment-baseline","middle")
}