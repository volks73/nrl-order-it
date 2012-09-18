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
 * 		Christopher R. Field <christopher.field.ctr@nrl.navy.mil>
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

/**
 * The <code>Company</code> object represents a company, handles communication with SQLite database for the 
 * companies table, and handles the functionality of the company pane, tree, and form.
 */
var Company = new function()
{
	var HTTP = "http://";
	var id = '';
	var name = '';
	var address = '';
	var phone = '';
	var fax = '';
	var website = '';
	var dateAdded = new Date();
	
	this.add = add;
	this.edit = edit;
	this.remove = remove;	
	this.search = search;
	this.gotoWebsite = gotoWebsite;
	this.showAddForm = showAddForm;
	this.showUpdateForm = showUpdateForm;
	this.resetForm = resetForm;
	this.cancelForm = cancelForm;
		
	/**
	 * Adds a new company to the SQLite database.
	 */
	function add()
	{	
		getForm();
		
		insert();
		
		rebuildMenuList();
		rebuildTree();
		
		NRLOrderIt.updateMessage('company.add');
		
		clearForm();		
		hideForm();
	}

	/**
	 * Inserts a new company into the database.
	 */
	function insert()
	{
		var statement = NRLOrderIt.conn.createStatement("INSERT INTO companies ('name','address','phone','fax','website','date_added') VALUES (:name, :address, :phone, :fax, :website, :dateAdded)");
		
		statement.params.name = name; 
		statement.params.address = address;
		statement.params.phone = phone;
		statement.params.fax = fax;
		statement.params.website = website;
		
		dateAdded = new Date();
		var timestamp = Math.round(dateAdded.getTime() / 1000);
		statement.params.dateAdded = timestamp;
			
		statement.execute();
		statement.reset();
	}
	
	/**
	 * Edits an existing company.
	 */
	function edit()
	{
		getForm();
		
		update();
		
		rebuildMenuList();
		rebuildTree();
		
		NRLOrderIt.updateMessage('company.update');
		
		clearForm();		
		hideForm();
	}
	
	/**
	 * Updates an existing company in the database.
	 */
	function update()
	{
		var statement = NRLOrderIt.conn.createStatement("UPDATE companies SET name = :name, address = :address, phone = :phone, fax = :fax, website = :website WHERE companies_id = :companiesId");
		
		statement.params.companiesId = id;
		statement.params.name = name;
		statement.params.address = address;
		statement.params.phone = phone;
		statement.params.fax = fax;
		statement.params.website = website;
		
		statement.execute();
		statement.reset();
	}
	
	/**
	 * Removes an existing company. This function does not remove it from the database, but updates the date deleted column with the current date and time.
	 */
	function remove()
	{
		var companyTree = document.getElementById('NRLOrderIt-Company-Tree');
		var currentIndex = companyTree.view.selection.currentIndex;
		
		if ( currentIndex > -1 )
		{
			var companyNameColumn = companyTree.columns.getNamedColumn('NRLOrderIt-Company-Tree-Name');	
			id = companyTree.view.getCellValue(currentIndex, companyNameColumn);
		
			var statement = NRLOrderIt.conn.createStatement("UPDATE companies SET date_deleted = :dateDeleted WHERE companies_id = :companiesId");
			statement.params.companiesId = id;
			
			var currentDate = new Date();
			statement.params.dateDeleted = Math.round(currentDate.getTime() / 1000);
			
			statement.execute();
			statement.reset();
		
			rebuildTree();
			rebuildMenuList();
			
			NRLOrderIt.updateMessage('company.delete');			
		}
	}
	
	/**
	 * Deletes an existing company from the database.
	 */
	function deleteFrom()
	{
		var statement = NRLOrderIt.conn.createStatement("DELETE FROM companies WHERE companies_id = :companiesId");
		
		statement.params.companiesId = id;
		
		statement.execute();
		statement.reset();
	}
	
	/**
	 * Searches for a company based on fuzzy logic.
	 */
	function search()
	{
		var like = document.getElementById('NRLOrderIt-Company-Like');
		var companySearch = document.getElementById('NRLOrderIt-Company-Search');
		var value = companySearch.value;
		like.textContent = "%" + (value ? value + "%" : "");
		
		rebuildTree();
	}
	
	/**
	 * Opens a new tab in the browser at the company's website.
	 */
	function gotoWebsite(companyWebsite)
	{	
		if ( !companyWebsite )
		{		
			var companyTree = document.getElementById('NRLOrderIt-Company-Tree');
			var currentIndex = companyTree.view.selection.currentIndex;	
			
			if ( currentIndex > -1 )
			{
				var companyWebsiteColumn = companyTree.columns.getNamedColumn('NRLOrderIt-Company-Tree-Website');
				companyWebsite = companyTree.view.getCellText(currentIndex, companyWebsiteColumn)				
			}
		}
		
		if ( companyWebsite.substring(0, 7) != HTTP )
		{
			companyWebsite = HTTP + companyWebsite;
		}
		
		gBrowser.selectedTab = gBrowser.addTab(companyWebsite);
	}
	
	/**
	 * Shows the form for adding a new company.
	 */
	function showAddForm()
	{
		resetForm();
		
		var add = document.getElementById('NRLOrderIt-Company-Form-Add');
		var update = document.getElementById('NRLOrderIt-Company-Form-Update');
		var reset = document.getElementById('NRLOrderIt-Company-Form-Reset');
		reset.hidden = false;
		add.hidden = false;
		update.hidden = true;
		
		showForm();
		
		NRLOrderIt.updateMessage('company.new');
	}
	
	/**
	 * Shows the form for updating an existing company.
	 */
	function showUpdateForm()
	{	
		var companyTree = document.getElementById('NRLOrderIt-Company-Tree');
		var currentIndex = companyTree.view.selection.currentIndex;	
		
		if ( currentIndex > -1 )
		{
			var companyNameColumn = companyTree.columns.getNamedColumn('NRLOrderIt-Company-Tree-Name');
			var companyAddressColumn = companyTree.columns.getNamedColumn('NRLOrderIt-Company-Tree-Address');
			var companyPhoneColumn = companyTree.columns.getNamedColumn('NRLOrderIt-Company-Tree-Phone');
			var companyFaxColumn = companyTree.columns.getNamedColumn('NRLOrderIt-Company-Tree-Fax');
			var companyWebsiteColumn = companyTree.columns.getNamedColumn('NRLOrderIt-Company-Tree-Website');	
			
			id = companyTree.view.getCellValue(currentIndex, companyNameColumn);
			name = companyTree.view.getCellText(currentIndex, companyNameColumn);
			address = companyTree.view.getCellText(currentIndex, companyAddressColumn);
			phone = companyTree.view.getCellText(currentIndex, companyPhoneColumn);
			fax = companyTree.view.getCellText(currentIndex, companyFaxColumn);
			website = companyTree.view.getCellText(currentIndex, companyWebsiteColumn);
			
			setForm();
			
			var add = document.getElementById('NRLOrderIt-Company-Form-Add');
			var update = document.getElementById('NRLOrderIt-Company-Form-Update');
			var reset = document.getElementById('NRLOrderIt-Company-Form-Reset');
			reset.hidden = true;
			add.hidden = true;
			update.hidden = false;
			
			showForm();
			
			if ( NRLOrderIt.prefs.getBoolPref('general.doubleclicktowebsite') )
			{
				gotoWebsite(website);
			}
			
			NRLOrderIt.updateMessage('company.edit');
		}
	}
	
	/**
	 * Cancels the adding of a new or updating of an existing company. This resets the form and hides it.
	 */
	function cancelForm()
	{
		clearForm();
		
		hideForm();
		
		NRLOrderIt.updateMessage('company.cancel');
	}
	
	/**
	 * Resets the form. This clears all input fields but does NOT hide the form.
	 */
	function resetForm()
	{
		clearForm();
		
		NRLOrderIt.updateMessage('company.reset');
	}
	
	function clearForm()
	{
		id = '';
		name = '';
		address = '';
		phone = '';
		fax = '';
		website = '';
		
		setForm();
	}
	
	/**
	 * Populates the member variables of the company object with the values from the form.
	 */
	function getForm()
	{
		var formName = document.getElementById('NRLOrderIt-Company-Form-Name');
		var formAddress = document.getElementById('NRLOrderIt-Company-Form-Address');
		var formPhone = document.getElementById('NRLOrderIt-Company-Form-Phone');
		var formFax = document.getElementById('NRLOrderIt-Company-Form-Fax');
		var formWebsite = document.getElementById('NRLOrderIt-Company-Form-Website');
		
		name = formName.value;
		address = formAddress.value;
		phone = formPhone.value;
		fax = formFax.value;
		website = formWebsite.value;
	}
	
	/**
	 * Populates the form with the member variables of the company object.
	 */
	function setForm()
	{
		var formName = document.getElementById('NRLOrderIt-Company-Form-Name');
		var formAddress = document.getElementById('NRLOrderIt-Company-Form-Address');
		var formPhone = document.getElementById('NRLOrderIt-Company-Form-Phone');
		var formFax = document.getElementById('NRLOrderIt-Company-Form-Fax');
		var formWebsite = document.getElementById('NRLOrderIt-Company-Form-Website');
		
		formName.value = name;
		formAddress.value = address;
		formPhone.value = phone;
		formFax.value = fax;
		formWebsite.value = website;
	}	
	
	/**
	 * Hides the form.
	 */
	function hideForm()
	{
		var companyForm = document.getElementById('NRLOrderIt-Company-Form');
		companyForm.setAttribute('hidden', true);
	}
	
	/**
	 * Shows the form.
	 */
	function showForm()
	{
		var companyForm = document.getElementById('NRLOrderIt-Company-Form');
		companyForm.setAttribute('hidden', false);
	}
	
	/**
	 * Rebuilds the company tree. This is generally called after a change has occurred in the SQLite database.
	 */
	function rebuildTree()
	{
		var companyTree = document.getElementById('NRLOrderIt-Company-Tree');
		companyTree.builder.rebuild();	
	}
	
	/**
	 * Rebuilds the menu list of companies.
	 */
	function rebuildMenuList()
	{
		var companyMenu = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Company');
		companyMenu.builder.rebuild();
		companyMenu.selectedIndex = 0;
	}
}