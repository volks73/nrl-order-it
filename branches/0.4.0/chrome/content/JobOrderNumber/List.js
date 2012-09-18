Components.utils.import("resource://NRLOrderIt/common.js");
Components.utils.import("resource://NRLOrderIt/log4moz.js");

/**
 * The <code>JobOrderNumber.List</code> module.
 */
NRLOrderIt.JobOrderNumber.List = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("JobOrderNumberList");
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _treeBox;
	var _rowCount = 0;
	var _jobOrderNumbers = [];
	
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
		_jobOrderNumbers = [];
		
		_logger.trace("_clear closed");
	}
	
	return {
		
		/*
		 * List IDs.
		 */
		
		get LIST_ID() {
			return 'NRLOrderIt-JobOrderNumber-List'; 
		},
		
		get NAME_COLUMN() {
			return 'NRLOrderIt-JobOrderNumber-List-Name';
		},
		
		get ACCOUNT_NUMBER_COLUMN() {
			return 'NRLOrderIt-JobOrderNumber-List-AccountNumber';
		},
		
		/*
		 * Events.
		 */
		
		/**
		 * Fired when loading of this List is complete.
		 */
		get LOAD_EVENT() {
			return 'NRLOrderIt-JobOrderNumberList-Load';
		},
		
		/**
		 * Fired to select a job order number.
		 */
		get SELECT_EVENT() {
			return 'NRLOrderIt-JobOrderNumberList-Select';
		},
		
		/*
		 * Public methods.
		 */
		
		/**
		 * Sends a <code>SELECT_EVENT</code> notification. Notification
		 * is only sent if a job order number is selected in this List.
		 */
		select : function () {
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
		init : function () {
			_logger.trace("init opened");
			
			this.load();
			
			_logger.trace("init closed");
		},
		
		/**
		 * Hides this list.
		 */
		hide : function () {
			_logger.trace("hide opened");
			
			var list = document.getElementById(this.LIST_ID);
			list.setAttribute('hidden', true);
			
			_logger.trace("hide closed");
		},
		
		/**
		 * Shows this list.
		 */
		show : function () {
			_logger.trace("show opened");
			
			var list = document.getElementById(this.LIST_ID);
			list.setAttribute('hidden', false);
			
			_logger.trace("show closed");
		},
		
		/**
		 * Gets the selected job order number in the List. Will return <code>null</code> 
		 * if no job order number is selected in the List.
		 * 
		 * @return The selected job order number or <code>null</code>.
		 */
		get selected() {
			_logger.trace("selected called");
			
			var tree = document.getElementById(this.LIST_ID);
			var selectedRow = tree.view.selection.currentIndex;
			
			if ( selectedRow > -1 )
			{
				return _jobOrderNumbers[selectedRow];
			}
			else
			{
				return null;
			}
		},
		
		/**
		 * Loads the List with the job order numbers from the data source.
		 */
		load : function () {
			_logger.trace("load opened");
			
			_clear();
			
			var sql = "SELECT " +
			NRLOrderIt.Storage.JobOrderNumber.ID_COLUMN + ", " +
			NRLOrderIt.Storage.JobOrderNumber.NAME_COLUMN + ", " +
			NRLOrderIt.Storage.JobOrderNumber.ACCOUNT_NUMBER_COLUMN + ", " +
			NRLOrderIt.Storage.JobOrderNumber.DESCRIPTION_COLUMN + ", " +
			NRLOrderIt.Storage.JobOrderNumber.DATE_ADDED_COLUMN + 
			" FROM " +
			NRLOrderIt.Storage.JobOrderNumber.TABLE_NAME +
			" WHERE " + 
			NRLOrderIt.Storage.JobOrderNumber.DATE_REMOVED_COLUMN + " ISNULL ";
		
			_logger.debug(sql);
			var statement = NRLOrderIt.Storage.conn.createStatement(sql);
			
			try
			{
				statement.executeAsync( {							
					handleResult : function(aResultSet) {
						_logger.trace("handleResult opened");
						
						for ( let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow() )
						{  
							let rowId = row.getResultByName(NRLOrderIt.Storage.JobOrderNumber.ID_COLUMN);
							let rowName = row.getResultByName(NRLOrderIt.Storage.JobOrderNumber.NAME_COLUMN);
							let rowAccountNumber = row.getResultByName(NRLOrderIt.Storage.JobOrderNumber.ACCOUNT_NUMBER_COLUMN);
							let rowDescription = row.getResultByName(NRLOrderIt.Storage.JobOrderNumber.DESCRIPTION_COLUMN);																		
							let rowDateAdded = row.getResultByName(NRLOrderIt.Storage.JobOrderNumber.DATE_ADDED_COLUMN);
							  
							_jobOrderNumbers[_rowCount] = NRLOrderIt.JobOrderNumber(rowId, rowName, rowAccountNumber, rowDescription, new Date(rowDateAdded * 1000));			   
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
							document.getElementById(NRLOrderIt.JobOrderNumberList.LIST_ID).view = NRLOrderIt.JobOrderNumberList;
							_observerService.notifyObservers(NRLOrderIt.JobOrderNumberList, NRLOrderIt.JobOrderNumberList.LOAD_EVENT, null);
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
    	
	    	if ( _rowCount > 0 )
	    	{
		    	if ( column.id == this.NAME_COLUMN )
		    	{
		    		return _jobOrderNumbers[row].name;
		    	}
		    	else if (column.id == this.ACCOUNT_NUMBER_COLUMN )
		    	{
		    		return _jobOrderNumbers[row].accountNumber;
		    	}
		    	else
		    	{
		    		_logger.warn("Unknown column: " + column.id);
		    	}
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
	    
		setTree : function (aTreeBox) {
			_logger.trace("setTree opened");
			
			_treeBox = aTreeBox;
			
			_logger.trace("setTree closed");
		},
	    
		toggleOpenState : function (index) {
			
		},
		
	    get rowCount() {
	    	return _rowCount;
	    }
	}
})();