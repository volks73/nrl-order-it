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
 * The <code>PurchaseOrder.Panel</code> module.
 */
mil.navy.nrl.NRLOrderIt.PurchaseOrder.Panel = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.PurchaseOrder.Panel"); 
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _storage = null;
	var _form = null;
	var _panel = null;
	
	/*
	 * Private methods.
	 */
	
	var _loadForm = function (aPurchaseOrder) {
		_logger.trace("_loadForm opened");
		
		_NRLOrderIt.PurchaseOrder.Form.load(aPurchaseOrder);
		
		_logger.trace("_loadForm closed");
	};
	
	var _showForm = function () {
		_logger.trace("_showForm opened");
		
		_panel.setAttribute('hidden', true);
		_form.setAttribute('hidden', false);
		
		_logger.trace("_showForm closed");
	};

	var _hideForm = function () {
		_logger.trace("_hideForm opeend");
		
		_panel.setAttribute('hidden', false);
		_form.setAttribute('hidden', true);
		
		_logger.trace("_hideForm closed");
	};
	
	var _add = function () {
		_logger.trace("_add opened");
		
		_loadForm(_storage.create());
		_showForm();
		
		_logger.trace("_add closed");
	};
	
	var _edit = function () {
		_logger.trace("_edit opened");
		
		if ( _NRLOrderIt.PurchaseOrder.Tree.selected !== null ) {
			_loadForm(_NRLOrderIt.PurchaseOrder.Tree.selected);
			_showForm();
		}
		
		_logger.trace("_edit closed");
	};
	
	var _remove = function () {
		_logger.trace("_remove opened");
		
		if ( _NRLOrderIt.PurchaseOrder.Tree.selected !== null ) {
			_storage.remove(_NRLOrderIt.PurchaseOrder.Tree.selected, {
				completed : function (results) {
					_logger.trace("completed opened");
					
					_NRLOrderIt.PurchaseOrder.Tree.load();
					
					_logger.trace("completed closed");
				}
			});
		}
		
		_logger.trace("_remove closed");
	};
	
	var _search = function () {
		_logger.trace("search opened");
		
		_storage.search(keywords, {
			completed : function (results) {
				_logger.trace("completed opened");
				
				_logger.trace("completed closed");
			}
		});
		
		_logger.trace("search removed");
	};
	
	return {
		
		/*
		 * IDs.
		 */
		
		get ID() {
			return _NRLOrderIt.PurchaseOrder.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Panel';
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
			_panel = document.getElementById(this.ID);
			_form = document.getElementById(_NRLOrderIt.PurchaseOrder.Form.ID);
			
			_NRLOrderIt.PurchaseOrder.Tree.init(_storage);
			_NRLOrderIt.PurchaseOrder.Form.init(_storage);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Form.DONE_EVENT);
					
					let formPurchaseOrder = _NRLOrderIt.PurchaseOrder.Form.purchaseOrder;
					
					let callback = {
						completed : function (results) {
							_NRLOrderIt.PurchaseOrder.Tree.load();
						}	
					};
					
					if ( formPurchaseOrder.id === null ) {
						_storage.add(formPurchaseOrder, callback);
					}
					else {
						_storage.edit(formPurchaseOrder, callback);
					}
					
					_NRLOrderIt.PurchaseOrder.Form.clear();					
					_hideForm();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Form.DONE_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Form.CANCEL_EVENT);
		
					_NRLOrderIt.PurchaseOrder.Form.clear();
					_hideForm();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Form.CANCEL_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Tree.EDIT_EVENT);
					
					_edit();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Tree.EDIT_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Toolbar.ADD_EVENT);
					
					_add();					
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Toolbar.ADD_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Toolbar.EDIT_EVENT);
					
					_edit();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Toolbar.EDIT_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Toolbar.REMOVE_EVENT);
					
					_remove();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Toolbar.REMOVE_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Toolbar.SEARCH_EVENT);
					
					_search();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Toolbar.SEARCH_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Menu.ADD_EVENT);
					
					_add();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Menu.ADD_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Menu.EDIT_EVENT);
					
					_edit();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Menu.EDIT_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.PurchaseOrder.Menu.REMOVE_EVENT);
					
					_remove();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.PurchaseOrder.Menu.REMOVE_EVENT, null);
			
			_logger.trace("init closed");
		},
	}
})();