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
 * 		Christopher R. Field <christopher.field@nrl.navy.mil, cfield2@gmail.com>
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
var EXPORTED_SYMBOLS = [ "mil.navy.nrl.NRLOrderIt.NRLOrderIt.Addon" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://NRLOrderIt/common.js");
Components.utils.import("resource://NRLOrderIt/log4moz.js");
Components.utils.import("resource://NRLOrderIt/SQL.js");
Components.utils.import("resource://NRLOrderIt/SQLStorage.js");

/**
 * The <code>Addon</code> module.
 */
mil.navy.nrl.NRLOrderIt.Addon = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.Addon");  
	var _application = Cc["@mozilla.org/fuel/application;1"].getService(Ci.fuelIApplication);
	var _dateFormat = 'M/d/yyyy';
	var _storage = mil.navy.nrl.NRLOrderIt.SQL.Storage;

	/**
	 * The preferences for the application.
	 */
	var _preferences = {
		version : "extensions.nrlorderit.version",
		installed : "extensions.nrlorderit.installed",
		debug : "extensions.nrlorderit.debug",
		debugLevel : "extensions.nrlorderit.debug.level",
		logging : "extensions.nrlorderit.logging",
		loggingLevel : "extensions.nrlorderit.logging.level",
		dateFormat : "extensions.nrlorderit.dateformat"
	};
	
	/*
	 * Private methods.
	 */
	
	/**
	 * Sets the version number in the extension preferences.
	 */
	var _setVersionPreference = function () {
		_logger.trace("_setVersionPreference opened");
		
		let versionPref = _application.prefs.get(_preferences.version);
	    	
	    try 
		{
	    	_logger.debug("Firefox 4 or greater preferences used");
			
			Components.utils.import("resource://gre/modules/AddonManager.jsm");
			AddonManager.getAddonByID(this.EXTENSION_ID, function(addon)
			{	
				versionPref.value = addon.version;				
			}); 					
		}
		catch ( execption ) 
		{
			_logger.debug("Firefox 3.0 to 3.6 perferences used");
			
			// Firefox 3.0 to 3.6
			var gExtensionManager = Cc["@mozilla.org/extensions/manager;1"].getService(Ci.nsIExtensionManager);
			versionPref.value = gExtensionManager.getItemForID(this.EXTENSION_ID).version;
		}
		
		_logger.info("NRLOrderIt version: " + versionPref.value);		
		_logger.trace("_setVersionPreference closed");
	};
	
	/**
	 * Initializes the logger.
	 */
	var _initLogger = function () {
		_logger.trace("_initLogger opened");
		
		let debugPref = _application.prefs.get(_preferences.debug);
		let debugLevelPref = _application.prefs.get(_preferences.debugLevel);
		let loggingPref = _application.prefs.get(_preferences.logging);
		let loggingLevelPref = _application.prefs.get(_preferences.loggingLevel);
		
		let root = Log4Moz.repository.rootLogger;
		root.level = Log4Moz.Level["All"];
		
		if ( debugPref.value ) {
			let formatter = new Log4Moz.BasicFormatter();  
			let consoleAppender = new Log4Moz.ConsoleAppender(formatter);
			
			let level = "ALL";
			
			if ( debugLevelPref.value ) {
				level = debugLevelPref.value;
			}
			
			consoleAppender.level = Log4Moz.Level[level];
			root.addAppender(consoleAppender); 
		}
		
		if ( loggingPref.value ) {
			// TODO: Change formatter to show timestamp in human readable format
			let formatter = new Log4Moz.BasicFormatter();    
			let logFile = NRLOrderIt.App.EXTENSION_FOLDER;
			logFile.append(NRLOrderIt.App.LOG_FILE_NAME);  
	   
			let fileAppender = new Log4Moz.RotatingFileAppender(logFile, formatter);
			
			let level = "WARN";
			
			if ( loggingLevelPref.value ) {
				level = loggingLevelPref.value;
			}
			
			fileAppender.level = Log4Moz.Level[loggingLevelPref.value];
			root.addAppender(fileAppender);
		}
		
		_logger.trace("_initLogger closed");
	};
	
	return {
			
		/*
		 * Application Constants.
		 */
		
		get EXTENSION_ID() {
			return "NRLOrderIt@nrl.navy.mil";
		},
		
		get EXTENSION_NAME() {
				return "NRLOrderIt";
		},
			
		get EXTENSION_TITLE() {
			return "NRL Order It";
		},
		
		get EXTENSION_FOLDER_NAME() {
			return "extensions";
		},
			
		get DEFAULTS_FOLDER_NAME() {
			return "defaults";
		},
		
		get LOG_FILE_NAME() {
			return "log.txt";
		},
		
		get DATABASE_FILE_NAME() {
			return "NRLOrderIt.sqlite";
		},
		
		get DEFAULT_DATABASE_FILE_NAME() {
			return "NRLOrderIt_default.sqlite";
		},
		
		get PROFILE_FOLDER() {
			let directoryService = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);    
			let profileFolder = directoryService.get("ProfD", Ci.nsIFile); // ../profiles/profileName/
			
			return profileFolder;
		},
		
		get INSTALL_FOLDER() {    
			let installFolder = this.PROFILE_FOLDER;
			
			installFolder.append(this.EXTENSION_FOLDER_NAME); // ../profiles/profileName/extensions
			installFolder.append(this.EXTENSION_ID);  // ../profiles/profileName/extensions/NRLOrderIt@nrl.navy.mil
			
			return installFolder;
		},
		
		get EXTENSION_FOLDER() {
			let extensionFolder = this.PROFILE_FOLDER; // ../profile/profileName/
			
			extensionFolder.append(this.EXTENSION_NAME); // ../profile/profileName/NRLOrderIt/
			
			return extensionFolder;
		},
		
		get DEFAULTS_FOLDER() {
			let defaultsFolder = this.INSTALL_FOLDER;
			
			defaultsFolder.append(DEFAULTS_FOLDER_NAME);
			
			return defaultsFolder;
		},
		
		get DATABASE_FILE() {
			let databaseFile = this.EXTENSION_FOLDER;
			databaseFile.append(this.DATABASE_FILE_NAME);
		    
		    return databaseFile;
		},
		
		/*
		 * Public methods.
		 */
		
		/**
		 * Loads the extension. This function checks if the extensions needs to be installed, upgraded, or run.
		 */
		load : function () {
			_logger.trace("load opened");
		
			_initLogger();
			
			let installedPref = _application.prefs.get(_preferences.installed);
		
		    if ( !installedPref.value ) 
		    {
		    	this.install(installedPref);
		    }
	    	
		    let dateFormatPref = _application.prefs.get(_preferences.dateFormat);
		    
		    if ( dateFormatPref ) {
		    	_dateFormat = dateFormatPref.value;
		    }
		    
		    _storage.init(this.DATABASE_FILE);
		    
		    _logger.trace("load closed");
		},
	
		/**
		 * Installs the extension.
		 */
		install : function (installedPref) {
			_logger.trace("install opened");
			
		   	installedPref.value = true;
		   	
		   	_setVersionPreference();
		   	
		   	// Create the NRLOrderIt folder in the profile directory. This is where all the user data and logs
		   	// will be stored.
		   	let extensionFolder = this.EXTENSION_DIRECTORY;
			
			if ( !extensionFolder.exists() || !extensionFolder.isDirectory() ) 
			{   
				extensionFolder.create(Ci.nsIFile.DIRECTORY_TYPE, 0774);  
			}
		   	
			// Copy the default database to the NRLOrderIt extension folder in the profile directory.
			let defaultDatabaseFile = this.DEFAULTS_FOLDER;
			defaultDatabaseFile.append(this.DEFAULT_DATABASE_FILE_NAME);
			
			defaultDatabaseFile.copyTo(extensionFolder, this.DATABASE_FILE_NAME);
		   	
		   	_logger.trace("install closed");
		},
		
		/**
		 * Upgrades the extension.
		 */
		upgrade : function () {
			_logger.trace("upgrade called");
			
			// TODO: Add upgrade code.
						
			_logger.trace("upgrade returned");
		},
		
		get dateFormat() {
			return _dateFormat;
		},
		
		get storage() {
			return _storage;
		}
	}
})();