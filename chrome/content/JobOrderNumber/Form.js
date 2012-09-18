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
 * The <code>JobOrderNumber.Form</code> module.
 */
mil.navy.nrl.NRLOrderIt.JobOrderNumber.Form = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.JobOrderNumber.Form");
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _jobOrderNumber = null;
	var _nameTextbox = null;
	var _accountNumberTextbox = null;
	var _descriptionTextbox = null;
	
	/*
	 * Private methods.
	 */
	
	var _load = function() {
		_logger.trace("_load opened");
		
		_nameTextbox.value = _jobOrderNumber.name;
		_accountNumberTextbox.value = _jobOrderNumber.accountNumber;
		_descriptionTextbox.value = _jobOrderNumber.description;
		
		_logger.trace("_load closed");
	};
	
	return {
		
		/*
		 * IDs.
		 */
		
		get ID() {
			return _NRLOrderIt.JobOrderNumber.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Form';
		},
		
		get NAME_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Name';
		},
		
		get ACCOUNT_NUMBER_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'AccountNumber';
		},
		
		get DESCRIPTION_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Description';
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
		
		/**
		 * Initializes the form.
		 */
		init : function () {
			_logger.trace("init opened");
			
			_nameTextbox = document.getElementById(this.NAME_TEXTBOX_ID);
			_accountNumberTextbox = document.getElementById(this.ACCOUNT_NUMBER_TEXTBOX_ID);
			_descriptionTextbox = document.getElementById(this.DESCRIPTION_TEXTBOX_ID);
			
			this.clear();
			
			_logger.trace("init closed");
		},
		
		/**
		 * Loads the form from a job order number. Sends a <code>LOAD_EVENT</code> notification upon completion.
		 * 
		 * @param aJobOrderNumber A job order number.
		 */
		load : function (aJobOrderNumber) {
			_logger.trace("load opened");
			
			_jobOrderNumber = aJobOrderNumber;
			
			_load();
			
			_observerService.notifyObservers(this, this.LOAD_EVENT, null);		
			_logger.trace("load closed");
		},
		
		/**
		 * Clears the form values and nulls the current job order number.
		 */
		clear : function () {
			_logger.trace("clear opened");
			
			_nameTextbox.value = '';
			_accountNumberTextbox.value = '';
			_descriptionTextbox.value = '';
			
			_jobOrderNumber = null;
			
			_logger.trace("clear closed");
		},
		
		/**
		 * Adds or updates an existing job order number. Sends a <code>DONE_EVENT</code> notification upon completion.
		 */
		done : function () {
			_logger.trace("done opened");
			
			_jobOrderNumber.name = _nameTextbox.value;
			_jobOrderNumber.accountNumber = _accountNumberTextbox.value;
			_jobOrderNumber.description = _descriptionTextbox.value;
			
			_observerService.notifyObservers(this, this.DONE_EVENT, null);
			_logger.trace("done closed");
		},
		
		/**
		 * Resets the form.
		 */
		reset : function () {
			_logger.trace("reset opened");
			
			_load();
			
			_observerService.notifyObservers(this, this.RESET_EVENT, null);
			_logger.trace("reset closed");
		},
		
		/**
		 * Cancels the form.
		 */
		cancel : function () {
			_logger.trace("cancel opened");
			
			this.clear();
			
			_observerService.notifyObservers(this, this.CANCEL_EVENT, null);
			_logger.trace("cancel closed");
		},
		
		/**
		 * Gets the Job Order Number.
		 */
		get jobOrderNumber() {
			return _jobOrderNumber;
		}
	}
})();