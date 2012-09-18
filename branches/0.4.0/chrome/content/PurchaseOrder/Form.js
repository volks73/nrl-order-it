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
 * The <code>PurchaseOrder.Form</code> module.
 */
mil.navy.nrl.NRLOrderIt.PurchaseOrder.Form = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("NRLOrderIt.PurchaseOrder.Form");
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _purchaseOrder = null;
	var _titleTextbox = null;
	var _originatorTextbox = null;
	var _priorityTextbox = null;
	var _deliverToTextbox = null;
	var _dateRequiredDatepicker = null;
	var _dateSubmittedDatepicker = null;
	var _dateReceivedDatepicker = null;
	var _submittedCheckbox = null;
	var _receivedCheckbox = null;
	var _notesTextbox = null;
	
	/*
	 * Private methods.
	 */
	
	var _load = function () {
		_logger.trace("_load opened");
		
		// The form elements that use a datepicker widget are not obtained during initialization.
		// An Invalid Date error will occur if the datepicker element is stored before finishing
		// the loading for the application. So, all datepicker elements are obtained during
		// loading, not during initialization.
//		_dateRequiredDatepicker = document.getElementById(NRLOrderIt.PurchaseOrderForm.FORM_DATE_REQUIRED);
//		_dateSubmittedDatepicker = document.getElementById(NRLOrderIt.PurchaseOrderForm.FORM_DATE_SUBMITTED);
//		_dateReceivedDatepicker = document.getElementById(NRLOrderIt.PurchaseOrderForm.FORM_DATE_RECEIVED);

		_titleTextbox.value = _purchaseOrder.title;
		_originatorTextbox.value = _purchaseOrder.originator;
		_priorityTextbox.value = _purchaseOrder.priority;
		_deliverToTextbox.value = _purchaseOrder.deliverTo;	
		_notesTextbox.value = _purchaseOrder.notes;
	
		// TODO: Fix datepicker work
		
		// The dateValue property does not appear to work for the datepicker widget
		// Setting the dateValue property causes program to crash.
//		_dateRequiredDatepicker.dateValue = _purchaseOrder.dateRequired;
		
//		if ( _purchaseOrder.dateSubmitted === null ) {
//			_dateSubmittedDatepicker.dateValue = new Date();
//			_submittedCheckbox.checked = false;
//		} 
//		else {
//			_dateSubmittedDatepicker.dateValue = _purchaseOrder.dateSubmitted;
//			_submittedCheckbox.checked = true;	
//		}
//			
//		if ( _purchaseOrder.dateReceived === null ) {
//			formDateReceived.dateValue = new Date();
//			formReceived.checked = false;
//		}
//		else {
//			_dateReceivedDatepicker.dateValue = _purchaseOrder.dateReceived;	
//			_receivedCheckbox.checked = true;
//		}
		
		_NRLOrderIt.PurchaseOrder.Item.Panel.load(_purchaseOrder);
		
		_logger.trace("_load closed");
	};
	
	return {
		
		/*
		 * IDs.
		 */
		
		get ID() {
			return _NRLOrderIt.PurchaseOrder.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Form';
		},
		
		get TITLE_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Title';
		},
		
		get ORIGINATOR_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Originator';
		},
		
		get PRIORITY_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Priority';
		},
		
		get DELIVER_TO_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'DeliverTo';
		},
		
		get DATE_REQUIRED_DATEPICKER_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'DateRequired';
		},
		
		get JOB_ORDER_NUMBER_MENULIST_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'JobOrderNumber';
		},
		
		get COMPANY_MENULIST_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Company';
		},
		
		get DATE_SUBMITTED_DATEPICKER_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'DateSubmitted';
		},
		
		get DATE_RECEIVED_DATEPICKER_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'DateReceived';
		},
		
		get SUBMITTED_CHECKBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Submitted';
		},
		
		get RECEIVED_CHECKBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Received';
		},
		
		get NOTES_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Notes';
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
		
		init : function (aStorage) {
			_logger.trace("init opened");
			
			if ( aStorage === null ) {
				_logger.warn("aStorage is null");
			}
			
			_NRLOrderIt.PurchaseOrder.Item.Panel.init(aStorage);
			
			// The form elements that use a datepicker widget are not obtained during initialization.
			// An Invalid Date error will occur if the datepicker element is stored before finishing
			// the loading for the application. So, all datepicker elements are obtained during
			// loading, not during initialization.
			_titleTextbox = document.getElementById(this.TITLE_TEXTBOX_ID);
			_originatorTextbox = document.getElementById(this.ORIGINATOR_TEXTBOX_ID);
			_priorityTextbox = document.getElementById(this.PRIORITY_TEXTBOX_ID);
			_deliverToTextbox = document.getElementById(this.DELIVER_TO_TEXTBOX_ID);
			_submittedCheckbox = document.getElementById(this.SUBMITTED_CHECKBOX_ID);
			_receivedCheckbox = document.getElementById(this.RECEIVED_CHECKBOX_ID);
			_notesTextbox = document.getElementById(this.NOTES_TEXTBOX_ID);
			
			this.clear();
			
			_logger.trace("init closed");
		},
		
		clear : function () {
			_logger.trace("clear opened");

			_titleTextbox.value = '';
			_originatorTextbox.value = '';
			_priorityTextbox.value = '';
			_deliverToTextbox.value = '';
			_submittedCheckbox.checked = false;
			_receivedCheckbox.checked = false;
			_notesTextbox.value = '';
			
//			if ( _dateRequiredDatepicker !== null ) {
//				_dateRequiredDatepicker.dateValue = new Date();	
//			}
//			
//			if ( _dateSubmittedDatepicker !== null ) {
//				_dateSubmittedDatepicker.dateValue = new Date();	
//			}
//			
//			if ( _dateReceivedDatepicker !== null ) {
//				_dateReceivedDatepicker.dateValue = new Date();
//			}
			
			_purchaseOrder = null;
			
			_logger.trace("clear closed");
		},
		
		load : function (aPurchaseOrder) {
			_logger.trace("load opened");
			
			_purchaseOrder = aPurchaseOrder;
			
			_load();
			
			_observerService.notifyObservers(this, this.LOAD_EVENT, null);
			_logger.trace("load closed");
		},
		
		done : function () {
			_logger.trace("done opened");
						
			_purchaseOrder.title = _titleTextbox.value;
			_purchaseOrder.originator = _originatorTextbox.value;
			_purchaseOrder.priority = _priorityTextbox.value;
			_purchaseOrder.deliverTo = _deliverToTextbox.value;
			_purchaseOrder.notes = _notesTextbox.value;

//			_purchaseOrder.dateRequired = _dateRequiredDatepicker.dateValue;
			
//			if ( _submittedCheckbox.checked ) {
//				_purchaseOrder.dateSubmitted = _dateSubmittedDatepicker.dateValue;	
//			}
//			else {
//				_purchaseOrder.dateSubmitted = null;
//			}
//			
//			if ( formReceived.checked ) {
//				_purchaseOrder.dateReceived = _dateReceivedDatepicker.dateValue;	
//			}
//			else {
//				_purchaseOrder.dateReceived = null;
//			}	
			
			_observerService.notifyObservers(this, this.DONE_EVENT, null);
			_logger.trace("done closed");
		},

		reset : function () {
			_logger.trace("reset opened");
			
			_load();
			
			_observerService.notifyObservers(this, this.RESET_EVENT, null);
			_logger.trace("reset closed");
		},
		
		cancel : function() {
			_logger.trace("cancel opened");
			
			this.clear();
			
			_observerService.notifyObservers(this, this.CANCEL_EVENT, null);
			_logger.trace("cancel closed");
		},
		
		get purchaseOrder() {
			return _purchaseOrder;
		}
	}
}());