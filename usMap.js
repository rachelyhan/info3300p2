// PART 2: US MAP WITH COUNTIES WITH UNEMPLOYMENT RATE (Rachel and Crystal)
const colorsArray2 = ["lightgrey", "cyan"];
const colorScale2 = d3.scaleQuantize()
  .domain([0, 1])
  .range(colorsArray2);

function drawUS(counties, us_path, statesMesh, match) {
  us_svg.selectAll("path.counties").data(counties.features)
    .join("path")
    .attr("class", "counties")
    .attr("d", us_path)
    .attr("fill", d => colorScale2(Number(match.includes(d.id))));
  us_svg.append("path").datum(statesMesh)
    .attr("class", "outline")
    .attr("d", us_path);
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
  return match
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

  const defaultSelection = [xScale(data[selected_county][attribute]) - xScale(minMax[1] * 0.1), xScale(data[selected_county][attribute]) + xScale(minMax[1] * 0.1)]
  console.log(defaultSelection)

  let wrapper = container.append("div").attr("class", "control");
  wrapper.append("div").text(label);
  let canvas = wrapper.append("svg").attr("width", sliderWidth)
    .attr("height", sliderHeight + 40)
    .attr("attribute", attribute);
  let areaLayer = canvas.append("g");
  canvas.append("g").attr("transform", `translate(0,${sliderHeight})`)
    .call(xAxis);

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

  let filterFunc = d => true;
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
      selectedCounties = matchCounties()
      drawUS(counties, us_path, statesMesh, matchCounties())
    }
    else {
      let filterFunc = d => true;
      filters[attribute] = filterFunc;
      drawUS(counties, us_path, statesMesh, matchCounties())
    }
  }
  canvas.append("g").attr("class", "brush").call(brush);
}