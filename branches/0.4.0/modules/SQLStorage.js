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
var EXPORTED_SYMBOLS = [ "mil.navy.nrl.NRLOrderIt.SQL.Storage" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://NRLOrderIt/common.js");
Components.utils.import("resource://NRLOrderIt/log4moz.js");
Components.utils.import("resource://NRLOrderIt/SQL.js");
Components.utils.import("resource://NRLOrderIt/SQLJobOrderNumber.js");
Components.utils.import("resource://NRLOrderIt/SQLCompany.js");
Components.utils.import("resource://NRLOrderIt/SQLPurchaseOrder.js");
Components.utils.import("resource://NRLOrderIt/SQLItem.js");

/**
 * The <code>Storage</code> module.
 */
mil.navy.nrl.NRLOrderIt.SQL.Storage = ( function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.SQL.Storage");
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _SQL = _NRLOrderIt.SQL;
	
	return {
		
		/*
		 * Public methods.
		 */
		
		init : function (databaseFile) {
			_logger.trace("init opened");
			
			var storageService = Cc["@mozilla.org/storage/service;1"].getService(Ci.mozIStorageService);
			
			let conn = storageService.openDatabase(databaseFile);
			
			_SQL.JobOrderNumber.init(conn);
			_SQL.Company.init(conn);
			_SQL.PurchaseOrder.init(conn);
			_SQL.Item.init(conn);
			
			_logger.trace("init closed");
		},
		
		get purchaseOrder() {
			return _SQL.PurchaseOrder;
		},
		
		get company() {
			return _SQL.Company;
		},
		
		get jobOrderNumber() {
			return _SQL.JobOrderNumber;
		},
				
		get item() {
			return _SQL.Item;
		}
	}
})();