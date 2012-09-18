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
var EXPORTED_SYMBOLS = [ "mil.navy.nrl.NRLorderIt.SQL.Company" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://NRLOrderIt/common.js");
Components.utils.import("resource://NRLOrderIt/log4moz.js");
Components.utils.import("resource://NRLOrderIt/SQL.js");

/**
 * The <code>Company</code> module.
 */
mil.navy.nrl.NRLOrderIt.SQL.Company = ( function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.SQL.Company");
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _SQL = _NRLOrderIt.SQL;
	var _conn = null;
	var _sqlTable = {
			name : 'companies',
			columns : [
			           {
			        	   name : 'companies_id',
			        	   property : 'id',
			        	   param : _SQL.ID_PARAM,
			        	   type : 0
			           },	
			           {
			        	   name : 'name',
			        	   property : 'name',
			        	   param : 'name',
			        	   type : ''
			           },	           
			           {
			        	   name : 'address',
			        	   property : 'address',
			        	   param : 'address',
			        	   type : ''
			           },	           
			           {
			        	   name : 'phone',
			        	   property : 'phone',
			        	   param : 'phone',
			        	   type : ''
			           },	           
			           {
			        	   name : 'fax',
			        	   property : 'fax',
			        	   param : 'fax',
			        	   type : ''
			           },	           
			           {
			        	   name : 'website',
			        	   property : 'website',
			        	   param : 'website',
			        	   type : ''
			           },	           
			           {
			        	   name : _SQL.DATE_ADDED_COLUMN,
			        	   property : 'dateAdded',
			        	   param : _SQL.DATE_ADDED_PARAM,
			        	   type : new Date()
			           },	           
			           {
			        	   name : _SQL.DATE_REMOVED_COLUMN,
			        	   property : 'dateRemoved',
			        	   param : _SQL.DATE_REMOVED_PARAM,
			        	   type : new Date()
			           }
			          ]
	};
	
	return {
		
		/*
		 * Public methods.
		 */
		
		init : function (aConn) {
			_logger.trace("init opened");
			
			if ( aConn === null ) {
				_logger.warn("aConn is null");
			}
			
			_conn = aConn;
			
			_logger.trace("init closed");
		},
		
		add : function (aCompany, aCallback) {
			_logger.trace("add opened");
			
			// TODO: Add null parameter warning
			
			aCompany.dateAdded = new Date();
			aCompany.dateRemoved = null;
			
			let columns = _sqlTable.columns;
			
			// Column [0] is assumed to be the id column.
			let column = _SQL.ID_INDEX + 1;
			let sql1 = "'" + columns[column].name + "'";
			let sql2 = ":" + columns[column].param;
			
			column += 1;
			
			for ( column; column < columns.length; column += 1 ) {
				if ( columns[column].property !== null ) {
					sql1 += ", '" + columns[column].name + "'";
					sql2 += ", :" + columns[column].param;	
				}				
			}
			
			let sql = "INSERT INTO " + _sqlTable.name + " (" + sql1 + ") VALUES (" + sql2 + ")";
			
			_logger.debug(sql);
			
			let statement = _conn.createAsyncStatement(sql);
			
			for ( let i = _SQL.ID_INDEX + 1; i < columns.length; i += 1 ) {
				let value = aCompany[columns[i].property];
				
				if ( _NRLOrderIt.isDate(value) ) {
					value = _SQL.convertDateToInteger(value);
				}
				
				statement.params[columns[i].param] = value;
			}
			
			try {
				statement.executeAsync( {
					handleResult : function (aResultSet) {
						_logger.trace("handleResult opened");
						
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
							_logger.debug("insert SQL completed");
							
							let lastInsertId = null;
							let lastInsertIdSQL = "SELECT last_insert_rowid() AS " + _sqlTable.columns[_SQL.ID_INDEX].name;
							let lastInsertIdStatement = _conn.createAsyncStatement(lastInsertIdSQL);

							try {
								lastInsertIdStatement.executeAsync( {
									handleResult : function (aResultSet) {
										_logger.trace("handleResult opened");
										
										let row = aResultSet.getNextRow();
										lastInsertId = row.getResultByName(_sqlTable.columns[_SQL.ID_INDEX].name);
										
										_logger.trace("handlResult closed");
									},
									
									handleError : function (anError) {
										_logger.trace("handleError opened");
										
										_logger.error(anError.message);
										
										_logger.trace("handleError closed");
									},
									
									handleCompletion : function (aReason) {
										_logger.trace("handleCompletion opened");
										
										if ( aReason === Components.interfaces.mozIStorageStatementCallback.REASON_FINISHED ) {
											_logger.debug("select last_insert_rowid() completed");
											_logger.debug("last insert id = " + lastInsertId);
											
											if ( typeof(aCallback) !== 'undefined') {
												aCompany.id = lastInsertId;
												aCallback.completed(lastInsertId);
											}
										}
										
										_logger.trace("handleCompletion closed");
									}
								});
							}
							catch (anError) {
								_logger.error(anError.message);
							}
							finally {
								lastInsertIdStatement.finalize();
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
			
			_logger.trace("add closed");
		},
		
		edit : function (aCompany, aCallback) {
			_logger.trace("edit opened");
			
			// TODO: Add null parameter warning.
			
			let columns = _sqlTable.columns;
			let idColumn = columns[_SQL.ID_INDEX];
			
			// Column [0] is assumed to be the id column, skip it for now.
			let column = _SQL.ID_INDEX + 1;
			
			let sql = "UPDATE " + _sqlTable.name + " SET " + 
				columns[column].name + " = :" + columns[column].param;
			
			column += 1;
			
			for ( column; column < columns.length; column += 1 ) {
				sql += ", " + columns[column].name + " = :" + columns[column].param;	
			}
			
			sql += " WHERE " + idColumn.name + " = :" + idColumn.param; 
			
			_logger.debug(sql);
			
			let statement = _conn.createAsyncStatement(sql);
			
			for ( let i = _SQL.ID_INDEX; i < columns.length; i += 1 ) {
				let value = aCompany[columns[i].property];
				
				if ( _NRLOrderIt.isDate(value) ) {
					value = _SQL.convertDateToInteger(value);
				}
				
				statement.params[columns[i].param] = value;
			}
			
			try {
				statement.executeAsync( {
					handleResult : function (aResultSet) {
						_logger.trace("handleResult opened");
					
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
							_logger.debug("update SQL completed");
							
							if ( typeof(aCallback) !== 'undefined') {
								aCallback.completed(aCompany);
							}
						}
						else {
							_logger.warn("Query canceled or aborted");
						}
					
						_logger.trace("handleCompletion closed");
					}  
				});	
			}
			catch ( anError ) {
				_logger.error(anError.message);
			}
			finally	{
				statement.finalize();
			}
			
			_logger.trace("edit closed");
		},
		
		remove : function (aCompany, aCallback) {
			_logger.trace("remove opened");
			
			// TODO: Add null parameter warning.
			
			aCompany.dateRemoved = new Date();
			let idColumn = _sqlTable.columns[_SQL.ID_INDEX];
			
			let sql = "UPDATE " + _sqlTable.name + " SET " +
				_SQL.DATE_REMOVED_COLUMN + 
				" = " +
				":" + _SQL.DATE_REMOVED_PARAM + 
				" WHERE " + 
				idColumn.name + 
				" = :" + 
				idColumn.param;
			
			_logger.debug(sql);
			
			let statement = _conn.createAsyncStatement(sql);
			
			statement.params[_SQL.DATE_REMOVED_PARAM] = _SQL.convertDateToInteger(aCompany.dateRemoved);
			statement.params[idColumn.param] = aCompany[idColumn.property];
			
			try {
				statement.executeAsync( {
					handleResult : function (aResultSet) {
						_logger.trace("handleResult opened");
					
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
							_logger.debug("update SQL completed");
							
							if ( typeof(aCallback) !== 'undefined') {
								aCallback.completed(aCompany);
							}
						}
						else {
							_logger.warn("Query canceled or aborted");
						}
					
						_logger.trace("handleCompletion closed");
					}  
				});	
			}
			catch ( anError ) {
				_logger.error(anError.message);
			}
			finally	{
				statement.finalize();
			}
			
			_logger.trace("remove closed");
		},
		
		retrieveAll : function (aCallback) {
			_logger.trace("retrieveAll opened");
			
			// TODO: Add null parameter warning.
			
			let companies = [];
			let sql = "SELECT * FROM " + _sqlTable.name + " WHERE " + _SQL.DATE_REMOVED_COLUMN + " ISNULL";
			
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
							companies[rowCount] = {};
							
							for ( let i = 0; i < columns.length; i += 1 ) {
								if ( columns[i].property !== null ) {
									if ( _NRLOrderIt.isDate(columns[i].type) ) {
										companies[rowCount][columns[i].property] = _SQL.convertIntegerToDate(row.getResultByName(columns[i].name));
									}
									else {
										companies[rowCount][columns[i].property] = row.getResultByName(columns[i].name);	
									}						
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
								aCallback.completed(companies);
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
		
		search : function (keyword, aCallback) {
			_logger.trace("search opened");
			
			// TODO: Add null parameter warning.
			
			let columns = _sqlTable.columns;
			let column = _SQL.ID_INDEX + 1;
			let companies = [];
			
			let sql = "SELECT * FROM " + _sqlTable.name + " WHERE " + 
				_SQL.DATE_REMOEVED_COLUMN + " ISNULL AND ";
			
			sql += "(" + columns[column].name + " LIKE " + columns[column].param;
			column += 1;
			
			for ( column; column < columns.length; column += 1 ) {
				sql += " OR " + columns[column].name + " LIKE " + columns[column].param;
			}
			
			sql += ")";
			
			_logger.debug(sql);
			
			let statement = _conn.createAsyncStatement(sql);
			
			for ( let i = _SQL.ID_INDEX + 1; i < columns.length; i += 1) {
				statement.params[columns[i].param] = keyword;
			}
			
			try {
				statement.executeAsync({
					handleResult : function (aResultSet) {
						_logger.trace("handleResult opened");
					
						let rowCount = 0;
						let columns = _sqlTable.columns;
						
						for ( let row = aResultSet.getNextRow(); row; row = aResultSet.getNextRow() )
						{  
							companies[rowCount] = {};
							
							for ( let i = 0; i < columns.length; i += 1 ) {
								if ( columns[i].property !== null ) {
									if ( _NRLOrderIt.isDate(columns[i].type) ) {
										companies[rowCount][columns[i].property] = _SQL.convertIntegerToDate(row.getResultByName(columns[i].name));
									}
									else {
										companies[rowCount][columns[i].property] = row.getResultByName(columns[i].name);	
									}						
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
								aCallback.completed(companies);
							}
						}
						else {
							_logger.warn("Query canceled or aborted: " + sql);
						}
					
						_logger.trace("handleCompletion closed");
					}  
				});						
			}
			catch (anError) {
				_logger.error(anError);
			}
			finally {
				statement.finalize();
			}
			
			_logger.trace("search closed");
		},
		
		create : function () {
			_logger.trace("create opened");
			
			let aCompany = {
					id : null,
					name : '',
					address : '',
					phone : '',
					fax : '',
					website : ''
			};
			
			// TODO: Add preferences defaults instead of literals.
			
			_logger.trace("create closed");
			return aCompany;
		}
	}
})();