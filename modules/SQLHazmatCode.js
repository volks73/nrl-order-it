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
var EXPORTED_SYMBOLS = [ "mil.navy.nrl.NRLOrderIt.SQL.PurchaseOrder.Item.HazmatCode" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://NRLOrderIt/common.js");
Components.utils.import("resource://NRLOrderIt/log4moz.js");
Components.utils.import("resource://NRLOrderIt/SQL.js");

/**
 * The <code>HazmatCode</code> module.
 */
mil.navy.nrl.NRLOrderIt.SQL.PurchaseOrder.Item.HazmatCode = ( function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.SQL.PurchaseOrder.Item.HazmatCode");
	var _SQL = mil.navy.nrl.NRLOrderIt.SQL;
	var _conn = null;
	var _sqlTable = {
			name : 'hazmat_codes',
			columns : [
			           {
			        	   name : 'hazmat_codes_id',
			        	   property : 'id',
			        	   param : _SQL.ID_PARAM,
			        	   type : 0
			           },
			           {
			        	   name : 'letter',
			        	   property : 'letter',
			        	   param : 'letter',
			        	   type : ''
			           },							
			           {
			        	   name : 'description',
			        	   property : 'description',
			        	   param : 'description',
			        	   type : ''
			           }
			         ]
			   
	};
	
	return {
		
		/*
		 * Public methods.
		 */
		
		init : function (aConn) {
			_logger.trace("init opened");
			
			_conn = aConn;
			
			_logger.trace("init closed");
		},

		retrieveAll : function (aCallback) {
			_logger.trace("retrieveAll opened");
			
			let hazmatCodes = [];
			let sql = "SELECT * FROM " + _sqlTable.name;
			
			_logger.debug(sql);
			
			let statement = _conn.createAsyncStatement(sql);
			
			try {
				statement.executeAsync( {
					handleResult : function (aResultSet) {
						_logger.trace("handleResult opened");
					
						let rowCount = 0;
						let columns = _sqlTable.columns;
						
						for ( let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow() )
						{  
							hazmatCodes[rowCount] = {};
							
							for ( let i = 0; i < columns.length; i += 1 ) {
								if ( columns[i].property !== null ) {
									hazmatCodes[rowCount][columns[i].property] = row.getResultByName(columns[i].name);	
								}
							}
							
							rowCount += 1;
						}
						
						_logger.trace("handleResult closed");
					},  
					  
					handleError : function (aError) {
						_logger.trace("handleError opened");
					
						_logger.error(aError.message);
					
						_logger.trace("handleError closed");
					},  
	
					handleCompletion : function (aReason) {
						_logger.trace("handleCompletion opened");
					
						if ( aReason === Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED ) {
							_logger.debug("select SQL completed");
							
							if ( typeof(aCallback) !== 'undefined') {
								aCallback.completed(hazmatCodes);
							}
						}
						else {
							_logger.warn("Query canceled or aborted: " + sql);
						}
					
						_logger.trace("handleCompletion closed");
					}  
				});	
			}
			catch ( anError ) {
				_logger.error(anError.message);
			}
			finally {
				statement.finalize();
			}
			
			_logger.trace("retrieveAll closed");
		},
		
		create : function () {
			_logger.trace("create opened");
			
			let aHazmatCode = {
					id : null,
					letter : '',
					description : ''
			};
			
			_logger.trace("create closed");
			return aHazmatCode;
		}
	}
})();