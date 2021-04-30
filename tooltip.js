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
    .attr("y", 10);
  let employment = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 30);
  let income = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 50);
  let literacy = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 70);
  let highschool = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 90);
  let college = tooltip.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 110);

  let momesh = map.append("path")
    .attr("class", "mouseover_outline")
    .attr("d", "");

  d3.selectAll(".selected_counties").on("mouseenter", mouseEntersPlot);
  d3.selectAll(".selected_counties").on("mouseout", mouseLeavesPlot);

  function mouseEntersPlot() {
    tooltip1 = d3.select(this.parentNode).select("#tooltip")

    tooltip1.style("visibility", "visible")

    let county = d3.select(this);
    let countyID = county.datum().id;

    name.text(data[Number(countyID)]["county_name"] + ", " + data[Number(countyID)]["state"])
    employment.text((data[Number(countyID)]["employment_rate"] * 100).toString() + "% employed");
    income.text("Median Household Income" + data[Number(countyID)]["income"]);
    literacy.text((data[Number(countyID)]["literacy"] * 100).toString() + "% at Level 3 literacy");
    college.text(data[Number(countyID)]["college"] + "% have bachelor's degrees");
    highschool.text(data[Number(countyID)]["high_school"] + "% graduated high school");

    var state_projection = d3.geoAlbersUsa().scale(1).translate([0, 0]);
    state_path = d3.geoPath().projection(state_projection);
    let bounds = state_path.bounds(county.datum());
    let xPos = (bounds[0][0] + bounds[1][0]) / 2.0;
    let yPos = bounds[1][1];

    var mo = topojson.mesh(us, us.objects.counties, function (a, b) { return a.id === countyID || b.id === countyID });
    momesh.datum(mo).attr("d", state_path)

    console.log(mo)

    tooltip1.attr("transform", `translate(${xPos},${yPos})`);
  }

  function mouseLeavesPlot() {
    d3.select(this.parentNode).select("#tooltip").style("visibility", "hidden");
    momesh.attr("d", "");
  }
}