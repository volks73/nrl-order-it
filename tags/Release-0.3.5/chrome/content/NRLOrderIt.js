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
 * The Original Code is NRL Order It.
 *
 * The Initial Developer of the Original Code is Dr. Christopher R. Field.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 * 		Christopher R. Field <christopher.field.ctr@nrl.navy.mil>
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

/**
 * The <code>NRLOrderIt</code> object contains all the configuration information and functions
 * used throughout the application.
 */
var NRLOrderIt = new function()
{
	const EXT_ID = "NRLOrderIt@nrl.navy.mil";
	const EXT_NAME = "NRLOrderIt";
	const EXT_TITLE = "NRL Order It";
	const EXT_DIR = "extensions";
	const DEFAULTS_DIR = "defaults";
	const DB_FILE = "NRLOrderIt.sqlite";
	const DB_DEFAULT_FILE = "NRLOrderIt_default.sqlite";
	const DB_PATH = "profile:" + DB_FILE;
		
	var titleState;
	var toolbarCollapseState;
	
	this.conn = null;
	this.prefs = null;
	
	this.onLoad = onLoad;
	this.updateMessage = updateMessage;
	this.toggleDisplay = toggleDisplay;
	this.toggleFullscreen = toggleFullscreen;
	this.advanceFocus = advanceFocus;
	this.displayPreferences = displayPreferences;
	this.displayMessage = displayMessage;
	
	/**
	 * Listens for load events from the window. If the database file does not exist,
	 * this will create one in the profile directory. This also sets the 
	 * <code>datasources</code> attribute for all database-driven UI elements. The
	 * database can be found at <code>DB_PATH</code>.
	 */
	function onLoad()
	{	
		var version = -1;
		var firstRun = true;
		
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		                                .getService(Components.interfaces.nsIPrefService)
		                                .getBranch("nrlorderit.");
		this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
				
		firstRun = this.prefs.getBoolPref('firstrun');
		
		/*
		 * Install.
		 */
		if ( firstRun )
		{
			this.prefs.setBoolPref('firstrun', false);
			createDatabase(this.prefs.getCharPref('version'));
			
			try 
			{
				// Firefox 4 and later;
				Components.utils.import("resource://gre/modules/AddonManager.jsm");
				AddonManager.getAddonByID(EXT_ID, function(addon)
				{
					var tempPrefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
                    .getBranch("nrlorderit.");
					
					tempPrefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
					tempPrefs.setCharPref('version', addon.version);
				}); 					
			}
			catch ( ex ) 
			{
				// Firefox 3.6 and before
				var gExtensionManager = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
				this.prefs.setCharPref('version', gExtensionManager.getItemForID(EXT_ID).version);
			}
				
			showTutorial();
		}
		
		// TODO: Upgrade code
		
		window.removeEventListener("load", function() { NRLOrderIt.onLoad(); }, true);
		
		var storageService = Components.classes["@mozilla.org/storage/service;1"].getService(Components.interfaces.mozIStorageService);
		
		/*
		 * Create the connection. This method will create the database file, but it shouldn't have to 
		 * based on the preceding code.
		 */
		this.conn = storageService.openDatabase(getDBFile());
		
		/*
		 * Now that the database file has been located and/or created, set the data sources
		 * for the database-driven UI elements.
		 */
		setDataSources();
	}
	
	/**
	 * Gets the database file.
	 */
	function getDBFile()
	{
		/*
		 * Get the profile folder. The database file is located in ProfD/NRLOrderIt while
		 * the extension contents are located at ProfD/extensions/NRLOrderIt
		 */
		var profileDir = Components.classes["@mozilla.org/file/directory_service;1"]  
			                     .getService(Components.interfaces.nsIProperties)  
			                     .get("ProfD", Components.interfaces.nsIFile);
		
		var dbFile = profileDir.clone();
		dbFile.append(DB_FILE);
		
		return dbFile;
	}
	
	/**
	 * Creates the database file.
	 * 
	 * @param version The already installed version.
	 */
	function createDatabase(version)
	{
		/*
		 * Get the profile folder. The database file is located in ProfD/NRLOrderIt while
		 * the extension contents are located at ProfD/extensions/NRLOrderIt
		 */
		var profileDir = Components.classes["@mozilla.org/file/directory_service;1"]  
			                     .getService(Components.interfaces.nsIProperties)  
			                     .get("ProfD", Components.interfaces.nsIFile);
		
		var dbFile = getDBFile();
		
		/*
		 * It maybe the first run, but an old database may be around, so let's be careful.
		 */
		if ( dbFile.exists() )
		{
			try
			{
				if ( version )
				{
					dbFile.copyTo(profileDir, EXT_NAME + "_" + version + ".sqlite");
				}
				else
				{
					dbFile.copyTo(profileDir, EXT_NAME + "_old.sqlite");
				}
			}
			catch ( e )
			{
				/*
				 * Do nothing.
				 */
			}
		}
		else
		{
			// %APPDATA%\Roaming\Mozilla\Firefox\Profiles\
			var defaultsDir = profileDir.clone();
			// %APPDATA%\Roaming\Mozilla\Firefox\Profiles\extensions\
			defaultsDir.append(EXT_DIR)
			// %APPDATA%\Roaming\Mozilla\Firefox\Profiles\extensions\NRLOrderIt@nrl.navy.mil
			defaultsDir.append(EXT_ID);
			// %APPDATA%\Roaming\Mozilla\Firefox\Profiles\extensions\NRLOrderIt@nrl.navy.mil\defaults
			defaultsDir.append(DEFAULTS_DIR);
							
			var defaultDB = null;
					
			if ( defaultsDir.exists() )
			{
				defaultDB = defaultsDir.clone();
			}
			else
			{
				/*
				 * This is for the development environment. While under development, the extension is
				 * not actually installed in 'ProfD/extensions/NRLOrderIt@nrl.navy.mil' but in the
				 * workspace on the development computer desktop. Thus, there is no defaults
				 * folder for the development environment of the extension. So, the defaults folder
				 * was copied to 'ProfD/NRLOrderIt' under the development profile and the default
				 * DB file is copied from that location. Under a production, or user, environment,
				 * this code should not matter.
				 */
				var dbDir = profileDir.clone();
				dbDir.append(EXT_NAME);
					
				if ( dbDir.exists() )
				{
					defaultDB = dbDir.clone();
				}
			}
					
			defaultDB.append(DB_DEFAULT_FILE);
			defaultDB.copyTo(profileDir, DB_FILE);
		}
	}
	
	/**
	 * Shows the mini-tutorial in a new tab.
	 */
	function showTutorial()
	{
		/*
		 * Loads a page by opening a new tab. Useful for loading a mini tutorial.
		 */
		window.setTimeout(function()
		{
			gBrowser.selectedTab = gBrowser.addTab("chrome://NRLOrderIt/content/Tutorial.html");
		}, 1500); // Firefox 2 fix - or else tab will get closed
	}
	
	
	/**
	 * Toggles full screen mode.
	 */
	function toggleFullscreen()
	{		
		var nrlOrderItPane = document.getElementById('NRLOrderIt-pane');
		var toolbox = getNavToolbox();
		var makeFullscreen = nrlOrderItPane.flex == "0";
		
		if ( makeFullscreen )
		{
			nrlOrderItPane.setAttribute('flex', "1");
		}
		else
		{
			nrlOrderItPane.setAttribute('flex', "0");
		}
		
		document.getElementById('content').setAttribute('collapsed', makeFullscreen);
		document.getElementById('NRLOrderIt-splitter').setAttribute('hidden', makeFullscreen);
		
		if ( makeFullscreen )
		{
			if( document.title != EXT_TITLE ) 
			{
				titleState = document.title;
				document.title = EXT_TITLE;
			}
			
			if( !toolbarCollapseState ) 
			{
				toolbarCollapseState = [node.collapsed for each (node in toolbox.childNodes)];
				
				for( var i=0; i<toolbox.childNodes.length; i++ )
				{
					toolbox.childNodes[i].collapsed = true;
				}
			}
		}
		else
		{
			if ( document.title == EXT_TITLE )
			{
				document.title = titleState;
			}
			
			if( toolbarCollapseState )
			{
				for( var i=0; i<toolbox.childNodes.length; i++ )
				{
					toolbox.childNodes[i].collapsed = toolbarCollapseState[i];
				}
				
				toolbarCollapseState = undefined;
			}
		}
	}
	
	/**
	 * Sets the data sources for all database-driven UI elements. This sets the <code>datasources</code> attribute for all
	 * XUL template elements to <code>DB_PATH</code>. The <code>datasources</code> attribute cannot be set within the XUL
	 * document statically because the XUL loads before the JavaScript, which creates a database connection with the 
	 * SQLite database, which is fine, if the database is already created with tables. However, if the database does
	 * not exist, creating the database connection will create the file with no tables; then none of the SQL
	 * will work. To avoid the XUL data source from creating the database prior to the JavaScript on load, the
	 * <code>datasources</code> attribute for all database-driven UI elements is set to <code>rdf:null</code> and
	 * then set on load of the JavaScript, not on load of the XUL. 
	 */
	function setDataSources()
	{
		var purchaseOrderTree = document.getElementById('NRLOrderIt-PurchaseOrder-Tree');
		var companyMenu = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Company');
		var jobOrderNumberMenu = document.getElementById('NRLOrderIt-PurchaseOrder-Form-JobOrderNumber');
		var itemTree = document.getElementById('NRLOrderIt-Item-Tree');
		var hazmatCodeMenu = document.getElementById('NRLOrderIt-Item-Form-HazmatCode');
		var companyTree = document.getElementById('NRLOrderIt-Company-Tree');
		var jobOrderNumberTree = document.getElementById('NRLOrderIt-JobOrderNumber-Tree');
		
		purchaseOrderTree.datasources = DB_PATH;
		companyMenu.datasources = DB_PATH;
		jobOrderNumberMenu.datasources = DB_PATH;
		itemTree.datasources = DB_PATH;
		hazmatCodeMenu.datasources = DB_PATH;
		companyTree.datasources = DB_PATH;		
		jobOrderNumberTree.datasources = DB_PATH;
		
		/*
		 * There is some bug where the menulist rebuild() function doesn't remove all the items
		 * automatically and reset the selected index, so we have to do it manually. Otherwise,
		 * all of the rows in the database will appear twice in the menu.
		 */
		companyMenu.removeAllItems();
		companyMenu.builder.rebuild();
		companyMenu.selectedIndex = 0;
		
		jobOrderNumberMenu.removeAllItems();
		jobOrderNumberMenu.builder.rebuild();
		jobOrderNumberMenu.selectedIndex = 0;
		
		hazmatCodeMenu.removeAllItems();
		hazmatCodeMenu.builder.rebuild();
		hazmatCodeMenu.selectedIndex = 0;	
	}
	
	/**
	 * Advances the focus on enter key or return key press.
	 * 
	 * @param event The key event.
	 */
	function advanceFocus(event)
	{
		if ( event.keyCode == KeyEvent.DOM_VK_ENTER || event.keyCode == KeyEvent.DOM_VK_RETURN )			
		{
			document.commandDispatcher.advanceFocus();
		}
	}
	
	/**
	 * Updates the message bar.
	 * 
	 * @param messageKey The key to the message in the NRLOrderIt.properties file.
	 */
	function updateMessage(messageKey)
	{
		var messages = document.getElementById('NRLOrderIt-Messages');		
		var messageLabel = document.getElementById('NRLOrderIt-message');
		messageLabel.value = messages.getString(messageKey);
	}
	
	/**
	 * Displays a dialog box with a message, similar to the <code>alert()</code> method.
	 * 
	 * @param messageKey The key to the message in the NRLOrderIt.properties file.
	 */
	function displayMessage(messageKey)
	{
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		                                       .getService(Components.interfaces.nsIPromptService);

		var messages = document.getElementById('NRLOrderIt-Messages');
		promptService.alert(window, "NRL Order It Message", messages.getString(messageKey));
	}
	
	/**
	 * Opens a dialog with the preferences for the extension.
	 */
	function displayPreferences() 
	{	
		/*
		 * For the preferences dialog to be displayed, the toolbar flag must be set. This is not mentioned in the XUL MDC
		 * documentation.
		 */
		window.openDialog("chrome://NRLOrderIt/content/Preferences.xul", "NRLOrderIt-Preferences", "chrome,titlebar,toolbar,centerscreen,modal", this);
	}
	
	/**
	 * Toggles the display of the main interface and splitter bar.
	 */
	function toggleDisplay()
	{
		var nrlOrderItPane = document.getElementById('NRLOrderIt-pane');
		var splitter = document.getElementById('NRLOrderIt-splitter');
		
		if ( nrlOrderItPane.getAttribute('hidden') == 'true' )
		{
			var isHidden = true;
			updateMessage('welcome');
		}

		splitter.setAttribute('hidden', !isHidden);
		nrlOrderItPane.setAttribute('hidden', !isHidden);
	}
}

window.addEventListener("load", function() { NRLOrderIt.onLoad(); }, true);