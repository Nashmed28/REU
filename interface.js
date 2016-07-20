// types, categorical, numerical, and boolean
// mean -> num (lower,upper), bool (bins)
// histogram -> categorical (), numerical(), and boolean()
// quantile -> numerical bool 
// bivariate -> categorical
// func, <types: metadata per type>
// build set of types dynamically



// JSON data of r-libraries (Fanny's work will provide these)
// List of variables to make form bubbles (Fanny's work will provide these)
var functions = '{"rfunctions":[' +
	'{"func":"Mean","parameter":["Lower Bound", "Upper Bound"] },' +
	'{"func":"Histogram","parameter":["Number of Bins"] },' +
	'{"func":"Quantile","parameter": ["Lower Bound", "Upper Bound", "Granularity"] },' +
    '{"func":"Bivariate Analysis","parameter": ["Lower Bound", "Upper Bound", "y-Lower Bound", "y-Upper Bound", "R-coefficient"] } ],' + 
    '"varlist": ["var1", "var2"] }';

// Parses the function and varlist data structure
var fobj = JSON.parse(functions);

// Locally global array of parameters need for a single variable
var generated_parameters = [];

// Global table of metadata (as inputed by user)
var inputted_metadata = [];



// Unique array function (source: http://stackoverflow.com/questions/11246758/how-to-get-unique-values-in-an-array)
Array.prototype.unique = function () {
    var arr = this;
    return $.grep(arr, function (v, i) {
        return $.inArray(v, arr) === i;
    });
};

// Makes a checklist of possible statistics 
function available_statistics() { 
    var options = "";
    for (n = 0; n < fobj.rfunctions.length; n++) {
        options += "<input type='checkbox' name='stat' onclick='Parameter_Populate(this.id," + n + ")' id='" + fobj.rfunctions[n].func.replace(/\s/g, '') + "'> " + fobj.rfunctions[n].func + "<br>";
    };
    $(".released_statistics").append(options);
};




function Parameter_Memory(parameter_id) {
    var metadata = document.getElementById(parameter_id).value;
    alert(metadata);
};





// generates html based on statistics choosen
function parameter_fields() {
    // makes blank html text
    var parameter_field = "";
        
    // uses .unique() to get all unique values and iterate through
    for (n = 0; n < generated_parameters.unique().length; n++) {
        // creates html list in .sort() (alphabet order)
        parameter_field += generated_parameters.unique().sort()[n] + ": <input type='text' id='input_" + generated_parameters.unique().sort()[n].replace(/\s/g, '') +"' oninput='Parameter_Memory(this.id)'><br>"
    };

    // prints this all out, display seems smooth
    document.getElementById('necessary_parameters').innerHTML = parameter_field; 
};

// Produce parameter fields
function Parameter_Populate(stat_id, stat_index) {
    // checks if thing is checked
    if ($("#" + stat_id).prop('checked')) {
        // adds parameters to master array
        // does simple push, so added in the order selected and listed
        for(n = 0; n < fobj.rfunctions[stat_index].parameter.length; n++) {
            generated_parameters.push(fobj.rfunctions[stat_index].parameter[n]);
        };

        // calls the parameter generating function
        parameter_fields();
    }

    // if not checked
    else {
        // splice.() help: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_fobjects/Array/splice
        // index() help: https://api.jquery.com/index/

        // finds index of particular parameter and removes them
        for(n = 0; n < fobj.rfunctions[stat_index].parameter.length; n++) {
            generated_parameters.splice((generated_parameters.indexOf(fobj.rfunctions[stat_index].parameter[n])), 1);
        };

        // calls the parameter generating function
        parameter_fields();
    }
};












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

$(document).ready(function () {	
	// sidebar action, with toggle and text-switch
	$("#sidebar-toggle").click(function() {
        $(this).text(function(i, v){
        	return v === '>>' ? '<<' : '>>'
        });
        $("#wrapper").toggleClass("toggled");
    });

	// Collapsable Sections
    var acc = document.getElementsByClassName("accordion");
    var i;

    for (i = 0; i < acc.length; i++) {
        acc[i].onclick = function(){
            this.classList.toggle("active");
            this.nextElementSibling.classList.toggle("show");
      }
    }

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

