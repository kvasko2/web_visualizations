// Convert hex color to rgba color object.
function convertHexToRgbaObject(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = {"r":r, "g":g, "b":b, "a":opacity/100}
    return result;
}

// Convert hext to rbga string.
function convertHexToRgbaString(hex,opacity){
    hex = hex.replace('#','');
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);

    result = 'rgba('+r+','+g+','+b+','+opacity/100+')';
    return result;
}

// Lighten an RGB color value.
function lightenRgb(rgbValue, opacity, percent){
    // Convert the rgb value to a useable array.
    rgbValue = rgbValue.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    // Calculate the difference between each value and its full value. 
    diff = {
        "r": 255 - parseInt(rgbValue[1]),
        "g": 255 - parseInt(rgbValue[2]),
        "b": 255 - parseInt(rgbValue[3])
    };
    
    // Multiply the difference by the desired percent increase and add to the initial value.
    result = {
        "r": Math.round(parseInt(rgbValue[1]) + (diff["r"] * percent/100)),
        "g": Math.round(parseInt(rgbValue[2]) + (diff["g"] * percent/100)),
        "b": Math.round(parseInt(rgbValue[3]) + (diff["b"] * percent/100)),
        "a":opacity
    };
    
    return 'rgba('+result["r"]+','+result["g"]+','+result["b"]+','+result["a"]+')';
}

function lightenHex(hexValue, opacity, percent){
    // Convert the hex value to rgba.
    rgbaValue = convertHexToRgbaObject(hexValue, opacity);
    
    // Calculate the difference between each value and its full value. 
    diff = {
        "r": 255 - rgbaValue["r"],
        "g": 255 - rgbaValue["g"],
        "b": 255 - rgbaValue["b"]
    };
    
    // Multiply the difference by the desired percent increase and add to the initial value.
    result = {
        "r": rgbaValue["r"] + (diff["r"] * percent/100),
        "g": rgbaValue["g"] + (diff["g"] * percent/100),
        "b": rgbaValue["b"] + (diff["b"] * percent/100),
        "a":rgbaValue["a"]
    };
    
    return 'rgba('+result["r"]+','+result["g"]+','+result["b"]+','+result["a"]+')';
}

function rgbToHex(rgb){
    rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
    return (rgb && rgb.length === 4) ? "#" +
           ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
           ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
           ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}