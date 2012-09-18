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
Components.utils.import("resource://NRLOrderIt/common.js");
Components.utils.import("resource://NRLOrderIt/log4moz.js");

/**
 * The <code>CompanyForm</code> module.
 */
mil.navy.nrl.NRLOrderIt.Company.Form = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.Company.Form");
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _company = null;
	var _nameTextbox = null;
	var _addressTextbox = null;
	var _phoneTextbox = null;
	var _faxTextbox = null;
	var _websiteTextbox = null;
	
	/*
	 * Private methods.
	 */
	
	var _load = function () {
		_logger.trace("_load opened");
		
		_nameTextbox.value = _company.name;
		_addressTextbox.value = _company.address;
		_phoneTextbox.value = _company.phone;
		_faxTextbox.value = _company.fax;
		_websiteTextbox.value = _company.website;
		
		_logger.trace("_load closed");
	};
	
	return {
		
		/*
		 * IDs.
		 */
		
		get ID() {
			return _NRLOrderIt.Company.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Form';
		},
		
		get NAME_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Name';
		},
		
		get ADDRESS_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Address';
		},
		
		get PHONE_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Phone';
		},
		
		get FAX_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Fax';
		},
		
		get WEBSITE_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Website';
		},
		
		get DONE_BUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Done';
		},
		
		get RESET_BUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Reset';
		},
		
		get CANCEL_BUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Cancel';
		},
		
		/*
		 * Events.
		 */
		
		get EVENT_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Event'; 
		},
		
		/**
		 * Fired when the form is loaded.
		 */
		get LOAD_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Load';
		},
		
		/**
		 * Fired when done.
		 */
		get DONE_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Done';
		},
		
		/**
		 * Fired when reset.
		 */
		get RESET_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Reset';
		},
		
		/**
		 * Fired when canceled.
		 */
		get CANCEL_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Cancel';
		},
		
		/*
		 * Public methods.
		 */
		
		init : function () {
			_logger.trace("init opened");
			
			_nameTextbox = document.getElementById(this.NAME_TEXTBOX_ID);
			_addressTextbox = document.getElementById(this.ADDRESS_TEXTBOX_ID);
			_phoneTextbox = document.getElementById(this.PHONE_TEXTBOX_ID);
			_faxTextbox = document.getElementById(this.FAX_TEXTBOX_ID);
			_websiteTextbox = document.getElementById(this.WEBSITE_TEXTBOX_ID);
			
			this.clear();
			
			_logger.trace("init closed");
		},
		
		clear : function () {
			_logger.trace("clear opened");
			
			_nameTextbox.value = '';
			_addressTextbox.value = '';
			_phoneTextbox.value = '';
			_faxTextbox.value = '';
			_websiteTextbox.value = '';
			
			_company = null;
			
			_logger.trace("clear closed");
		},
		
		load : function (aCompany) {
			_logger.trace("load opened");
			
			_company = aCompany;
			
			_load();
			
			_observerService.notifyObservers(this, this.LOAD_EVENT, null);		
			_logger.trace("load closed");
		},
		
		done : function () {
			_logger.trace("done opened");
			
			_company.name = _nameTextbox.value;
			_company.address = _addressTextbox.value ;
			_company.phone = _phoneTextbox.value;
			_company.fax = _faxTextbox.value;
			_company.website = _websiteTextbox.value;
			
			_observerService.notifyObservers(this, this.DONE_EVENT, null);
			_logger.trace("done closed");
		},
		
		reset : function () {
			_logger.trace("reset opened");
			
			_load();
			
			_observerService.notifyObservers(this, this.RESET_EVENT, null);
			_logger.trace("reset closed");
		},
		
		cancel : function () {
			_logger.trace("cancel opened");
			
			this.clear();
			
			_observerService.notifyObservers(this, this.CANCEL_EVENT, null);
			_logger.trace("cancel closed");
		},
		
		get company() {
			return _company;
		}
	}
})();