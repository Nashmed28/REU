// JSON data of r-libraries
var text = '{"rfunctions":[' +
	'{"func":"Mean","parameter":["Lower Bound", "Upper Bound", "Granularity"] },' +
	'{"func":"Histogram","parameter":["Number of Bins"] },' +
	'{"func":"Quantile","parameter": ["Lower Bound", "Upper Bound", "Granularity"] }]}';




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

    // Clone form fields
    $("#add-new").click(function() {
        $("#statistic").clone().prependTo("#add-new");
    });

    // Demo of using JSON data
	obj = JSON.parse(text);
	document.getElementById("demo").innerHTML =
	obj.rfunctions[2].func + " " + obj.rfunctions[2].parameter[1];
	     	











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

