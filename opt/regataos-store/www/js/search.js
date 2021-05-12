// Search
function search() {
var form = document.getElementById('form');
var field = document.getElementById('field');

checklang();

form.addEventListener('submit', function(e) {
	// Capture the search
	var data = field.value
	$('#field').val("");

	// Go search page
	$("#iframeregata").attr("src", linkstore + "search?q=" + data);

	// Take the page to the top
	window.scrollTo(0,0);

	// Prevent form submission
	e.preventDefault();
});
}

search();
