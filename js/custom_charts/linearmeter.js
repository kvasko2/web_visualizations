/**
  @function: LinearMeter
  @description: Function to generate a d3 linearmeter with a linear meter and its backdrop.
  @param: element, DOMelement, The element to which the linearmeter will be attached.
  @param: data, Object, JSON describing the item's actual value and the total it could have.
                        Example data: {value:3, total:5}
  @param: baseColor, String, Hex value of the base color for this meter, which is the color seen when the meter is full.
  @param: width, integer, The desired width of the meter. Default value of 100.
  @param: height, integer, The desired height of the linearmeter. Default value of 25.
  @param: roundX, float, The desired amount to round the meter's corners on the x-axis. Default value of 2.
  @param: roundY, float, The desired amount to round the meter's corners on the y-axis. Default value of 2.
**/
function LinearMeter(element, data, baseColor, width, height, roundX, roundY) {
  // Default values.
  width = typeof width !== 'undefined' ? width : 100;
  height = typeof height !== 'undefined' ? height : 25;
  roundX = typeof roundX !== 'undefined' ? roundX : 5;
  roundY = typeof roundY !== 'undefined' ? roundY : 12.5;

  // Create the svg and attach it to the given element.
  var svg = d3.select(element)
              .append('svg')
              .attr('class', 'linearmeter')
              .attr('width', width)
              .attr('height', height)
              .append('g');


  // Draw the backdrop.
  svg.append('rect')
     .attr('class', 'linearmeter-backdrop')
     .attr('x', 0)
     .attr('y', 0)
     .attr('width', width)
     .attr('height', height)
     .attr('rx', roundX)
     .attr('ry', roundY);

  // Draw the metered value.
  // Calculate the percentage of the full width the meter covers.
  var percentCoverage = data.value/data.total;
  // Adjust color appropriately.
  var adjustedColor = lightenRgb(baseColor, 100, 100-(100*percentCoverage));

  svg.append('rect')
     .attr('class', 'linearmeter-meter')
     .style("fill", adjustedColor)
     .attr('x', 0)
     .attr('y', 0)
     .attr('width', Math.floor(width*percentCoverage))
     .attr('height', height)
     .attr('rx', roundX)
     .attr('ry', roundY);
}
