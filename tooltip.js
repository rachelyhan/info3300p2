function add_tooltip(element_id, state_path, data, us) {
  let tooltipWidth = 300;
  let tooltipHeight = 135;
  const map = d3.select(element_id);

  let tooltip = map.append("g")
    .attr("class", "tooltip")
    .style("visibility", "hidden")
    .attr("id", "tooltip")

  tooltip.append("rect")
    .attr("fill", "black")
    .attr("opacity", 0.9)
    .attr("x", -tooltipWidth / 2.0)
    .attr("y", 0)
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight)

  let name = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 10)
    .attr("id", "name")
  let employment = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 30)
    .attr("id", "employment")
  let income = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 50)
    .attr("id", "income")
  let literacy = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 70)
    .attr("id", "literacy")
  let highschool = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 90)
    .attr("id", "highschool")
  let college = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 110)
    .attr("id", "college")

  d3.selectAll(".selected_counties").on("mouseenter", mouseEntersPlot);
  d3.selectAll(".selected_counties").on("mouseout", mouseLeavesPlot);

  function mouseEntersPlot() {
    const svg = d3.select(this.parentNode.parentNode)
    tooltip1 = svg.select("#tooltip")
    let county = d3.select(this);
    let countyID = county.datum().id;

    tooltip1.style("visibility", "visible")

    svg.select("#name").text(data[Number(countyID)]["county_name"] + ", " + data[Number(countyID)]["state"])
    svg.select("#employment").text((data[Number(countyID)]["employment_rate"] * 100).toString() + "% employed");
    svg.select("#income").text("Median Household Income" + data[Number(countyID)]["income"]);
    svg.select("#literacy").text((data[Number(countyID)]["literacy"] * 100).toString() + "% at Level 3 literacy");
    svg.select("#college").text(data[Number(countyID)]["college"] + "% have bachelor's degrees");
    svg.select("#highschool").text(data[Number(countyID)]["high_school"] + "% graduated high school");

    var state_projection = d3.geoAlbersUsa().scale(1).translate([0, 0]);
    state_path = d3.geoPath().projection(state_projection);

    var states = topojson.feature(us, us.objects.states)
    const state_width = svg.attr("width") - 200
    const state_height = svg.attr("height") - 200

    selected_state = states.features.filter(function (d) {
      return d.id === countyID.substring(0, 2);
    });

    var bounds = state_path.bounds(selected_state[0]);
    var state_x_difference = bounds[1][0] - bounds[0][0];
    var state_y_difference = bounds[1][1] - bounds[0][1];
    var state_x_sum = bounds[1][0] + bounds[0][0];
    var state_y_sum = bounds[1][1] + bounds[0][1];

    var state_scale = 0.95 / Math.max(state_x_difference / state_width, state_y_difference / state_height);
    var state_translate = [(state_width - state_scale * state_x_sum) / 2, (state_height - state_scale * state_y_sum) / 2];

    state_projection.scale(state_scale)
      .translate(state_translate);

    bounds = state_path.bounds(county.datum());
    let xPos = (bounds[0][0] + bounds[1][0]) / 2.0;
    let yPos = bounds[1][1];

    var mo = topojson.mesh(us, us.objects.counties, function (a, b) { return a.id === countyID || b.id === countyID });
    svg.select("#momesh").datum(mo).attr("d", state_path)

    tooltip1.attr("transform", `translate(${xPos + 100},${yPos + 100})`);
  }

  function mouseLeavesPlot() {
    const svg = d3.select(this.parentNode.parentNode)
    tooltip1 = svg.select("#tooltip").style("visibility", "hidden");
    svg.select("#momesh").attr("d", "");
  }
}