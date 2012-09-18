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
Components.utils.import("resource://NRLOrderIt/common.js");
Components.utils.import("resource://NRLOrderIt/log4moz.js");
Components.utils.import("resource://NRLOrderIt/date.js");
Components.utils.import("resource://NRLOrderIt/Company.js");
Components.utils.import("resource://NRLOrderIt/Storage.js");

/**
 * The <code>CompanyList</code> class.
 */
NRLOrderIt.CompanyList = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("CompanyList");
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _treeBox;
	var _rowCount = 0;
	var _companies = [];
	
	_logger.level = Log4Moz.Level["All"];
	
	/*
	 * Private methods.
	 */
	
	/**
	 * Clears the List view.
	 */
	var _clear = function()
	{
		_logger.trace("_clear opened");
		
		_rowCount = 0;
		_companies = [];
		
		_logger.trace("_clear closed");
	}
	
	return {
		
		/*
		 * List IDs.
		 */
		
		get LIST_ID() {
			return 'NRLOrderIt-Company-List'; 
		},
		
		get NAME_COLUMN() {
			return 'NRLOrderIt-Company-List-Name';
		},
		
		/*
		 * Class Events.
		 */
		
		/**
		 * Fired when loading of this list is complete.
		 */
		get LOAD_EVENT() {
			return 'NRLOrderIt-CompanyList-Load';
		},
		
		/**
		 * Fired upon selection of a company from this list.
		 */
		get SELECT_EVENT() {
			return 'NRLOrderIt-CompanyList-Select';
		},
		
		/*
		 * Public methods.
		 */
		
		/**
		 * Sends a <code>SELECT_EVENT</code> notification. Notification
		 * is only sent if a job order number is selected in this List.
		 */
		select : function() {
			_logger.trace("select opened");
			
			if ( this.selected != null )
			{
				_observerService.notifyObservers(this, this.SELECT_EVENT, null);
			}
									
			_logger.trace("select closed");
		},
		
		/**
		 * Initializes the List.
		 */
		init : function() {
			_logger.trace("init opened");
			
			this.load();
			
			_logger.trace("init closed");
		},
		
		/**
		 * Gets the selected company in the List. Will return <code>null</code> 
		 * if no company is selected in the List.
		 * 
		 * @return The selected company or <code>null</code>.
		 */
		get selected() {
			_logger.trace("selected called");
			
			var tree = document.getElementById(this.LIST_ID);
			var selectedRow = tree.view.selection.currentIndex;
			
			if ( selectedRow > -1 )
			{
				return _companies[selectedRow];
			}
			else
			{
				return null;
			}
		},
		
		/**
		 * Hides this list.
		 */
		hide : function() {
			_logger.trace("hide opened");
			
			var list = document.getElementById(this.LIST_ID);
			list.setAttribute('hidden', true);
			
			_logger.trace("hide closed");
		},
		
		/**
		 * Shows this list.
		 */
		show : function() {
			_logger.trace("show opened");
			
			var list = document.getElementById(this.LIST_ID);
			list.setAttribute('hidden', false);
			
			_logger.trace("show closed");
		},
		
		/**
		 * Loads this tree with the companies from the data source.
		 */
		load : function() {
			_logger.trace("load opened");
			
			_clear();
			
			var sql = "SELECT " +
			NRLOrderIt.Storage.Company.ID_COLUMN + ", " +
			NRLOrderIt.Storage.Company.NAME_COLUMN + ", " +
			NRLOrderIt.Storage.Company.ADDRESS_COLUMN + ", " +
			NRLOrderIt.Storage.Company.PHONE_COLUMN + ", " +
			NRLOrderIt.Storage.Company.FAX_COLUMN + ", " +
			NRLOrderIt.Storage.Company.WEBSITE_COLUMN + ", " +
			NRLOrderIt.Storage.Company.DATE_ADDED_COLUMN + 
			" FROM " +
			NRLOrderIt.Storage.Company.TABLE_NAME +
			" WHERE " + 
			NRLOrderIt.Storage.Company.DATE_REMOVED_COLUMN + " ISNULL ";
		
			_logger.debug(sql);
			var statement = NRLOrderIt.Storage.conn.createStatement(sql);
			
			try
			{
				statement.executeAsync( {							
					handleResult : function(aResultSet) {
						_logger.trace("handleResult opened");
						
						for ( let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow() )
						{  
							let rowId = row.getResultByName(NRLOrderIt.Storage.Company.ID_COLUMN);
							let rowName = row.getResultByName(NRLOrderIt.Storage.Company.NAME_COLUMN);
							let rowAddress = row.getResultByName(NRLOrderIt.Storage.Company.ADDRESS_COLUMN);
							let rowPhone = row.getResultByName(NRLOrderIt.Storage.Company.PHONE_COLUMN);
							let rowFax = row.getResultByName(NRLOrderIt.Storage.Company.FAX_COLUMN);
							let rowWebsite = row.getResultByName(NRLOrderIt.Storage.Company.WEBSITE_COLUMN);
							let rowDateAdded = row.getResultByName(NRLOrderIt.Storage.Company.DATE_ADDED_COLUMN);
							  
							_companies[_rowCount] = NRLOrderIt.Company(rowId, rowName, rowAddress, rowPhone, rowFax, rowWebsite, new Date(rowDateAdded * 1000));			   
							_rowCount = _rowCount + 1;
						}
						
						_logger.trace("handleResult closed");
					},  
						  
					handleError : function(aError) {
						_logger.trace("handleError opened");
						
						_logger.error(aError.message);
						
						_logger.trace("handleError closed");
					},  
		
					handleCompletion : function(aReason) {
						_logger.trace("handleCompletion opened");
						
						if ( aReason == Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED )
						{
							document.getElementById(NRLOrderIt.CompanyList.LIST_ID).view = NRLOrderIt.CompanyList;
							_observerService.notifyObservers(NRLOrderIt.CompanyList, NRLOrderIt.CompanyList.LOAD_EVENT, null);
						}
						else
						{
							_logger.warn("Quary canceled or aborted");
						}
						
						_logger.trace("handleCompletion closed");
					}  
				});
			}
			catch ( aError )
			{
				_logger.error(aError.message);
			}
			finally 
			{
				statement.reset();
			}   
			
			_logger.trace("load closed");
		},
		
		canDrop : function(index, orientation, dataTransfer) { return false; },
	    cycleCell : function(row, col) {},
	    cycleHeader : function(col) {},
	    drop : function(row, orientation, dataTransfer) {},
	    getCellProperties : function(row, col, props) {},
		
		getCellText : function(row, column) {
    	
	    	if ( _rowCount > 0 )
	    	{
		    	if ( column.id == this.NAME_COLUMN )
		    	{
		    		return _companies[row].name;
		    	}
		    	else
		    	{
		    		_logger.warn("Unknown column: " + column.id);
		    	}
	    	}
	    },
		
	    getCellValue : function(row, column) { return null; },
	    getColumnProperties : function(colid, col, props) {},
	    getImageSrc : function(row,col) { return null; },
	    getLevel : function(row) { return 0; },
	    getParentIndex : function(rowIndex) { return 0; },
	    getProgressMode : function(row, col) { return null; },
	    getRowProperties : function(row, props) {},
	    hasNextSibling : function(rowIndex, afterIndex) { return false; },
	    isContainer : function(index) { return false; },
	    isContainerEmpty : function(index) { return false; },
	    isContainerOpen : function(index) { return false; },
	    isEditable : function(row, col) { return false; },
	    isSelectable : function(row, col) { return true; },
	    isSeparator : function(row) { return false; },
	    isSorted : function() { return false; },
	    performAction : function(action) {},
	    performActionOnCell : function(action, row, col) {},
	    performActionOnRow : function(action, row) {},
	    selectionChanged : function() {},
	    setCellText : function(row, col, value) {},
	    setCellValue : function(row, col, value) {},
	    
		setTree : function(aTreeBox) {
			_logger.trace("setTree opened");
			
			_treeBox = aTreeBox;
			
			_logger.trace("setTree closed");
		},
	    
		toggleOpenState : function(index) {},
		
	    get rowCount() {
			_logger.trace("rowCount called");
			
	    	return _rowCount;
	    }
	}
})();

window.addEventListener("load", function() { NRLOrderIt.CompanyList.init() }, true);