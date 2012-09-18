//
//  jsPrintSetup 
//  	 Global object extending printing features from client-side JavaScript
//
//  Revision: 
//     $Id: jsPrintSetup.js,v 1.9 2010/01/22 14:17:03 mitko Exp $ 
//
//  Copyright(c) 2009 EDA Ltd.
//
// Special thanks to Josh Stutts to add print to file and print listener!
// 

const kMODULE_NAME = "jsPrintSetup";
const kMODULE_CONTRACTID = "@edabg.com/jsprintsetup;1";
const kMODULE_CID = Components.ID("ec8030f7-c20a-464f-9b0e-13a3a9e97384");
const kMODULE_INTERFACE = Components.interfaces.jsPrintSetup;

function jsPrintSetup() {
	this.DEBUG = false; 
	this.INITOK = false; 
	try {

		this.printSettingsInterface = Components.interfaces.nsIPrintSettings;
	
		this.printSettingsService = 
			Components.classes["@mozilla.org/gfx/printsettings-service;1"]
					.getService(Components.interfaces.nsIPrintSettingsService);
	//	this.printSettingsService = 
	//		Components.classes["@mozilla.org/gfx/printsettings-service;1"]
	//			.createInstance(Components.interfaces.nsIPrintSettingsService);
	
		this.printSettings = this.printSettingsService.newPrintSettings;
	//		this.printSettingsService.globalPrintSettings
	//			.QueryInterface(Components.interfaces.nsIPrintSettings);
	
		this.globalPrintSettings = this.printSettingsService.globalPrintSettings;
		this.prefManager = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch);
		
		this.getPrintersList();                  
		this.setPrinter('');
	
		this.globalPaperSizeUnit = this.printSettingsService.globalPrintSettings.paperSizeUnit;
		this.paperSizeUnit = Components.interfaces.nsIPrintSettings.kPaperSizeMillimeters;

		this.printProgressListener = null; 

		this.INITOK = true; 
	} catch (err) {
		this.error(err);	
	}
}


jsPrintSetup.prototype = {
	Release: function() {
//		this.alert('release');
		this.printProgressListener = null;
		this.printSettingsInterface = null;
		this.printSettingsService = null;
		this.printSettings = null;
		this.globalPrintSettings = null;
		this.prefManager = null;
		this.printerList = null;
		return true;
	},
// Alert and logging methods
	alert: function(aMsg){
		var promptService = 
			Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
				.getService(Components.interfaces.nsIPromptService);
		promptService.alert(null, "JS Print Setup", aMsg);
		promptService = null;	
	},

	dump: function(aObj){
		var msg = '';
		for (var i in aObj)  
			msg += '\n'+i+':'/*+aObj[i]*/;
		this.alert('Object:'+msg);
	},

	error: function (err) {
		if (typeof(err) == 'object') {
			var msg = '';
			for (var i in err)  
				if (typeof(err[i]) != 'function') 
					msg += '\n'+i+':'+err[i];
			this.alert('Error:'+msg);
		} else 
			this.alert('Error:'+err);
	},

	log: function (aMsg) {
	  var consoleService = 
	    Components.classes["@mozilla.org/consoleservice;1"].
	               getService(Components.interfaces.nsIConsoleService);
	  consoleService.logStringMessage(aMsg);
	  consoleService = null;
	},

// Common private methods	
	getWindow: function () {
		var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"]
									.getService(Components.interfaces.nsIWindowMediator);
		return wm.getMostRecentWindow('navigator:browser');
	},
	
  getWebBrowserPrint: function (aWindow)
  {
    var contentWindow = aWindow || this.getWindow().content;
//		this.alert(contentWindow.frames.length);
//		if (contentWindow.frames.length)
//			contentWindow = contentWindow.frames[0]; 
    return contentWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                        .getInterface(Components.interfaces.nsIWebBrowserPrint);
  },	
	
/*
  getWebBrowserPrint: function ()
  {
//    var contentWindow = aWindow || window.content;
		var contentWindow = this.getWindow().content;
    	return contentWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                        .getInterface(Components.interfaces.nsIWebBrowserPrint);
  },
*/

// Common converting private methods 
	adjustValue : function (value, unitFrom, unitTo) {
		if (unitFrom != unitTo) {
			// Different Paper Size Units 
			if (unitTo == Components.interfaces.nsIPrintSettings.kPaperSizeInches)
				// value is in mm -> convert to inches
				return value / 25.4;
			else
				// value is in inches -> convert to mm
				return value * 25.4;
		} else
			return value;
	},
	
	// gets printer setting value and adjust it depending of units
	getValue : function (value) {
		// Here must be this.printSettings.paperSizeUnit, but actualy don't work properly
		// to work well we are using this.globalPrintSettings.paperSizeUnit
		return this.adjustValue(value, this.globalPrintSettings.paperSizeUnit, this.paperSizeUnit);
	},

	// sets printer setting value and adjust it depending of units
	setValue : function (value) {
		// Here must be this.printSettings.paperSizeUnit, but actualy don't work properly
		// to work well we are using this.globalPrintSettings.paperSizeUnit
		return this.adjustValue(value, this.paperSizeUnit, this.globalPrintSettings.paperSizeUnit);
	},

	// gets global printer setting value and adjust it depending of units
	getGlobalValue : function (value) {
		return this.adjustValue(value, this.globalPrintSettings.paperSizeUnit, this.paperSizeUnit);
	},

	// sets global printer setting value and adjust it depending of units
	setGlobalValue : function (value) {
		return this.adjustValue(value, this.paperSizeUnit, this.globalPrintSettings.paperSizeUnit);
	},

	// converts string to boolean
	toBool: function (value){
		return ((value == "true") || (value == "1")? true:false);
	},

	// convert scaling from percent to actual unit using from mozilla and reverse
	scalingConvert: function (scaling){
		if (scaling < 10.0) {
			scaling = 10.0;
		}
		if (scaling > 500.0) {
			scaling = 500.0;
		}
		scaling /= 100.0;
		
		return scaling;
	},
	scalingConvertR: function (scaling){
		return scaling*100;
	},
	
	// jsPrintSetup paperSizeUnit
	getPaperSizeUnit : function () {
		return this.paperSizeUnit;
	}, 
	setPaperSizeUnit : function (aPaperSizeUnit) {
		this.paperSizeUnit = aPaperSizeUnit;
	}, 
	// sets printer name and read its settings, if 	
	setPrinter: function(printerName){
		// Check for printer exist in list is removed instead of this error are captured!
/*	
		if (printerName) {
			// check if printer exist
			for (var i = 0, p_exist = false; (i < this.printerList.length) && !p_exist; i++)
				if (this.printerList[i] == printerName) p_exist = 1;
			if (!p_exist) {
				this.alert('Error: Printer \''+printerName+'\' doesn\'t exist!');
				return;
			}
		}
*/		
		try {
			// On Mac OS this.printSettingsService.defaultPrinterName produce Error!
			try {
				this.printerName = (printerName? printerName:this.printSettingsService.defaultPrinterName);
			} catch (err) {
				if (printerName)
					this.printerName = printerName;
			}
			// In case of error above
			if (this.printerName) {
				this.printSettings.printerName = this.printerName;
				// This is part from mozilla toolkit printUtils.js
				// First get any defaults from the printer 		
				this.printSettingsService.initPrintSettingsFromPrinter(this.printSettings.printerName, this.printSettings);
			}
			// now augment them with any values from last time
			this.printSettingsService.initPrintSettingsFromPrefs(this.printSettings, true, this.printSettingsInterface.kInitSaveAll);
	
		/*	if (this.printSettingsService.defaultPrinterName != this.printerName)
				this.printSettingsService.defaultPrinterName = this.printerName;*/
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}		
	},
	
	// get current printer name 
	getPrinter: function(){
		return this.printerName;
	},
	
	// get list of available printers
	getPrintersList: function(){
		this.printerList = new Array();
		var printerEnumerator;
		try {
			// Printer Enumerator in Mac OS is not implemented!
			printerEnumerator =	Components.classes["@mozilla.org/gfx/printerenumerator;1"];
			if(printerEnumerator) { 
				printerEnumerator = printerEnumerator.getService(Components.interfaces.nsIPrinterEnumerator);
				if (printerEnumerator)
					printerEnumerator = printerEnumerator.printerNameList;  
			}
			if (printerEnumerator) {
				var i = 0;
				while(printerEnumerator.hasMore())
					this.printerList[i++] = printerEnumerator.getNext();
			} else {
				// In case of Mac OS this.printSettingsService.defaultPrinterName produce error!
				try {
					this.printerList[0] = this.printSettingsService.defaultPrinterName;
				} catch (err) {
					try {
						if (this.printSettings.printerName)
							this.printerList[0] = this.printSettings.printerName;
					} catch (err) {
					} 	
				}	
			}	
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}
		printerEnumerator = null;		
		return this.printerList;	
/*
		var printerEnumerator =
			Components.classes["@mozilla.org/gfx/printerenumerator;1"]
				.getService(Components.interfaces.nsIPrinterEnumerator)
				.printerNameList;
		this.printerList = new Array();
		var i = 0;
		while(printerEnumerator.hasMore())
			this.printerList[i++] = printerEnumerator.getNext();
		return this.printerList;
*/			
	},

	//set current printer options
	setOption: function(option,value){
		try {
			switch(option){
				case 'orientation':
					this.printSettings.orientation = value;
					break;
				case 'marginTop':
					this.printSettings.marginTop = this.setValue(value);
					break;
				case 'marginLeft':
					this.printSettings.marginLeft = this.setValue(value);
					break;
				case 'marginRight':
					this.printSettings.marginRight = this.setValue(value);
					break;
				case 'marginBottom':
					this.printSettings.marginBottom = this.setValue(value);
					break;
				case 'headerStrCenter':
					this.printSettings.headerStrCenter = value;
					break;
				case 'headerStrLeft':
					this.printSettings.headerStrLeft = value;
					break;
				case 'headerStrRight':
					this.printSettings.headerStrRight = value;
					break;
				case 'footerStrCenter':
					this.printSettings.footerStrCenter = value;
					break;
				case 'footerStrLeft':
					this.printSettings.footerStrLeft = value;
					break;
				case 'footerStrRight':
					this.printSettings.footerStrRight = value;
					break;
				case 'scaling':
					this.printSettings.scaling = this.scalingConvert(value);
					break;
				case 'shrinkToFit':
					this.printSettings.shrinkToFit = this.toBool(value);
					break;
				case 'numCopies':
					this.printSettings.numCopies = value;
					break;				
				case 'outputFormat':
					this.printSettings.outputFormat = value;				
					break;				
				case 'paperName':
					this.printSettings.paperName = value;				
					break;				
				case 'paperData':
					this.printSettings.paperData = value;				
					break;				
				case 'paperSizeType':
					this.printSettings.paperSizeType = value;				
					break;
				case 'paperSizeUnit':
					this.alert("The property paperSizeUnit is readonly!");
	//				this.printSettings.paperSizeUnit = value;				
					break;			
				case 'paperHeight':
					this.printSettings.paperHeight = this.setValue(value);				
					break;				
				case 'paperWidth':
					this.printSettings.paperWidth = this.setValue(value);				
					break;
				case 'printRange':
					this.printSettings.printRange = value;				
					break;
				case 'startPageRange':
					this.printSettings.startPageRange = value;				
					break;
				case 'endPageRange':
					this.printSettings.endPageRange = value;				
					break;
				case 'printSilent':
					this.printSettings.printSilent = this.toBool(value);				
					break;									
				case 'showPrintProgress':
					this.printSettings.showPrintProgress = this.toBool(value);				
					break;
				case 'printBGColors' :
					this.printSettings.printBGColors = this.toBool(value);				
					break;										
				case 'printBGImages' :
					this.printSettings.printBGImages = this.toBool(value);				
					break;										
				case 'title':
					this.printSettings.title = value;
					break;
				case 'toFileName':
					this.printSettings.toFileName = value;
					break;
				default :
					this.alert('Not supported option:'+option);										
			}
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}		 
	},

	// set global print options
	setGlobalOption: function(option,value){
		try {
			switch(option){
				case 'orientation':
					this.globalPrintSettings.orientation = value;
					break;
				case 'marginTop':
					this.globalPrintSettings.marginTop = this.setGlobalValue(value);
					break;
				case 'marginLeft':
					this.globalPrintSettings.marginLeft = this.setGlobalValue(value);
					break;
				case 'marginRight':
					this.globalPrintSettings.marginRight = this.setGlobalValue(value);
					break;
				case 'marginBottom':
					this.globalPrintSettings.marginBottom = this.setGlobalValue(value);
					break;
				case 'headerStrCenter':
					this.globalPrintSettings.headerStrCenter = value;
					break;
				case 'headerStrLeft':
					this.globalPrintSettings.headerStrLeft = value;
					break;
				case 'headerStrRight':
					this.globalPrintSettings.headerStrRight = value;
					break;
				case 'footerStrCenter':
					this.globalPrintSettings.footerStrCenter = value;
					break;
				case 'footerStrLeft':
					this.globalPrintSettings.footerStrLeft = value;
					break;
				case 'footerStrRight':
					this.globalPrintSettings.footerStrRight = value;
					break;
				case 'shrinkToFit':
					this.globalPrintSettings.shrinkToFit = this.toBool(value);
					break;
				case 'scaling':
					this.globalPrintSettings.scaling = this.scalingConvert(value);
					break;
				case 'numCopies':
					this.globalPrintSettings.numCopies = value;
					break;				
				case 'outputFormat':
					this.globalPrintSettings.outputFormat = value;				
					break;				
				case 'paperName':
					this.globalPrintSettings.paperName = value;				
					break;				
				case 'paperData':
					this.globalPrintSettings.paperData = value;				
					break;				
				case 'paperSizeType':
					this.globalPrintSettings.paperSizeType = value;				
					break;
				case 'paperSizeUnit':
					this.alert("The Global property paperSizeUnit is readonly!");			
	//				this.globalPrintSettings.paperSizeUnit = value;				
					break;				
				case 'paperHeight':
					this.globalPrintSettings.paperHeight = this.setGlobalValue(value);				
					break;				
				case 'paperWidth':
					this.globalPrintSettings.paperWidth = this.setGlobalValue(value);				
					break;								
				case 'printRange':
					this.globalPrintSettings.printRange = value;				
					break;
				case 'startPageRange':
					this.globalPrintSettings.startPageRange = value;				
					break;
				case 'endPageRange':
					this.globalPrintSettings.endPageRange = value;				
					break;
				case 'printSilent':
					this.globalPrintSettings.printSilent = this.toBool(value);				
					break;									
				case 'showPrintProgress':
					this.globalPrintSettings.showPrintProgress = this.toBool(value);				
					break;									
				case 'printBGColors' :
					this.globalPrintSettings.printBGColors = this.toBool(value);				
					break;										
				case 'printBGImages' :
					this.globalPrintSettings.printBGImages = this.toBool(value);				
					break;										
				case 'title':
					this.globalPrintSettings.title = value;
					break;
				case 'toFileName':
					this.globalPrintSettings.toFileName = value;
					break;
				case 'DEBUG':
					this.DEBUG = this.toBool(value);				
					break;									
				default :
					this.alert('Not supported option:'+option);										
			}
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}		 
	},	

	// get current printer options
 	getOption: function(option){
		this.prefStatus = null;
		try {	
			switch(option){
				case 'orientation':
					this.prefStatus = this.printSettings.orientation;
					break;
				case 'marginTop':
					this.prefStatus = this.getValue(this.printSettings.marginTop);
					break;
				case 'marginLeft':
					this.prefStatus = this.getValue(this.printSettings.marginLeft);
					break;
				case 'marginRight':
					this.prefStatus = this.getValue(this.printSettings.marginRight);
					break;
				case 'marginBottom':
					this.prefStatus = this.getValue(this.printSettings.marginBottom);
					break;
				case 'headerStrCenter':
					this.prefStatus = this.printSettings.headerStrCenter;
					break;
				case 'headerStrLeft':
					this.prefStatus = this.printSettings.headerStrLeft;
					break;
				case 'headerStrRight':
					this.prefStatus = this.printSettings.headerStrRight;
					break;
				case 'footerStrCenter':
					this.prefStatus = this.printSettings.footerStrCenter;
					break;
				case 'footerStrLeft':
					this.prefStatus = this.printSettings.footerStrLeft;
					break;
				case 'footerStrRight':
					this.prefStatus = this.printSettings.footerStrRight;
					break;
				case 'scaling':
					this.prefStatus = this.scalingConvertR(this.printSettings.scaling);				
					break;			
				case 'shrinkToFit':
					this.prefStatus = this.printSettings.shrinkToFit;
					break;
				case 'numCopies':
					this.prefStatus = this.printSettings.numCopies;				
					break;				
				case 'outputFormat':
					this.prefStatus = this.printSettings.outputFormat;				
					break;				
				case 'paperName':
					this.prefStatus = this.printSettings.paperName;				
					break;				
				case 'paperData':
					this.prefStatus = this.printSettings.paperData;				
					break;				
				case 'paperSizeType':
					this.prefStatus = this.printSettings.paperSizeType;				
					break;
				case 'paperSizeUnit':
					this.prefStatus = this.printSettings.paperSizeUnit;				
					break;				
				case 'paperHeight':
					this.prefStatus = this.getValue(this.printSettings.paperHeight);				
					break;				
				case 'paperWidth':
					this.prefStatus = this.getValue(this.printSettings.paperWidth);				
					break;												
				case 'pinterName': // for my bug compatibility
				case 'printerName':
					this.prefStatus = this.printSettings.printerName;
					break;
				case 'printRange':
					this.prefStatus = this.printSettings.printRange;				
					break;
				case 'startPageRange':
					this.prefStatus = this.printSettings.startPageRange;				
					break;
				case 'endPageRange':
					this.prefStatus = this.printSettings.endPageRange;				
					break;
				case 'printSilent':
					this.prefStatus = this.printSettings.printSilent;				
					break;									
				case 'showPrintProgress':
					this.prefStatus = this.printSettings.showPrintProgress;				
					break;									
				case 'printBGColors' :
					this.prefStatus = this.printSettings.printBGColors;				
					break;										
				case 'printBGImages' :
					this.prefStatus = this.printSettings.printBGImages;				
					break;										
				case 'title':
					this.prefStatus = this.printSettings.title;
					break;
				case 'toFileName':
					this.prefStatus = this.printSettings.toFileName;
					break;
				default :
					this.prefStatus = null;										
					this.alert('Not supported option:'+option);										
			}
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}		 
		return this.prefStatus;
	},

	// get  global print options
 	getGlobalOption: function(option){
		this.prefStatus = null;
		try {	
			switch(option){
				case 'orientation':
					this.prefStatus = this.globalPrintSettings.orientation;
					break;
				case 'marginTop':
					this.prefStatus = this.getGlobalValue(this.globalPrintSettings.marginTop);
					break;
				case 'marginLeft':
					this.prefStatus = this.getGlobalValue(this.globalPrintSettings.marginLeft);
					break;
				case 'marginRight':
					this.prefStatus = this.getGlobalValue(this.globalPrintSettings.marginRight);
					break;
				case 'marginBottom':
					this.prefStatus = this.getGlobalValue(this.globalPrintSettings.marginBottom);
					break;
				case 'headerStrCenter':
					this.prefStatus = this.globalPrintSettings.headerStrCenter;
					break;
				case 'headerStrLeft':
					this.prefStatus = this.globalPrintSettings.headerStrLeft;
					break;
				case 'headerStrRight':
					this.prefStatus = this.globalPrintSettings.headerStrRight;
					break;
				case 'footerStrCenter':
					this.prefStatus = this.globalPrintSettings.footerStrCenter;
					break;
				case 'footerStrLeft':
					this.prefStatus = this.globalPrintSettings.footerStrLeft;
					break;
				case 'footerStrRight':
					this.prefStatus = this.globalPrintSettings.footerStrRight;
					break;
				case 'scaling':
					this.prefStatus = this.scalingConvertR(this.globalPrintSettings.scaling);				
					break;			
				case 'shrinkToFit':
					this.prefStatus = this.globalPrintSettings.shrinkToFit;
					break;
				case 'numCopies':
					this.prefStatus = this.globalPrintSettings.numCopies;				
					break;				
				case 'outputFormat':
					this.prefStatus = this.globalPrintSettings.outputFormat;				
					break;				
				case 'paperName':
					this.prefStatus = this.globalPrintSettings.paperName;				
					break;				
				case 'paperData':
					this.prefStatus = this.globalPrintSettings.paperData;				
					break;				
				case 'paperSizeType':
					this.prefStatus = this.globalPrintSettings.paperSizeType;				
					break;
				case 'paperSizeUnit':
					this.prefStatus = this.globalPrintSettings.paperSizeUnit;				
					break;				
				case 'paperHeight':
					this.prefStatus = this.getGlobalValue(this.globalPrintSettings.paperHeight);				
					break;				
				case 'paperWidth':
					this.prefStatus = this.getGlobalValue(this.globalPrintSettings.paperWidth);				
					break;												
				case 'pinterName': // for my bug compatibility
				case 'printerName':
					this.prefStatus = this.globalPrintSettings.printerName;
					break;
				case 'printRange':
					this.prefStatus = this.globalPrintSettings.printRange;				
					break;
				case 'startPageRange':
					this.prefStatus = this.globalPrintSettings.startPageRange;				
					break;
				case 'endPageRange':
					this.prefStatus = this.globalPrintSettings.endPageRange;				
					break;
				case 'printSilent':
					this.prefStatus = this.globalPrintSettings.printSilent;				
					break;									
				case 'showPrintProgress':
					this.prefStatus = this.globalPrintSettings.showPrintProgress;				
					break;									
				case 'printBGColors' :
					this.prefStatus = this.globalPrintSettings.printBGColors;				
					break;										
				case 'printBGImages' :
					this.prefStatus = this.globalPrintSettings.printBGImages;				
					break;										
				case 'title':
					this.prefStatus = this.globalPrintSettings.title;
					break;
				case 'toFileName':
					this.prefStatus = this.globalPrintSettings.toFileName;
					break;
				case 'DEBUG':
					this.prefStatus = this.DEBUG;				
					break;									
				default :
					this.prefStatus = null;										
					this.alert('Not supported option:'+option);
			}
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}		 
		return this.prefStatus;

	},
//		
// All print configuration options can be found at
// http://kb.mozillazine.org/About:config_entries#Print..2A
//
	// set flag to display print progress true/false 	
	setShowPrintProgress: function (flag){
		try {
			this.prefManager.setBoolPref("print.show_print_progress", flag);
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}	
	},

	// get flag to display print progress
	getShowPrintProgress: function () {
		try {
			return this.prefManager.getBoolPref("print.print.show_print_progress");
		} catch (err) {
			if (this.DEBUG) this.error(err);
			return NULL;
		}	
	},

	// set flag for silents print process (don't display print dialog)
	setSilentPrint: function (flag) {
		try {
			this.prefManager.setBoolPref("print.always_print_silent", flag);	
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}	
	},
	
	// clear silent print always flag
	clearSilentPrint: function () {
		try {
			this.prefManager.clearUserPref("print.always_print_silent");	
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}	
	},
	
	// get flag for silents print process (don't display print dialog)
	getSilentPrint: function (){
		try {
			return this.prefManager.getBoolPref("print.always_print_silent");	
		} catch (err) {
			if (this.DEBUG) this.error(err);
			return NULL;
		}	
	},
	
	//save  current printer settings to preferences
	saveOptions: function(optionSet){
		try {
	      this.printSettingsService.savePrintSettingsToPrefs(this.printSettings, true, optionSet);
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}	
	},

	// save global print settings to preferences
	saveGlobalOptions: function(optionSet){
		try {
	      this.printSettingsService.savePrintSettingsToPrefs(this.globalPrintSettings, true, optionSet);
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}	
	},
	
	// call print with current printer
	print: function() {
		try {				
			var webBrowserPrint = this.getWebBrowserPrint(null);				
			//Check to see if an nsIWebProgressListener was provided, if so, use it.
			webBrowserPrint.print(this.printSettings, this.printProgressListener);  
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}	
	},

	printWindow: function(aWindow) {
		try {				
			var webBrowserPrint = this.getWebBrowserPrint(aWindow);
			webBrowserPrint.print(this.printSettings, this.printProgressListener); //this.printSettings, null
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}	
	},

	setPrintProgressListener: function(listener) {
		try {
			this.printProgressListener = listener;
		} catch (err) {
			this.error(err);
		}	
	},

	printPreview: function() {
		this.alert("This version doesn't implement method printPreview! ");
	},
	 
	// refreshresh printer options
	refreshOptions: function(){
//		this.printSettings = this.printSettingsService.globalPrintSettings
//		.QueryInterface(Components.interfaces.nsIPrintSettings);
//		this.printSettings.printerName = this.printerName;
		try {
			// This is part from mozilla toolkit printUtils.js
			// First get any defaults from the printer 		
			this.printSettingsService.initPrintSettingsFromPrinter(this.printSettings.printerName, this.printSettings);
			// now augment them with any values from last time
			this.printSettingsService.initPrintSettingsFromPrefs(this.printSettings, true, this.printSettingsInterface.kInitSaveAll);
		} catch (err) {
			if (this.DEBUG) this.error(err);
		}	
	},

// Interface supporting methods	
	// nsISupports
	QueryInterface: function(iid) {
/*	
		if (iid.equals(kMODULE_INTERFACE)) this.alert(kMODULE_INTERFACE);
		else if (iid.equals(Components.interfaces.nsIClassInfo)) this.alert(Components.interfaces.nsIClassInfo);
		else if (iid.equals(Components.interfaces.nsISupports)) this.alert(Components.interfaces.nsISupports);
		else if (iid.equals(Components.interfaces.nsISecurityCheckedComponent)) this.alert(Components.interfaces.nsISecurityCheckedComponent);
		else this.alert('unknown:'+iid);
*/		
		if (!iid.equals(kMODULE_INTERFACE) &&
			!iid.equals(Components.interfaces.nsIClassInfo) &&
			!iid.equals(Components.interfaces.nsISupports) 
//			&&	!iid.equals(Components.interfaces.nsISecurityCheckedComponent)
			) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
		return this;
	},

	// nsIClassInfo
	flags: Components.interfaces.nsIClassInfo.DOM_OBJECT, //|Components.interfaces.nsIClassInfo.SINGLETON,

	implementationLanguage: Components.interfaces.nsIProgrammingLanguage.JAVASCRIPT,

	classDescription: kMODULE_NAME,
	classID: kMODULE_CID,
	contractID: kMODULE_CONTRACTID,

	getInterfaces: function(aCount) {
		var aResult = [
		 	kMODULE_INTERFACE
//			, Components.interfaces.nsISecurityCheckedComponent
			, Components.interfaces.nsIClassInfo
		];
//		this.alert('get interfaces:'+aResult);
		aCount.value = aResult.length;
		return aResult;
	},

	getHelperForLanguage: function(count) { return null; },
  
	// nsISecurityCheckedComponent
	// Implementation of this interface was suggested from Dave Townsend
	// to see http://weblogs.mozillazine.org/weirdal/archives/017211.html
/*	
	canCreateWrapper : function canCreateWrapper(aIID) {
//		this.alert('canCreateWrapper:'+aIID);
		return "AllAccess";
	},
	canCallMethod: function canCallMethod(aIID, methodName) {
//		this.alert('canGetProperty:'+aIID+':'+propertyName);
		return "AllAccess";
	},
	canGetProperty: function canGetProperty(aIID, propertyName) {
//		this.alert('canGetProperty:'+aIID+':'+propertyName);
		return "AllAccess";
/ *		
		switch (propertyName) {
			case "property 1":
			case "property 2":
				return "AllAccess";
		}
		return "NoAccess";
* /		
	},
	canSetProperty: function canSetProperty(aIID, propertyName) {
//		this.alert('canSetProperty:'+aIID+':'+propertyName);
		return "AllAccess";
/ *	
		if (propertyName == "property 1") {
			return "AllAccess";
		}
		return "NoAccess";
* /		
	},
*/	
};

// the end jsPrintSetup.property
var jsPrintSetupFactory = {
	createInstance : function (outer, iid) {
/*	
		var ps  = 
				Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
					.getService(Components.interfaces.nsIPromptService);
		if (iid.equals(kMODULE_INTERFACE)) ps.alert(null, "JS Print Setup",'aa:'+kMODULE_INTERFACE);
		else if (iid.equals(Components.interfaces.nsIClassInfo)) ps.alert(null, "JS Print Setup",'aa:'+Components.interfaces.nsIClassInfo);
		else if (iid.equals(Components.interfaces.nsISecurityCheckedComponent)) ps.alert(null, "JS Print Setup",'aa:'+Components.interfaces.nsISecurityCheckedComponent);
		else if (iid.equals(Components.interfaces.nsISupports)) ps.alert(null, "JS Print Setup",'aa:'+Components.interfaces.nsISupports);
		else ps.alert(null, "JS Print Setup",'aa:unknown:'+iid);
*/		
		if (outer !== null)
			throw Components.results.NS_ERROR_NO_AGGREGATION;
		if (!iid.equals(kMODULE_INTERFACE) &&
			!iid.equals(Components.interfaces.nsIClassInfo) && 
			!iid.equals(Components.interfaces.nsISupports) 
//			&& !iid.equals(Components.interfaces.nsISecurityCheckedComponent)
			) {
			throw Components.results.NS_ERROR_NO_INTERFACE;
		}
//		return new jsPrintSetup();
		return (new jsPrintSetup()).QueryInterface(iid);
	}
}; // jsPrintSetupFactory


var jsPrintSetupModule = {
	registerSelf : function (aCompMgr, fileSpec, location, type) {
		var compMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.registerFactoryLocation(
			kMODULE_CID
			, kMODULE_NAME
			, kMODULE_CONTRACTID
			, fileSpec
			, location
			, type
		);
		var catman = Components.classes["@mozilla.org/categorymanager;1"].
							getService(Components.interfaces.nsICategoryManager);
	// Register Global Property, make object accessible to any window
		catman.addCategoryEntry(
			"JavaScript global property"
			, "jsPrintSetup"
			, kMODULE_CONTRACTID
			, true
			, true
		);
		catman = null;
		compMgr = null;
	},

  unregisterSelf: function(aCompMgr, aLocation, aType)
	{
		var catman = Components.classes["@mozilla.org/categorymanager;1"].
						getService(Components.interfaces.nsICategoryManager);
		catman.deleteCategoryEntry(
			"JavaScript global property"
			, "jsPrintSetup"
			, true
		);
		var compMgr = aCompMgr.QueryInterface(Components.interfaces.nsIComponentRegistrar);
		compMgr.unregisterFactoryLocation(kMODULE_CID, aLocation);
		compMgr = null;        
		catman = null;
	},

	getClassObject : function (compMgr, cid, iid) {
		if (!cid.equals(kMODULE_CID))
			throw Components.results.NS_ERROR_NO_INTERFACE;
		if (!iid.equals(Components.interfaces.nsIFactory))
			throw Components.results.NS_ERROR_NOT_IMPLEMENTED;
		return jsPrintSetupFactory;
	},

	canUnload : function (compMgr) {
		return true;
	}
}; // jsPrintSetupModule


function NSGetModule(compMgr, fileSpec) {
	return jsPrintSetupModule;
}
