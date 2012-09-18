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
 * The <code>Item.Form</code> module.
 */
mil.navy.nrl.NRLOrderIt.PurchaseOrder.Item.Form = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.PurchaseOrder.Item.Form");
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _item = null;
	var _storage = null;
	var _hazmatCodes = null;
	var _partNumberTextbox = null;
	var _descriptionTextbox = null;
	var _hazmatCodeMenulist = null;
	var _unitOfIssueTextbox = null;
	var _unitPriceTextbox = null;
	var _quantityTextbox = null;	
	
	/*
	 * Private methods.
	 */
	
	var _load = function () {
		_logger.trace("_load opened");
		
		_partNumberTextbox.value = _item.partNumber;
		_descriptionTextbox.value = _item.description;
		_unitOfIssueTextbox.value = _item.unitOfIssue;
		_unitPriceTextbox.value = _item.unitPrice;
		_quantityTextbox.value = _item.quantity;
		
		if ( _item.hazmatCodeValue === null ) {
			_hazmatCodeMenulist.selectedIndex = 0;
		}
		else {
			_hazmatCodeMenulist.selectedIndex = _item.hazmatCodeValue;
		}
		
		_logger.trace("_load closed");
	};
	
	var _initHazmatCodes = function () {
		_logger.trace("_getHazmatCodeList opened");
		
		_storage.retrieveAll({
			completed : function (results) {
				_logger.trace("completed opened");
				
				_hazmatCodes = results;
				
				_createHazmatCodeList();
				
				_logger.trace("completed closed");
			}
		});
		
		_logger.trace("_getHazmatCodeList closed");
	};
	
	var _createHazmatCodeList = function () {
		_logger.trace("_createHazmatCodeList opened");
		
		for ( let i = 0; i < _hazmatCodes.length; i += 1 ) {
			let label = _hazmatCodes[i].letter + " - " + _hazmatCodes[i].description;
			
			_hazmatCodeMenulist.appendItem(label, i);	
		}
		
		_logger.trace("_createHazmatCodeList closed");
	};
	
	return {
		
		/*
		 * IDs.
		 */
		
		get ID() {
			return _NRLOrderIt.PurchaseOrder.Item.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Form';
		},
		
		get PART_NUMBER_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'PartNumber';
		},
		
		get DESCRIPTION_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Description';
		},
		
		get HAZMAT_CODE_MENULIST_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'HazmatCode';
		},
		
		get UNIT_OF_ISSUE_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'UnitOfIssue';
		},
		
		get UNIT_PRICE_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'UnitPrice';
		},
		
		get QUANTITY_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Quantity';
		},
		
		get DONE_BUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Done';
		},
		
		/*
		 * Events.
		 */
		
		get EVENT_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Event';
		},
		
		get LOAD_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Load';
		},
		
		get ADD_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Add';
		},
		
		get EDIT_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Edit';
		},
		
		/*
		 * Public methods.
		 */
		
		init : function (aStorage) {
			_logger.trace("init opened");
			
			if ( aStorage === null ) {
				_logger.warn("aStorage is null");
			}
			
			_storage = aStorage;
			
			_partNumberTextbox = document.getElementById(this.PART_NUMBER_TEXTBOX_ID);
			_descriptionTextbox = document.getElementById(this.DESCRIPTION_TEXTBOX_ID);
			_hazmatCodeMenulist = document.getElementById(this.HAZMAT_CODE_MENULIST_ID);
			_unitOfIssueTextbox = document.getElementById(this.UNIT_OF_ISSUE_TEXTBOX_ID);
			_unitPriceTextbox = document.getElementById(this.UNIT_PRICE_TEXTBOX_ID);
			_quantityTextbox = document.getElementById(this.QUANTITY_TEXTBOX_ID);
			
//			_initHazmatCodes();
			this.clear();
			
			_logger.trace("init closed");
		},
		
		clear : function () {
			_logger.trace("clear opened");
			
			_partNumberTextbox.value = '';
			_descriptionTextbox.value = '';
			_hazmatCodeMenulist.selectedIndex = 0;
			_unitOfIssueTextbox.value = '';
			_unitPriceTextbox.value = '';
			_quantityTextbox.value = '';
			
			_item = null;
			
			_logger.trace("clear closed");
		},
		
		load : function (aItem) {
			_logger.trace("load opened");
			
			_item = aItem;
			
			_load();
											
			_observerService.notifyObservers(this, this.LOAD_EVENT, null);		
			_logger.trace("load closed");
		},
		
		done : function () {
			_logger.trace("done opened");
			
			let event = null;
			
			// If adding a new item, then an item object needs to be
			// created. If editing an existing item, then an item 
			// object already exists.
			if ( _item === null ) {
				_item = {};
				event = this.ADD_EVENT;
			}
			else {
				event = this.EDIT_EVENT;
			}
			
			_item.partNumber = _partNumberTextbox.value;
			_item.description = _descriptionTextbox.value;
			_item.hazmatCodeValue = _hazmatCodeMenulist.value;
			_item.hazmatCodeLabel = _hazmatCodeMenulist.label;
			_item.unitOfIssue = _unitOfIssueTextbox.value;
			_item.unitPrice = _unitPriceTextbox.value;
			_item.quantity = _quantityTextbox.value;
			
			// Calculate the total cost of the item.
			_item.total = _item.quantity * _item.unitPrice;
			
			_observerService.notifyObservers(this, event, null);	
			_logger.trace("done closed");
		},
		
		get item() {
			return _item;
		}
	}
})();