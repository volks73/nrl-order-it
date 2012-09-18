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
Components.utils.import("resource://NRLOrderIt/Addon.js");
Components.utils.import("resource://NRLOrderIt/log4moz.js");

/**
 * The <code>BrowserOverlay</code> module.
 */
mil.navy.nrl.NRLOrderIt.BrowserOverlay = (function () {
	
	/*
	 * Private variables.
	 */
	
	var _logger = Log4Moz.repository.getLogger("mil.navy.nrl.NRLOrderIt.BrowserOverlay");
	var _NRLOrderIt = mil.navy.nrl.NRLOrderIt;
	var _addon = _NRLOrderIt.Addon;
	var _pane = null;
	var _splitter = null;
	var _statusBar = null;
	
	return {
		
		/*
		 * IDs.
		 */
		
		get PANE_ID() {
			return _NRLOrderIt.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Pane';
		},
		
		get SPLITTER_ID() {
			return _NRLOrderIt.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'Splitter';
		},
		
		get STATUS_BAR_PANEL_ID() {
			return _NRLOrderIt.NAMESPACE + _NRLOrderIt.NAMESPACE_SEPARATOR + 'StatusBar-Panel';
		},
		
		/*
		 * Public methods.
		 */
		
		init : function () {
			_logger.trace("init opened");
			
			_pane = document.getElementById(this.PANE_ID);
			_splitter = document.getElementById(this.SPLITTER_ID);
			_statusBar = document.getElementById(this.STATUS_BAR_PANEL_ID);
			
			_addon.load();
			
			_NRLOrderIt.JobOrderNumber.Panel.init(_addon.storage.jobOrderNumber);
			_NRLOrderIt.Company.Panel.init(_addon.storage.company);
			_NRLOrderIt.PurchaseOrder.Panel.init(_addon.storage.purchaseOrder);
			
			_logger.trace("init closed");
		},
		
		/**
		 * Toggles the visibility of the application pane.
		 */
		togglePane : function () {
			_logger.trace("togglePane opened");
			
			if ( _pane.getAttribute('hidden') === 'true' ) {			
				var isHidden = true;
			}
	
			_splitter.setAttribute('hidden', !isHidden);
			_pane.setAttribute('hidden', !isHidden);
			
			_logger.trace("togglePane closed");
		}
	}
})();

window.addEventListener("load", function() { mil.navy.nrl.NRLOrderIt.BrowserOverlay.init(); }, true);