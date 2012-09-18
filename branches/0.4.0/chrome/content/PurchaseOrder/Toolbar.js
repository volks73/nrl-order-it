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
 * The <code>PurchaseOrder.Toolbar</code> module.
 */
mil.navy.nrl.NRLOrderIt.PurchaseOrder.Toolbar = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("NRLOrderIt.PurchaseOrder.Toolbar"); 
	var _observerService = Cc["@mozilla.org/observer-service;1"].getService(Ci.nsIObserverService);
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	
	return {
		
		/*
		 * IDs.
		 */
		
		get ID() {
			return _NRLOrderIt.PurchaseOrder.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Toolbar';
		},
		
		get ADD_TOOLBARBUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Add';
		},
		
		get EDIT_TOOLBARBUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Edit';
		},
		
		get VIEW_TOOLBARBUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'View';
		},
		
		get PRINT_TOOLBARBUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Print';
		},
		
		get COPY_TOOLBARBUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Copy';
		},
		
		get REMOVE_TOOLBARBUTTON_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Remove';
		},
		
		get SEARCH_TEXTBOX_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Search';
		},
		
		/*
		 * Events.
		 */
		
		get EVENT_ID() {
			return this.ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Event'; 
		},
		
		/**
		 * Fired to add a new purchase order.
		 */
		get ADD_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Add';
		},
		
		/**
		 * Fired to edit an existing purchase order.
		 */
		get EDIT_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Edit';
		},
		
		/**
		 * Fired to view a purchase order.
		 */
		get VIEW_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'View';
		},
		
		/**
		 * Fired to print a purchase order.
		 */
		get PRINT_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Print';
		},
		
		/**
		 * Fired to copy a purchase order.
		 */
		get COPY_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Copy';
		},
		
		/**
		 * Fired to remove an existing purchase order.
		 */
		get REMOVE_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Remove';
		},
		
		/**
		 * Fired to search for an existing purchase order.
		 */
		get SEARCH_EVENT() {
			return this.EVENT_ID + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Search';
		},
		
		/*
		 * Public methods.
		 */
		

		init : function () {
			_logger.trace("init opened");
			
			_logger.trace("init closed");
		},
		
		add : function () {
			_logger.trace("add opened");
			
			_observerService.notifyObservers(this, this.ADD_EVENT, null);
			
			_logger.trace("add closed");
		},
		
		edit : function () {
			_logger.trace("edit opened");
			
			_observerService.notifyObservers(this, this.EDIT_EVENT, null);
			
			_logger.trace("edit closed");
		},
		
		view : function () {
			_logger.trace("view opened");
			
			_observerService.notifyObservers(this, this.VIEW_EVENT, null);
			
			_logger.trace("view closed");
		},
		
		copy : function () {
			_logger.trace("copy opened");
			
			_observerService.notifyObservers(this, this.COPY_EVENT, null);
			
			_logger.trace("copy closed");
		},
		
		print : function () {
			_logger.trace("print opened");
			
			_observerService.notifyObservers(this, this.PRINT_EVENT, null);
			
			_logger.trace("print closed");
		},
		
		remove : function () {
			_logger.trace("remove opened");
			
			_observerService.notifyObservers(this, this.REMOVE_EVENT, null);
			
			_logger.trace("remove closed");
		},
		
		search : function () {
			_logger.trace("search opened");
			
			_observerService.notifyObservers(this, this.SEARCH_EVENT, null);
			
			_logger.trace("search closed");
		}
	}
})();