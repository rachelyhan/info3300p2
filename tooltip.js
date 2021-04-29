function add_tooltip(element_id, state_path, data) {
  let tooltipWidth = 300;
  let tooltipHeight = 135;
  const map = d3.select(element_id);

  let tooltip = map.append("g")
    .attr("class", "tooltip")
    .style("visibility", "hidden")

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
    .attr("class", "mouseover outline")
    .attr("d", "");

  d3.selectAll(".selected_counties").on("mouseenter", mouseEntersPlot);
  d3.selectAll(".selected_counties").on("mouseout", mouseLeavesPlot);

  function mouseEntersPlot() {
    tooltip.style("visibility", "visible")
    let county = d3.select(this);
    let countyID = county.datum().id;

    name.text(data[Number(countyID)]["county_name"] + ", " + data[Number(countyID)]["state"])
    employment.text((data[Number(countyID)]["employment_rate"] * 100).toString() + "% employed");
    income.text("Median Household Income" + data[Number(countyID)]["income"]);
    literacy.text((data[Number(countyID)]["literacy"] * 100).toString() + "% at Level 3 literacy");
    college.text(data[Number(countyID)]["college"] + "% have bachelor's degrees");
    highschool.text(data[Number(countyID)]["high_school"] + "% graduated high school");

    let bounds = state_path.bounds(county.datum());   // Get the pixel boundaries of the county
    let xPos = (bounds[0][0] + bounds[1][0]) / 2.0;
    let yPos = bounds[1][1];

    if (yPos + tooltipHeight > d3.select(element_id).attr("height")) {
      console.log("yes")
      yPos = 100
    }

    if (xPos - tooltipWidth / 2 < 0) {
      xPos = d3.select(element_id).attr("width") - tooltipWidth / 2 - 100
    } else if (xPos + tooltipWidth / 2 > d3.select(element_id).attr("width")) {
      xPos = tooltipWidth
    }

    tooltip.attr("transform", `translate(${xPos},${yPos})`);
  }

  function mouseLeavesPlot() {
    tooltip.style("visibility", "hidden");
    momesh.attr("d", "");
  }
}