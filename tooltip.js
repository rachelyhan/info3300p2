//CREATES AND UPDATES TOOLTIPS FOR STATE MAPS

function add_tooltip(element_id, data, us) {
  const tooltipWidth = 300;
  const tooltipHeight = 135;
  let svg = d3.select(element_id);

  let tooltip = svg.append("g")
    .attr("class", "tooltip")
    .style("visibility", "hidden")
    .attr("id", "tooltip")

  tooltip.append("rect")
    .attr("fill", "white")
    .attr("opacity", 0.9)
    .attr("rx", "15")
    .attr("stroke", "grey")
    .attr("stroke-width", "1px")
    .attr("x", -tooltipWidth / 2.0)
    .attr("y", 0)
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight)

  //text
  const attributes = ["name", "employment", "income", "literacy", "college", "highschool"]
  var y = 10

  attributes.forEach((d) => {
    tooltip.append("text")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "hanging")
      .attr("x", 0)
      .attr("y", y)
      .attr("id", d)

    y += 20
  })

  d3.selectAll(".selected_counties").on("mouseenter", mouseEntersPlot);
  d3.selectAll(".selected_counties").on("mouseout", mouseLeavesPlot);



  function mouseEntersPlot() {
    const svg = d3.select(this.parentNode.parentNode)
    tooltip = svg.select("#tooltip")
    let county = d3.select(this).datum();
    let countyID = county.id;

    //calculating translation and scale for tooltip placement
    var states = topojson.feature(us, us.objects.states);
    const state_width = svg.attr("width")
    const state_height = svg.attr("height") - 150
    selected_state = states.features.filter(function (d) {
      return d.id === countyID.substring(0, 2);
    });

    var state_projection = d3.geoAlbersUsa().scale(1).translate([0, 0]);
    var state_path = d3.geoPath().projection(state_projection);

    var bounds = state_path.bounds(selected_state[0]);
    var state_x_difference = bounds[1][0] - bounds[0][0];
    var state_y_difference = bounds[1][1] - bounds[0][1];
    var state_x_sum = bounds[1][0] + bounds[0][0];
    var state_y_sum = bounds[1][1] + bounds[0][1];
    var state_scale = 0.95 / Math.max(state_x_difference / state_width, state_y_difference / state_height);
    var state_translate = [(state_width - state_scale * state_x_sum) / 2, (state_height - state_scale * state_y_sum) / 2];

    state_projection.scale(state_scale)
      .translate(state_translate);

    bounds = state_path.bounds(county);
    let xPos = (bounds[0][0] + bounds[1][0]) / 2.0
    let yPos = bounds[1][1] + 50

    if (xPos + tooltipWidth / 2 > state_width) {
      xPos = (bounds[0][0] - tooltipWidth / 2)
    } else if (xPos - tooltipWidth / 2 < 0) {
      xPos = bounds[0][0] + tooltipWidth / 2
    }

    if (yPos + tooltipHeight > state_height + 80) {
      yPos = bounds[1][1] - tooltipHeight
    }

    //highlight outline
    var mo = topojson.mesh(us, us.objects.counties, function (a, b) { return a.id === countyID || b.id === countyID });
    svg.select("#momesh").datum(mo).attr("d", state_path)

    //update and show tooltip
    tooltip.style("visibility", "visible")
    tooltip.attr("transform", `translate(${xPos},${yPos})`);

    svg.select("#name").text("County: " + data[Number(countyID)]["county_name"] + ", " + data[Number(countyID)]["state_abbreviation"])
    svg.select("#employment").text("Employment Rate: " + Math.round(data[Number(countyID)]["employment_rate"] * 100).toString() + "%");
    svg.select("#income").text("Median Household Income: " + data[Number(countyID)]["income"].toString());
    svg.select("#literacy").text("Pop. % at Level 3 Literacy: " + Math.round((data[Number(countyID)]["literacy"] * 100).toString()) + "%");
    svg.select("#college").text("Pop. % with Bachelors' Degrees: " + Math.round(data[Number(countyID)]["college"]) + "%");
    svg.select("#highschool").text("Pop. % of High School Graduates: " + Math.round(data[Number(countyID)]["high_school"]) + "%");
  }

  function mouseLeavesPlot() {
    const svg = d3.select(this.parentNode.parentNode)
    tooltip = svg.select("#tooltip").style("visibility", "hidden");
    svg.select("#momesh").attr("d", "");
  }
}