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
Components.utils.import("resource://NRLOrderIt/Addon.js");
Components.utils.import("resource://NRLOrderIt/date.js");

/**
 * The <code>Item.Tree</code> module.
 */
mil.navy.nrl.NRLOrderIt.PurchaseOrder.Item.Tree = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.PurchaseOrder.Item.Tree");
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _addon = _NRLOrderIt.Addon;
	var _storage = null;
	var _items = null;
	var _tree = null;
	var _treeBox = null;
	
	/*
	 * Private methods.
	 */
	
	var _clear = function() {
		_logger.trace("_clear opened");
		
		_items = [];
		
		_logger.trace("_clear closed");
	};
	
	return {
		
		/*
		 * IDs.
		 */
		
		get ID() {
			return _NRLOrderIt.PurchaseOrder.Item.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Tree'; 
		},
		
		/*
		 * Column IDs.
		 */
		
		get PART_NUMBER_COLUMN_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'PartNumber';
		},
		
		get DESCRIPTION_COLUMN_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Description';
		},
		
		get HAZMAT_CODE_COLUMN_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'HazmatCode';
		},
		
		get UNIT_OF_ISSUE_COLUMN_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'UnitOfIssue';
		},
		
		get UNIT_PRICE_COLUMN_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'UnitPrice';
		},
		
		get QUANTITY_COLUMN_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Quantity';
		},
		
		get TOTAL_COLUMN_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Total';
		},
		
		get COLUMNS() {
			let columns = [
							{
								id : this.PART_NUMBER_COLUMN_ID,
								property : 'partNumber'
							},
							{
								id : this.DESCRIPTION_COLUMN_ID,
								property : 'description'
							},
							{
								id : this.HAZMAT_CODE_COLUMN_ID,
								property : 'hazmatCodeLabel'
							},
							{
								id : this.UNIT_OF_ISSUE_COLUMN_ID,
								property : 'unitOfIssue'
							},
							{
								id : this.UNIT_PRICE_COLUMN_ID,
								property : 'unitPrice'
							},
							{
								id : this.QUANTITY_COLUMN_ID,
								property : 'quantity'
							},
							{
								id : this.TOTAL_COLUMN_ID,
								property : 'total'
							}
			              ];
			
			return columns;
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
		
		get EDIT_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Edit';
		},
		
		/*
		 * Public methods.
		 */
		
		init : function (aStorage) {
			_logger.trace("init opened");
			
			_storage = aStorage;
			_tree = document.getElementById(this.ID);
			
			_logger.trace("init closed");
		},
		
		edit : function () {
			_logger.trace("edit opened");
			
			if ( this.selected !== null ) {
				_observerService.notifyObservers(this, this.EDIT_EVENT, null);
			}
									
			_logger.trace("edit closed");
		},
		
		get selectedValue() {
			let selectedRow = _tree.view.selection.currentIndex;
			
			if ( selectedRow > -1 ) {
				return _items[selectedRow];
			}
			else {
				return null;
			}
		},

		get selectedIndex() {
			let selectedIndex = _tree.view.selection.currentIndex;
			
			if ( selectedIndex > -1 ) {
				return selectedIndex;
			}
			else {
				return null;
			}
		},
		
		load : function (aPurchaseOrder) {
			_logger.trace("load opened");
			
			if ( aPurchaseOrder === null ) {
				_logger.warn("aPurchaseOrder is null");
			}
			
			_clear();
					
			_storage.retrieve(aPurchaseOrder, {
				completed : function (results) {
					_logger.trace("completed opened");
					
					_items = results;
					_tree.view = _NRLOrderIt.PurchaseOrder.Item.Tree;
					
					_logger.trace("completed closed");
				}
			});
			
			_observerService.notifyObservers(this, this.LOAD_EVENT, null);
			_logger.trace("load closed");
		},
		
		canDrop : function (index, orientation, dataTransfer) { 
			return false; 
		},
		
	    cycleCell : function (row, col) {
	    	
	    },
	    
	    cycleHeader : function (col) {
	    	
	    },
	    
	    drop : function (row, orientation, dataTransfer) {
	    	
	    },
	    
	    getCellProperties : function (row, col, props) {
	    	
	    },
		
		getCellText : function (row, column) {
	    	if ( _items.length > 0 ) {
	    		for ( let i = 0; i < this.COLUMNS.length; i += 1 ) {
					if ( column.id === this.COLUMNS[i].id ) {
						let columnObject = _items[row][this.COLUMNS[i].property];
						
						if ( _NRLOrderIt.isDate(columnObject) ) {
							return Date.parse(columnObject.toDateString()).toString(_addon.dateFormat);
						}
						else {
							return columnObject;
						}
					}
	    		}
	    		
	    		_logger.warn("Unknown column: " + column.id);
	    	}
	    },
		
	    getCellValue : function (row, column) { 
	    	return null; 
	    },
	    
	    getColumnProperties : function (colid, col, props) {
	    	
	    },
	    
	    getImageSrc : function (row,col) { 
	    	return null; 
	    },
	    
	    getLevel : function (row) { 
	    	return 0; 
	    },
	    
	    getParentIndex : function (rowIndex) { 
	    	return 0; 
	    },
	    
	    getProgressMode : function (row, col) { 
	    	return null; 
	    },
	    
	    getRowProperties : function (row, props) {
	    	
	    },
	    
	    hasNextSibling : function (rowIndex, afterIndex) { 
	    	return false; 
	    },
	    
	    isContainer : function (index) { 
	    	return false; 
	    },
	    
	    isContainerEmpty : function (index) { 
	    	return false; 
	    },
	    
	    isContainerOpen : function (index) { 
	    	return false; 
	    },
	    
	    isEditable : function (row, col) { 
	    	return false; 
	    },
	    
	    isSelectable : function (row, col) { 
	    	return true; 
	    },
	    
	    isSeparator : function (row) { 
	    	return false; 
	    },
	    
	    isSorted : function () { 
	    	return false; 
	    },
	    
	    performAction : function (action) {
	    	
	    },
	    
	    performActionOnCell : function (action, row, col) {
	    	
	    },
	    
	    performActionOnRow : function (action, row) {
	    	
	    },
	    
	    selectionChanged : function () {
	    	
	    },
	    
	    setCellText : function (row, col, value) {
	    	
	    },
	    
	    setCellValue : function (row, col, value) {
	    	
	    },
	    
		setTree : function (treeBox) {
			_logger.trace("setTree opened");
			
			_treeBox = treeBox;
			
			_logger.trace("setTree closed");
		},
	    
		toggleOpenState : function (index) {
			
		},
		
	    get rowCount() {
	    	return _items.length;
	    }
	}
})();