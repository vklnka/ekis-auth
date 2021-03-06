var DEFAULT_URL = 'https://ms45.edu.ru/ekis_auth/';

var cookies = document.cookie.split(/;\s+/);

var remember_field = document.getElementById("remember");

if (remember_field) {

	// Please don't remember me
	var remember_div = remember_field.parentElement;

	remember_div.style.display = 'none';
	remember_div.style.visibility = 'hidden';
	remember_div.innerHTML = '<span style="display: block; text-align: center;"><img src="chrome-extension://'+chrome.runtime.id+'/spinner.gif" alt="Please wait" style="margin: auto; width: 64px;"/></span>';

	var username_field = document.getElementById("username");
	var password_field = document.getElementById("password");

	var form = remember_div.parentElement;

	var buttons = form.getElementsByTagName("button");

	document.body.children[0].children[0].children[0].children[1].children[0].children[0].innerHTML = "Сайт отключен от «Единой системы авторизации Департамента образования города Москвы» (что бы это не значило) и подключен к системе авторизации Гимназии № 45.";

	function show_error(text) {
		var error_message_display = document.getElementById("system-message-container");
		if (text === '') {
			error_message_display.innerHTML = "";
		} else {
			error_message_display.innerHTML = '<div id="system-message"><div class="alert alert-warning"><a class="close" data-dismiss="alert">×</a>'+
			'<h4 class="alert-heading">Предупреждение</h4><div><div class="alert-message">'+
			text+'</div></div></div></div>';
		}
	}

	var url;
	chrome.storage.sync.get("ekisAuthURL", function(items) {
		if (typeof items.ekisAuthURL !== 'undefined') {
			url = items.ekisAuthURL;
		} else {
			url = DEFAULT_URL;
		}
		console.log(url);
	})

	form.addEventListener("submit", function(event) {
		event.preventDefault();

		if (typeof url === 'undefined') {
			return false;
		}

		show_error("");

		username_field.disabled = true;
		password_field.disabled = true;

		for (b=0; b<buttons.length; b++) {
			console.log(buttons[b])
			buttons[b].style.display = "none";
			buttons[b].style.visibility = "hidden";
		}

		remember_div.style.display = 'block';
		remember_div.style.visibility = 'visible';

		var xhr = new XMLHttpRequest();
		xhr.open('POST', url, true);
	 
		xhr.addEventListener("readystatechange", function(e){
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					var response = JSON.parse(xhr.responseText);
					chrome.runtime.sendMessage(response, function(response) {
						console.log(response);
						window.location.href = "http://lk.educom.ru/news.html";
					});
				} else {
					if (xhr.status == 403) {
						show_error("Неправильный логин или пароль.");
						console.log("Auth failed");
					} else {
						show_error("Произошла неизвестная ошибка. Попробуйте повторить попытку входа позднее.");
						console.log("Unknown error");
					}
					username_field.disabled = false;
					password_field.disabled = false;
					password_field.value = ""

					for (b=0; b<buttons.length; b++) {
						buttons[b].style.display = "block";
						buttons[b].style.visibility = "visible";
					}

					remember_div.style.display = 'none';
					remember_div.style.visibility = 'hidden';
				}
			} 
		}, false);
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
		xhr.send('username='+username_field.value+'&password='+password_field.value);
	}, false); 
}