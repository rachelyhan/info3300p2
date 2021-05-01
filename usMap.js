// DRAWS US MAP IN VISUALIZATION 2, AND CREATES HOVER TOOLTIP FOR IT

const colorsArray2 = ["lightgrey", "cyan"];
const colorScale2 = d3.scaleQuantize()
  .domain([0, 1])
  .range(colorsArray2);

var filters = {};

//returns true if county fulfills all filter criteria
function matchCounties(county, data) {
  var pass = true
  Object.values(filters).forEach(filterFunc => {
    pass = pass && filterFunc(data[Number(county)]);
  });
  return pass
};

//updates colors for counties
function updateUS(counties, us_path, data) {
  us_svg.selectAll("path.counties").data(counties.features)
    .join("path")
    .attr("class", "counties")
    .attr("d", us_path)
    .attr("fill", d => colorScale2(Number(matchCounties(d.id, data))));
}

//draws US map
function drawUS(counties, us_path, statesMesh, data, county_id, us) {
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  // const mapWidth = us_svg.attr("width") - margin.left - margin.right;
  // const mapHeight = us_svg.attr("height") - margin.top - margin.bottom;
  const map = us_svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  map.selectAll("path.counties").data(counties.features)
    .join("path")
    .attr("class", "counties")
    .attr("d", us_path)
    .attr("fill", d => colorScale2(Number(matchCounties(d.id, data))));
  map.append("path").datum(statesMesh)
    .attr("class", "outline")
    .attr("d", us_path);

  let momesh = map.append("path")
    .attr("class", "select_outline")
    .attr("d", "");

  map.append("path")
    .attr("class", "mouseover_outline")
    .attr("d", "")
    .attr("id", "momesh")

  var state_projection = d3.geoAlbersUsa().scale(1).translate([0, 0]);
  var state_path = d3.geoPath().projection(state_projection);

  var mo = topojson.mesh(us, us.objects.counties, function (a, b) { return a.id === county_id.toString() || b.id === county_id.toString(); });
  momesh.datum(mo).attr("d", state_path)
  console.log(mo)
}

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


  // const defaultSelection = [Math.max(0, select_value - minMax[1] * 0.1), Math.min(minMax[1], select_value + minMax[1] * 0.1)]
  // console.log(defaultSelection)

  // wrapper.append("div").text(defaultSelection[0].toString() + " - " + defaultSelection[1].toString())
  //   .attr("id", "values");

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

      // d3.select(this.parentNode.parentNode).select("#values").text(start.toString() + " - " + end.toString())
    }
    else {
      let filterFunc = d => true;
      filters[attribute] = filterFunc;
      // d3.select(this.parentNode.parentNode).select("#values").text("No Filter")
      // console.log(filters[attribute])
    }
    updateUS(counties, us_path, data)
  }
  canvas.append("g").attr("class", "brush").call(brush)
  // .call(brush.move, defaultSelection);
}

function usTooltip(data, us) {
  const tooltipWidth = 300;
  const tooltipHeight = 135;
  let svg = d3.select("#us_map");

  let tooltip = svg.append("g")
    .attr("class", "us_tooltip")
    .style("visibility", "hidden")
    .attr("id", "tooltip")

  tooltip.append("rect")
    .attr("fill", "black")
    .attr("opacity", 0.9)
    .attr("x", -tooltipWidth / 2.0)
    .attr("y", 0)
    .attr("width", tooltipWidth)
    .attr("height", tooltipHeight)

  //text
  const attributes = ["name", "employment", "income", "literacy", "college", "highschool"]
  var y = 10

  attributes.forEach((d) => {
    tooltip.append("text")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "hanging")
      .attr("x", 0)
      .attr("y", y)
      .attr("id", d)

    y += 20
  })

  d3.selectAll(".counties").on("mouseenter", mouseEntersPlot);
  d3.selectAll(".counties").on("mouseout", mouseLeavesPlot);



  function mouseEntersPlot() {
    const svg = d3.select(this.parentNode.parentNode)
    tooltip = svg.select("#tooltip")
    let county = d3.select(this).datum();
    let countyID = county.id;

    //calculating translation and scale for tooltip placement
    var states = topojson.feature(us, us.objects.states)
    selected_state = states.features.filter(function (d) {
      return d.id === countyID.substring(0, 2);
    });

    var state_projection = d3.geoAlbersUsa().scale(1).translate([0, 0]);
    var state_path = d3.geoPath().projection(state_projection);

    bounds = state_path.bounds(selected_state[0]);
    var state_scale = 1300
    var state_translate = [487.5 + (bounds[0][0]) / 2, 400 + (bounds[0][1]) / 2];

    state_projection.scale(state_scale)
      .translate(state_translate);
    state_projection.translate(state_translate);

    bounds = state_path.bounds(county);
    let xPos = (bounds[0][0] + bounds[1][0]) / 2.0;
    let yPos = bounds[1][1];

    //highlight outline
    var mo = topojson.mesh(us, us.objects.counties, function (a, b) { return a.id === countyID || b.id === countyID });
    svg.select("#momesh").datum(mo).attr("d", state_path)

    //update and show tooltip
    tooltip.style("visibility", "visible")
    tooltip.attr("transform", `translate(${xPos},${yPos})`);

    svg.select("#name").text(data[Number(countyID)]["county_name"] + ", " + data[Number(countyID)]["state"])
    svg.select("#employment").text((data[Number(countyID)]["employment_rate"] * 100).toString() + "% employed");
    svg.select("#income").text("Median Household Income" + data[Number(countyID)]["income"]);
    svg.select("#literacy").text((data[Number(countyID)]["literacy"] * 100).toString() + "% at Level 3 literacy");
    svg.select("#college").text(data[Number(countyID)]["college"] + "% have bachelor's degrees");
    svg.select("#highschool").text(data[Number(countyID)]["high_school"] + "% graduated high school");
  }



  function mouseLeavesPlot() {
    const svg = d3.select(this.parentNode.parentNode)
    tooltip = svg.select("#tooltip").style("visibility", "hidden");
    svg.select("#momesh").attr("d", "");
  }
}