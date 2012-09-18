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
 * The <code>JobOrderNumber</code> object represents a job order number, handles communication with SQLite database for the job
 * order number table, and handles the functionality of the job order number pane, tree, and form.
 */
var JobOrderNumber = new function()
{
	var id = '';
	var name = '';
	var number = '';
	var description = '';
	var dateAdded = new Date();
	
	this.add = add;
	this.edit = edit;
	this.remove = remove;
	this.search = search;
	this.showAddForm = showAddForm;
	this.showUpdateForm = showUpdateForm;
	this.resetForm = resetForm;
	this.cancelForm = cancelForm;
	
	/**
	 * Adds a new job order number.
	 */
	function add()
	{	
		getForm();
		
		insert();
		
		rebuildMenuList();
		rebuildTree();
		
		NRLOrderIt.updateMessage('jobordernumber.add');
		
		clearForm();
		hideForm();
	}
	
	/**
	 * Inserts a new job order number into the database.
	 */
	function insert()
	{
		var statement = NRLOrderIt.conn.createStatement("INSERT INTO job_order_numbers ('job_order_number','name','description','date_added') VALUES (:jobOrderNumber, :name, :description, :dateAdded)");
		
		statement.params.name = name; 
		statement.params.jobOrderNumber = number;
		statement.params.description = description;
		
		dateAdded = new Date();
		var timestamp = Math.round(dateAdded.getTime() / 1000);
		statement.params.dateAdded = timestamp;
			
		statement.execute();
		statement.reset();
	}
	
	/**
	 * Edits an existing job order number.
	 */
	function edit()
	{
		getForm();
		
		update();
		
		rebuildMenuList();
		rebuildTree();
		
		NRLOrderIt.updateMessage('jobordernumber.update');
		
		clearForm();
		hideForm();
	}
	
	/**
	 * Updates an existing job order number in the database.
	 */
	function update()
	{
		var statement = NRLOrderIt.conn.createStatement("UPDATE job_order_numbers SET job_order_number = :jobOrderNumber, name = :name, description = :description WHERE job_order_numbers_id = :jobOrderNumbersId");
		
		statement.params.jobOrderNumbersId = id;
		statement.params.name = name;
		statement.params.jobOrderNumber = number;
		statement.params.description = description;
		
		statement.execute();
		statement.reset();
	}
	
	/**
	 * Removes an existing job order number. This only updates the date deleted column with the current date. This function
	 * does not remove the job order number from the database.
	 */
	function remove()
	{
		var jobOrderNumberTree = document.getElementById('NRLOrderIt-JobOrderNumber-Tree');
		var currentIndex = jobOrderNumberTree.view.selection.currentIndex;
		
		if ( currentIndex > -1 )
		{
			var jobOrderNumberNameColumn = jobOrderNumberTree.columns.getNamedColumn('NRLOrderIt-JobOrderNumber-Tree-Name');	
			id = jobOrderNumberTree.view.getCellValue(currentIndex, jobOrderNumberNameColumn);
		
			var statement = NRLOrderIt.conn.createStatement("UPDATE job_order_numbers SET date_deleted = :dateDeleted WHERE job_order_numbers_id = :jobOrderNumbersId");
			statement.params.jobOrderNumbersId = id;
			
			var currentDate = new Date();
			statement.params.dateDeleted = Math.round(currentDate.getTime() / 1000);
			
			statement.execute();
			statement.reset();
			
			rebuildTree();
			rebuildMenuList();
			
			NRLOrderIt.updateMessage('jobordernumber.delete');
		}
	}
	
	/**
	 * Searches for a job order number based on fuzzy logic.
	 */
	function search()
	{
		var like = document.getElementById('NRLOrderIt-JobOrderNumber-Like');
		var jobOrderNumberSearch = document.getElementById('NRLOrderIt-JobOrderNumber-Search');
		var value = jobOrderNumberSearch.value;
		like.textContent = "%" + (value ? value + "%" : "");
		
		rebuildTree();
	}
	
	/**
	 * Deletes an existing job order number from the database.
	 */
	function deleteFrom()
	{
		var statement = NRLOrderIt.conn.createStatement("DELETE FROM job_order_numbers WHERE job_order_numbers_id = :jobOrderNumbersId");
		
		statement.params.jobOrderNumbersId = id;
		
		statement.execute();
		statement.reset();
	}
	
	/**
	 * Shows the form for adding a new job order number.
	 */
	function showAddForm()
	{
		resetForm();
		
		var add = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Add');
		var update = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Update');
		var reset = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Reset');
		reset.hidden = false;
		add.hidden = false;
		update.hidden = true;
		
		showForm();
		
		NRLOrderIt.updateMessage('jobordernumber.new');
	}
	
	/**
	 * Shows the form for updating an existing job order number.
	 */
	function showUpdateForm()
	{	
		var jobOrderNumberTree = document.getElementById('NRLOrderIt-JobOrderNumber-Tree');
		var currentIndex = jobOrderNumberTree.view.selection.currentIndex;	
		
		if ( currentIndex > -1 )
		{
			var jobOrderNumberNameColumn = jobOrderNumberTree.columns.getNamedColumn('NRLOrderIt-JobOrderNumber-Tree-Name');
			var jobOrderNumberNumberColumn = jobOrderNumberTree.columns.getNamedColumn('NRLOrderIt-JobOrderNumber-Tree-Number');
			var jobOrderNumberDescriptionColumn = jobOrderNumberTree.columns.getNamedColumn('NRLOrderIt-JobOrderNumber-Tree-Description');
				
			id = jobOrderNumberTree.view.getCellValue(currentIndex, jobOrderNumberNameColumn);
			name = jobOrderNumberTree.view.getCellText(currentIndex, jobOrderNumberNameColumn);
			number = jobOrderNumberTree.view.getCellText(currentIndex, jobOrderNumberNumberColumn);	
			description = jobOrderNumberTree.view.getCellText(currentIndex, jobOrderNumberDescriptionColumn);
			
			setForm();
			
			var add = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Add');
			var update = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Update');
			var reset = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Reset');
			reset.hidden = true;
			add.hidden = true;
			update.hidden = false;
			
			showForm();
			
			NRLOrderIt.updateMessage('jobordernumber.edit');
		}
	}
	
	/**
	 * Cancels the adding of a new or updating of an existing job order number. This resets the form and hides it.
	 */
	function cancelForm()
	{
		resetForm();
		
		hideForm();
		
		NRLOrderIt.updateMessage('jobordernumber.cancel');
	}
	
	/**
	 * Resets the form. This clears all input fields but does NOT hide the form.
	 */
	function resetForm()
	{
		clearForm();
		
		NRLOrderIt.updateMessage('jobordernumber.reset');
	}
	
	/**
	 * Clears the form inputs.
	 */
	function clearForm()
	{
		id = '';
		name = '';
		number = '';
		description = '';
		
		setForm();
	}
	
	/**
	 * Populates the member variables of the job order number object with the values from the form.
	 */
	function getForm()
	{
		var formName = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Name');
		var formNumber = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Number');
		var formDescription = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Description');
		
		name = formName.value;
		number = formNumber.value;
		description = formDescription.value;
	}
	
	/**
	 * Populates the form with the member variables of the job order number object.
	 */
	function setForm()
	{
		var formName = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Name');
		var formNumber = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Number');
		var formDescription = document.getElementById('NRLOrderIt-JobOrderNumber-Form-Description');
		
		formName.value = name;
		formNumber.value = number;
		formDescription.value = description;
	}	
	
	/**
	 * Hides the form.
	 */
	function hideForm()
	{
		var jobOrderNumberForm = document.getElementById('NRLOrderIt-JobOrderNumber-Form');
		jobOrderNumberForm.setAttribute('hidden', true);
	}
	
	/**
	 * Shows the form.
	 */
	function showForm()
	{
		var jobOrderNumberForm = document.getElementById('NRLOrderIt-JobOrderNumber-Form');
		jobOrderNumberForm.setAttribute('hidden', false);
	}
	
	/**
	 * Rebuilds the job order number tree. This is generally called after a change has occurred in the SQLite database.
	 */
	function rebuildTree()
	{
		var jobOrderNumberTree = document.getElementById('NRLOrderIt-JobOrderNumber-Tree');
		jobOrderNumberTree.builder.rebuild();	
	}
	
	/**
	 * Rebuilds the job order number menu list.
	 */
	function rebuildMenuList()
	{
		var jobOrderNumberMenu = document.getElementById('NRLOrderIt-PurchaseOrder-Form-JobOrderNumber');
		jobOrderNumberMenu.builder.rebuild();
		jobOrderNumberMenu.selectedIndex = 0;
	}
}