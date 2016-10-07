function pieChart(elementId, data, width, height){
  // Defaults.
  width = typeof width !== 'undefined' ? width : 250;
  height = typeof height !== 'undefined' ? height : 200;
  // Calculate the radius.
  var radius = Math.min(width, height) / 2.25; // Need room for the labels.

  // Grab the color for the line container.
  var color = $(".pie-chart-container").css('color');
  var colors = [];
  // Add the color to each data item.
  for (var i = 0; i < data.length; i++){
      var tempColor = rgbToHex(lightenRgb(color, 100, ((100/data.length)*i)));
      colors.push(tempColor);
  }

  // Create the pie.
  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0);

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(dataItem) { return dataItem.value; });

  var svg = d3.select(elementId).append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var g = svg.selectAll(".arc")
      .data(pie(data))
      .enter().append("g")
      .attr("class", "arc");

  g.append("path")
      .attr("d", arc)
      .style("fill", function(d) { return colors[d.data.index]; });

  g.append("text")
      .attr("transform", function(d) {
        var position = arc.centroid(d);
        position[0] *= 2.6;
        position[1] *= 2.6;
        return "translate(" + position + ")";
      })
      .attr("dy", ".35em")
      .style("text-anchor", "middle")
      .text(function(d) { return d.data.name; });

    /*var lines = d3.select("g.arc")
                  .append("svg:line")
                    .attr("x1", 0)
                    .attr("x2", 0)
                    .attr("y1", function(d){
                      if(d.value > threshold){
                        return -that.r-3;
                      }else{
                        return -that.r;
                      }
                    })
                    .attr("y2", function(d){
                      if(d.value > threshold){
                        return -that.r-8;
                      }
                      else{                 
                        return -that.r;
                      }
                    })
                    .attr("stroke", "gray")
                    .attr("transform", function(d) {
                        return "rotate(" + (d.startAngle+d.endAngle)/2 * (180/Math.PI) + ")";
                    });*/
}