var height = document.getElementById('mainbar').offsetHeight;


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

    $("#add-new").click(function() {
        $("#statistic").clone().prependTo("#add-new");
    });

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