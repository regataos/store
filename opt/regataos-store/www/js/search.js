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
		$("#iframe-regataos-store").attr("src", linkstore + "search?q=" + data);

		// Clear cache
		const fs = require('fs');
		if (fs.existsSync("/tmp/regataos-store/go-installed")) {
			fs.unlinkSync("/tmp/regataos-store/go-installed");
		}

		// Take the page to the top
		window.scrollTo(0,0);

		// Prevent form submission
		e.preventDefault();
	});
}

search();
