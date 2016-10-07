function Tooltip(element, graphType, contentList, offset){
	offset = typeof offset !== 'undefined' ? offset : {top: -100, left: 50};

	// Container string (copied from an svg given by visual designers).
	var containerString = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 187.4 142.6" enable-background="new 0 0 187.4 142.6" xml:space="preserve"><polygon fill="#FFFFFF" points="0.5,0.5 0.5,134.7 28.4,134.7 32.8,142.1 37.3,134.7 186.9,134.7 186.9,0.5 "/><g><defs><rect id="SVGID_1_" x="0" y="0" width="187.4" height="142.6"/></defs><clipPath id="SVGID_2_"><use xlink:href="#SVGID_1_"  overflow="visible"/></clipPath><polygon clip-path="url(#SVGID_2_)" fill="none" stroke="#CBCBCB" stroke-linejoin="round" points="0.5,0.5 0.5,134.7 28.4,134.7 32.8,142.1 37.3,134.7 186.9,134.7 186.9,0.5 	"/></g></svg>';
	// Creating the tooltip visuals backwards.
	var tooltipContainer = $.parseHTML(containerString);
	// Create the tooltip's div with the appropriate class.
	var tooltipElement = $('<div>', {class:graphType+"-tooltip"});

	// Append the container to the tooltip.
	tooltipElement.append(tooltipContainer);

	// For any content passed.
	for (var i = 0; i < contentList.length; i++){
		tooltipElement.append(contentList[i]);
	}

	// Append the tooltip to the provided element.
	$('body').append(tooltipElement);//insertAfter(tooltipElement);

	// Add the mouse over and out event handlers.
	$(element).on('mouseover', function(){
		$('body').find("."+graphType+"-tooltip")
		       .addClass("visible-tooltip")
		       .css({top: $(element).offset().top+offset.top, left: $(element).offset().left+offset.left});
	});
	$(element).on('mouseout', function(){
		$('body').find("."+graphType+"-tooltip")
		       .removeClass("visible-tooltip");
	});
}

function TooltipAsString(graphType, contentList){
	// Container string (copied from an svg given by visual designers).
	var containerString = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 187.4 142.6" enable-background="new 0 0 187.4 142.6" xml:space="preserve"><polygon fill="#FFFFFF" points="0.5,0.5 0.5,134.7 28.4,134.7 32.8,142.1 37.3,134.7 186.9,134.7 186.9,0.5 "/><g><defs><rect id="SVGID_1_" x="0" y="0" width="187.4" height="142.6"/></defs><clipPath id="SVGID_2_"><use xlink:href="#SVGID_1_"  overflow="visible"/></clipPath><polygon clip-path="url(#SVGID_2_)" fill="none" stroke="#CBCBCB" stroke-linejoin="round" points="0.5,0.5 0.5,134.7 28.4,134.7 32.8,142.1 37.3,134.7 186.9,134.7 186.9,0.5 	"/></g></svg>';
	// Creating the tooltip visuals backwards.
	var tooltipContainer = $.parseHTML(containerString);
	// Create the tooltip's div with the appropriate class.
	var tooltipElement = $('<div>', {class:graphType+"-tooltip"});

	// Append the container to the tooltip.
	tooltipElement.append(tooltipContainer);

	// For any content passed.
	for (var i = 0; i < contentList.length; i++){
		tooltipElement.append(contentList[i]);
	}

	return tooltipElement.html();
}