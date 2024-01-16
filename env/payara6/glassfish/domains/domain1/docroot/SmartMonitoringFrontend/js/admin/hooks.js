const subscriptionListURL = '/SmartMonitoringBackend/subscriptions';
const subscriptionDeleteURL = '/SmartMonitoringBackend/subscriptions';
const subscriptionUpdateURL = '/SmartMonitoringBackend/subscriptions';
const subscriptionDetailURL = '/SmartMonitoringBackend/subscriptions';
const subscriptionCreateURL = '/SmartMonitoringBackend/subscriptions';
const filterListURL = '/SmartMonitoringBackend/subscriptions/{subId}/filters'; //use {subId} for subId
const filerDeleteURL = '/SmartMonitoringBackend/subscriptions/{subId}/filters'; //use {subId} for subId
const filterUpdateURL = '/SmartMonitoringBackend/subscriptions/{subId}/filters'; //use {subId} for subId
const filterCreateURL = '/SmartMonitoringBackend/subscriptions/{subId}/filters'; //use {subId} for subId
const parentUserURL = '/SmartMonitoringBackend/user/list/parents';
let subscriptionJSON;
let subscriptionArr;
var subscriptionData;
let filterJSON;
var filterArr;
const activeCheckboxEnabled = '<input class="uk-checkbox uk-disabled" type="checkbox" checked/>';
const activeCheckboxDisabled = '<input class="uk-checkbox uk-disabled" type="checkbox"/>';
const subscriptionEditButton = "<button type='button' uk-toggle='target: #subscription-detail' onclick='getSubscriptionDetails({ID})' class='uk-button uk-button-default uk-button-primary' uk-tooltip='' style='width: 100%'>Bearbeiten</button>";
const subscriptionDeleteButton = "<button type='button' uk-toggle='target: #delete-modal' onclick='setDeleteBTNEvent(\"deleteSubscription({ID})\")' class='uk-button uk-button-default uk-button-primary' uk-tooltip='' style='width: 100%'>Löschen</button>";

const userRole = "de.fhbielefeld.scl.usermanager.persistence.jpa.User.parent.id" //key for userrole (needed for admin instead of key + value)

const addColor = "#0EA854";
// static HTML for the subscriptiontable with SWAC-component present
const subscriptionTableHTML = '<div id="subscription-table" swa="swac_present FROM subscriptionData TEMPLATE table_for_all_datasets" class="swac_hintmsg"></div>';
// static HTML for generation of HTTP-Request-Header-Switcher
const headerSwitcherStartHTML = '<div uk-switcher="animation: uk-animation-fade; toggle: > *">';
const headerSwitcherContentStartHTML = '<ul class="uk-switcher uk-margin">';
const headerSwitcherHTML = '<button class="uk-button uk-button-default" type="button">{key}:{value}</button>';
const headerSwitcherContentHTML = '<li style="padding-left: 50px"><span class="uk-label">Key:</span><input id="subscription_header_key_{index}" class="uk-input" value="{key}"><span class="uk-label">Value:</span><input id="subscription_header_value_{index}" class="uk-input" value="{value}"></li></div>';
const headerSwitcherEndHTML = '<button id="btnAddHeader" class="uk-button uk-button-default" type="button" style="background-color: ' + addColor + '" onclick="newHeader()">Neu hinzufügen</button></div>';
const headerSwitcherContentEndHTML = '<li id="headerSwitcherContent" style="padding-left: 50px"></li>';
// static HTML for generation of HTTP-Request-Parameter-Switcher
const paramsSwitcherStartHTML = '<div uk-switcher="animation: uk-animation-fade; toggle: > *">';
const paramsSwitcherContentStartHTML = '<ul class="uk-switcher uk-margin">';
const paramsSwitcherHTML = '<button class="uk-button uk-button-default" type="button">{key}:{value}</button>';
const paramsSwitcherContentHTML = '<li style="padding-left: 50px"><span class="uk-label">Key:</span><input id="subscription_params_key_{index}" class="uk-input" value="{key}"><span class="uk-label">Value:</span><input id="subscription_params_value_{index}" class="uk-input" value="{value}"></li></div>';
const paramsSwitcherEndHTML = '<button id="btnAddParam" class="uk-button uk-button-default" type="button" style="background-color: ' + addColor + '" onclick="newParams()">Neu hinzufügen</button></div>';
const paramsSwitcherContentEndHTML = '<li id="paramsSwitcherContent" style="padding-left: 50px"></li>';

const headerAddButtton = "<button class='uk-button uk-button-default' type='button'>Neuer Header</button>";
const headerNewSwitcherContent = '<li style="padding-left: 50px"><span class="uk-label">Key:</span><input id="subscription_header_key_{index}" class="uk-input"><span class="uk-label">Value:</span><input id="subscription_header_value_{index}" class="uk-input"></li>'
const parameterAddButton = "<button class='uk-button uk-button-default' type='button'>Neuer Parameter</button>";
const parameterNewSwitcherContent = '<li style="padding-left: 50px"><span class="uk-label">Key:</span><input id="subscription_params_key_{index}" class="uk-input"><span class="uk-label">Value:</span><input id="subscription_params_value_{index}" class="uk-input"></li>';


const filterSwitcherAddNewFilterHTML = "<li><a href='#' style='background-color: " + addColor +"'>Neuen Filter anlegen</a></li>";
const filterSwitcherHTML = "<li><a href='#'>{description}</a></li>";
const filterContentHTML = '<li><span class="uk-label">Beschreibung:</span><input id="filter_name_{id}" class="uk-input" value="{description}"><hr><ul id="filter_switcher_{id}" class="uk-subnav uk-subnav-pill" uk-switcher="animation: uk-animation-fade"><li id="filter_switcher_role_{id}"><a href="#">Rolle</a></li><li id="filter_switcher_key_{id}"><a href="#">Schlüssel + Wert</a></li></ul><ul class="uk-switcher uk-margin"><li><select id="filter_role_{id}" class="uk-select">{parentOptions}</select></li><li><span class="uk-label">Schlüssel:</span><input id="filter_key_{id}" class="uk-input" value="{key}"><span class="uk-label">Wert:</span><input id="filter_value_{id}" class="uk-input" value="{value}"></li></ul><button id="filter_save_{id}" type="button" onclick="saveFilter({subId},{id})" class="uk-button uk-button-default uk-button-primary" uk-tooltip="" style="width: 33%; margin: 3px">Speichern</button>' + "<button id='filter_delete_{id}' type='button' uk-toggle='target: #delete-modal' onclick='setDeleteBTNEvent(\"deleteFilter({subId},{id})\")' class='uk-button uk-button-default uk-button-primary' uk-tooltip='' style='width: 33%; margin: 3px'>Löschen</button>" + '<button type="button" onclick="" class="uk-modal-close uk-button uk-button-default uk-button-primary" uk-tooltip="" style="width: 33%; margin: 3px">Abbrechen</button>';
const filterContentEndHTML = '<li><span class="uk-label">Beschreibung:</span><input id="filter_name_new" class="uk-input"><hr><ul id="filter_switcher_new" class="uk-subnav uk-subnav-pill" uk-switcher="animation: uk-animation-fade"><li id="filter_switcher_role_new"><a href="#">Rolle</a></li><li id="filter_switcher_key_new"><a href="#">Schlüssel + Wert</a></li></ul><ul class="uk-switcher uk-margin"><li><select id="filter_role_new" class="uk-select">{parentOptions}</select></li><li><span class="uk-label">Schlüssel:</span><input id="filter_key_new" class="uk-input"><span class="uk-label">Wert:</span><input id="filter_value_new" class="uk-input"></li></ul><hr><button id="filter_save_new" type="button" onclick="createFilter({subId})" class="uk-button uk-button-default uk-button-primary" uk-tooltip="" style="width: 49%; margin: 3px">Speichern</button><button type="button" onclick="" class="uk-modal-close uk-button uk-button-default uk-button-primary" uk-tooltip="" style="width: 49%; margin: 3px">Abbrechen</button>';;

/**
 * Sets the onClick event of the delete button in the delete modal to the given method.
 * 
 * @param {string} onClick method with parameters as string
 */
function setDeleteBTNEvent(onClick) {
	let btn = document.getElementById("deleteBTN_Modal");
	btn.setAttribute("onClick", "javascript:" + onClick);
}

/**
 * Sends a notification to the user via UIkit.notification.
 * 
 * @param {string} msg message that should be sent to the user
 */
function sendMessageToUser(msg) {
	UIkit.notification({
		message: msg,
		status: 'primary',
		pos: 'top-right',
		timeout: 5000
	});
}

/**
 * Loads Subscriptions from backend into subscriptionData.
 * 
 */
function getSubscriptions() {
	fetch(subscriptionListURL)
	.then(res => { if (!res.ok) { throw Error(response.statusText); } else { return res.json(); } })
	.then((out) => {
	  subscriptionArr = out;
	  subscriptionData = [];
	  for (let i = 0; i < subscriptionArr.length; i++) {
		subscriptionData[i] = {};
		subscriptionData[i].Id = subscriptionArr[i].id;
		subscriptionData[i].Name = subscriptionArr[i].description;
		subscriptionData[i].Erstelldatum = subscriptionArr[i].createdAt;
		if (subscriptionArr[i].active) {
			subscriptionData[i].Aktiv = activeCheckboxEnabled;
		} else {
			subscriptionData[i].Aktiv = activeCheckboxDisabled;
		}
		subscriptionData[i].Event = subscriptionArr[i].event;
		subscriptionData[i].Aktion = subscriptionArr[i].action;
		subscriptionData[i].Bearbeiten = subscriptionEditButton.replace(/{ID}/g, subscriptionArr[i].id);
		subscriptionData[i].Löschen = subscriptionDeleteButton.replace(/{ID}/g, subscriptionArr[i].id);
	  }
	})
	.catch(err => {
		SWAC_debug.addErrorMessage('hookmanagement.js', err + " thrown when trying to get subscriptions:");
		sendMessageToUser("Fehler beim Laden der Subscriptions: " + err); 
	});
}

/**
 * Removes generated navbar and table to readd it, so we can display new data.
 *
 * DEV NOTE: should be redone when the reload()-function in SWAC gets implemented. 
 */
function refreshSubscriptions() {
	getSubscriptions();
	let table = document.getElementById("subscription-outer");
	table.innerHTML = '';
	table.innerHTML = subscriptionTableHTML;
	let navbar = document.getElementById("main_navigation");
	navbar.innerHTML = '';
	SWAC.detectRequestors();
}

/**
 * sends delete request for a subscription to backend and reloads the subscriptiontable with refreshSubscriptions()
 *
 * @param {int} id the id of the subscription that should be deleted
 */
function deleteSubscription(id) {
	fetch(subscriptionDeleteURL + "/" + id, {
		method: 'DELETE'
	}).then(() => {
		sendMessageToUser('Hook mit ID: ' + id + ' erfolgreich gelöscht!');
		refreshSubscriptions();
	}).catch(err => {
		SWAC_debug.addErrorMessage('hookmanagement.js', err + " thrown when trying to delete subscription. ID: " + id);
	});
}

/**
 * gets the details of a specificed subscription from backend and parses it into subscription-modal.
 * 
 * @param {int} id the id of the subscription to get details from
 */
function getSubscriptionDetails(id) {
	fetch(subscriptionDetailURL  + "/" + id)
	.then(res => res.json())
	.then((out) => {
		let subscriptionDetails = out;
		let subscriptionName = document.getElementById("subscription_name");
		subscriptionName.value = subscriptionDetails.description;
		let subscriptionEvent = document.getElementById("subscription_event");
		subscriptionEvent.value = subscriptionDetails.event;
		let subscriptionAction = document.getElementById("subscription_actionswitcher");
		if (subscriptionDetails.action.includes("Java")) {
			UIkit.switcher(subscriptionAction).show(1);
		} else { // HTTPRequest
			UIkit.switcher(subscriptionAction).show(0);
		}
		let subscriptionJavaMethod = document.getElementById("subscription_java_method");
		subscriptionJavaMethod.value = subscriptionDetails.config.path;
		let subscriptionHTTPURL = document.getElementById("subscription_http_url");
		subscriptionHTTPURL.value = subscriptionDetails.config.url;
		let subscriptionHTTPMethod = document.getElementById("subscription_http_method");
		subscriptionHTTPMethod.value = subscriptionDetails.config.method;
		let subscriptionHTTPHeader = document.getElementById("subscription_http_header");
		let header = subscriptionDetails.config.header;
		let headerSwitcher = headerSwitcherStartHTML;
		let headerSwitcherContent = headerSwitcherStartHTML;
		for (let i = 0; i < header.length; i++)
		{
			let key = header[i].key;
			let value = header[i].value;
			if (header[i].key != null && header[i].key != "") {
				headerSwitcher += headerSwitcherHTML.replace(/{key}/g, key).replace(/{value}/g, value);
				headerSwitcherContent += headerSwitcherContentHTML.replace(/{index}/g, i.toString()).replace(/{key}/g, key).replace(/{value}/g, value);
			}
		}
		headerSwitcher += headerSwitcherEndHTML;
		headerSwitcherContent += headerSwitcherContentEndHTML;
		subscriptionHTTPHeader.innerHTML = headerSwitcher + headerSwitcherContent;
		let subscriptionHTTPParams = document.getElementById("subscription_http_params");
		let params = subscriptionDetails.config.parameter;
		let paramsSwitcher = paramsSwitcherStartHTML;
		let paramsSwitcherContent = paramsSwitcherContentStartHTML;
		for (let i = 0; i < params.length; i++)
		{
			let key = params[i].key;
			let value = params[i].value;
			paramsSwitcher += paramsSwitcherHTML.replace(/{key}/g, key).replace(/{value}/g, value);
			paramsSwitcherContent += paramsSwitcherContentHTML.replace(/{key}/g, key).replace(/{value}/g, value).replace(/{index}/g, i.toString());
		}
		paramsSwitcher += paramsSwitcherEndHTML;
		paramsSwitcherContent += paramsSwitcherContentEndHTML;
		subscriptionHTTPParams.innerHTML = paramsSwitcher + paramsSwitcherContent;
		let subscriptionHTTPBody = document.getElementById("subscription_http_body");
		subscriptionHTTPBody.value = subscriptionDetails.config.body;
		let subscriptionActive = document.getElementById("subscription_active");
		subscriptionActive.checked = subscriptionDetails.active;
		let subscriptionFilter = document.getElementById("subscription_filter");
		subscriptionFilter.setAttribute("onClick", "javascript:" + "getFilters(" + id + ")");
		subscriptionFilter.setAttribute("uk-toggle", "target: #filter-edit");
		subscriptionFilter.setAttribute("style", "display: inherit !important; width: 100%");
		let saveButton = document.getElementById("subscription_save");
		saveButton.setAttribute("onClick", "javascript: saveSubscription(" + id + ")");
	}).catch(err => {
		SWAC_debug.addErrorMessage('hookmanagement.js', err + " thrown when trying to get subscription details. ID: " + id);
	});
}

/**
 * reset the subscription-detail-modal (before creation of new subscription)
 */
function resetSubscriptionDetails() {
		let subscriptionName = document.getElementById("subscription_name");
		subscriptionName.value = "";
		let subscriptionEvent = document.getElementById("subscription_event");
		subscriptionEvent.value = "";
		let subscriptionAction = document.getElementById("subscription_actionswitcher");
		UIkit.switcher(subscriptionAction).show(1);
		let subscriptionJavaMethod = document.getElementById("subscription_java_method");
		subscriptionJavaMethod.value = "";
		let subscriptionHTTPURL = document.getElementById("subscription_http_url");
		subscriptionHTTPURL.value = "";
		let subscriptionHTTPMethod = document.getElementById("subscription_http_method");
		subscriptionHTTPMethod.value = "POST";
		let subscriptionHTTPHeader = document.getElementById("subscription_http_header");
		let headerSwitcher = headerSwitcherStartHTML;
		let headerSwitcherContent = headerSwitcherContentStartHTML;
		headerSwitcher += headerSwitcherEndHTML;
		headerSwitcherContent +=  headerSwitcherContentEndHTML;
		subscriptionHTTPHeader.innerHTML = headerSwitcher + headerSwitcherContent;
		let subscriptionHTTPParams = document.getElementById("subscription_http_params");
		let paramsSwitcher = paramsSwitcherStartHTML;
		let paramsSwitcherContent = paramsSwitcherContentStartHTML;
		paramsSwitcher += paramsSwitcherEndHTML;
		paramsSwitcherContent += paramsSwitcherContentEndHTML;
		subscriptionHTTPParams.innerHTML = paramsSwitcher + paramsSwitcherContent;
		let subscriptionHTTPBody = document.getElementById("subscription_http_body");
		subscriptionHTTPBody.value = "";
		let subscriptionActive = document.getElementById("subscription_active");
		subscriptionActive.checked = true;
		let subscriptionFilter = document.getElementById("subscription_filter");
		subscriptionFilter.setAttribute("onClick", "javascript: sendMessageToUser('Bitte Speichern, bevor Filter angelegt werden können!')");
		subscriptionFilter.setAttribute("uk-toggle", "target: locked");
		let saveButton = document.getElementById("subscription_save");
		saveButton.setAttribute("onClick", "javascript: createSubscription()");
}

/**
 * post a new created subscription to the backend
 */
function createSubscription() {
	let subscriptionName = document.getElementById("subscription_name");
	let description = subscriptionName.value;
	let subscriptionEvent = document.getElementById("subscription_event");
	let event = subscriptionEvent.value;
	let subscriptionHTTPRequest = document.getElementById("subscription_http_request");
	let action = "";
	let subscriptionHTTPURL = document.getElementById("subscription_http_url");
	let url = subscriptionHTTPURL.value;
	let subscriptionHTTPMethod = document.getElementById("subscription_http_method");
	let method = subscriptionHTTPMethod.value;
	let subscriptionHTTPBody = document.getElementById("subscription_http_body");
	let body = subscriptionHTTPBody.value;
	let subscriptionActive = document.getElementById("subscription_active");
	let active = subscriptionActive.checked;
	let subscriptionJavaMethod = document.getElementById("subscription_java_method");
	let path = subscriptionJavaMethod.value;
	let requestJSON = {};
	requestJSON.config = {};
	requestJSON.config.header = [];
	let i = 0;
	let finished = false;
	while (!finished) {
		let subscriptionHeaderKey = document.getElementById("subscription_header_key_" + i);
		let subscriptionHeaderValue = document.getElementById("subscription_header_value_" + i);
		if (subscriptionHeaderKey != null && subscriptionHeaderValue != null) {
			let headerKey = subscriptionHeaderKey.value;
			let headerValue = subscriptionHeaderValue.value;
			if (headerKey != "") {
				requestJSON.config.header[i] = {};
				requestJSON.config.header[i].key = headerKey;
				requestJSON.config.header[i].value = headerValue;
			}
			i++;
		} else {
			finished = true;
		}
	}
	i = 0;
	finished = false;
	requestJSON.config.parameter = [];
	while (!finished) {
		let subscriptionParamsKey = document.getElementById("subscription_params_key_" + i);
		let subscriptionParamsValue = document.getElementById("subscription_params_value_" + i);
		if (subscriptionParamsKey != null && subscriptionParamsValue != null) {
			let parameterKey = subscriptionParamsKey.value;
			let parameterValue = subscriptionParamsValue.value;
			if (parameterKey != "") {
				requestJSON.config.parameter[i] = {};
				requestJSON.config.parameter[i].key = parameterKey;
				requestJSON.config.parameter[i].value = parameterValue;
			}
			i++;
		} else {
			finished = true;
		}
	}
	if (subscriptionHTTPRequest.className === "uk-active") {
		action = "HTTPRequest";
		path = null;
	} else {
		action = "JavaExecute";
		url = null;
		body = null;
		method = null;
	}
	requestJSON.event = event;
	requestJSON.action = action;
	requestJSON.description = description;
	requestJSON.active = active;
	requestJSON.config.url = url;
	requestJSON.config.method = method;
	requestJSON.config.body = body;
	requestJSON.config.path = path;
	fetch(subscriptionCreateURL, {
		method: "POST",
		headers: {"Content-Type": "application/json", "Access-Control-Origin": "*"},
		body:  JSON.stringify(requestJSON)
	}).then(function(response){ 
		return response.json(); 
	}).then(function(resp){
		sendMessageToUser("Successfully created subscription " + description);
		refreshSubscriptions();
	})
	.catch(err => { 
		SWAC_debug.addErrorMessage('hookmanagement.js', err + " thrown when trying to create a subscription");
	});
}

/**
 * update the specified subscription against the backend.
 * @param {int} id the id of the subscription to be updated
 */
function saveSubscription(id) {
	let subscriptionName = document.getElementById("subscription_name");
	let description = subscriptionName.value;
	let subscriptionEvent = document.getElementById("subscription_event");
	let event = subscriptionEvent.value;
	let subscriptionHTTPRequest = document.getElementById("subscription_http_request");
	let action = "";
	let subscriptionHTTPURL = document.getElementById("subscription_http_url");
	let url = subscriptionHTTPURL.value;
	let subscriptionHTTPMethod = document.getElementById("subscription_http_method");
	let method = subscriptionHTTPMethod.value;
	let subscriptionHTTPBody = document.getElementById("subscription_http_body");
	let body = subscriptionHTTPBody.value;
	let subscriptionActive = document.getElementById("subscription_active");
	let active = subscriptionActive.checked;
	let subscriptionJavaMethod = document.getElementById("subscription_java_method");
	let path = subscriptionJavaMethod.value;
	let requestJSON = {};
	requestJSON.config = {};
	requestJSON.config.header = [];
	let i = 0;
	let finished = false;
	while (!finished) {
		let subscriptionHeaderKey = document.getElementById("subscription_header_key_" + i);
		let subscriptionHeaderValue = document.getElementById("subscription_header_value_" + i);
		if (subscriptionHeaderKey != null && subscriptionHeaderValue != null) {
			let headerKey = subscriptionHeaderKey.value;
			let headerValue = subscriptionHeaderValue.value;
			if (headerKey != "") {
				requestJSON.config.header[i] = {};
				requestJSON.config.header[i].key = headerKey;
				requestJSON.config.header[i].value = headerValue;
			}
			i++;
		} else {
			finished = true;
		}
	}
	i = 0;
	finished = false;
	requestJSON.config.parameter = [];
	while (!finished) {
		let subscriptionParamsKey = document.getElementById("subscription_params_key_" + i);
		let subscriptionParamsValue = document.getElementById("subscription_params_value_" + i);
		if (subscriptionParamsKey != null && subscriptionParamsValue != null) {
			let parameterKey = subscriptionParamsKey.value;
			let parameterValue = subscriptionParamsValue.value;
			if (parameterKey != "") {
				requestJSON.config.parameter[i] = {};
				requestJSON.config.parameter[i].key = parameterKey;
				requestJSON.config.parameter[i].value = parameterValue;
			}
			i++;
		} else {
			finished = true;
		}
	}
	if (subscriptionHTTPRequest.className === "uk-active") {
		action = "HTTPRequest";
		path = null;
	} else {
		action = "JavaExecute";
		url = null;
		body = null;
		method = null;
	}
	requestJSON.event = event;
	requestJSON.action = action;
	requestJSON.description = description;
	requestJSON.active = active;
	requestJSON.config.url = url;
	requestJSON.config.method = method;
	requestJSON.config.body = body;
	requestJSON.config.path = path;
	fetch(subscriptionUpdateURL + '/' + id, {
		method: "PUT",
		headers: {"Content-Type": "application/json", "Access-Control-Origin": "*"},
		body:  JSON.stringify(requestJSON)
	}).then(function(response){ 
		return response.json(); 
	}).then(function(resp){
		sendMessageToUser("Successfully updated subscription " + description);
		refreshSubscriptions();
	})
	.catch(err => { 
		SWAC_debug.addErrorMessage('hookmanagement.js', err + " thrown when trying to create a subscription");
	});
}

/**
 * create new header elements in the switcher so we can add headers to the httprequest-headers
 */
function newHeader() {
	let i = 0;
	let finished = false;
	while (!finished) {
		let subscriptionHeaderKey = document.getElementById("subscription_header_key_" + i);
		let subscriptionHeaderValue = document.getElementById("subscription_header_value_" + i);
		if (subscriptionHeaderKey != null && subscriptionHeaderValue != null) {
			i++;
		} else {
			finished = true;
		}
	}
	let headerSwitcherContent = document.getElementById("headerSwitcherContent");
	let btnAddHeader = document.getElementById("btnAddHeader");
	btnAddHeader.insertAdjacentHTML('beforebegin', headerAddButtton);
	headerSwitcherContent.insertAdjacentHTML('beforebegin', headerNewSwitcherContent.replace(/{index}/g, i.toString()));
	let switcher = document.getElementById("subscription_http_header").children[0];
	UIkit.switcher(switcher).show(i);
}

/**
 * create new parameter elements in the switcher so we can add parameters to the httprquest-parameters
 */
function newParams() {
	let i = 0;
	let finished = false;
	while (!finished) {
		let subscriptionParamsKey = document.getElementById("subscription_params_key_" + i);
		let subscriptionParamsValue = document.getElementById("subscription_params_value_" + i);
		if (subscriptionParamsKey != null && subscriptionParamsValue != null) {
			i++;
		} else {
			finished = true;
		}
	}
	let paramsSwitcherContent = document.getElementById("paramsSwitcherContent");
	let btnAddParam = document.getElementById("btnAddParam");
	btnAddParam.insertAdjacentHTML('beforebegin', parameterAddButton);
	paramsSwitcherContent.insertAdjacentHTML('beforebegin', parameterNewSwitcherContent.replace(/{index}/g, i.toString()));
	let switcher = document.getElementById("subscription_http_params").children[0];
	UIkit.switcher(switcher).show(i);
}

/**
 * gets the filterData from backend and parses it into ui
 * 
 * @param {int} subId id of the subscription we want to retrieve the filters from 
 */
function getFilters(subId) {
	fetch(filterListURL.replace("{subId}", subId))
	.then(res => res.json())
	.then((out) => {
		filterArr = out;
		let parentOptions = "";
		const fet = fetch(parentUserURL).then(res => { if (res.ok) { return res.json() } else { throw Error(response.statusText); }}).then((parentList) => {
			parentUsers = parentList.parentList;
			for (let j = 0; j < parentUsers.length; j++) {
				parentOptions += "<option>" + parentUsers[j].id + " | " + parentUsers[j].username + "</option>";
			}
		}).then(() => {
			let filterSwitcher = document.getElementById("filter_switcher");
			let filterContent = document.getElementById("filter_content");
			filterSwitcher.innerHTML = "";
			filterContent.innerHTML = "";
			for (let i = 0; i < filterArr.length; i++) {
				let key = filterArr[i].key;
				let value = filterArr[i].value;
				let description = filterArr[i].description;
				let id = filterArr[i].id;
				filterSwitcher.innerHTML += filterSwitcherHTML.replace(/{description}/g, description);
				let newfilter = document.createElement("div");
				newfilter.innerHTML = filterContentHTML.replace(/{description}/g, description).replace(/{id}/g, id).replace(/{key}/g, key).replace(/{value}/g, value).replace(/{subId}/g, subId).replace(/{parentOptions}/g, parentOptions);
				filterContent.appendChild(newfilter);
				let switcher = document.getElementById("filter_switcher_" + id);
				if(key == userRole) { // it is userrole filter
					UIkit.switcher(switcher).show(0);
					let filterRole = document.getElementById("filter_role_" + id);
					for (let j = 0; j < filterRole.children.length; j++) {
						if (filterRole.children[j].value.includes(value + " | ")){
							filterRole.value = filterRole.children[j].value;
						}
					}

				} else {
					UIkit.switcher(switcher).show(1);
				}	
			}
			filterSwitcher.innerHTML += filterSwitcherAddNewFilterHTML;
			let newfilter = document.createElement("div");
			newfilter.innerHTML = filterContentEndHTML.replace(/{subId}/g, subId).replace(/{parentOptions}/g, parentOptions);
			filterContent.appendChild(newfilter);
		});
	})
	.catch(err => { 
		SWAC_debug.addErrorMessage('hookmanagement.js', err + " thrown when trying to get filters for subscription: " + subId);
		sendMessageToUser("Fehler beim Laden der Filter für Subscription " + subId + ": " + err); 
	});
}

/**
 * reload filters for the given subscription
 * 
 * @param {int} subId the id of the subscription to get filters off 
 */
function refreshFilters(subId) {
	getFilters(subId);
}

/**
 * delete a filter in the backend
 * 
 * @param {int} subId id of the subscription where the filter should be deleted
 * @param {int} id id of the filter that should be delted
 */
function deleteFilter(subId, id) {
	fetch(filerDeleteURL.replace("{subId}", subId) + "/" + id, {
		method: 'DELETE'
	}).then(() => {
		sendMessageToUser('Filter mit ID: ' + id + ' erfolgreich gelöscht!');
		refreshFilters(subId);
	}).catch(err => {
		SWAC_debug.addErrorMessage('hookmanagement.js', err + " thrown when trying to delete filter");
	})
}

/**
 * updates a filter on backend and refreshes ui with the new data
 * 
 * @param {int} subId id of the subscription owning the filter
 * @param {int} id id of the filter that should be updated
 */
function saveFilter(subId, id) {
	let filterName = document.getElementById("filter_name_" + id);
	let description = filterName.value;
	let filterSwitcherRole = document.getElementById("filter_switcher_role_" + id);
	let key = "";
	let value = "";
	if (filterSwitcherRole.className === "uk-active") {
		key = userRole;
		let filterRole = document.getElementById("filter_role_" + id);
		value = filterRole.value.split(" | ")[0];
	} else {
		let filterKey = document.getElementById("filter_key_" + id);
		key = filterKey.value;
		let filterValue = document.getElementById("filter_value_" + id);
		value = filterValue.value;
	}
	let requestJSON = {};
	requestJSON.description = description;
	requestJSON.key = key;
	requestJSON.value = value;
	fetch(filterUpdateURL.replace("{subId}", subId) + '/' + id, {
		method: "PUT",
		headers: {"Content-Type": "application/json", "Access-Control-Origin": "*"},
		body:  JSON.stringify(requestJSON)
	}).then(function(response){ 
		return response.json(); 
	}).then(function(resp){
		sendMessageToUser("Successfully updated filter " + description);
		refreshFilters(subId);
	})
	.catch(err => { 
		SWAC_debug.addErrorMessage('hookmanagement.js', err + " thrown when trying to create a filter for: " + subId);
	});
}

/**
 * create a new filter in backend and refresh the ui to show it
 * 
 * @param {int} subId id of the subscription that owns the new filter
 */
function createFilter(subId) {
	let filterNameNew = document.getElementById("filter_name_new");
	let description = filterNameNew.value;
	let filterSwitcherRoleNew = document.getElementById("filter_switcher_role_new");
	let key = "";
	let value = "";
	if (filterSwitcherRoleNew.className === "uk-active") {
		key = userRole;
		let filterRole = document.getElementById("filter_role_new");
		value = filterRole.value.split(" | ")[0];
	} else {
		let filterKey = document.getElementById("filter_key_new");
		key = filterKey.value;
		let filterValue = document.getElementById("filter_value_new");
		value = filterValue.value;
	}
	let requestJSON = {};
	requestJSON.description = description;
	requestJSON.key = key;
	requestJSON.value = value;
	fetch(filterCreateURL.replace("{subId}", subId), {
		method: "POST",
		headers: {"Content-Type": "application/json", "Access-Control-Origin": "*"},
		body:  JSON.stringify(requestJSON)
	}).then(function(response){ 
		return response.json(); 
	}).then(function(resp){
		sendMessageToUser("Successfully created filter " + description);
		refreshFilters(subId);
	})
	.catch(err => { 
		SWAC_debug.addErrorMessage('hookmanagement.js', err + " thrown when trying to create a filter for: " + subId);
	});
}

// initial loading of subscriptionts into our default viewed table
getSubscriptions();