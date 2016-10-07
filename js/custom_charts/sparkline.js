/**
  @function: SparkLine
  @description: Function to generate a d3 sparkline with a line, backdrop, and circle endpoint.
  @param: element, DOMelement, The element to which the sparkline will be attached.
  @param: data, Object, JSON describing the utilization unit, label for the interval over which the data is reported,
                        the number of time intervals to evaluate (latest/newest and X number of time intervals before it),
                        and a data list which describes the total usage.
                        Example data: {unit:"gb", timeIntervalLabel:"day", numberOfIntervalsToEvaluateFromLatest: 30, data:[{x:53, y:0}, {x:75, y:1}, etc...]}
  @param: width, integer, The desired width of the sparkline. Default value of 100.
  @param: height, integer, The desired height of the sparkline. Default value of 25.
  @param: stroke, integer, The desired stroke, or thickness, of the line of the sparkline. Default value of 2.
  @param: circleRadius, float, The desired radius for the end-point circle. Default value of 3.
  @param: hasTooltip, boolean, Whether or not the sparkline has a tooltip.
**/

function SparkLine(element, data, width, height, stroke, circleRadius, hasTooltip) {
  // Default values.
  width = typeof width !== 'undefined' ? width : 100;
  height = typeof height !== 'undefined' ? height : 25;
  stroke = typeof stroke !== 'undefined' ? stroke : 2;
  circleRadius = typeof circleRadius !== 'undefined' ? circleRadius : 3;
  hasTooltip = typeof hasTooltip !== 'undefined' ? hasTooltip : true;

  // Trim down the data set to the desired amount.
  var trimmedData = data.data.slice(data.data.length-data.numberOfIntervalsToEvaluateFromLatest, data.data.length);

  // Height of backdrop (current "hardcoded").
  var backdropHeight = height * 3/7;

  // Setup the range of the coordinate system.
  var x = d3.scale.linear().range([circleRadius, width-circleRadius]);
  var y = d3.scale.linear().range([height-circleRadius, circleRadius]);

  var line = d3.svg.line()
               .interpolate("basis")
               .x(function(d) { return x(d.x); })
               .y(function(d) { return y(d.y); });

  x.domain(d3.extent(trimmedData, function(d) { return d.x; }));
  y.domain(d3.extent(trimmedData, function(d) { return d.y; }));

  // Create the svg and attach it to the given element.
  var svg = d3.select(element)
              .append('svg')
              .attr('class', 'sparkline')
              .attr('width', width)
              .attr('height', height)
              .append('g');

  // Create and attach the backdrop.
  svg.append('rect')
     .attr('class', 'sparkline-backdrop')
     .attr('x', circleRadius)
     .attr('y', (height-backdropHeight)/2)
     .attr('width', width-(circleRadius*2))
     .attr('height', backdropHeight);
  // Attach the line to the svg.
  svg.append('path')
     .datum(trimmedData)
     .attr('stroke-width', stroke)
     .attr('class', 'sparkline-line')
     .attr('d', line);
  // Create and attach the circle end-point.
  svg.append('circle')
     .attr('class', 'sparkline-circle')
     .attr('cx', x(data.data[data.data.length-1].x))
     .attr('cy', y(data.data[data.data.length-1].y))
     .attr('r', circleRadius);

  // If the sparkline has a tooltip.
  if (hasTooltip){
    // Total utilization and utilization over the given span.
    var total = 0, spanTotal = 0;
    // Calculate the total utilization.
    for (var i = 0; i < data.data.length; i++){
      // If in the desired reporting period.
      if (i < (data.data.length-1) && i >= (data.data.length - data.numberOfIntervalsToEvaluateFromLatest -1)){
        // Increase the span total.
        spanTotal += data.data[i].y;
      }
      // Increase the total.
      total += data.data[i].y;
    }
    // Create the title content for the tooltip.
    var title = $.parseHTML('<div class="tooltip-title">Utilization: '+total+data.unit+'</div>');

    // Construct the intended content for the tooltip.
    var content = $('<div>', {class:"tooltip-content"});
    // Strings to hold different content containers.
    var arrow = '<div class="utilization-arrow"></div>';
    var percentTotal = Math.floor((spanTotal/total)*100);
    var percentUtilization = '<div class="percent-utilization">'+percentTotal+'%</div>';
    var plainText = '<div class="plain-text">over '+data.numberOfIntervalsToEvaluateFromLatest+' '+data.timeIntervalLabel+'(s)</div>';
    var content = $.parseHTML('<div class="tooltip-content">'+arrow+percentUtilization+plainText+'</div>');

    // Offset.
    var offset = {top: -145, left: 62};

    // Add a tooltip.
    Tooltip(element, "sparkline", [title, content], offset);
  }
}