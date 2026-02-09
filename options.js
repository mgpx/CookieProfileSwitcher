var extVersionNumber = extension.getExtensionVersion();


function init(){
	$('#about-extension-version').html(extVersionNumber);
	loadChangelog();
	loadProfileData();
	loadDomainManager();
}

function loadChangelog() {
	var url = extension.getResourceURL("changelog.md");
	$.get(url).done(function(text) {
		var converter = new showdown.Converter();
		var html = converter.makeHtml(text);
		$("#changelog-content").html(html);
	});
}

function loadProfileData(){
	chrome.storage.local.get('profiles', function(items){
		var profile = (items && items.profiles) ? items.profiles : {};
		$('#profile-data-textarea').val(JSON.stringify(profile, undefined, "\t"));
	});
	
}

function saveProfileData(){
	var profile = JSON.parse($('#profile-data-textarea').val());
	if(!jQuery.isEmptyObject(profile)){
		if(confirm("Are you sure you want to save profile data?")){
			chrome.storage.local.set({'profiles': profile}, function(){
				loadDomainManager();
			});
		}
		else{
		}
		
	}
}

function clearProfileData(){
	var profile = {};
	if(confirm("Are you sure you want to clear profile data?")){
		chrome.storage.local.set({'profiles': profile}, function(){
			$('#profile-data-textarea').val("");
			loadDomainManager();
		});
	}
	else{
	}
}
function exportProfileData(){
	chrome.storage.local.get('profiles', function(items){
		var profile;
		if(jQuery.isEmptyObject(items) || jQuery.isEmptyObject(items.profiles)){
			
		}
		else{
			profile = JSON.parse(JSON.stringify(items.profiles));
			var dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(JSON.stringify(profile, undefined, "\t"));
			downloadURI(dataUri, "CookieProfileSwitcher.json");
		}
	});
}

function clearCookieData(){
	chrome.storage.local.get('profiles', function(items){
		var profile;
		if(!jQuery.isEmptyObject(items) && !jQuery.isEmptyObject(items.profiles)){
			profile = JSON.parse(JSON.stringify(items.profiles));
			console.log(JSON.stringify(profile));
		}
	});
}

function sendEmail() {
    var emailUrl = "mailto:emerysteele@gmail.com?Subject=Cookie%20Profile%20Switcher%20-%20Feedback";
    chrome.tabs.create({ url: emailUrl }, function(tab) {
        setTimeout(function() {
            chrome.tabs.remove(tab.id);
        }, 500);
    });
}

function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

function importProfileData(e){
	var files = e.target.files, reader = new FileReader();
	reader.onload = _imp;
	reader.readAsText(files[0]);
}

function _imp() {
	var _myImportedData = JSON.parse(this.result);
	if(!jQuery.isEmptyObject(_myImportedData)){
		chrome.storage.local.set({'profiles': _myImportedData}, function(){
			$('#profile-data-textarea').val(JSON.stringify(_myImportedData, undefined, "\t"));
			loadDomainManager();
		});
	}
	$('#import-profile-data-input').val("");
}

function loadDomainManager(){
	chrome.storage.local.get('profiles', function(items){
		var profiles = (items && items.profiles) ? items.profiles : {};
		var domains = Object.keys(profiles).sort();
		var $select = $('#domain-select');
		$select.empty();
		if(domains.length === 0){
			$select.append($('<option/>', { value: '', text: 'No domains found' }));
			$('#domain-profiles').html('<div class="muted">No profiles saved.</div>');
			return;
		}
		for(var i = 0; i < domains.length; i++){
			$select.append($('<option/>', { value: domains[i], text: domains[i] }));
		}
		renderDomainProfiles(domains[0]);
	});
}

function renderDomainProfiles(domain){
	chrome.storage.local.get('profiles', function(items){
		var profiles = (items && items.profiles) ? items.profiles : {};
		var domainData = profiles[domain];
		var $container = $('#domain-profiles');
		$container.empty();
		if(!domainData || !domainData.profileData){
			$container.html('<div class="muted">No profiles for this domain.</div>');
			return;
		}
		var current = domainData.currentProfile;
		var keys = Object.keys(domainData.profileData);
		if(keys.length === 0){
			$container.html('<div class="muted">No profiles for this domain.</div>');
			return;
		}
		for(var i = 0; i < keys.length; i++){
			var name = keys[i];
			var $item = $('<div/>', { 'class': 'profile-item' });
			var $name = $('<div/>', { 'class': 'profile-name' + (name === current ? ' current' : ''), text: name });
			var $actions = $('<div/>', { 'class': 'profile-actions' });
			var $setCurrent = $('<button/>', { 'class': 'btn btn-info', text: 'Set Current' });
			var $rename = $('<button/>', { 'class': 'btn btn-default', text: 'Rename' });
			var $remove = $('<button/>', { 'class': 'btn btn-danger', text: 'Remove' });

			(function(domain, name){
				$setCurrent.on('click', function(){
					chrome.storage.local.get('profiles', function(items){
						var profiles = (items && items.profiles) ? items.profiles : {};
						if(!profiles[domain]){ return; }
						profiles[domain].currentProfile = name;
						chrome.storage.local.set({'profiles': profiles}, function(){
							renderDomainProfiles(domain);
						});
					});
				});
				$rename.on('click', function(){
					var newName = prompt('New profile name:', name);
					if(!newName || newName === name){ return; }
					chrome.storage.local.get('profiles', function(items){
						var profiles = (items && items.profiles) ? items.profiles : {};
						if(!profiles[domain] || !profiles[domain].profileData){ return; }
						if(profiles[domain].profileData[newName]){
							alert('A profile with that name already exists.');
							return;
						}
						profiles[domain].profileData[newName] = profiles[domain].profileData[name];
						delete profiles[domain].profileData[name];
						if(profiles[domain].currentProfile === name){
							profiles[domain].currentProfile = newName;
						}
						chrome.storage.local.set({'profiles': profiles}, function(){
							renderDomainProfiles(domain);
						});
					});
				});
				$remove.on('click', function(){
					if(!confirm('Remove this profile?')){ return; }
					chrome.storage.local.get('profiles', function(items){
						var profiles = (items && items.profiles) ? items.profiles : {};
						if(!profiles[domain] || !profiles[domain].profileData){ return; }
						delete profiles[domain].profileData[name];
						var remaining = Object.keys(profiles[domain].profileData);
						if(remaining.length === 0){
							delete profiles[domain];
						}
						else if(profiles[domain].currentProfile === name){
							profiles[domain].currentProfile = remaining[0];
						}
						chrome.storage.local.set({'profiles': profiles}, function(){
							if(profiles[domain]){
								renderDomainProfiles(domain);
							}
							else{
								loadDomainManager();
							}
						});
					});
				});
			})(domain, name);

			$actions.append($setCurrent);
			$actions.append($rename);
			$actions.append($remove);
			$item.append($name);
			$item.append($actions);
			$container.append($item);
		}
	});
}

function deleteDomain(){
	var domain = $('#domain-select').val();
	if(!domain){ return; }
	if(!confirm('Delete all profiles for this domain?')){ return; }
	chrome.storage.local.get('profiles', function(items){
		var profiles = (items && items.profiles) ? items.profiles : {};
		if(profiles[domain]){
			delete profiles[domain];
			chrome.storage.local.set({'profiles': profiles}, function(){
				loadDomainManager();
			});
		}
	});
}


function downloadURI(uri, name) {
  var link = document.createElement("a");
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  delete link;
}

document.addEventListener('DOMContentLoaded', function() {
  init();
  document.querySelector('#save-profile-data').addEventListener('click', saveProfileData);
  document.querySelector('#clear-profile-data').addEventListener('click', clearProfileData);
  //document.querySelector('#clear-cookie-data').addEventListener('click', clearCookieData);
  document.querySelector('#import-profile-data').addEventListener('click', function(){$('#import-profile-data-input').click();});
  document.querySelector('#import-profile-data-input').addEventListener('change', importProfileData);
  document.querySelector('#export-profile-data').addEventListener('click', exportProfileData);
  document.querySelector('#send-email').addEventListener('click', sendEmail);
  document.querySelector('#refresh-domains').addEventListener('click', loadDomainManager);
  document.querySelector('#delete-domain').addEventListener('click', deleteDomain);
  document.querySelector('#domain-select').addEventListener('change', function(e){ renderDomainProfiles(e.target.value); });
  //document.querySelector('#profileCreate_button').addEventListener('click', newProfile);
  //document.body.addEventListener('click', focusFilter);
  //document.querySelector('#remove_button').addEventListener('click', removeAll);
  //document.querySelector('#import_button').addEventListener('click', importCookies);
  //document.querySelector('#filter_div input').addEventListener(
  //    'input', reloadCookieTable);
  //document.querySelector('#filter_div button').addEventListener(
  //    'click', resetFilter); 
});
