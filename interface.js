// JSON data of r-libraries and functions (Fanny's work will provide these)
var JSON_file = '{"rfunctions":[' +
    '{"statistic": "Mean", "stat_info": "Average", "statistic_type": [{"stype": "Numerical", "parameter": ["Lower Bound", "Upper Bound"]}, {"stype": "Boolean", "parameter": []}]},' + 
    '{"statistic": "Histogram", "stat_info": "Frequency", "statistic_type": [{"stype": "Numerical", "parameter": ["Number of Bins"]}, {"stype": "Boolean", "parameter": []}, {"stype": "Categorical", "parameter": ["Number of Bins"]}]},' +
    '{"statistic": "Quantile", "stat_info": "Range", "statistic_type": [{"stype": "Numerical", "parameter": ["Lower Bound", "Upper Bound", "Granularity"]}, {"stype": "Boolean", "parameter": []}]} ],' +
    '"type_label": [ {"stype": "Numerical", "type_info": "Numbers"}, {"stype": "Boolean", "type_info": "True or False"}, {"stype": "Categorical", "type_info": "Categories"} ],' +
    '"parameter_info": [ {"parameter": "Lower Bound", "entry_type": "number", "pinfo": "Lowest Value"}, {"parameter": "Upper Bound", "entry_type": "number", "pinfo": "Highest Value"}, {"parameter": "Number of Bins", "entry_type": "pos_integer", "pinfo": "Number of Categories"}, {"parameter": "Granularity", "entry_type": "pos_integer", "pinfo": "Spread"} ] }';


// List of variables to make form bubbles (Fanny's work will provide these)
var JSON_file2 = '{ "varlist": ["var1", "var2", "var3", "var4", "var5"] }'; 


// Parses the function and varlist data structure
var rfunctions = JSON.parse(JSON_file);
var varlist = JSON.parse(JSON_file2);

// List of possible variable
var variable_list = varlist.varlist;

// Active and inactive variable list
var varlist_active = [];
var varlist_inactive = variable_list; 






// Unique array function (source: http://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array)
Array.prototype.unique = function () {
    var arr = this;
    return $.grep(arr, function (v, i) {
        return $.inArray(v, arr) === i;
    });
};





// List of possible statisitics
var statistic_list = [];
for (n = 0; n < rfunctions.rfunctions.length; n++) {
    statistic_list.push(rfunctions.rfunctions[n].statistic);
};

// List of all types
var type_list = [];
for (n = 0; n < rfunctions.type_label.length; n++) {
    type_list.push(rfunctions.type_label[n].stype);
};


// List of statistics per type and metadata required
for (n = 0; n < type_list.length; n++) {
    var var_type = type_list[n];
    eval("var " + var_type.replace(/\s/g, '_') + "_stat_list = [];");
    eval("var " + var_type.replace(/\s/g, '_') + "_stat_parameter_list = [];");
    for (m = 0; m < rfunctions.rfunctions.length; m++) {
        for (l = 0; l < rfunctions.rfunctions[m].statistic_type.length; l++) {
            if (rfunctions.rfunctions[m].statistic_type[l].stype == var_type) {
                eval(var_type.replace(/\s/g, '_') + "_stat_list.push('" + rfunctions.rfunctions[m].statistic + "');");
                eval(var_type.replace(/\s/g, '_') + "_stat_parameter_list.push({'rfunctions_index': " + m + ", 'parameter_index': " + l + "});");
            }
            else {}
        };
    };
};

// List of all metadata
var metadata_list = [];
for (n = 0; n < rfunctions.parameter_info.length; n++) {
    metadata_list.push(rfunctions.parameter_info[n].parameter);
};







// Column index dictionary
// Format: inputted_metadata[variable_name] = ['Variable_Type', 'Statistic1', 'Epsilon1', 'Accuracy1', 'Hold1', ... Repeats for all possible statistics ... All Possible Metadata];
var column_index = {}
column_index["Variable_Type"] = 0; 
for (n = 0; n < statistic_list.length; n ++) {
    var m = 4 * n; 
    var statistic_index = statistic_list[n].replace(/\s/g, '_');
    column_index[statistic_index] = m + 1;
    column_index["epsilon_" + statistic_index] = m + 2;
    column_index["accuracy_" + statistic_index] = m + 3;
    column_index["hold_" + statistic_index] = m + 4;
};
for (n = 0; n < metadata_list.length; n++) {
    m = 4 * statistic_list.length + 1;
    column_index[metadata_list[n].replace(/\s/g, '_')] = m + n;
};

column_index_length = 1 + 4 * statistic_list.length + metadata_list.length;

// Array that is to be passed to the R-servers
// Format: inputted_metadata[variable_name] = ['Variable_Type', 'Statistic1', 'Epsilon1', 'Accuracy1', 'Hold1', ... Repeats for all possible statistics ... All Possible Metadata];
var inputted_metadata = {};

// Memory of the previous table
var previous_inputted_metadata = {};

// A reset function for rows
function reset (row) {
    row[0] = "default";
    for (m = 0; m < statistic_list.length; m ++) {
        var n = 4 * m + 1;
        row[n] = 0;
        row[n + 1] = 0;
        row[n + 2] = 0;
        row[n + 3] = 0;
    };
    for (l = 0; l < metadata_list.length; l++) {
        var n = 1 + 4 * statistic_list.length;
        row[n + l] = "";
    };
};

// A default array 
function array_default () {
    var array_default = ['default'];
    for (m = 0; m < statistic_list.length; m ++) {
        array_default.push(0);
        array_default.push(0);
        array_default.push(0);
        array_default.push(0);
    };
    for (l = 0; l < metadata_list.length; l++) {
        array_default.push("");
    };
    return array_default;
};


// Make the category dropdown
// Tooltip: http://stackoverflow.com/questions/682643/tooltip-on-a-dropdown-list
function list_of_types (variable) {
    type_menu = "";
    for (m = 0; m < type_list.length; m++) {
        type_menu += "<option id='" + type_list[m] + "_" + variable + "' value='" + type_list[m] + "' title='" + rfunctions.type_label[m].type_info + "'>" + type_list[m] + "</option>";
    };
    return type_menu;
};

// Produces checkboxes on selected type
function type_selected (type_chosen, variable) {
    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));
    reset(inputted_metadata[variable]);
    inputted_metadata[variable][0] = type_chosen;
    generate_epsilon_table();

    if (type_chosen != "default") {
        document.getElementById("released_statistics_" + variable).innerHTML = list_of_statistics(type_chosen, variable);
        document.getElementById('necessary_parameters_' + variable).innerHTML = "";
    }
    else {
        document.getElementById("released_statistics_" + variable).innerHTML = "";
        document.getElementById('necessary_parameters_' + variable).innerHTML = "";
    }
    console.log(previous_inputted_metadata);
};

// Makes the checkboxes
function list_of_statistics (type_chosen, variable) {
    variable = variable.replace(/\s/g, '_');
    var options = "";
    eval("var type_chosen_list = " + type_chosen + "_stat_list;")
    for (n = 0; n < type_chosen_list.length; n++) {
        options += "<input type='checkbox' name='" + type_chosen_list[n].replace(/\s/g, '_') + "' onclick='Parameter_Populate(this," + n + ",\"" + variable + "\",\"" + type_chosen + "\"); generate_epsilon_table();' id='" + type_chosen_list[n].replace(/\s/g, '_') + "_" + variable + "'> <span title='" + rfunctions.rfunctions[(column_index[type_chosen_list[n].replace(/\s/g, '_')] - 1) / 4].stat_info + "'>" + type_chosen_list[n] + "</span><br>";
    };
    return options;
};

// Makes bubbles and takes in variable name as unique identifier
// Forces each variable to have an unique name
function make_bubble (variable) {
    var variable_raw = variable;
    variable = variable.replace(/\s/g, '_');
    var blank_bubble = 
    "<div id='" + variable + "'>" + 
        "<div class='bubble' id='bubble_" + variable + "'>" +
            "<button class='accordion' id='accordion_" + variable + "' onclick='accordion(this)'>" +
                variable_raw +
            "</button>" +
            "<div id='panel_" + variable + "' class='panel'>" +
                "<div id='variable_types_" + variable + "' class='variable_types'>" +
                    "Variable Type: " +
                    "<select id='variable_type_" + variable + "' onchange='type_selected(value,\"" + variable + "\")'>" + 
                        "<option id='default_" + variable + "' value='default'>Please select a type</option>" +
                        list_of_types(variable) +
                    "</select>" +
                "</div>" +
                "<hr style='margin-top: -0.25em'>" +
                "<div id='released_statistics_" + variable + "' class='released_statistics'>" +
                "</div>" +
                "<hr style='margin-top: -0.25em'>" +
                "<div id='necessary_parameters_" + variable + "' class='necessary_parameters'></div>" + 
                "<div><button onclick='delete_variable(\"" + variable_raw + "\")'>DELETE</button></div>" + 
            "</div>" +
        "</div>" +
        "<br>" +
    "</div>";
    return blank_bubble;
};

// Enables Collapsable Sections for JS Generated HTML
function accordion (bubble) {
    var variable = bubble.id.slice(10, bubble.id.length);
    if (bubble.className == "accordion") {
        bubble.className = "accordion active";
        document.getElementById("panel_" + variable).className = "panel show";
    }
    else {
        bubble.className = "accordion";
        document.getElementById("panel_" + variable).className = "panel";
    };
};

// Generates bubbles from variable list recieved
function variable_bubble () {
    for (i = 0; i < varlist_active.length; i++) {
        $("#bubble_form").append(make_bubble(varlist_active[i]));
    };
};






// Generates html based on statistics choosen
function parameter_fields (variable, type_chosen) {
    eval("var pparameter = " + type_chosen + "_stat_list;");
    eval("var ppparameter = " + type_chosen + "_stat_parameter_list;");

    var needed_parameters = [];
    for (i = 0; i < ppparameter.length; i++) {
        if (inputted_metadata[variable][column_index[pparameter[i].replace(/\s/g, '_')]] > 0) {
            needed_parameters = needed_parameters.concat(rfunctions.rfunctions[ppparameter[i].rfunctions_index].statistic_type[ppparameter[i].parameter_index].parameter);
        }
        else {}
    };
    needed_parameters = needed_parameters.unique();

    // makes blank html text
    var parameter_field = "";

    // uses .unique() to get all unique values and iterate through
    for (j = 0; j < needed_parameters.length; j++) {
        // creates html list in .sort() (alphabet order)
        parameter_field += "<span title='" + rfunctions.parameter_info[(column_index[needed_parameters[j].replace(/\s/g, '_')] - (4 * type_list.length) - 1)].pinfo + "'>" + needed_parameters[j] + ":</span> <input type='text' value='" + inputted_metadata[variable][column_index[needed_parameters[j].replace(/\s/g, '_')]] + "' name='" + needed_parameters[j].replace(/\s/g, '_') + "'id='input_" + needed_parameters[j].replace(/\s/g, '_') + "_" + variable + "' oninput='Parameter_Memory(this,\"" + variable + "\")' onfocusout='ValidateInput(this, \"" + rfunctions.parameter_info[(column_index[needed_parameters[j].replace(/\s/g, '_')] - (4 * type_list.length) - 1)].entry_type + "\", \"" + variable + "\")'><br>"
    };

    // prints this all out, display seems smooth
    document.getElementById('necessary_parameters_' + variable).innerHTML = parameter_field; 
};

// Produce parameter fields
// http://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_oninput
function Parameter_Populate (stat, stat_index, variable, type_chosen) {    
    eval("var ppparameter = " + type_chosen + "_stat_parameter_list;");

    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));

    // checks if thing is checked
    if ($("#" + stat.id).prop('checked')) {
        // Updating the master data-array
        inputted_metadata[variable][column_index[stat.name]] = 1;

        // In case zero parameters needed
        epsilon_table_validation(variable); 
        
        // calls the parameter HTML generating function
        parameter_fields(variable, type_chosen);
    }

    // if not checked
    else {
        // splice.() help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_fobjects/Array/splice
        // index() help: https://api.jquery.com/index/

        // Updating the master data-array
        inputted_metadata[variable][column_index[stat.name]] = 0;

        // calls the parameter HTML generating function
        parameter_fields(variable, type_chosen);
    }
    console.log(previous_inputted_metadata);
};

// Stores metadata in memory
function Parameter_Memory (parameter, variable) {
    inputted_metadata[variable][column_index[parameter.name]] = parameter.value;
};






// Regex: http://www.w3schools.com/jsref/jsref_obj_regexp.asp
// Validate form based on entry_type info
function ValidateInput (input, valid_entry, variable) {
    // Actual input validation
    var entry = input.value;

    if (entry == "") {
        epsilon_table_validation(variable);    
        return false;
    } 

    if (valid_entry == "general_text") {
        if (!entry.match(/^[a-zA-Z0-9]+$/)) {
            alert("Invalid entry. Entry can only contain numbers and letters only!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }

    if (valid_entry == "text_only") {
        if (!entry.match(/^[a-zA-Z]+$/)) {
            alert("Invalid entry. Entry can only contain letters only!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }

    if (valid_entry == "pos_decimal") {
        if (!entry.match(/^[+]?[0-9]*[.]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be positive decimals!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }

    if (valid_entry == "neg_decimal") {
        if (!entry.match(/^[-]{1}[0-9]*[.]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be negative decimals. Must have negative sign (-) in front!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "decimal") {
        if (!entry.match(/^[+-]?[0-9]*[.]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be decimals!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "pos_integer") {
        if (!entry.match(/^[+]?[0-9]+$/)) {
            alert("Invalid entry. Entry can only be positive integer!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "neg_integer") {
        if (!entry.match(/^[-]{1}[0-9]+$/)) {
            alert("Invalid entry. Entry can only be negative integer. Must have negative sign (-) in front!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "integer") {
        if (!entry.match(/^[+-]?[0-9]+$/)) {
            alert("Invalid entry. Entry can only be integers!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "pos_number") {
        if (!(entry.match(/^[+]?[0-9]+[.]?$/) || entry.match(/^[+]?[0-9]*[.]{1}[0-9]+$/))) {
            alert("Invalid entry. Entry can only be positive numbers!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "neg_number") {
        if (!(entry.match(/^[-]{1}[0-9]+[.]?$/) || entry.match(/^[-]{1}[0-9]*[.]{1}[0-9]+$/))) {
            alert("Invalid entry. Entry can only be negative numbers!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }
    
    if (valid_entry == "number") {
        if (!(entry.match(/^[+-]?[0-9]+[.]?$/) || entry.match(/^[+-]?[0-9]*[.]{1}[0-9]+$/))) {
            alert("Invalid entry. Entry can only be numbers!");
            inputted_metadata[variable][column_index[input.name]] = "";
            input.value = "";
        }
    }

    epsilon_table_validation(variable);    
};


// Epsilon Table Validation
function epsilon_table_validation (variable) {
    var type_chosen = inputted_metadata[variable][0];
    eval("var pparameter = " + type_chosen + "_stat_list;");
    eval("var ppparameter = " + type_chosen + "_stat_parameter_list;");    
    for (q = 0; q < pparameter.length; q++) {
        if (inputted_metadata[variable][column_index[pparameter[q]]] > 0) {
            var sparameter = rfunctions.rfunctions[(ppparameter[(pparameter.indexOf(pparameter[q]))].rfunctions_index)].statistic_type[ppparameter[pparameter.indexOf(pparameter[q])].parameter_index].parameter;
            inputted_metadata[variable][column_index[pparameter[q]]] = 2 + sparameter.length;
            for (r = 0; r < sparameter.length; r++) {
                if (inputted_metadata[variable][column_index[sparameter[r].replace(/\s/g, '_')]] != "") {
                    inputted_metadata[variable][column_index[pparameter[q]]] = inputted_metadata[variable][column_index[pparameter[q]]] - 1;  
                }
            };
        }
    };
    generate_epsilon_table();  
};




// Does the hold function
function hold_status (hold_checkbox, variable, statistic) {
    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));
    if ($("#" + hold_checkbox.id).prop('checked')) {
        inputted_metadata[variable][column_index["hold_" + statistic]] = 1;
    }
    else {

        inputted_metadata[variable][column_index["hold_" + statistic]] = 0;
    }
    console.log(previous_inputted_metadata);
};



// Creates Epsilon 
function generate_epsilon_table () {
    var epsilon_table = 
    "<table id='epsilon_table' style='width: 100%;'>" +
        "<tr>" +
            "<td style='font-weight: bold;'>" +
                "Variable Name" +
            "</td>" +
            "<td style='font-weight: bold;'>" +
                "Statistic" +
            "</td>" +
            "<td title='Privacy parameter' style='font-weight: bold;'>" +
                "Epsilon" +
            "</td>" +
            "<td title='How accurate?' style='font-weight: bold;'>" +
                "Accuracy" +
            "</td>" +
            "<td title='Wanna fix the epsilon/accuracy value?' style='font-weight: bold;'>" +
                "Hold" +
            "</td>" +
        "</tr>";
    for (n = 0; n < varlist_active.length; n++) {
        for (m = 0; m < statistic_list.length; m++) {
            var stat_index = 4 * m + 1;
            if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index] > 0) {
                epsilon_table += 
                "<tr>" +
                    "<td>" +
                        varlist_active[n] +
                    "</td>" +
                    "<td>" +
                        statistic_list[m] +
                    "</td>"; 

                    if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index] == 2) {
                        epsilon_table += 
                        "<td>" +
                            "0" +
                        "</td>" +
                        "<td>" +
                            "<input type='text' value='" + inputted_metadata[varlist_active[n].replace(/\s/g, '_')][stat_index + 2] + "' name='accuracy_" + statistic_list[m] + "' onfocusout='ValidateInput(this, \"pos_number\", \"" + varlist_active[n].replace(/\s/g, '_') + "\")' oninput='Parameter_Memory(this,\"" + varlist_active[n].replace(/\s/g, '_') + "\")'>" +
                        "</td>" +
                        "<td>";
                        
                        if (inputted_metadata[varlist_active[n].replace(/\s/g, '_')][column_index["hold_" + statistic_list[m]]] == 1) {    
                            epsilon_table += "<input type='checkbox' id='hold_" + varlist_active[n].replace(/\s/g, '_') + "_" + statistic_list[m] + "' onclick='hold_status(this,\"" + varlist_active[n].replace(/\s/g, '_') + "\",\"" + statistic_list[m] + "\")' checked>";
                        }
                        else {
                            epsilon_table += "<input type='checkbox' id='hold_" + varlist_active[n].replace(/\s/g, '_') + "_" + statistic_list[m] + "' onclick='hold_status(this,\"" + varlist_active[n].replace(/\s/g, '_') + "\",\"" + statistic_list[m] + "\")'>";
                        }
                    }

                    else {
                        epsilon_table += 
                        "<td title='Epsilon will be edittable after putting in the necessary metadata fields.'>" +
                        "</td>" +
                        "<td title='Accuracy will be edittable after putting in the necessary metadata fields.'>" +
                        "</td>" +
                        "<td title='Hold status will be edittable after putting in the necessary metadata fields.'>";
                    }
                    
                epsilon_table +=    
                    "</td>" +
                "</tr>";
            }
            else {}
        };
    };
    epsilon_table += 
    "</table>";

    document.getElementById('epsilon_sidebar').innerHTML = epsilon_table;
};






// Reverse column_index: http://stackoverflow.com/questions/1159277/array-flip-in-javascript
var index_column = {};
$.each(column_index, function(i, el) {
    index_column[el]=i;
});

// Get length of js dictionary length: http://jsfiddle.net/simevidas/nN84h/
// Generates a HTML datapage with all the info collected 
function report () {
    info =
    "<style>" +
    "#epsilon_table table, #epsilon_table th, #epsilon_table td {" +
        "border: 1px solid black;" +
        "border-collapse: collapse;" +
    "}" +
    "#epsilon_table th, #epsilon_table td {" +
        "padding: 5px;" +
        "text-align: center;" +
    "}" +
    "</style>" + 
    "<table id='epsilon_table' style='width: 100%;'>" +
        "<tr>" +
            "<td style='font-weight: bold;'>" +
                "Variable Name" +
            "</td>";

    for (n = 0; n < column_index_length; n++) {
        info +=             
        "<td style='font-weight: bold;'>" +
            index_column[n] +
        "</td>";
    };
    
    info += "</tr>";

    for (m = 0;  m < varlist_active.length; m++) {
        info += 
        "<tr>" +
            "<td>" +
                varlist_active[m] +
            "</td>";
        
        for (l = 0; l < column_index_length; l++) {
            info +=             
            "<td>" +
                inputted_metadata[varlist_active[m].replace(/\s/g, '_')][l] +
            "</td>";
        };

        info += "</tr>";
    };

    var report_info = window.open("");
    report_info.document.write(info + "</table>");
};


// json
// mouseover label telling what the statistic is
// what metadata needs (numerical (whole number), text, decimal (can have .), positive, negative #, is order a < b, )
// custom logic (metadata checking rules)
// shift over dynamic table to below


// issues to resolve:
// form logic (check if numerials), 
// epsilon/accuracy table




// $(document).ready(function () {	
// 	// sidebar action, with toggle and text-switch
// 	$("#sidebar-toggle").click(function() {
//         $(this).text(function(i, v){
//         	return v === '>>' ? '<<' : '>>'
//         });
//         $("#wrapper").toggleClass("toggled");
//     });
// });




// Search box logic: https://www.html5andbeyond.com/live-search-a-html-list-using-jquery-no-plugin-needed/
jQuery(document).ready(function($) {
    $('.live-search-list li').each(function() {
        $(this).attr('data-search-term', $(this).text().toLowerCase());
    });

    $('.live-search-box').on('keyup', function() {
        var searchTerm = $(this).val().toLowerCase();

        $('.live-search-list li').each(function() {
            if ($(this).filter('[data-search-term *= ' + searchTerm + ']').length > 0 || searchTerm.length < 1) {
                $(this).show();
            } 
            else {
                $(this).hide();
            }
        });
    });
});




// Adding variables to the variable selection column
function populate_variable_selection_sidebar () {
    variable_selection_sidebar = ""
    for (n = 0; n < variable_list.length; n++) {
        variable_selection_sidebar += "<li id='selection_sidebar_" + variable_list[n] + "' data-search-term='" + variable_list[n] + "' onclick='variable_selected(\""+variable_list[n]+"\")'>" + variable_list[n] + "</li>";
    };
    $("#variable_sidebar").append(variable_selection_sidebar);
};




// CSS when variable selected
var variable_selected_class = 
    "color: black;" +
    "list-style: none;" +
    "padding: 5px;" + 
    "margin: 5px 0;" +
    "border: solid 5px green;"+
    "text-align: center;";

// CSS when variable unselected
var variable_unselected_class = 
    "color: black;" +
    "list-style: none;" +
    "padding: 5px;" + 
    "margin: 5px 0;" +
    "border: solid 5px red;"+
    "text-align: center;";

// Variable selection boxes change to signify selection
function variable_selected (variable) {
    if (inputted_metadata[variable] == undefined) {
        document.getElementById("selection_sidebar_" + variable).style.cssText = variable_selected_class; 
        create_new_variable(variable);
    }
    else {
        delete_variable(variable);
    }
    document.getElementById("live-search-box").value = "";
    $('.live-search-list li').each(function() {
        $(this).show();
    });
};





// Updates varlist_active, varlist_inactive, and creates bubble
function create_new_variable (variable) {
    // fixes javascript pass by value/reference issue
    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));
    var variable_index = varlist_inactive.indexOf(variable);
    varlist_inactive.splice(variable_index, 1);
    varlist_active.push(variable);
    inputted_metadata[variable] = array_default();
    $("#bubble_form").append(make_bubble(variable));
    console.log(previous_inputted_metadata);
};


// Remove variable
function delete_variable (variable) {
    previous_inputted_metadata = JSON.parse(JSON.stringify(inputted_metadata));
    document.getElementById("selection_sidebar_" + variable).style.cssText = variable_unselected_class; 
    var variable_index = varlist_active.indexOf(variable);
    varlist_active.splice(variable_index, 1);
    varlist_inactive.push(variable);
    delete inputted_metadata[variable.replace(/\s/g, '_')];
    document.getElementById(variable.replace(/\s/g, '_')).remove();
    generate_epsilon_table();
    console.log(previous_inputted_metadata);
};


// fearonLaitan.xml
// index.html
// readData.js


// hide variable sidebar + scroll down + previous table memory
















// function talktoR(btn, df, x, y, globals) {

//   //package the output as JSON
//   var estimated=false;
//   var base = rappURL;
  
//   // If hold was pressed, no need to send to R
//   if(btn === "Hold"){
//     return;
//   }


//   isComplete = isCompleteTable(df);
 
//   if(!isComplete){
//     alert("Action is invalid while incomplete row exists. Complete it or delete it.");
//     if(x === 0){
//         resetGlobals(prevGlobals);  
//         }
//         else{
//             undo();
//         }
//   }
//   else{
//   function estimateSuccess(btn,json) {
//     allResults.push(json);
//     console.log("json in: ", json);
//     estimated=true;
    
//     if(json["error"][0] ==="T"){
//         alert(json["message"]);
//         //if globals were edited
//         if(x === 0){
//             resetGlobals(prevGlobals);
//         }
//         else{
//             undo();
//         }
//     }
        
//     else{
//         prevGlobals = getGlobalParameters()
//         json = json["prd"];
//         var n = getGlobalParameters()["n"];
//         var accType = document.getElementById("accType").value;
        
//         for(i=0; i < json.length; i++){ 
//           if(accType === "Absolute"){
//              newAcc = parseFloat(json[i].Accuracy)*n;
//              }
//           else{
//              newAcc = parseFloat(json[i].Accuracy);
//           }
//           newEps = parseFloat(json[i].Epsilon);
          
//           //if(data[i].Hold !==true){
//             data[i].Accuracy =newAcc.toString();
//          // }
//           data[i].Epsilon = newEps.toString();
//           grid.updateRow(i);
//         }
    
//         if(data[grid.getDataLength() - 1].Accuracy){
//           //last row has no acc value, make new row
//           AddNewRow()
//         }
//     }
//   }
   

//   function statisticsSuccess(btn,json) {  
//   //Must do something else here if submit happened
//     // SOMEWHEREHERE.push(json);
//     console.log("json in: ", json);
//   }


//   function estimateFail(btn) {
//     estimated=true;
//   }

//   if(document.getElementById("accType").value === "Absolute"){
//         var n = getGlobalParameters()["n"];
//         for(i=0; i<data.length; i++){
//             data[i].Accuracy = data[i].Accuracy/n
//         }   
//     }
//   if(btn === "submit"){
//     //check completeness here too
//     // if secrecy of the sample is active, provide boosted privacy parameters
//     if(secSamp){
//         globals["eps"] = document.getElementById("funcEp").value; 
//         var big_n = document.getElementById("secSamp").value; 
//         var n = globals["n"];
//         globals["del"] = globals["del"]*(big_n/n)
//     }
//     var jsonout = JSON.stringify({ df: df, fileid: fileid, globals: globals});  // Make this a local reference eventually
//     urlcall = base+"privateStatistics";
//     console.log("urlcall out: ", urlcall);
  
//     makeCorsRequest(urlcall,btn, statisticsSuccess, estimateFail, jsonout);
//   }

//   else{
//     if(secSamp){
//         globals["eps"] = document.getElementById("funcEp").value; 
//         var big_n = document.getElementById("secSamp").value; 
//         var n = globals["n"];
//         globals["del"] = globals["del"]*(big_n/n)
//     }
//     var jsonout = JSON.stringify({ df: df, x: x, y: y, btn:btn, globals:globals});
//     console.log(jsonout)
//     urlcall = base+"privateAccuracies";
//     console.log("urlcall out: ", urlcall);
//     allResults = [];
//     makeCorsRequest(urlcall,btn, estimateSuccess, estimateFail, jsonout);
//   }
//  } 
// }


// // below from http://www.html5rocks.com/en/tutorials/cors/ for cross-origin resource sharing
// // Create the XHR object.
// function createCORSRequest(method, url, callback) {
//     var xhr = new XMLHttpRequest();
//     if ("withCredentials" in xhr) {
//         // XHR for Chrome/Firefox/Opera/Safari.
//         xhr.open(method, url, true);
//     } else if (typeof XDomainRequest != "undefined") {
//         // XDomainRequest for IE.
//         xhr = new XDomainRequest();
//         xhr.open(method, url);
//     } else {
//         // CORS not supported.
//         xhr = null;
//     }
//     return xhr;  
// }


// // Make the actual CORS request.
// function makeCorsRequest(url,btn,callback, warningcallback, json) {
//     var xhr = createCORSRequest('POST', url);
//     if (!xhr) {
//         alert('CORS not supported');
//         return;
//     }
//     // Response handlers for asynchronous load
//     // onload or onreadystatechange?
    
//     xhr.onload = function() {
        
//       var text = xhr.responseText;
//       console.log("text ", text);
//       var json = JSON.parse(text);   // should wrap in try / catch
//       var names = Object.keys(json);

//       if (names[0] == "warning"){
//         warningcallback(btn);
//         alert("Warning: " + json.warning);
//       }else{
//         callback(btn, json);
//       }
//     };
//     xhr.onerror = function() {
//         // note: xhr.readystate should be 4, and status should be 200.  a status of 0 occurs when the url becomes too large
//         if(xhr.status==0) {
//             alert('xmlhttprequest status is 0. local server limitation?  url too long?');
//         }
//         else if(xhr.readyState!=4) {
//             alert('xmlhttprequest readystate is not 4.');
//         }
//         else {
//             alert('Woops, there was an error making the request.');
//         }
//         console.log(xhr);
//     };
//     console.log("sending")
//     console.log(json);
//     xhr.send("tableJSON="+json);   
// }

// function getGlobalParameters(){
//     var epsval=document.getElementById("epsilonbox").value;
//     var delval=document.getElementById("deltabox").value;
//     var betaval=document.getElementById("betabox").value;
//     var nval = 1223992 //Need to get this from metadata too 
//     var globals={eps:epsval, del:delval, beta:betaval, n:nval};
//     return globals;}
    
// var prevGlobals = getGlobalParameters();
// function resetGlobals(prevGlobals){
//     document.getElementById("epsilonbox").value = prevGlobals.eps
//     if(secSamp){
//         var big_n = document.getElementById("secSamp").value;
//         var n = getGlobalParameters()["n"];
//         var eps = getGlobalParameters()["eps"];
//         document.getElementById("funcEp").value = Math.log((Math.exp(eps)-1)*(big_n/n)+1);
//     }
//     document.getElementById("deltabox").value = prevGlobals.del
//     document.getElementById("betabox").value = prevGlobals.beta
// }
// function epsChange(){
//     var btn = "epsChange";
//     var df = data;
//     var x = 0;
//     var y= 0;
//     var globals=getGlobalParameters();
//     if(secSamp){
//         var big_n = document.getElementById("secSamp").value;
//         var n = getGlobalParameters()["n"];
//         var eps = getGlobalParameters()["eps"];
//         document.getElementById("funcEp").value = Math.log((Math.exp(eps)-1)*(big_n/n)+1);
//     }
//     talktoR(btn, df, x, y, globals);
// }
// function deltaChange(){
//     var btn = "deltaChange";
//     var df = data;
//     var x = 0;
//     var y= 0;
//     var globals=getGlobalParameters();
//     talktoR(btn, df, x, y, globals);
// }
// function betaChange(){
//     var btn = "betaChange";
//     var df = data;
//     var x = 0;
//     var y= 0;
//     var globals=getGlobalParameters();
//     talktoR(btn, df, x, y, globals);
// }

// function accTypeChange(){
//     var toggle = {"Relative":"Absolute", "Absolute":"Relative"};
//     var accType = document.getElementById("accType").value;
//     var newType = toggle[accType];
//     document.getElementById("accType").value = newType;
//     var n = getGlobalParameters()["n"];
//     for(i=0; i<data.length; i++){
//         if(newType === "Relative"){
//             data[i].Accuracy = data[i].Accuracy/n
//         }
//         else{
//             data[i].Accuracy = data[i].Accuracy*n
//         }
//         grid.updateRow(i);
//     }
//     grid.render();
// }

// function secSampChange(){
//     var big_n = document.getElementById("secSamp").value;
//     var n = getGlobalParameters()["n"];
//     if(isNaN(big_n) && big_n <= n){
//         alert("Global population must be a number larger than your sample");
//         document.getElementById("secSamp").value = "";
//         document.getElementById("funcEp").value = "";
//         secSamp = false;
//     }
//     else{
//         var eps = document.getElementById("epsilonbox").value;
//         console.log(typeof eps)
//         console.log(typeof n)
//         console.log(typeof big_n)
//         console.log(Math.exp(eps))
//         var funcEp = Math.log((Math.exp(eps)-1)*(big_n/n)+1);
//         var funcDel = document.getElementById("deltabox").value*(big_n/n)
//         document.getElementById("funcEp").value = funcEp;
//         secSamp = true; 
//         var btn = "secChange";
//         var df = data;
//         var x = 0;
//         var y= 0;
//         var globals=getGlobalParameters();
//         talktoR(btn, df, x, y, globals);
//     }
// }

// function submit(){

//     var btn = "submit";
//     var df = data;
//     var x = 0;
//     var y= 0;
//     var globals=getGlobalParameters();
//     console.log("Should talktoR");
//     //talktoR(btn, df, x, y, globals);
// }

