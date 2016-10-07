// Grid related Ids and Classes.
var widgetCanvasId = "#widget-canvas", widgetPaletteId = "#widget-palette";
var contentHeaderClass = ".content-header";

// Scaling variables.
var columnWidthPercent = 30.35;

/** Begin Grid initializing and refreshing functions. **/

function refreshWidgetGrid(gridIdOrClass, adjustedWidth){
    var newWidth;
    if (adjustedWidth == null){
        newWidth = (columnWidthPercent/100) * ($(gridIdOrClass).parent().width());
    } else {
        newWidth = adjustedWidth;
    }
    
    // Shapeshift the canvas.
    $(gridIdOrClass).shapeshift({
        minColumns: 3,
        colWidth: newWidth,
        minHeight: 280,
        autoHeight: true,
        columns: 3,
        gutterX: 20,
        gutterY: 20,
        enableResize: true
    });
}

function refreshContentHeader(adjustedWidth){
    var newWidth;
    if (adjustedWidth == null){
        newWidth = (columnWidthPercent/100) * ($(widgetCanvasId).parent().width());
    } else {
        newWidth = adjustedWidth;
    }
    
    // Shapeshift the canvas.
    $(contentHeaderClass).shapeshift({
        minColumns: 3,
        colWidth: newWidth,
        enableDrag: false,
        minHeight: 50,
        columns: 3,
        gutterX: 20,
        gutterY: 20
    });
}

function refreshGrid() {
    var adjustedWidth = (columnWidthPercent/100) * ($("#widget-canvas").parent().width());
    
    // Refresh the canvas.
    refreshWidgetGrid(widgetCanvasId, adjustedWidth);
    // Refresh the palette.
    refreshWidgetGrid(widgetPaletteId, adjustedWidth);
    // Refresh the content header.
    refreshContentHeader(adjustedWidth);
};
/** End Grid initializing and refreshing functions. **/

$(document).ready(function() {
    // For each expandable widget.
    $(this).find(".expandable-widget").each(function() {
        // Grab what should be the height of the widget body (that of its content).
        var newBodyHeight = $(this).find(".widget-body").children().first().height();
        // Set the height of the widget body to this content height.
        $(this).find(".widget-body").height(newBodyHeight);
    });

    refreshGrid();
});

$(window).resize(function(){
    refreshGrid();
});

$("#widget-canvas").on("widgetResize", function(event, sourceElement) {
    // Set the height of the object.
    sourceElement.closest(".widget-body").height(sourceElement.height());
    refreshGrid();
});

/** Begin Card-flip **/
$('#widget-canvas').on('click', '.flip-button', function() {
    var widget = $(this).closest(".widget");
    widget.addClass("flipping")
    widget.toggleClass('flipped');
    window.setTimeout(function(){widget.removeClass("flipping");}, 500);
});
/** End Card-flip **/

/** Begin Widget Settings **/
$('#widget-canvas').on('click', '.settings-button', function() {
    console.log("settings button pressed");
});
/** End Widget Settings **/

/** Begin Placeholder Modifiers **/
// When a widget is dragged.
$(".widget").on('drag', function(event, ui){
    // Make sure the placeholder is set to its height and width.
    /* Shapeshift does not automatically, but it does not work when transferring...
       a widget from the palette (because the pallete/parent is invisible).
    */
    $('#widget-canvas > .ss-placeholder-child').width($(this).width());
    $('#widget-canvas > .ss-placeholder-child').width($(this).width());
});
/** End Placeholder Modifiers **/

/** Begin Widget Palette Interactions **/
// Open the widget-palette.
$('.add-widget').click(function(){
    // Set the height of the palette to that of the canvas.
    $("#widget-palette-modal").height($("#widget-canvas").height());
    // Set the width of the palette to that of the canvas.
    $("#widget-palette-modal").outerWidth($("#widget-canvas").width()*.955);

    // Show the palette.
    $("#widget-palette-modal").addClass("show");
    
    // Reshresh the palette.
    refreshWidgetGrid(widgetPaletteId);
});

// Close modal when its close button is clicked.
$('.close-button').on('click', function() {
    var modal = $(this).closest(".modal");
    modal.removeClass("show");
});

// When user starts to drag a widget from the palette.
$('#widget-palette > .widget').on('dragstart', function(event, ui) {
    // Hide the modal.
    $('#widget-palette-modal').removeClass('show');

    $('#widget-canvas').removeClass('widgets-set').addClass('adding-widget');
});

// When user stops dragging a widget from the palette.
$('#widget-palette > .widget').on('dragstop', function(event, ui) {
    // Reshresh the palette.
    refreshWidgetGrid(widgetPaletteId);
    
    // Indicate that the widget has been set on the canvas.
    $('#widget-canvas').removeClass('adding-widget').addClass('widgets-set');
    // Remove this event from the widget.
    $(this).off("dragstop");
});
/** End Widget Palette Interactions **/