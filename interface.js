// types, categorical, numerical, and boolean
// mean -> num (lower,upper), bool (bins)
// histogram -> categorical (), numerical(), and boolean()
// quantile -> numerical bool 
// bivariate -> categorical
// func, <types: metadata per type>
// build set of types dynamically

// the whole storing thing in memory = sql/database





// Unique array function (source: http://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array)
Array.prototype.unique = function () {
    var arr = this;
    return $.grep(arr, function (v, i) {
        return $.inArray(v, arr) === i;
    });
};




// JSON data of r-libraries (Fanny's work will provide these)
// List of variables to make form bubbles (Fanny's work will provide these)
var functions = '{"rfunctions":[' +
	'{"func":"Mean","parameter":["Lower Bound", "Upper Bound"] },' +
	'{"func":"Histogram","parameter":["Number of Bins"] },' +
	'{"func":"Quantile","parameter": ["Lower Bound", "Upper Bound", "Granularity"] },' +
    '{"func":"Bivariate Analysis","parameter": ["Lower Bound", "Upper Bound", "y-Lower Bound", "y-Upper Bound", "R-coefficient"] } ],' + 
    '"varlist": ["var 1", "var21", "var3"] }';

// Parses the function and varlist data structure
var fobj = JSON.parse(functions);

// Locally global arrays of parameters need for a single variable
for (k = 0; k < fobj.varlist.length; k++) { 
    eval("var generated_parameters_" + fobj.varlist[k].replace(/\s/g, '_') + "= [];");
};

// Global metadata counter (only increases during a session)
var index_id = 1; 

// Initial List of Column Fields
var column_fields = ['index_id', 'Variable_Name', 'Variable_Type', 'Statistic', 'Epsilon', 'Accuracy', 'Hold'];

// Adding metadata fields
// https://davidwalsh.name/combining-js-arrays
var metadata_column_fields = [];
for (n = 0; n < fobj.rfunctions.length; n++) {
    metadata_column_fields = metadata_column_fields.concat(fobj.rfunctions[n].parameter);
};

// Number of metadata fields
metadata_column_fields_amount = metadata_column_fields.unique().length;

// Final Un-Editted List of Column Fields
column_fields = column_fields.concat(metadata_column_fields.unique());

// Final Edit of List of Column Fields (Converts "Lower Bound" -> "Lower_Bound")
for (n = 0; n < column_fields.length; n++) {
    column_fields[n] = column_fields[n].replace(/\s/g, '_');
};

// Making a dictionary of column to index
// http://stackoverflow.com/questions/7196212/how-to-create-dictionary-and-add-key-value-pairs-dynamically-in-javascriptadd
// Declaring a Column to Index Dictionary
var column_index = {};

// Populating the dictionary
for (n = 0; n < column_fields.length; n++) {
    column_index[column_fields[n]] = n;
};


// Global table of metadata (as inputed by user)
// Naive (current) metadata structure: [id/index, Variable Name, Variable Type, Statistic, Epsilon, Accuracy, Hold Status, ... All Possible Metadata ...]
var inputted_metadata = [];

// Making a deflaut entry full of nulls
var default_entry_metadata = [];
for (n = 0; n < column_fields.length; n++) {
    default_entry_metadata.push("null");
};

inputted_metadata.push(default_entry_metadata);

function list_of_statistics(variable) {
    variable = variable.replace(/\s/g, '_');
    var options = "";
    for (n = 0; n < fobj.rfunctions.length; n++) {
        options += "<input type='checkbox' name='" + fobj.rfunctions[n].func.replace(/\s/g, '_') + "' onclick='Parameter_Populate(this," + n + ",\"" + variable + "\")' id='" + fobj.rfunctions[n].func.replace(/\s/g, '_') + "_" + variable + "'> " + fobj.rfunctions[n].func + "<br>";
    };
    return options;
};

// Makes bubbles and takes in variable name as unique identifier
// Forces each variable to have an unique name
function make_bubble (variable) {
    variable = variable.replace(/\s/g, '_');
    var blank_bubble = 
    "<div class='bubble' id='bubble_" + variable + "'>" +
        "<button class='accordion' id='accordion_" + variable + "' onclick='accordion(this)'>" +
            "<table style='width: 100%;'>" +
                "<tr>" +
                    "<td style='width: 50%;'>" +
                        variable +
                    "</td>" +
                    "<td>" +
                        "Variable Type: " +
                        "<select id='variable_type_" + variable + "'>" + 
                            "<option id='default_" + variable + "' value='default'>Please select a type</option>" +
                        "</select>" +
                    "</td>" +
                "</tr>" +
            "</table>" +
        "</button>" +
        "<div id='panel_" + variable + "' class='panel'>" +
            "<div id='released_statistics_" + variable + "' class='released_statistics'>" +
                "Please select which statistics you wish to release:<br>" + 
                list_of_statistics(variable) +
            "</div>" +
            "<hr style='margin-top: -0.25em'>" +
            "<div id='necessary_parameters_" + variable + "' class='necessary_parameters'></div>" + 
        "</div>" +
    "</div>" +
    "<hr style='margin-top: 0.25em'>";
    return blank_bubble;
};

// Enables Collapsable Sections for JS Generated HTML
function accordion(bubble) {
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
function variable_bubble() {
    for (i = 0; i < fobj.varlist.length; i++) {
        $("#bubble_form").append(make_bubble(fobj.varlist[i]));
    };
};


// Stores metadata in memory
function Parameter_Memory(parameter, var_stat_index) {
    var metadata = document.getElementById(parameter.id).value;
    inputted_metadata[var_stat_index][column_index[parameter.name]] = metadata;
    alert(inputted_metadata[var_stat_index]);


    // inputted_metadata[var_stat_index]
    // alert(inputted_metadata[var_stat_index][column_index["Lower_Bound"]]);
    // alert(column_index["Lower_Bound"]);
};





// Generates html based on statistics choosen
function parameter_fields(variable, var_stat_index) {
    eval("var parameter_list = generated_parameters_" + variable + ";");
    
    // makes blank html text
    var parameter_field = "";

    // uses .unique() to get all unique values and iterate through
    for (j = 0; j < parameter_list.unique().length; j++) {
        // creates html list in .sort() (alphabet order)
        parameter_field += parameter_list.unique().sort()[j] + ": <input type='text' value='" + inputted_metadata[var_stat_index-1][column_index[parameter_list.unique().sort()[j].replace(/\s/g, '_')]] + "' name='" + parameter_list.unique().sort()[j].replace(/\s/g, '_') + "'id='input_" + parameter_list.unique().sort()[j].replace(/\s/g, '_') + "_" + variable + "' oninput='Parameter_Memory(this," + var_stat_index + ")'><br>"
    };

    // prints this all out, display seems smooth
    document.getElementById('necessary_parameters_' + variable).innerHTML = parameter_field; 
};

// Produce parameter fields
// http://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_oninput
function Parameter_Populate(stat, stat_index, variable) {
    eval("var parameter_list = generated_parameters_" + variable + ";");
    
    // checks if thing is checked
    if ($("#" + stat.id).prop('checked')) {
        // adds parameters to master array
        // does simple push, so added in the order selected and listed
        for(n = 0; n < fobj.rfunctions[stat_index].parameter.length; n++) {
            parameter_list.push(fobj.rfunctions[stat_index].parameter[n]);
        };
        
        // Adds to global metadata table
        // Naive (current) metadata structure: [id/index, Variable Name, Variable Type, Statistic, Epsilon, Accuracy, Hold Status, ... All Possible Metadata ...]
        metadata_to_add = [index_id, variable, "default", stat.name, "null", "null", "no"];
        for (l = 7; l < column_fields.length; l++) {
            metadata_to_add.push("null");
        }; 
        alert(column_fields + "\n" + metadata_to_add);
    
        inputted_metadata.push(metadata_to_add);

        // calls the parameter generating function
        parameter_fields(variable, index_id);


        index_id += 1;
    }

    // if not checked
    else {
        // splice.() help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_fobjects/Array/splice
        // index() help: https://api.jquery.com/index/

        // finds index of particular parameter and removes them
        for(n = 0; n < fobj.rfunctions[stat_index].parameter.length; n++) {
            parameter_list.splice((parameter_list.indexOf(fobj.rfunctions[stat_index].parameter[n])), 1);
        };

        // calls the parameter generating function
        parameter_fields(variable);
    }
};









































// // // var bob = list_of_statistics('dogs');



// function list_of_statistics() {
//     var options = "";
//     for (n = 0; n < fobj.rfunctions.length; n++) {
//         options += "<input type='checkbox' name='stat' onclick='Parameter_Populate(this.id," + n + ")' id='" + fobj.rfunctions[n].func.replace(/\s/g, '_') + "'> " + fobj.rfunctions[n].func + "<br>";
//     };
//     return options;
// };












// // Makes a checklist of possible statistics 
// function available_statistics() {
//     var options = "";
//     for (n = 0; n < fobj.rfunctions.length; n++) {
//         options += "<input type='checkbox' name='stat' onclick='Parameter_Populate(this.id," + n + ")' id='" + fobj.rfunctions[n].func.replace(/\s/g, '_') + "'> " + fobj.rfunctions[n].func + "<br>";
//     };
//     $(".released_statistics").append(options);
// };













// // Generates the list of possible statistics
// function list_of_statistics (variable) {
//     var options = "";
//     for (n = 0; n < fobj.rfunctions.length; n++) {
//         options += "<input type='checkbox' name='stat' onclick='Parameter_Populate(this.id," + n + ")' id='" + fobj.rfunctions[n].func.replace(/\s/g, '_') + "_" + variable.replace(/\s/g, '_') + "'> " + fobj.rfunctions[n].func + "<br>";
//     };
//     return options;
// };

// // Outputs a checklist of possible statistics 
// function available_statistics() {
//     var released_statistics_list = document.getElementsByClassName("released_statistics");
//     // alert(released_statistics_list[0].id.slice(20,released_statistics_list[0].length));
//     // alert(released_statistics_list[n].id.slice(20,released_statistics_list[n].length));

//     for (n = 0; n < released_statistics_list.length; n++) {
//         alert(list_of_statistics(released_statistics_list[n].id.slice(20,released_statistics_list[n].length)));
//         // released_statistics_list[n].append(list_of_statistics(released_statistics_list[n].id.slice(20,released_statistics_list[n].length)));
//     };
// };











// RUDIMENTARY WORKING
// // Makes a checklist of possible statistics 
// function available_statistics() {
//     var options = "";
//     for (n = 0; n < fobj.rfunctions.length; n++) {
//         options += "<input type='checkbox' name='stat' onclick='Parameter_Populate(this.id," + n + ")' id='" + fobj.rfunctions[n].func.replace(/\s/g, '_') + "'> " + fobj.rfunctions[n].func + "<br>";
//     };
//     $(".released_statistics").append(options);
// };













// ADD THIS BACK IN AFTER EACH STAT HAS AN UNIQUE ID
// // Generates html based on statistics choosen
// function parameter_fields() {
//     // makes blank html text
//     var parameter_field = "";
        
//     // uses .unique() to get all unique values and iterate through
//     for (n = 0; n < generated_parameters.unique().length; n++) {
//         // creates html list in .sort() (alphabet order)
//         parameter_field += generated_parameters.unique().sort()[n] + ": <input type='text' id='input_" + generated_parameters.unique().sort()[n].replace(/\s/g, '') +"' oninput='Parameter_Memory(this.id)'><br>"
//     };

//     // prints this all out, display seems smooth
//     document.getElementById('necessary_parameters').innerHTML = parameter_field; 
// };

// // Produce parameter fields
// // http://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_oninput
// function Parameter_Populate(stat_id, stat_index) {
//     // checks if thing is checked
//     if ($("#" + stat_id).prop('checked')) {
//         // adds parameters to master array
//         // does simple push, so added in the order selected and listed
//         for(n = 0; n < fobj.rfunctions[stat_index].parameter.length; n++) {
//             generated_parameters.push(fobj.rfunctions[stat_index].parameter[n]);
//         };

//         // Adds to global metadata table
//         // Naive (current) metadata structure: [id/index, Variable Name, Variable Type, Statistic, Epsilon, Accuracy, Hold Status, ... All Possible Metadata ...]
//         // metadata_to_add = [index_id]

//         // calls the parameter generating function
//         parameter_fields();
//     }

//     // if not checked
//     else {
//         // splice.() help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_fobjects/Array/splice
//         // index() help: https://api.jquery.com/index/

//         // finds index of particular parameter and removes them
//         for(n = 0; n < fobj.rfunctions[stat_index].parameter.length; n++) {
//             generated_parameters.splice((generated_parameters.indexOf(fobj.rfunctions[stat_index].parameter[n])), 1);
//         };

//         // calls the parameter generating function
//         parameter_fields();
//     }
// };






























// // // Generates the list of possible statistics
// function list_of_statistics (variable) {
//     var options = "";
//     for (n = 0; n < fobj.rfunctions.length; n++) {
//         options += "<input type='checkbox' name='stat' onclick='Parameter_Populate(this.id," + n + ")' id='" + fobj.rfunctions[n].func.replace(/\s/g, '_') + "_" + variable + "'> " + fobj.rfunctions[n].func + "<br>";
//     };
//     alert(options); 
// };


// var options = "";
// for (n = 0; n < fobj.rfunctions.length; n++) {
//     options += "<input type='checkbox' name='stat' onclick='Parameter_Populate(this.id," + n + ")' id='" + fobj.rfunctions[n].func.replace(/\s/g, '_') + "'> " + fobj.rfunctions[n].func + "<br>";
// };






// // Makes a checklist of possible statistics 
// function available_statistics() {
//     var options = "";
//     for (n = 0; n < fobj.rfunctions.length; n++) {
//         options += "<input type='checkbox' name='stat' onclick='Parameter_Populate(this.id," + n + ")' id='" + fobj.rfunctions[n].func.replace(/\s/g, '_') + "'> " + fobj.rfunctions[n].func + "<br>";
//     };
//     $(".released_statistics").append(options);
// };


// // Stores metadata in memory
// function Parameter_Memory(parameter_id) {
//     var metadata = document.getElementById(parameter_id).value;
//     alert(metadata);
// };












// // generates html based on statistics choosen
// function parameter_fields() {
//     // makes blank html text
//     var parameter_field = "";
        
//     // uses .unique() to get all unique values and iterate through
//     for (n = 0; n < generated_parameters.unique().length; n++) {
//         // creates html list in .sort() (alphabet order)
//         parameter_field += generated_parameters.unique().sort()[n] + ": <input type='text' id='input_" + generated_parameters.unique().sort()[n].replace(/\s/g, '') +"' oninput='Parameter_Memory(this.id)'><br>"
//     };

//     // prints this all out, display seems smooth
//     document.getElementById('necessary_parameters').innerHTML = parameter_field; 
// };

// // Produce parameter fields
// // http://www.w3schools.com/jsref/tryit.asp?filename=tryjsref_oninput
// function Parameter_Populate(stat_id, stat_index) {
//     // checks if thing is checked
//     if ($("#" + stat_id).prop('checked')) {
//         // adds parameters to master array
//         // does simple push, so added in the order selected and listed
//         for(n = 0; n < fobj.rfunctions[stat_index].parameter.length; n++) {
//             generated_parameters.push(fobj.rfunctions[stat_index].parameter[n]);
//         };

//         // Adds to global metadata table
//         // Naive (current) metadata structure: [id/index, Variable Name, Variable Type, Statistic, Epsilon, Accuracy, Hold Status, ... All Possible Metadata ...]
//         metadata_to_add = [index_id, ]

//         // calls the parameter generating function
//         parameter_fields();
//     }

//     // if not checked
//     else {
//         // splice.() help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_fobjects/Array/splice
//         // index() help: https://api.jquery.com/index/

//         // finds index of particular parameter and removes them
//         for(n = 0; n < fobj.rfunctions[stat_index].parameter.length; n++) {
//             generated_parameters.splice((generated_parameters.indexOf(fobj.rfunctions[stat_index].parameter[n])), 1);
//         };

//         // calls the parameter generating function
//         parameter_fields();
//     }
// };












// // Produce parameter fields
// function myFunction(stat_id){
//     if ($("#" + stat_id).prop('checked')) {
//         $("#necessary_parameters").append(stat_id);
//     }
//     else {
//         $("#necessary_parameters").append('dogs');
//     }
//     // document.getElementById('necessary_parameters').innerHTML = 'hi';
// };






// Collapsable Sections
// http://www.w3schools.com/howto/howto_js_accordion.asp
// var acc = document.getElementsByClassName("accordion");

// for (i = 0; i < acc.length; i++) {
//     acc[i].onclick = function() {
//         this.classList.toggle("active");
//         this.nextElementSibling.classList.toggle("show");
//     }
// }

$(document).ready(function () {	
	// sidebar action, with toggle and text-switch
	$("#sidebar-toggle").click(function() {
        $(this).text(function(i, v){
        	return v === '>>' ? '<<' : '>>'
        });
        $("#wrapper").toggleClass("toggled");
    });


    // Produces parameter fields





    // Produces parameter fields
    // if (document.getElementById('Mean').is(':checked') {
    //     alert("swag");
    // });












    // Clone form fields
    // $("#add-new").click(function() {
    //     $("#statistic").clone().prependTo("#add-new");
    // });

    // Demo of using JSON data
	// function available_statistics() { 
 //       var fobj = JSON.parse(functions);
	//    var text = "";
 //       var n; 
 //       for (n = 0; n < fobj.rfunctions.length; n++) {
 //        text += "<input type='checkbox' name='stat' value='" + fobj.rfunctions[n].func + "'> " + fobj.rfunctions[n].func + "<br>";
 //        };
 //        $(".released_statistics").append(text);
 //    };

    // fobj.rfunctions[2].func = Quantile 
    // fobj.rfunctions[2].parameter[1] = Upper Bound
    // fobj.rfunctions.length = 3










	// alert(height);
	// document.getElementById('header-wrap').style.height = '90px';
	// $(function() {
	// 	$('#wrapper').toggleClass('toggled');
	// });
 //    $('#additional-parameters').click(function(e) {
 //        e.preventDefault();
 //        $('#wrapper').toggleClass('toggled');
    // });
    // $("#menu-toggle").click(function(e) {
    //     e.preventDefault();
    //     $("#wrapper").toggleClass("toggled");
    // });
});

