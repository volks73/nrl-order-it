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
 * The <code>CompanyPanel</code> module.
 */
mil.navy.nrl.NRLOrderIt.Company.Panel = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.Company.Panel"); 
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _storage = null;
	var _form = null;
	
	/*
	 * Private methods.
	 */
	
	var _showForm = function () {
		_logger.trace("_showForm opened");
		
		_form.setAttribute('hidden', false);
		
		_logger.trace("_showForm closed");
	};
	
	var _hideForm = function () {
		_logger.trace("_hideForm opeend");
		
		_form.setAttribute('hidden', true);
		
		_logger.trace("_hideForm closed");
	};
	
	var _add = function () {
		_logger.trace("_add opened");
		
		_NRLOrderIt.Company.Form.load(_storage.create());
		
		_showForm();
		
		_logger.trace("_add closed");
	};
	
	var _edit = function () {
		_logger.trace("_edit opened");
		
		if ( _NRLOrderIt.Company.Tree.selected !== null ) {
			_NRLOrderIt.Company.Form.load(_NRLOrderIt.Company.Tree.selected);
			_showForm();
		}
		
		_logger.trace("_edit closed");
	};
	
	var _remove = function () {
		_logger.trace("_remove opened");
		
		if ( _NRLOrderIt.Company.Tree.selected !== null ) {
			_storage.remove(_NRLOrderIt.Company.Tree.selected, {
				completed : function (results) {
					_logger.trace("completed opened");
					
					_NRLOrderIt.Company.Tree.load();
					
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
			return _NRLOrderIt.Company.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Panel';
		},
		
		/*
		 * Public methods.
		 */
		
		init : function (aStorage) {
			_logger.trace("init opened");
			
			_storage = aStorage;
			_form = document.getElementById(_NRLOrderIt.Company.Form.ID);
			
			_NRLOrderIt.Company.Tree.init(_storage);
			_NRLOrderIt.Company.Form.init();
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Form.DONE_EVENT);
					
					let formCompany = _NRLOrderIt.Company.Form.company;
					
					let callback = {
						completed : function (results) {
							_NRLOrderIt.Company.Tree.load();
						}
					};
					
					if ( formCompany.id === null ) {
						_storage.add(formCompany, callback);
					}
					else {
						_storage.edit(formCompany, callback);	
					}
					
					_NRLOrderIt.Company.Form.clear();					
					_hideForm();
						
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Form.DONE_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Form.CANCEL_EVENT);
					
					_NRLOrderIt.Company.Form.clear();
					_hideForm();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Form.CANCEL_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Tree.EDIT_EVENT);
					
					_edit();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Tree.EDIT_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Toolbar.ADD_EVENT);
					
					_add();
					 
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Toolbar.ADD_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Toolbar.EDIT_EVENT);
					
					_edit();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Toolbar.EDIT_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Toolbar.REMOVE_EVENT);
					
					_remove();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Toolbar.REMOVE_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Toolbar.SEARCH_EVENT);
					
					_search();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Toolbar.SEARCH_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Menu.ADD_EVENT);
					
					_add();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Menu.ADD_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Menu.EDIT_EVENT);
					
					_edit();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Menu.EDIT_EVENT, null);
			
			_observerService.addObserver({
				observe : function (aSubject, aTopic, aData) {
					_logger.trace("observe opened");
					_logger.debug(_NRLOrderIt.Company.Menu.REMOVE_EVENT);
					
					_remove();
					
					_logger.trace("observe closed");
				}
			}, _NRLOrderIt.Company.Menu.REMOVE_EVENT, null);
			
			_logger.trace("init closed");
		}
	}
})();