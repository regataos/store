// Enter the size of the site so that the iframe script knows the size of the height
window.addEventListener("load", function(){
    if(window.self === window.top) return; // if w.self === w.top, we are not in an iframe 
    send_height_to_parent_function = function(){
        var height = "loaded";
        //console.log("Sending height as " + height + "px");
        parent.postMessage({"height" : height }, "*");
    }
    // send message to parent about height updates
    send_height_to_parent_function(); //whenever the page is loaded
    window.addEventListener("resize", send_height_to_parent_function); // whenever the page is resized
    var observer = new MutationObserver(send_height_to_parent_function);           // whenever DOM changes PT1
    var config = { attributes: true, childList: true, characterData: true, subtree:true}; // PT2
    observer.observe(window.document, config);                                            // PT3 
});

// Translate to English
$(document).ready(function() {
	var url = window.location.href;
	
	if (url.indexOf("en-newstore") > -1) {
		$(".descricao-app2").text("FREE");
		$(".app-version").text("| Version:");

		$(".game-button").text("Install");
		$(".install-button").text("Install");
		$(".open-button").text("Open");
		$(".remove-button").text("Remove");
	}
});
