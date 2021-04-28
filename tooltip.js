function add_tooltip(element_id, us, state_path, states) {
  let tooltipWidth = 220;
  let tooltipHeight = 135;
  const map = d3.select(element_id);

  let tooltip = map.append("g")
    .attr("class", "tooltip")
    .attr("visibility", "hidden");
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
    let state = d3.select(this);

    let stateID = state.datum().id;
    var mo = topojson.mesh(us, us.objects.states, function (a, b) { return a.id === stateID || b.id === stateID; });
    momesh.datum(mo).attr("d", state_path)

    selected_state = states.features.filter(function (d) {
      return d.id === stateID;
    });

    console.log(state_path.bounds(selected_state[0]));

    name.text(data[Number(stateID)]["county_name"] + ", " + data[Number(stateID)]["state"])
    employment.text((data[Number(stateID)]["employment_rate"] * 100).toString() + "% employed");
    income.text("Median Household Income" + data[Number(stateID)]["income"]);
    literacy.text((data[Number(stateID)]["literacy"] * 100).toString() + "% at Level 3 literacy");
    college.text(data[Number(stateID)]["college"] + "% have bachelor's degrees");
    highschool.text(data[Number(stateID)]["high_school"] + "% graduated high school");

    let bounds = state_path.bounds(state.datum());   // Get the pixel boundaries of the state
    let xPos = (bounds[0][0] + bounds[1][0]) / 2.0;
    let yPos = bounds[1][1];

    tooltip.attr("transform", `translate(${xPos},${yPos})`);
  }

  function mouseLeavesPlot() {
    tooltip.style("visibility", "hidden");
    momesh.attr("d", "");
  }
}