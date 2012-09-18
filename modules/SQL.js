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
var EXPORTED_SYMBOLS = [ "mil.navy.nrl.NRLOrderIt.SQL" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

Components.utils.import("resource://NRLOrderIt/common.js");

/**
 * The <code>SQL</code> namespace.
 */
if ( typeof(mil.navy.nrl.NRLOrderIt.SQL) === 'undefined' ) {
	
	/*
	 * The <code>SQL</code> namespace.
	 */
	
	mil.navy.nrl.NRLOrderIt.SQL = {
		
		/*
		 * Constants.
		 */
		
		get ID_INDEX() {
			return 0;
		},
		
		get ID_PARAM() {
			return 'id';
		},
			
		get DATE_ADDED_COLUMN() {
			return 'date_added';
		},
		
		get DATE_ADDED_PARAM() {
			return 'dateAdded';
		},
		
		get DATE_REMOVED_COLUMN() { 
			return 'date_removed';
		},
		
		get DATE_REMOVED_PARAM() {
			return 'dateRemoved';
		},
		
		/*
		 * Namespace methods.
		 */
		
		convertDateToInteger : function (aDate) {
			let dateInteger = null;
			
			if ( aDate !== null ) {
				dateInteger = Math.round(aDate.getTime() / 1000);	
			}
			
			return dateInteger;
		},
		
		convertIntegerToDate : function (anInteger) {
			let date = null;
			
			if ( anInteger !== null ) {
				date = new Date(anInteger * 1000);	
			}
			
			return date;
		}
	};
}