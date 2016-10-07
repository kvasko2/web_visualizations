/*
	@param: elementId, String, The id of the element to which the meter will be attached.
	@param: data, Object, JSON describing the active and pending items.
						  The pending items should be a list of the items, for the tooltip.
						  Example: {activeNum: 5, inactiveNum: 3}
	@param: meterTextList, Array, List with the desired content meter label. Default is empty.
						       Example: [
						       			 {text:"example1", class:"example1Class"},
						       			 {text:"example2", class:"example2Class"}
						       			]
	@param: tooltipContent, String, HTML string with the desired content for the tooltip. Default is empty string.
	@param: width, integer, The desired width of the chart. Default value of 200.
  	@param: height, integer, The desired height of the chart. Default value of 200.
*/
function DoughnutMeter(elementId, data, meterTextList, tooltipContent, width, height) {
	// Default values.
	width = typeof width !== 'undefined' ? width : 200;
	height = typeof height !== 'undefined' ? height : 200;
	tooltipContent = typeof tooltipContent !== 'undefined' ? tooltipContent : "";
	meterText = typeof meterText !== 'undefined' ? meterText : [];

	// Determine the total.
	var total = data.activeNum + data.inactiveNum;

	// Calculate the radius of the outer extent of the doughnut (based on which is the minimum).
	var radius = Math.min(width, height)/2;

	// Set the layout to be a pie.
	var pie = d3.layout.pie().sort(null);

	// Setup the path description as an arc with a hole in the middle.
	var meterArc = d3.svg.arc()
						 .innerRadius(radius*.85)
						 .outerRadius(radius);

	// Create the SVG.
	var svg = d3.select(elementId)
				.append("svg")
				.attr("class", "doughnut-meter")
				.attr("width", width)
				.attr("height", height)
				.append("g")
				.attr("transform", "translate("+width/2+","+height/2+")");

	// Create the path.
	var path = svg.selectAll("path")
				  .data(pie(calculatePercent(data.activeNum, total)))
				  .enter().append("path")
				  .attr("class", function(d, i){
				  	// For the first item (the metered value).
				  	if (i == 0){
				  		// Return a class of "doughnut-meter-meter".
				  		return "doughnut-meter-meter";
				  	}
				  	// Otherwise...
			  		// Return a class of "doughnut-meter-backdrop".
			  		return "doughnut-meter-backdrop";
				  })
				  .attr("d", meterArc) // Add the path description.
				  .each(function(d) {
				  	this._current = d;
				  });

	// Add a circles to the beginning and end of the meter.
	var distanceFromCenter = radius - (radius - (radius*.85))/2;
	var valueInRadians = calculateRadians(data.activeNum, total);

	// If the active number is greater than zero.
	if (data.activeNum > 0) {
		// Beginning circle.
		svg.append('circle')
			.attr('class', 'doughnut-meter-circle')
			.attr('cx', Math.cos(-0.5*Math.PI) * distanceFromCenter)
			.attr('cy', Math.sin(-0.5*Math.PI) * distanceFromCenter)
			.attr('r', (radius-(radius*.85))/2);
		// End circle.
		svg.append('circle')
			.attr('class', 'doughnut-meter-circle')
			.attr('cx', Math.cos(valueInRadians) * distanceFromCenter)
			.attr('cy', Math.sin(valueInRadians) * distanceFromCenter)
			.attr('r', (radius-(radius*.85))/2);
	}

	// Show the active value.
	svg.append("text")
	   .attr("class", "doughnut-meter-active-number")
	   .attr("y", 10)
	   .text(data.activeNum);
	// For each text item.
	for (var i = 0; i < meterTextList.length; i++) {
		svg.append("text")
		   .attr("class", meterTextList[i].class)
		   .attr("y", ((i+1)*20)+10)
		   .text(meterTextList[i].text);
	}

	// If the tooltip content is not empty.
	if (tooltipContent != ""){
		// Create a dummy div so that the tooltip only pops-up over the pending text.
		var dummy = $('<div>', {"class": "doughnut-meter-tooltip-dummy"});
		$(elementId).append(dummy);

		var offset = {top: -155, left: 30};

		var content = $.parseHTML(tooltipContent);

		Tooltip(dummy, "doughnut-meter", [content], offset);
	}
}

/**** Helper Functions ****/
function calculatePercent(value, maximum){
	// Prevent division by 0;
	if (maximum == 0){
		maximum = 1;
	}
	var percent = Math.floor((value/maximum)*100);
	return [percent, 100-percent];
}

function calculateRadians (value, maximum){
	// Prevent division by 0;
	if (maximum == 0){
		maximum = 1;
	}
	var fraction = Math.floor((value/maximum)*100)/100; // Doing the extra multiply 100 divide 100 to "lose" the same accuracy as during the calculate percent for the meter's extent.
	// Adjust to angles, and subtract 90, since the chart starts at normal 90 and the graph goes clock-wise.
	var angleInDegrees = (360 * fraction)-90;
	return (angleInDegrees*Math.PI)/180;
}
