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
var EXPORTED_SYMBOLS = [ "mil", "mil.navy", "mil.navy.nrl", "mil.navy.nrl.NRLOrderIt" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

if ( typeof(mil) === 'undefined' ) {
	var mil = {};
}

if ( typeof(mil.navy) === 'undefined' ) {
	mil.navy = {};
}

if ( typeof(mil.navy.nrl) === 'undefined' ) {
	mil.navy.nrl = {};
}

if ( typeof(mil.navy.nrl.NRLOrderIt) === 'undefined' ) {
	
	/*
	 * The <code>NRLOrderIt</code> name space.
	 */
	
	mil.navy.nrl.NRLOrderIt = {
			
		/**
		 * Gets the <code>NRLOrderIt</code> name space string for 'id' attributes of XUL elements
		 * related to the NRL Order It add-on.
		 * 
		 * @return 'NRLOrderIt'.
		 */	
		get NAMESPACE() {
			return 'NRLOrderIt';
		},
		
		/**
		 * Gets the <code>NRLOrderIt</code> separator used to create strings for 'id' attributes
		 * of XUL elements.
		 * 
		 * @return '-'.
		 */
		get NAMESPACE_SEPARATOR() {
			return '-';
		},
			
		isDate : function (object) {
			let isDate = false;
			
			if ( object !== null ) {
				isDate = Object.prototype.toString.call(object) === '[object Date]';
			}
			
			return isDate;
		},
		
		/*
		 * The <code>JobOrderNumber</code> name space.
		 */
		JobOrderNumber : {
			
			/**
			 * Gets the <code>JobOrderNumber</code> name space string for 'id' attributes used
			 * in XUL elements related to Job Order Numbers.
			 * 
			 *  @return 'NRLOrderIt-JobOrderNumber'.
			 */
			get NAMESPACE() {
				return mil.navy.nrl.NRLOrderIt.NAMESPACE + mil.navy.nrl.NRLOrderIt.NAMESPACE_SEPARATOR + 'JobOrderNumber';
			}
		},
		
		/*
		 * The <code>Company</code> name space.
		 */
		Company : {
			
			/**
			 * Gets the <code>Company</code> name space string for 'id' attributes used
			 * in XUL elements related to Companies.
			 * 
			 *  @return 'NRLOrderIt-Company'.
			 */
			get NAMESPACE() {
				return mil.navy.nrl.NRLOrderIt.NAMESPACE + mil.navy.nrl.NRLOrderIt.NAMESPACE_SEPARATOR + 'Company';
			}
		},
		
		/*
		 * The <code>PurchaseOrder</code> name space.
		 */
		PurchaseOrder : {
			
			/**
			 * Gets the <code>PurchaseOrder</code> name space string for 'id' attributes used
			 * in XUL elements related to Purchase Orders.
			 * 
			 *  @return 'NRLOrderIt-PurchaseOrder'.
			 */
			get NAMESPACE() {
				return mil.navy.nrl.NRLOrderIt.NAMESPACE + mil.navy.nrl.NRLOrderIt.NAMESPACE_SEPARATOR + 'PurchaseOrder';
			},
			
			/*
			 * The <code>Item</code> name space.
			 */
			Item : {
				
				/**
				 * Gets the <code>Item</code> name space string for 'id' attributes used
				 * in XUL elements related to Purchase Order Items.
				 * 
				 *  @return 'NRLOrderIt-PurchaseOrder-Item'.
				 */
				get NAMESPACE() {
					return mil.navy.nrl.NRLOrderIt.PurchaseOrder.NAMESPACE + mil.navy.nrl.NRLOrderIt.NAMESPACE_SEPARATOR + 'Item';
				}
			}
		}
	};
}