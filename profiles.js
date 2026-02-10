var debugMode = false;

var url, tab, currentDomain;
var origProfileTable = "";

//CONSOLE LOG CONTROLLER //
function debugLog(logData){
	if(debugMode == true){
		console.log(logData);
	}
}
function showToast(message){
	var toast = document.getElementById('toast');
	if(!toast){ return; }
	toast.textContent = message;
	toast.classList.add('show');
	setTimeout(function(){
		toast.classList.remove('show');
	}, 1400);
}

// BEGIN DOMAIN FUNCTIONS //
function getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
		debugLog(match[2]);
    return match[2];
    }
    else {
        return null;
    }
}
function isIpHost(hostname){
	return /^[0-9]{1,3}(\.[0-9]{1,3}){3}$/.test(hostname);
}
function getDomain(url) {
    var hostName = getHostName(url);
    var domain = url;
    
    if (hostName != null) {
        var parts = hostName.split('.').reverse();
        
        if (parts != null && parts.length > 1) {
            domain = parts[1] + '.' + parts[0];
                
            if (hostName.toLowerCase().indexOf('.co.uk') != -1 && parts.length > 2) {
              domain = parts[2] + '.' + domain;
            }
        }
        else {
            domain = hostName;
        }
    }
    debugLog(domain);
    return domain;
}
function getDomainKey(activeUrl){
	try{
		var u = new URL(activeUrl);
		var hostname = u.hostname;
		var port = u.port;
		if(hostname === 'localhost' || isIpHost(hostname) || hostname.indexOf('.') === -1){
			return port ? hostname + ':' + port : hostname;
		}
		return getDomain(activeUrl);
	}
	catch(e){
		return getDomain(activeUrl);
	}
}
// END DOMAIN FUNCTIONS //


// BEGIN PROFILE FUNCTIONS //
function addProfileListeners(){
	var classname = document.getElementsByClassName("changeProfile");

	for (var i = 0; i < classname.length; i++) {
		classname[i].addEventListener('click', changeProfile, false);
	}
	
	var classname = document.getElementsByClassName("editProfile");

	for (var i = 0; i < classname.length; i++) {
		classname[i].addEventListener('click', editProfile, false);
	}
	var classname = document.getElementsByClassName("removeProfile");

	for (var i = 0; i < classname.length; i++) {
		classname[i].addEventListener('click', removeProfile, false);
	}
	var classname = document.getElementsByClassName("saveProfileCookies");

	for (var i = 0; i < classname.length; i++) {
		classname[i].addEventListener('click', saveCurrentProfileCookies, false);
	}
	document.querySelector('#profileCreate_button').addEventListener('click', newProfile, false);
}
function editProfile(event){
	var target = event.currentTarget;
	var oldProfileName = target.getAttribute('data-profileName');
	debugLog("Clicked");
	$(target).html("save");
	$(target).parent().parent().parent().find('.changeProfile').hide();
	$(target).parent().parent().parent().find('.profileLabel').hide();
	$(target).parent().parent().parent().find('input').show();
	target.removeEventListener('click', editProfile, false);
	target.addEventListener('click', saveProfileName, false);
	//$(target).parent().parent().parent().find('input').text(target.getAttribute('data-profileName'));
	
	
	
	
}
function saveProfileName(event){
	var target = event.currentTarget;
	
	
	chrome.storage.local.get('profiles', function(items){
		var currentDomain = $('#domain_label').html();
		var currentProfile = $('#profile_label').html();
		var profile = {};
		var domainProfile = {};
		
		if(jQuery.isEmptyObject(items) || jQuery.isEmptyObject(items.profiles) || jQuery.isEmptyObject(items.profiles[currentDomain])){
			domainProfile = JSON.parse('{"currentProfile":"Profile 1", "profileData":{"Profile 1": []}}');
			if(!jQuery.isEmptyObject(items.profiles)){
				profile = JSON.parse(JSON.stringify(items.profiles));
			}
			profile[currentDomain] = domainProfile;
	
		}
		else{
			profile = items.profiles;
			debugLog(JSON.stringify(profile));
			domainProfile = profile[currentDomain];
		}
		if (target.getAttribute('data-profileName') !== $(target).parent().parent().parent().find('input').text()) {
			var temp = JSON.parse(JSON.stringify(profile));
			var newProfileName = $(target).parent().parent().parent().find('input').val();
			delete profile[currentDomain]['profileData'][target.getAttribute('data-profileName')];
			profile[currentDomain]['profileData'][newProfileName] = temp[currentDomain]['profileData'][target.getAttribute('data-profileName')];
			if(profile[currentDomain]['currentProfile'] == target.getAttribute('data-profileName')){
				profile[currentDomain]['currentProfile'] = newProfileName;
			}
		chrome.storage.local.set({ "profiles": profile }, function(){
			loadProfiles();
		});
		}
		
		
		//console.log(JSON.stringify(profile));
	});
}
function removeProfile(event){
	var target = event.currentTarget.getAttribute('data-profileName');
	chrome.storage.local.get('profiles', function(items){
		var currentDomain = $('#domain_label').html();
		var currentProfile = $('#profile_label').html();
		var profile = (items && items.profiles) ? items.profiles : {};
		if(!profile[currentDomain] || !profile[currentDomain]['profileData']){ return; }
		
		delete profile[currentDomain]['profileData'][target];
		
		var remainingProfiles = Object.keys(profile[currentDomain]['profileData']);
		if(remainingProfiles.length === 0){
			delete profile[currentDomain];
		}
		else if(currentProfile == target){
			profile[currentDomain]['currentProfile'] = remainingProfiles[0];
		}
		
		chrome.storage.local.set({ "profiles": profile }, function(){
			loadProfiles();
		});
		//console.log(JSON.stringify(profile));
	});
}
function resetDomain(){
	chrome.storage.local.get('profiles', function(items){
		var currentDomain = $('#domain_label').html();
		var profile = items.profiles;
		
		delete profile[currentDomain];
		
		chrome.storage.local.set({ "profiles": profile }, function(){
			loadProfiles();
		});
	});
}
function loadProfiles(){
	if(origProfileTable == ""){
		origProfileTable = $('#profileTable').html();
	}
	else{
		$('#profileTable').html(origProfileTable);
	}
	chrome.storage.local.get('profiles', function(items){
		var domain = $('#domain_label').html();
		var profile;
		var profiles = (items && items.profiles) ? items.profiles : {};
		if(url){
			var domainKey = getDomainKey(url);
			if(profiles[url] && !profiles[domainKey]){
				profiles[domainKey] = profiles[url];
				delete profiles[url];
				chrome.storage.local.set({ "profiles": profiles }, function(){});
			}
			if(domainKey && domainKey !== domain){
				domain = domainKey;
				currentDomain = domainKey;
				domainLoaded();
			}
		}
		
		if(jQuery.isEmptyObject(items) || jQuery.isEmptyObject(items.profiles) || jQuery.isEmptyObject(items.profiles[currentDomain])){
			$('#profile_label').html('No active profile');
			var emptyTableRef = document.getElementById('profileTable').getElementsByTagName('tbody')[0];
			var emptyRow = emptyTableRef.insertRow(1);
			var emptyCell = emptyRow.insertCell(0);
			emptyCell.colSpan = 2;
			emptyCell.className = "smallText";
			emptyCell.textContent = "This domain has no profiles yet. Create your first profile to start.";
			addProfileListeners();
			return;
		}
		else{
			profile = profiles[domain];
		}
		$('#profile_label').html(profile['currentProfile'] || 'No active profile');
		//$('#storage_label').html(JSON.stringify(profile['profileData']));
		
		for (var profileData in profile['profileData']){
			if (typeof profile['profileData'][profileData] !== 'function') {
				var tableRef = document.getElementById('profileTable').getElementsByTagName('tbody')[0];
				// Insert a row in the table at row index 0
				var newRow   = tableRef.insertRow(tableRef.rows.length - 1);
				// Insert a cell in the row at index 0
				var newCell  = newRow.insertCell(0);
				// Append a text node to the cell
				
				var textbox = document.createElement('input');
				textbox.setAttribute("hidden", "true");
				textbox.type = "textbox";
				textbox.setAttribute("value", profileData);
				
				var a  = document.createElement('a');
				
				var linkText  = document.createTextNode(profileData);
				
				if($('#profile_label').html() != profileData){
					a.appendChild(linkText);
					a.href = "#";
					a.className = "changeProfile";
					
					newCell.appendChild(a);
				}
				else{
					var span = document.createElement('a');
					span.className = "profileLabel";
					span.appendChild(linkText);
					
					newCell.appendChild(span);
				}
				
				newCell.appendChild(textbox);
				
				
				var newCell2  = newRow.insertCell(1);
				newCell2.className = "no-wrap";
				var a2 = document.createElement('a');
				a2.innerHTML = '<i class="fa fa-pencil"></i>';
				a2.href = "#";
				a2.setAttribute('data-profileName', profileData);
				a2.setAttribute('title', 'Edit');
				a2.setAttribute('aria-label', 'Edit');
				a2.className = "editProfile";
				
				var a3 = document.createElement('a');
				a3.innerHTML = '<i class="fa fa-times"></i>';
				a3.href = "#";
				a3.setAttribute('data-profileName', profileData);
				a3.setAttribute('title', 'Remove');
				a3.setAttribute('aria-label', 'Remove');
				a3.className = "removeProfile";
				
				var cellSpan = document.createElement('span');
				cellSpan.appendChild(a2);
				cellSpan.appendChild(document.createTextNode(" "));
				cellSpan.appendChild(a3);
				if($('#profile_label').html() == profileData){
					var a4 = document.createElement('a');
					a4.innerHTML = '<i class="fa fa-save"></i>';
					a4.href = "#";
					a4.setAttribute('data-profileName', profileData);
					a4.setAttribute('title', 'Save cookies');
					a4.setAttribute('aria-label', 'Save cookies');
					a4.className = "saveProfileCookies";
					cellSpan.appendChild(document.createTextNode(" "));
					cellSpan.appendChild(a4);
				}
				cellSpan.className = "smallText";
				
				newCell2.appendChild(cellSpan);
			}
		}
		addProfileListeners();
		//console.log(JSON.stringify(profile));
		loadDomainCookieStore();
	});
}
function newProfile(){
	var newProfileName = $('#profileName_input').val();
	var cloneCookies = $('#clone-cookies-checkbox').is(':checked');
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var activeUrl = (tabs && tabs.length > 0) ? tabs[0].url : null;
		if(!activeUrl || activeUrl.indexOf('http') !== 0){
			showToast('No active site');
			return;
		}
		var domainFromUrl = getDomainKey(activeUrl);
		chrome.storage.local.get('profiles', function(items){
			var profile = {};
			var domainProfile = {};
			var isFirstProfileForDomain = (jQuery.isEmptyObject(items) || jQuery.isEmptyObject(items.profiles) || jQuery.isEmptyObject(items.profiles[domainFromUrl]));
		
			if(isFirstProfileForDomain){
				domainProfile = JSON.parse('{"currentProfile":"", "profileData":{}}');
			}
			else{
				domainProfile = items.profiles[domainFromUrl];
			}

			if(!jQuery.isEmptyObject(items) && !jQuery.isEmptyObject(items.profiles)){
				profile = items['profiles'];
			}
		
			if(newProfileName != "")
			{
				if(isFirstProfileForDomain){
					chrome.cookies.getAll({ url: activeUrl }, function(cookies) {
						domainProfile['profileData'][newProfileName] = cookies || [];
						domainProfile['currentProfile'] = newProfileName;
						profile[domainFromUrl] = domainProfile;
						currentDomain = domainFromUrl;
						domainLoaded();
						$('#profile_label').html(domainProfile['currentProfile']);
						chrome.storage.local.set({ "profiles": profile }, function(){
							loadProfiles();
							showToast('Profile created with current cookies');
						});
					});
				}
				else if(cloneCookies === true){
					chrome.cookies.getAll({ url: activeUrl }, function(cookies) {
						domainProfile['profileData'][newProfileName] = cookies;
						profile[domainFromUrl] = domainProfile;
						currentDomain = domainFromUrl;
						domainLoaded();
						$('#profile_label').html(domainProfile['currentProfile'] || 'No active profile');
						chrome.storage.local.set({ "profiles": profile }, function(){
							loadProfiles();
						});
					});
				}
				else{
					domainProfile['profileData'][newProfileName] = [];
					profile[domainFromUrl] = domainProfile;
					currentDomain = domainFromUrl;
					domainLoaded();
					$('#profile_label').html(domainProfile['currentProfile'] || 'No active profile');
					chrome.storage.local.set({ "profiles": profile }, function(){
						loadProfiles();
					});
				}
			}
			return;
		});
	});
}
function saveCurrentProfileCookies(event){
	var target = event.currentTarget.getAttribute('data-profileName');
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var activeUrl = (tabs && tabs.length > 0) ? tabs[0].url : null;
		if(!activeUrl || activeUrl.indexOf('http') !== 0){
			showToast('No active site');
			return;
		}
		var domainFromUrl = getDomainKey(activeUrl);
		var cookieQuery = { url: activeUrl };
		chrome.cookies.getAll(cookieQuery, function(cookies) {
			chrome.storage.local.get('profiles', function(items){
				var profile = {};
				if(items && items.profiles){
					profile = items.profiles;
				}
				if(!profile[domainFromUrl]){
					profile[domainFromUrl] = { "currentProfile": target, "profileData": {} };
				}
				if(!profile[domainFromUrl]['profileData']){
					profile[domainFromUrl]['profileData'] = {};
				}
				profile[domainFromUrl]['profileData'][target] = cookies;
				if(!profile[domainFromUrl]['currentProfile']){
					profile[domainFromUrl]['currentProfile'] = target;
				}
				chrome.storage.local.set({ "profiles": profile }, function(){
					currentDomain = domainFromUrl;
					domainLoaded();
					loadProfiles();
					showToast('Saved cookies');
				});
			});
		});
	});
}
function extrapolateUrlFromCookie(cookie) {
    var prefix = cookie.secure ? "https://" : "http://";
    if (cookie.domain.charAt(0) == ".")
        prefix += "www";

    return prefix + cookie.domain + cookie.path;
}
function changeProfile(event){
	var target = event.target;
	var saveData = (event && event.saveData === true);
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		var activeUrl = (tabs && tabs.length > 0) ? tabs[0].url : null;
		if(!activeUrl || activeUrl.indexOf('http') !== 0){
			showToast('No active site');
			return;
		}
		var currentDomain = $('#domain_label').html();
		chrome.cookies.getAll({url: activeUrl}, function(cookies) {
			var currentProfile = $('#profile_label').html();
			
			chrome.storage.local.get('profiles', function(items){
				var currentDomain = $('#domain_label').html();
				var oldProfileData = cookies;
				var newProfileData = items.profiles[currentDomain]['profileData'][target.innerHTML];
				
				var profile = items.profiles;
				var domainProfiles = profile[currentDomain]['profileData'];
				
				if(saveData === true){
					domainProfiles[currentProfile] = oldProfileData;
				}
				profile[currentDomain]['currentProfile'] = target.innerHTML;
				profile[currentDomain]['profileData'] = domainProfiles;
				
				
				for(var i=0; i<cookies.length;i++) {
					chrome.cookies.remove({url: extrapolateUrlFromCookie(cookies[i]), name: cookies[i].name});
				}
				
				if(newProfileData.length > 0){for (var i=0; i<newProfileData.length;i++){
					newProfileData[i]['url'] = "http" + (newProfileData[i]['secure'] ? "s" : "") + "://" + newProfileData[i]['domain'].replace(/^\./, "");
					debugLog(newProfileData[i]['domain']);
					delete newProfileData[i]['hostOnly'];
					delete newProfileData[i]['session'];
					debugLog(JSON.stringify(newProfileData[i]));
					chrome.cookies.set(newProfileData[i]);
				}}
				
				
				
				chrome.storage.local.set({ "profiles": profile }, function(){
					loadProfiles();
				});
				
				
				//$('#storage_label').text(JSON.stringify(newProfileData));
				
				chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
					if(!arrayOfTabs || arrayOfTabs.length === 0){ return; }
					chrome.tabs.reload(arrayOfTabs[0].id);
				});
				
			});
			
		});
	});
	//$('#message_label').text("Profile Change Button clicked " + target.innerHTML);
}
// END PROFILE FUNCTIONS //



// BEGIN COOKIE FUNCTIONS //
function loadDomainCookieStore(){
	var currentDomain = $('#domain_label').html();
	chrome.cookies.getAll({domain: currentDomain}, function(cookies) {
		//$('#cookie_label').text(JSON.stringify(cookies));
	});
}
// END COOKIE FUNCTIONS //





function domainLoaded(){ //CODE TO EXECUTE WHEN DOMAIN HAS BEEN LOADED
	document.getElementById('domain_label').innerHTML = currentDomain;
	$('#profileCreate_button').data('domain', currentDomain);
}

function init(){ //POP-UP OPENED, INITIALIZE
	chrome.tabs.query({active: true, lastFocusedWindow: true}, function(tabs) {
		tab = tabs[0];
		url = tab.url;
		currentDomain = getDomainKey(url);
		domainLoaded();
		loadProfiles();
	});
	document.querySelector('#profileCreate_button').addEventListener('click', newProfile, false);
}

document.addEventListener('DOMContentLoaded', function() {
  init();
  document.querySelector('#profileCreate_button').addEventListener('click', newProfile);
  //document.body.addEventListener('click', focusFilter);
  //document.querySelector('#remove_button').addEventListener('click', removeAll);
  //document.querySelector('#import_button').addEventListener('click', importCookies);
  //document.querySelector('#filter_div input').addEventListener(
  //    'input', reloadCookieTable);
  //document.querySelector('#filter_div button').addEventListener(
  //    'click', resetFilter); 
});
