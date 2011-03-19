/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is the CheckPlaces extension.
 *
 * The Initial Developer of the Original Code is Andy Halford.
 * Portions created by the Initial Developer are Copyright (C) 2009-2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var CheckPlaces = {
	prefs: Components.classes["@mozilla.org/preferences-service;1"]
									 .getService(Components.interfaces.nsIPrefService)
									 .getBranch("extensions.checkplaces."),
	defaults: Components.classes["@mozilla.org/preferences-service;1"]
											.getService(Components.interfaces.nsIPrefService)
											.getDefaultBranch("extensions.checkplaces."),
	firefoxID: "{ec8030f7-c20a-464f-9b0e-13a3a9e97384}",
	seamonkeyID: "{92650c4d-4b8e-4d2a-b7eb-24ecf4f6b63a}",

	//Hide/show statusbar icon
	init: function() {
		//Vain attempt to stop new windows calling this more than once
		window.removeEventListener("load", CheckPlaces.init, false);

		//"this.prefs" doesn't work here
		var prefs = Components.classes["@mozilla.org/preferences-service;1"]
													.getService(Components.interfaces.nsIPrefService)
													.getBranch("extensions.checkplaces.");

		//Status bar
		var statusBar = document.getElementById("checkplaces-status");
		if (statusBar) statusBar.hidden = !prefs.getBoolPref("statusbaricon");

		//Bookmarks menu
		var bmMenu = document.getElementById("checkplaces-bmenu");
		if (bmMenu) bmMenu.hidden = !prefs.getBoolPref("bookmarks_menu");

		//Tools menu
		var toolsMenu = document.getElementById("checkplaces-tmenu");
		if (toolsMenu) toolsMenu.hidden = !prefs.getBoolPref("tools_menu");

		//Bookmarks organiser menu
		var orgMenu = document.getElementById("checkplaces-orgmenu");
		if (orgMenu) orgMenu.hidden = !prefs.getBoolPref("org_menu");

		//Manage Bookmarks Tool menu for SeaMonkey)
		var manageMenu = document.getElementById("checkplaces-managemenu");
		if (manageMenu) manageMenu.hidden = !prefs.getBoolPref("manage_menu");
	},

	onDialogLoad: function() {
		//Iterate over the defaults setting each UI item to the pref
		var prefList = this.defaults.getChildList("", {});
		for (var i = 0 ; i < prefList.length ; i++) {
			var id = prefList[i];
			switch (this.defaults.getPrefType(id)) {
				case this.defaults.PREF_BOOL:
					var checkbox = document.getElementById(id);
					if (checkbox) checkbox.checked = this.prefs.getBoolPref(id);
				break;

				case this.defaults.PREF_STRING:
					var item = document.getElementById(id);
					if (!item) break;
					item.value = this.prefs.getCharPref(id);
				break;
			}
		}

		//SeaMonkey/Firefox specific preferences
		var id = this.firefoxID;
		try {
			var info = Components.classes["@mozilla.org/xre/app-info;1"]
													 .getService(Components.interfaces.nsIXULAppInfo);
			id = info.ID;
		} catch(e) {
		}
		document.getElementById('org_menu').hidden = (id == this.seamonkeyID);
		document.getElementById('manage_menu').hidden = (id != this.seamonkeyID);

		//Migrate old settings (reverse them)
		try {
			document.getElementById("include").checked = !this.prefs.getBoolPref("include_all");
			this.prefs.clearUserPref("include_all");
		} catch (e) {
		}
		try {
			document.getElementById("exclude").checked = !this.prefs.getBoolPref("exclude_none");
			this.prefs.clearUserPref("exclude_none");
		} catch (e) {
		}

		this.toggleIncludeFolders();
		this.toggleExcludeFolders();
		this.toggleIcons();
	},

	//Display the button depending on the include checkbox
	toggleIncludeFolders: function() {
		document.getElementById("include_folders").disabled = !document.getElementById("include").checked;
	},

	//Display the button depending on the exclude checkbox
	toggleExcludeFolders: function() {
		document.getElementById("exclude_folders").disabled = !document.getElementById("exclude").checked;
	},

	//Display various items depending on the check_links checkbox
	toggleIcons: function() {
		var checkLinks = document.getElementById("check_links").checked;
		document.getElementById("use_timeout").disabled = !checkLinks;
		document.getElementById("use_concurrency").disabled = !checkLinks;
		document.getElementById("find_icons").disabled = !checkLinks;
		document.getElementById("use_get").disabled = !checkLinks;
		this.toggleTimeout();
		this.toggleConcurrency();
		this.toggleReload();
	},

	//Toggle the timeout option
	toggleTimeout: function() {
		var useTimeout = document.getElementById("use_timeout");
		document.getElementById("timeout").disabled = !useTimeout.checked || useTimeout.disabled;
	},

	//Toggle the concurrency option
	toggleConcurrency: function() {
		var useConcurrency = document.getElementById("use_concurrency");
		document.getElementById("concurrency").disabled = !useConcurrency.checked || useConcurrency.disabled;
	},

	//Toggle the reload icons option
	toggleReload: function() {
		var findIcons = document.getElementById("find_icons");
		document.getElementById("reload_icons").disabled = !findIcons.checked || findIcons.disabled;
	},

	onDialogAccept: function() {
		var prefList = this.defaults.getChildList("", {});
		for (var i = 0 ; i < prefList.length ; i++) {
			var id = prefList[i];
			switch (this.defaults.getPrefType(id)) {
				case this.defaults.PREF_BOOL:
					var checkbox = document.getElementById(id);
					if (checkbox) this.prefs.setBoolPref(id, checkbox.checked);
				break;

				case this.defaults.PREF_STRING:
					var item = document.getElementById(id);
					if (!item) break;

					//If radio group (probably a better way of doing this)
					if (id == "db_options") {
						this.prefs.setCharPref(id, item.selectedItem.id);
					}
					else {
						this.prefs.setCharPref(id, item.value);
					}
				break;
			}
		}

		//Statusbar icon
		//Get a list of all open windows
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
											 .getService(Components.interfaces.nsIWindowMediator);
		var enumerator = wm.getEnumerator('navigator:browser');

		//Now hide/show on each window
		while(enumerator.hasMoreElements()) {
			var currentWindow = enumerator.getNext();

			//Turn things on/off as appropriate
			try {
				var statusbaritem = document.getElementById("statusbaricon").checked;
				currentWindow.document.getElementById("checkplaces-status").hidden = !statusbaritem;
		  } catch (exception) {}
			try {
				var bmMenu = document.getElementById("bookmarks_menu").checked;
				currentWindow.document.getElementById("checkplaces-bmenu").hidden = !bmMenu;
		  } catch (exception) {}
			try {
				var toolsMenu = document.getElementById("tools_menu").checked;
				currentWindow.document.getElementById("checkplaces-tmenu").hidden = !toolsMenu;
		  } catch (exception) {}
		}

		//Bookmarks Organiser menu
		var enumerator = wm.getEnumerator('Places:Organizer');
		while(enumerator.hasMoreElements()) {
			var currentWindow = enumerator.getNext();
			try {
				var orgMenuitem = document.getElementById("org_menu").checked;
				currentWindow.document.getElementById("checkplaces-orgmenu").hidden = !orgMenuitem;
		  } catch (exception) {}
		}
	},

	//Select which folders to check
	selectBookmarkFolder: function(include) {
		var params = {inn:{include:include}, out:null};
		window.openDialog('chrome://checkplaces/content/folders.xul', 'CheckPlacesFolders', 'chrome,resizable,modal,centerscreen', params);

		//If nothing selected then untick the include/exclude boxes as appropriate
		var currentIDs = this.prefs.getCharPref(include ? "include_folder_ids" : "exclude_folder_ids");
		if (!currentIDs || !currentIDs.length) {
			document.getElementById(include ? "include" : "exclude").checked = false;
			this.toggleIncludeFolders();
			this.toggleExcludeFolders();
		}
	},

	//Called from options.xul to start the checking process
	startChecking: function() {
		this.onDialogAccept();
		this.check();
	},

	//Called from elsewhere to start the check
	check: function() {
		var params = {inn:null, out:null};
		window.openDialog('chrome://checkplaces/content/progress.xul', 'CheckPlacesProgress', 'chrome,modal,centerscreen', params);

		//If results returned then show them
		if (params.out) {
			var results = {inn:{elapsed:params.out.elapsed,
												  dnsList:params.out.dnsList,
												  pageErrorList:params.out.pageErrorList,
												  serverErrorList:params.out.serverErrorList,
												  noFileList:params.out.noFileList,
												  failedList:params.out.failedList,
												  questionableList:params.out.questionableList,
												  badList:params.out.badList,
												  duplicatesList:params.out.duplicatesList,
												  emptyList:params.out.emptyList,
												  cancelledList:params.out.cancelledList,
												  excludedList:params.out.excludedList,
												  bookmarkCount:params.out.bookmarkCount,
												  livemarkCount:params.out.livemarkCount,
												  pageCount:params.out.pageCount,
												  excludedCount:params.out.excludedCount,
												  folderCount:params.out.folderCount,
												  dbChecked:params.out.dbChecked,
													dbCheckFailed:params.out.dbCheckFailed,
													dbCompacted:params.out.dbCompacted,
													dbCompactFailed:params.out.dbCompactFailed}, out:null};
			window.openDialog('chrome://checkplaces/content/results.xul', 'CheckPlacesResults', 'chrome,modal,resizable,centerscreen', results);
		}
	},

/*
	//Check that at least one of the display options is showing otherwise it can't be launched
	checkOptionShowing: function(event) {
		var statusbaritem = document.getElementById("statusbaricon").checked;
		var bmMenu = document.getElementById("bookmarks_menu").checked;
		var toolsMenu = document.getElementById("tools_menu").checked;
		var orgMenuitem = document.getElementById("org_menu").checked;
		if (!statusbaritem && !bmMenu && !toolsMenu && !orgMenuitem) {
			event.target.checked = true;
			var bundle = Components.classes["@mozilla.org/intl/stringbundle;1"]
	           					.getService(Components.interfaces.nsIStringBundleService)
           						.createBundle("chrome://checkplaces/locale/checkplaces.properties");
			var prompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
														 .getService(Components.interfaces.nsIPromptService);
			prompt.alert(null, bundle.GetStringFromName('dialog_title'), bundle.GetStringFromName('missing_display_item'));
		}
	},
*/

	//Shows any exclude annotations so they can be reset if required
	showExcludes: function(event) {
		window.openDialog('chrome://checkplaces/content/excluded.xul', 'CheckPlacesExcluded', 'chrome,resizable,modal,centerscreen');
	}
};

//Hide/Show the status bar icon
window.addEventListener("load", CheckPlaces.init, false);
