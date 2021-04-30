// PART 2: US MAP WITH COUNTIES WITH UNEMPLOYMENT RATE (Rachel and Crystal)

const colorsArray2 = ["lightgrey", "cyan"];
const colorScale2 = d3.scaleQuantize()
  .domain([0, 1])
  .range(colorsArray2);

function updateUS(counties, us_path, statesMesh, match) {
  us_svg.selectAll("path.counties").data(counties.features)
    .join("path")
    .attr("class", "counties")
    .attr("d", us_path)
    .attr("fill", d => colorScale2(Number(match.includes(d.id))));
}

function drawUS(counties, us_path, statesMesh, match) {
  us_svg.selectAll("path.counties").data(counties.features)
    .join("path")
    .attr("class", "counties")
    .attr("d", us_path)
    .attr("fill", d => colorScale2(Number(match.includes(d.id))));
  us_svg.append("path").datum(statesMesh)
    .attr("class", "outline")
    .attr("d", us_path);

  // usTooltip(data)
}

var filters = {};

function matchCounties() {
  match = []
  Object.keys(data).forEach((county) => {
    let pass = true
    Object.values(filters).forEach(filterFunc => {
      pass = pass && filterFunc(data[county]);
    });
    if (pass) {
      match.push(county)
    }
  });
  console.log(match)
  return match
};

function getFilters() {
  return filters
};

function makeSlider(container, label, attribute, sliderHeight, sliderWidth, counties, us_path, statesMesh, selected_county, data) {
  let values = []
  let format = d3.format(".0%")
  Object.keys(data).forEach((county) => {
    let value = data[county][attribute]
    if (attribute === "college" || attribute === "high_school") {
      value /= 100
    } else if (attribute === "income") {
      value *= 1000
      format = d3.format("$.2s")
    }
    values.push(value);
  });

  let minMax = d3.extent(values);
  let xScale = d3.scaleLinear().domain(minMax).range([10, sliderWidth - 10]);
  let xAxis = d3.axisBottom(xScale).tickFormat(format);

  //set default brush 
  let select_value = data[selected_county][attribute]
  if (attribute === "college" || attribute === "high_school") {
    select_value /= 100
  } else if (attribute === "income") {
    select_value *= 1000
  }

  let wrapper = container.append("div").attr("class", "control");
  wrapper.append("div").text(label);
  let canvas = wrapper.append("svg").attr("width", sliderWidth)
    .attr("height", sliderHeight + 40)
    .attr("attribute", attribute);
  let areaLayer = canvas.append("g");
  canvas.append("g").attr("transform", `translate(0,${sliderHeight})`)
    .call(xAxis);
  canvas.append("rect").attr("transform", `translate(${xScale(select_value)}, 0)`)
    .attr("width", 2)
    .attr("height", sliderHeight)
    .attr("fill", "red")

  let numBins = 15;
  let histoGen = d3.histogram().domain(minMax)
    .thresholds(numBins);
  let counts = histoGen(values);

  counts.unshift({
    x0: 0,
    x1: counts[0].x0,
    length: counts[0].length
  });

  let yScale = d3.scaleLinear().domain(d3.extent(counts, d => d.length))
    .range([sliderHeight, 4]);

  let area = d3.area().x(d => xScale(d.x1))
    .y0(yScale(0))
    .y1(d => yScale(d.length))
    .curve(d3.curveNatural);
  areaLayer.append("path").datum(counts)
    .attr("class", "area")
    .attr("d", area);


  const defaultSelection = [Math.max(0, select_value - minMax[1] * 0.3), Math.min(minMax[1], select_value + minMax[1] * 0.3)]
  // console.log(defaultSelection)

  wrapper.append("div").text(defaultSelection[0].toString() + " - " + defaultSelection[1].toString())
    .attr("id", "values");

  let filterFunc = d => true;
  // let filterFunc = d => d[attribute] >= defaultSelection[0] && d[attribute] <= defaultSelection[1];
  filters[attribute] = filterFunc;

  var brush = d3.brushX().extent([[10, 0],
  [sliderWidth - 10, sliderHeight]])
    .on("brush end", brushMoved);

  function brushMoved(event) {
    if (event.selection !== null) {
      start = xScale.invert(event.selection[0]);
      end = xScale.invert(event.selection[1]);
      if (attribute === "college" || attribute === "high_school") {
        start *= 100
        end *= 100
      } else if (attribute === "income") {
        start /= 1000
        end /= 1000
      }
      let filterFunc = d => d[attribute] >= start && d[attribute] <= end;
      filters[attribute] = filterFunc;
      // console.log(filters[attribute], start, end)

      d3.select(this.parentNode.parentNode).select("#values").text(start.toString() + " - " + end.toString())
    }
    else {
      let filterFunc = d => true;
      filters[attribute] = filterFunc;
      d3.select(this.parentNode.parentNode).select("#values").text("No Filter")
      // console.log(filters[attribute])
    }
    updateUS(counties, us_path, statesMesh, matchCounties())
  }
  canvas.append("g").attr("class", "brush").call(brush)
    .call(brush.move, defaultSelection);

  // Object.values(filters).forEach(filterFunc => {
  //   // console.log(filters[attribute])
  // });
}

function usTooltip(data) {

  var state_projection = d3.geoAlbersUsa().scale(1).translate([0, 0]);
  var state_path = d3.geoPath().projection(state_projection);

  let tooltipWidth = 300;
  let tooltipHeight = 135;

  const map = d3.select("#us_map");

  let tooltip2 = map.append("g")
    .attr("class", "tooltip2")
    .style("visibility", "hidden")
    .attr("id", "tooltip2")

  tooltip2.append("rect")
    .attr("fill", "black")
    .attr("opacity", 0.9)
    .attr("x", -tooltipWidth / 2.0)
    .attr("y", 0)
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight)

  let name = tooltip2.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 10);
  let employment = tooltip2.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 30);
  let income = tooltip2.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 50);
  let literacy = tooltip2.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 70);
  let highschool = tooltip2.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 90);
  let college = tooltip2.append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "hanging")
    .attr("x", 0)
    .attr("y", 110);

  d3.select("tooltip").selectAll("text")

  let momesh = map.append("path")
    .attr("class", "mouseover outline")
    .attr("d", "");

  d3.selectAll(".selected_counties").on("mouseenter", mouseEntersPlot);
  d3.selectAll(".selected_counties").on("mouseout", mouseLeavesPlot);

  function mouseEntersPlot() {
    tooltip1 = d3.select(this.parentNode).select("#tooltip2")

    tooltip1.style("visibility", "visible")

    let county = d3.select(this);
    let countyID = county.datum().id;

    // console.log(countyID)
    // console.log(data[Number(countyID)]["state_path"]);
    // console.log(county.datum())

    name.text(data[Number(countyID)]["county_name"] + ", " + data[Number(countyID)]["state"])
    employment.text((data[Number(countyID)]["employment_rate"] * 100).toString() + "% employed");
    income.text("Median Household Income" + data[Number(countyID)]["income"]);
    literacy.text((data[Number(countyID)]["literacy"] * 100).toString() + "% at Level 3 literacy");
    college.text(data[Number(countyID)]["college"] + "% have bachelor's degrees");
    highschool.text(data[Number(countyID)]["high_school"] + "% graduated high school");

    // var state_projection = d3.geoAlbersUsa().scale(1).translate([0, 0]);
    // state_path = d3.geoPath().projection(state_projection);

    let bounds = state_path.bounds(county.datum());   // Get the pixel boundaries of the county
    let xPos = (bounds[0][0] + bounds[1][0]) / 2.0;
    let yPos = bounds[1][1];

    console.log(map)

    if (yPos + tooltipHeight > map.attr("height")) {
      yPos = 100
    }

    if (xPos - tooltipWidth / 2 < 0) {
      xPos = map.attr("width") - tooltipWidth / 2 - 100
    } else if (xPos + tooltipWidth / 2 > map.attr("width")) {
      xPos = tooltipWidth
    }

    tooltip1.attr("transform", `translate(${xPos},${yPos})`);
  }

  function mouseLeavesPlot() {
    d3.select(this.parentNode).select("#tooltip2").style("visibility", "hidden");
    momesh.attr("d", "");
  }
}