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
 * A purchase order item.
 */
function Item()
{
	this.id = '';
	this.hazmatCode = '';
	this.partNumber = '';
	this.description = '';
	this.unitOfIssue = '';
	this.unitPrice = '';
	this.quantity = 1;
	this.dateAdded = new Date();
}

/**
 * The currently added or edited purchase order
 */
var PurchaseOrder = new function()
{
	var id = '';
	var title = '';
	var company = false;
	var jobOrderNumber = false;
	var originator = '';
	var deliverTo = '';
	var priority = '';
	var dateRequired = new Date();
	var amount = '';
	var dateAdded = new Date();
	var dateSubmitted = new Date();
	var dateReceived = new Date();
	var notes = '';
	var item = new Item();
	var editing = false;
	
	this.add = add;
	this.edit = edit;
	this.done = done;
	this.remove = remove;
	this.reset = reset;
	this.cancel = cancel;
	this.addItem = addItem;
	this.removeItem = removeItem;
	this.editItem = editItem;
	this.updateItem = updateItem;
	this.removeAllItems = removeAllItems;
	this.generate = generate;
	this.copy = copy;
	this.search = search;
	
	/**
	 * Clears the purchase order and item fields.
	 */
	function clear()
	{		
		id = '';
		title = "";
		company = false;
		jobOrderNumber = false;
		originator = NRLOrderIt.prefs.getCharPref("default.originator");
		deliverTo = NRLOrderIt.prefs.getCharPref("default.deliverto");
		priority = NRLOrderIt.prefs.getCharPref("default.priority");
		dateRequired = new Date();
		amount = '';
		dateAdded = new Date();
		dateSubmitted = new Date();
		dateRequired = new Date();
		notes = '';	
		
		item.id = '';
		item.partNumber = '';
		item.hazmatCode = '';
		item.description = '';
		item.unitOfIssue = NRLOrderIt.prefs.getCharPref("default.unitofissue");
		item.unitPrice = 0;
		item.quantity = 1;
		item.dateAdded = new Date();
	}
	
	/**
	 * Adds a new purchase order.
	 */
	function add()
	{			
		editing = false;
		
		clear();
		
		insert();
		
		rebuildTree();
		rebuildItemTree();
		
		setForm();
				
		showForm();
		
		NRLOrderIt.updateMessage('purchaseorder.new');
	}
	
	/**
	 * Inserts a new purchase order into the database. The purchase order id is set to the database id after insertion.
	 */
	function insert()
	{
		var statement = NRLOrderIt.conn.createStatement("INSERT INTO purchase_orders (" +
				"'title'," +
				"'job_order_numbers_id'," +
				"'companies_id'," +
				"'originator'," +
				"'deliver_to'," +
				"'priority'," +
				"'date_added'," +
				"'notes'" +
				") VALUES (" +
				"''," +
				"''," +
				"''," +
				"''," +
				"''," +
				"''," +
				":dateAdded," +
				"''" +
				")");
		
		var timestamp = Math.round(dateAdded.getTime() / 1000);
		statement.params.dateAdded = timestamp;

		statement.execute();
		statement.reset();
	
		id = NRLOrderIt.conn.lastInsertRowID;
	}
	
	/**
	 * Prepares the form for editing a purchase order.
	 */
	function edit()
	{
		editing = true;
		
		var purchaseOrderTree = document.getElementById('NRLOrderIt-PurchaseOrder-Tree');
		var currentIndex = purchaseOrderTree.view.selection.currentIndex;
		
		if ( currentIndex > -1 )
		{
			var purchaseOrderTitleColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-Title');
			var purchaseOrderCompanyColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-Company');
			var purchaseOrderJobOrderNumberColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-JobOrderNumber');
			var purchaseOrderOriginatorColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-Originator');
			var purchaseOrderDeliverToColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-DeliverTo');
			var purchaseOrderPriorityColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-Priority');
			var purchaseOrderDateRequiredColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-DateRequired');
			var purchaseOrderDateSubmittedColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-DateSubmitted');
			var purchaseOrderDateReceivedColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-DateReceived');
			var purchaseOrderNotesColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-Notes');
			
			id = purchaseOrderTree.view.getCellValue(currentIndex, purchaseOrderTitleColumn);
			title = purchaseOrderTree.view.getCellText(currentIndex, purchaseOrderTitleColumn);
			company = purchaseOrderTree.view.getCellValue(currentIndex, purchaseOrderCompanyColumn);	
			jobOrderNumber = purchaseOrderTree.view.getCellValue(currentIndex, purchaseOrderJobOrderNumberColumn);
			originator = purchaseOrderTree.view.getCellText(currentIndex, purchaseOrderOriginatorColumn);
			deliverTo = purchaseOrderTree.view.getCellText(currentIndex, purchaseOrderDeliverToColumn);
			priority = purchaseOrderTree.view.getCellText(currentIndex, purchaseOrderPriorityColumn);
			dateRequired = new Date(parseInt(purchaseOrderTree.view.getCellValue(currentIndex, purchaseOrderDateRequiredColumn)) * 1000);
			notes = purchaseOrderTree.view.getCellText(currentIndex, purchaseOrderNotesColumn);
			dateSubmitted = new Date(parseInt(purchaseOrderTree.view.getCellValue(currentIndex, purchaseOrderDateSubmittedColumn)) * 1000);
			dateReceived = new Date(parseInt(purchaseOrderTree.view.getCellValue(currentIndex, purchaseOrderDateReceivedColumn)) * 1000);			
			
			setForm();
			showForm();
			resetItemForm();
			
			rebuildItemTree();
			updateItemSummary();
			
			NRLOrderIt.updateMessage('purchaseorder.edit');
		}
	}
	
	/**
	 * Completes the purchase order form.
	 */
	function done()
	{
		getForm();
		
		update();
		
		rebuildTree();
		
		clear();
		
		NRLOrderIt.updateMessage('purchaseorder.done');

		hideForm();
	}
	
	/**
	 * Updates an existing purchase order in the database.
	 */
	function update()
	{
		var statement = NRLOrderIt.conn.createStatement("UPDATE purchase_orders SET " +
				"title = :title," +
				"job_order_numbers_id = :jobOrderNumbersId," +
				"companies_id = :companiesId," +
				"originator = :originator," +
				"deliver_to = :deliverTo," +
				"priority = :priority," +
				"date_required = :dateRequired," +
				"date_submitted = :dateSubmitted," +
				"date_received = :dateReceived," +
				"notes = :notes " +
				"WHERE purchase_orders_id = :purchaseOrdersId");

		statement.params.purchaseOrdersId = id;
		statement.params.title = title; 
		statement.params.jobOrderNumbersId = jobOrderNumber;
		statement.params.companiesId = company;
		statement.params.originator = originator;
		statement.params.deliverTo = deliverTo;
		statement.params.priority = priority;
				
		var timestamp = Math.round(dateRequired.getTime() / 1000);
		
		statement.params.dateRequired = timestamp;
		
		if ( isNaN(dateSubmitted.getTime()) )
		{
			statement.params.dateSubmitted = '';
		}
		else
		{
			var dateSubmittedTime = Math.round(dateSubmitted.getTime() / 1000);		
			statement.params.dateSubmitted = dateSubmittedTime;
		}
		
		if ( isNaN(dateReceived.getTime()) )
		{
			statement.params.dateReceived = '';
		}
		else
		{
			var dateReceivedTime = Math.round(dateReceived.getTime() / 1000);		
			statement.params.dateReceived = dateReceivedTime;
		}
		
		statement.params.notes = notes;
		
		statement.execute();
		statement.reset();
	}
	
	/**
	 * Removes a purchase order from the tree.
	 */
	function remove()
	{
		var purchaseOrderTree = document.getElementById('NRLOrderIt-PurchaseOrder-Tree');
		var currentIndex = purchaseOrderTree.view.selection.currentIndex;
		
		if ( currentIndex > -1 )
		{
			var purchaseOrderTitleColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-Title');	
			id = purchaseOrderTree.view.getCellValue(currentIndex, purchaseOrderTitleColumn);
			deleteFrom();
			
			NRLOrderIt.updateMessage('purchaseorder.delete');
		}
	}
	
	/**
	 * Delete the purchase order from the database.
	 */
	function deleteFrom()
	{
		var statement = NRLOrderIt.conn.createStatement("DELETE FROM purchase_orders WHERE purchase_orders_id = :purchaseOrdersId");
		
		statement.params.purchaseOrdersId = id;
		
		statement.execute();
		statement.reset();
		
		var itemStatement = NRLOrderIt.conn.createStatement("DELETE FROM items WHERE purchase_orders_id = :purchaseOrdersId");
		itemStatement.params.purchaseOrdersId = id;
		itemStatement.execute();
		itemStatement.reset();
		
		rebuildTree();
	}
	
	/**
	 * Cancels the purchase order form. This clears all fields and hides the form.
	 */
	function cancel()
	{	
		if ( editing )
		{
			editing = false;
		}
		else
		{
			deleteFrom();
			removeAllItems()
		}
		
		hideForm();
		
		NRLOrderIt.updateMessage('purchaseorder.cancel');
	}
	
	/**
	 * Resets the form. This clears all fields and removes all items.
	 */
	function reset()
	{
		var formTitle = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Title');
		var formJobOrderNumber = document.getElementById('NRLOrderIt-PurchaseOrder-Form-JobOrderNumber');
		var formCompany = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Company');
		var formOriginator = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Originator');
		var formDeliverTo = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DeliverTo');
		var formPriority = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Priority');
		var formDateRequired = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DateRequired');
		var formNotes = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Notes');
		
		formTitle.value = '';
		formJobOrderNumber.selectedIndex = 0;
		formCompany.selectedIndex = 0;
		formOriginator.value = '';
		formDeliverTo.value = '';
		formPriority.value = '';
		formDateRequired.dateValue = new Date();
		formNotes.value = '';
		
		NRLOrderIt.updateMessage('purchaseorder.reset');
	}
	
	/**
	 * Searches for a purchase order based on fuzzy logic.
	 */
	function search()
	{
		var like = document.getElementById('NRLOrderIt-PurchaseOrder-Like');
		var purchaseOrderSearch = document.getElementById('NRLOrderIt-PurchaseOrder-Search');
		var value = purchaseOrderSearch.value;
		like.textContent = "%" + (value ? value + "%" : "");
		
		rebuildTree();
	}
	
	/**
	 * Shows the purchase order form.
	 */
	function showForm()
	{
		var purchaseOrderForm = document.getElementById('NRLOrderIt-PurchaseOrder-Form');
		purchaseOrderForm.setAttribute('hidden', false);
		
		var purchaseOrders = document.getElementById('NRLOrderIt-PurchaseOrders');
		purchaseOrders.setAttribute('hidden', true);				
	}
	
	/**
	 * Hides the purchase order form.
	 */
	function hideForm()
	{
		var purchaseOrderForm = document.getElementById('NRLOrderIt-PurchaseOrder-Form');
		purchaseOrderForm.setAttribute('hidden', true);
		
		var purchaseOrders = document.getElementById('NRLOrderIt-PurchaseOrders');
		purchaseOrders.setAttribute('hidden', false);
	}
	
	/**
	 * Gets the values from the form and saves them to the member variables.
	 */
	function getForm()
	{
		var formTitle = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Title');
		var formJobOrderNumber = document.getElementById('NRLOrderIt-PurchaseOrder-Form-JobOrderNumber');
		var formCompany = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Company');
		var formOriginator = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Originator');
		var formDeliverTo = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DeliverTo');
		var formPriority = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Priority');
		var formDateRequired = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DateRequired');
		var formDateSubmitted = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DateSubmitted');
		var formSubmitted = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Submitted');
		var formDateReceived = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DateReceived');
		var formReceived = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Received');
		var formNotes = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Notes');
		
		title = formTitle.value;
		jobOrderNumber = formJobOrderNumber.value;
		company = formCompany.value;
		originator = formOriginator.value;
		deliverTo = formDeliverTo.value;
		priority = formPriority.value;
		dateRequired = formDateRequired.dateValue;
		notes = formNotes.value;
		
		if ( formSubmitted.checked )
		{
			dateSubmitted = formDateSubmitted.dateValue;
		}
		else
		{
			dateSubmitted = new Date('not set');
		}
		
		if ( formReceived.checked )
		{
			dateReceived = formDateReceived.dateValue;
		}
		else
		{
			dateReceived = new Date('not set');
		}
	}
	
	/**
	 * Sets the values of the form fields from the member variables.
	 */
	function setForm()
	{
		var formTitle = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Title');
		var formJobOrderNumber = document.getElementById('NRLOrderIt-PurchaseOrder-Form-JobOrderNumber');
		var formCompany = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Company');
		var formOriginator = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Originator');
		var formDeliverTo = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DeliverTo');
		var formPriority = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Priority');
		var formDateRequired = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DateRequired');
		var formDateSubmitted = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DateSubmitted');
		var formDateReceived = document.getElementById('NRLOrderIt-PurchaseOrder-Form-DateReceived');
		var formNotes = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Notes');
		
		formTitle.value = title;
		
		if ( !jobOrderNumber )
		{
			formJobOrderNumber.selectedIndex = 0;
		}
		else
		{
			var menuItems = formJobOrderNumber.getElementsByTagName('menuitem');
			for ( var i = 0; i < menuItems.length; i++ )
			{
				if ( menuItems[i].value == jobOrderNumber )
				{
					formJobOrderNumber.selectedItem = menuItems[i];
					break;
				}
			}
		}
		
		if ( !company )
		{
			formCompany.selectedIndex = 0;
		}
		else
		{
			var menuItems = formCompany.getElementsByTagName('menuitem');
			for ( var i = 0; i < menuItems.length; i++ )
			{
				if ( menuItems[i].value == company )
				{
					formCompany.selectedItem = menuItems[i];
					break;
				}
			}
		}
		
		formOriginator.value = originator;
		formDeliverTo.value = deliverTo;
		formPriority.value = priority;
		formDateRequired.dateValue = dateRequired;
		formNotes.value = notes;
		
		if ( isNaN(dateSubmitted.getTime()) )
		{
			var formSubmitted = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Submitted');
			formSubmitted.checked = false;
			dateSubmitted = new Date();			 
		}
		
		formDateSubmitted.dateValue = dateSubmitted;
		
		if ( isNaN(dateReceived.getTime()) )
		{
			var formReceived = document.getElementById('NRLOrderIt-PurchaseOrder-Form-Received');
			formReceived.checked = false;
			dateReceived = new Date();			 
		}
		
		formDateReceived.dateValue = dateReceived;
		
		setFormItem()
	}
	
	/**
	 * Rebuilds the tree.
	 */
	function rebuildTree()
	{
		var purchaseOrderTree = document.getElementById('NRLOrderIt-PurchaseOrder-Tree');
		purchaseOrderTree.builder.rebuild();
	}
	
	/**
	 * Adds an item to the purchase order.
	 */
	function addItem()
	{
		item.dateAdded = new Date();
		
		getFormItem();
		
		if ( item.hazmatCode > 0 )
		{
			insertItem();		
			resetItemForm();		
			rebuildItemTree();		
			updateItemSummary();
			
			NRLOrderIt.updateMessage("item.add");
		}
		else
		{
			NRLOrderIt.displayMessage('item.hazmatCode');
		}		
	}
	
	/**
	 * Inserts a new item into the database.
	 */
	function insertItem()
	{
		var statement = NRLOrderIt.conn.createStatement("INSERT INTO items (" +
				"'hazmat_codes_id'," +
				"'part_number'," +
				"'description'," +
				"'unit_of_issue'," +
				"'unit_price'," +
				"'purchase_orders_id'," +
				"'quantity'," +
				"'date_added'" +
				") VALUES (" +
				":hazmatCodesId," +
				":partNumber," +
				":description," +
				":unitOfIssue," +
				":unitPrice," +
				":purchaseOrdersId," +
				":quantity," +
				":dateAdded" +
				")");
		
		statement.params.hazmatCodesId = item.hazmatCode;
		statement.params.partNumber = item.partNumber;
		statement.params.description = item.description;
		statement.params.unitOfIssue = item.unitOfIssue;
		statement.params.unitPrice = item.unitPrice;
		statement.params.purchaseOrdersId = id;
		statement.params.quantity = item.quantity;
		statement.params.dateAdded = Math.round(item.dateAdded.getTime() / 1000);
		
		statement.execute();
		statement.reset();
	}
	
	/**
	 * Sets the form and buttons for editing an item already a part of the purchase order.
	 */
	function editItem()
	{		
		var itemTree = document.getElementById('NRLOrderIt-Item-Tree');
		var currentIndex = itemTree.view.selection.currentIndex;
		
		if ( currentIndex > -1 )
		{
			var itemPartNumberColumn = itemTree.columns.getNamedColumn('NRLOrderIt-Item-Tree-PartNumber');
			var itemDescriptionColumn = itemTree.columns.getNamedColumn('NRLOrderIt-Item-Tree-Description');
			var itemHazmatCodeColumn = itemTree.columns.getNamedColumn('NRLOrderIt-Item-Tree-HazmatCode');
			var itemUnitOfIssueColumn = itemTree.columns.getNamedColumn('NRLOrderIt-Item-Tree-UnitOfIssue');
			var itemQuantityColumn = itemTree.columns.getNamedColumn('NRLOrderIt-Item-Tree-Quantity');
			var itemUnitPriceColumn = itemTree.columns.getNamedColumn('NRLOrderIt-Item-Tree-UnitPrice');				
			
			item.id = itemTree.view.getCellValue(currentIndex, itemPartNumberColumn);
			item.partNumber = itemTree.view.getCellText(currentIndex, itemPartNumberColumn);
			item.description = itemTree.view.getCellText(currentIndex, itemDescriptionColumn);
			item.hazmatCode = itemTree.view.getCellValue(currentIndex, itemHazmatCodeColumn);	
			item.unitOfIssue = itemTree.view.getCellText(currentIndex, itemUnitOfIssueColumn);
			item.quantity = itemTree.view.getCellText(currentIndex, itemQuantityColumn);
			item.unitPrice = itemTree.view.getCellText(currentIndex, itemUnitPriceColumn);
			
			setFormItem();
					
			var addButton = document.getElementById('NRLOrderIt-Item-Form-Add')
			var updateButton = document.getElementById('NRLOrderIt-Item-Form-Update');
			addButton.hidden = true;
			updateButton.hidden = false;
			
			NRLOrderIt.updateMessage('item.edit');
		}
	}
	
	/**
	 * Updates the existing item of a purchase order. This does NOT update the database.
	 */
	function updateItem()
	{
		getFormItem();
		
		var statement = NRLOrderIt.conn.createStatement("UPDATE items SET " +
						"'part_number' = :partNumber," +
						"'description' = :description," +
						"'hazmat_codes_id' = :hazmatCodesId," +
						"'unit_of_issue' = :unitOfIssue," +
						"'quantity' = :quantity," +
						"'unit_price' = :unitPrice" +
						" WHERE items_id = :itemsId");
		
		statement.params.partNumber = item.partNumber;
		statement.params.description = item.description;
		statement.params.hazmatCodesId = item.hazmatCode;
		statement.params.unitOfIssue = item.unitOfIssue;
		statement.params.quantity = item.quantity;
		statement.params.unitPrice = item.unitPrice;
		statement.params.itemsId = item.id;
		
		statement.execute();
		statement.reset();
		
		rebuildItemTree();
		
		var addButton = document.getElementById('NRLOrderIt-Item-Form-Add')
		var updateButton = document.getElementById('NRLOrderIt-Item-Form-Update');
		addButton.hidden = false;
		updateButton.hidden = true;
		
		resetItemForm();
		
		updateItemSummary()
		
		NRLOrderIt.updateMessage('item.update');
	}
	
	/**
	 * Removes an item from the purchase order. This does NOT remove it from database.
	 */
	function removeItem()
	{
		var itemTree = document.getElementById('NRLOrderIt-Item-Tree');
		var currentIndex = itemTree.view.selection.currentIndex;
		
		if ( currentIndex > -1 )
		{
			var itemPartNumberColumn = itemTree.columns.getNamedColumn('NRLOrderIt-Item-Tree-PartNumber');				
			itemsId = itemTree.view.getCellValue(currentIndex, itemPartNumberColumn);
		
			var statement = NRLOrderIt.conn.createStatement("DELETE FROM items WHERE items_id = :itemsId");
			
			statement.params.itemsId = itemsId;
			
			statement.execute();
			
			rebuildItemTree();
			
			updateItemSummary()
			
			NRLOrderIt.updateMessage('item.remove');
		}
	}
	
	/**
	 * Removes all items from the purchase order. This does NOT remove items from the database.
	 */
	function removeAllItems()
	{
		var statement = NRLOrderIt.conn.createStatement("DELETE FROM items WHERE purchase_orders_id = :purchaseOrdersId");
		
		statement.params.purchaseOrdersId = id;
		
		statement.execute();
		
		rebuildItemTree();
		
		updateItemSummary()
		
		NRLOrderIt.updateMessage('item.removeall');
	}
	
	/**
	 * Gets an item from the from.
	 */
	function getFormItem()
	{		
		var formPartNumber = document.getElementById('NRLOrderIt-Item-Form-PartNumber');
		var formHazmatCode = document.getElementById('NRLOrderIt-Item-Form-HazmatCode');
		var formDescription = document.getElementById('NRLOrderIt-Item-Form-Description');
		var formUnitOfIssue = document.getElementById('NRLOrderIt-Item-Form-UnitOfIssue');
		var formUnitPrice = document.getElementById('NRLOrderIt-Item-Form-UnitPrice');
		var formQuantity = document.getElementById('NRLOrderIt-Item-Form-Quantity');
			
		item.partNumber = formPartNumber.value;
		item.hazmatCode = formHazmatCode.value;
		item.description = formDescription.value;
		item.unitOfIssue = formUnitOfIssue.value;
		item.unitPrice = formUnitPrice.value;
		item.quantity = formQuantity.value;
	}
	
	/**
	 * Sets the form based on the item.
	 */
	function setFormItem()
	{
		var formPartNumber = document.getElementById('NRLOrderIt-Item-Form-PartNumber');
		var formHazmatCode = document.getElementById('NRLOrderIt-Item-Form-HazmatCode');
		var formDescription = document.getElementById('NRLOrderIt-Item-Form-Description');
		var formUnitOfIssue = document.getElementById('NRLOrderIt-Item-Form-UnitOfIssue');
		var formUnitPrice = document.getElementById('NRLOrderIt-Item-Form-UnitPrice');
		var formQuantity = document.getElementById('NRLOrderIt-Item-Form-Quantity');
		
		var menuItems = formHazmatCode.getElementsByTagName('menuitem');
		for ( var i = 0; i < menuItems.length; i++ )
		{
			if ( menuItems[i].value == item.hazmatCode )
			{
				formHazmatCode.selectedItem = menuItems[i];
				break;
			}
		}
		
		formPartNumber.value = item.partNumber;
		formDescription.value = item.description;
		formUnitOfIssue.value = item.unitOfIssue;
		formUnitPrice.value = item.unitPrice;
		formQuantity.value = item.quantity;
	}
	
	/**
	 * Resets the form.
	 */
	function resetItemForm()
	{		
		var formPartNumber = document.getElementById('NRLOrderIt-Item-Form-PartNumber');
		var formHazmatCode = document.getElementById('NRLOrderIt-Item-Form-HazmatCode');
		var formDescription = document.getElementById('NRLOrderIt-Item-Form-Description');
		var formUnitOfIssue = document.getElementById('NRLOrderIt-Item-Form-UnitOfIssue');
		var formUnitPrice = document.getElementById('NRLOrderIt-Item-Form-UnitPrice');
		var formQuantity = document.getElementById('NRLOrderIt-Item-Form-Quantity');
		
		formPartNumber.value = '';
		formHazmatCode.selectedIndex = 0;
		formDescription.value = '';
		formUnitOfIssue.value = NRLOrderIt.prefs.getCharPref("default.unitofissue");;
		formUnitPrice.value = 0;
		formQuantity.value = 1;
	}
	
	/**
	 * Rebuilds the tree.
	 */
	function rebuildItemTree()
	{
		document.getElementById('purchaseOrdersId').textContent = id;
		var itemTree = document.getElementById('NRLOrderIt-Item-Tree');
		itemTree.builder.rebuild();
	}
	
	/**
	 * Updates the item summary at the bottom of the Items tab.
	 */
	function updateItemSummary()
	{
		var statement = NRLOrderIt.conn.createStatement("SELECT count(items_id) AS uniqueQuantity, SUM(quantity) as totalQuantity, SUM(quantity * unit_price) as total FROM items WHERE items.purchase_orders_id = :purchaseOrdersId");
		statement.params.purchaseOrdersId = id;

		while ( statement.executeStep() )
		{
			var itemTotal = document.getElementById('NRLOrderIt-Item-Total');
			var total = parseFloat(statement.row.total);
			
			if ( isNaN(total) )
			{
				total = 0.00;
			}
			
			itemTotal.value = total.toFixed(2);
			
			var itemTotalQuantity = document.getElementById('NRLOrderIt-Item-TotalQuantity');
			itemTotalQuantity.value = statement.row.totalQuantity;
			
			var itemUniqueQuantity = document.getElementById('NRLOrderIt-Item-UniqueQuantity');
			itemUniqueQuantity.value = statement.row.uniqueQuantity;
		}	
	}
	
	/**
	 * Creates a purchase order document in HTML.
	 */
	function generate()
	{
		var purchaseOrderTree = document.getElementById('NRLOrderIt-PurchaseOrder-Tree');
		var currentIndex = purchaseOrderTree.view.selection.currentIndex;
		
		if ( currentIndex > -1 )
		{
			var purchaseOrderTitleColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-Title');
			id = purchaseOrderTree.view.getCellValue(currentIndex, purchaseOrderTitleColumn);
	
			var statement = NRLOrderIt.conn.createStatement("SELECT title, originator, deliver_to, priority, date_required, companies.name as company, companies.address as address, phone, fax, website, job_order_numbers.job_order_number as jobOrderNumber, SUM(items.unit_price * items.quantity) as amount FROM purchase_orders OUTER LEFT JOIN items ON purchase_orders.purchase_orders_id = items.purchase_orders_id OUTER LEFT JOIN companies ON purchase_orders.companies_id = companies.companies_id OUTER LEFT JOIN job_order_numbers ON purchase_orders.job_order_numbers_id = job_order_numbers.job_order_numbers_id WHERE purchase_orders.purchase_orders_id = :purchaseOrdersId GROUP BY purchase_orders.purchase_orders_id");
			statement.params.purchaseOrdersId = id;
			statement.executeStep();
			title = statement.row.title;
			originator = statement.row.originator;
			deliverTo = statement.row.deliver_to;
			priority = statement.row.priority;
			dateRequired = new Date(parseInt(statement.row.date_required) * 1000);
			var company = statement.row.company;
			var address = statement.row.address;
			var account = statement.row.jobOrderNumber;
			var phone = statement.row.phone;
			var fax = statement.row.fax;
			var website = statement.row.website;
			amount = parseFloat(statement.row.amount).toFixed(2);
			var currentDate = new Date();
			statement.reset();
			
			var newTabBrowser = gBrowser.getBrowserForTab(gBrowser.addTab("chrome://NRLOrderIt/content/PurchaseOrderForm.html"));
			newTabBrowser.addEventListener("load", function()
			{
				var formattedDate = currentDate.getMonth() + 1 + "/" + currentDate.getDate() + "/" + currentDate.getFullYear(); 
				
				newTabBrowser.contentDocument.title = title;
				var htmlDate = newTabBrowser.contentDocument.getElementById('htmlDate');
				htmlDate.innerHTML = formattedDate; 
				
				var htmlOriginator = newTabBrowser.contentDocument.getElementById('htmlOriginator');
				htmlOriginator.innerHTML = originator;
				
				var htmlDeliverTo = newTabBrowser.contentDocument.getElementById('htmlDeliverTo');
				htmlDeliverTo.innerHTML = deliverTo;
				
				var htmlPriority = newTabBrowser.contentDocument.getElementById('htmlPriority');
				htmlPriority.innerHTML = priority;
				
				var htmlDateRequired = newTabBrowser.contentDocument.getElementById('htmlDateRequired');
				htmlDateRequired.innerHTML = (dateRequired.getMonth() + 1) + "/" + dateRequired.getDate() + "/" + dateRequired.getFullYear();
				
				var htmlTotal = newTabBrowser.contentDocument.getElementById('htmlTotal');
				htmlTotal.innerHTML = amount;
				
				var htmlJobOrderNumber = newTabBrowser.contentDocument.getElementById('htmlJobOrderNumber');
				htmlJobOrderNumber.innerHTML = account;
				
				var htmlAddress = newTabBrowser.contentDocument.getElementById('htmlAddress');
				htmlAddress.innerHTML = company + "<br/>" + address + "<br/>" + website;
				
				var htmlPhone = newTabBrowser.contentDocument.getElementById('htmlPhone');
				htmlPhone.innerHTML = phone;
				
				var htmlFax = newTabBrowser.contentDocument.getElementById('htmlFax');
				htmlFax.innerHTML = fax;
				
				var htmlSignatureTitle = newTabBrowser.contentDocument.getElementById('htmlSignatureTitle');
				htmlSignatureTitle.innerHTML = NRLOrderIt.prefs.getCharPref('default.signaturetitle');
				
				if ( NRLOrderIt.prefs.getBoolPref('general.signaturedate') )
				{
					var htmlSignatureDate = newTabBrowser.contentDocument.getElementById('htmlSignatureDate');
					htmlSignatureDate.innerHTML = formattedDate;
				}
				
				var itemStatement = NRLOrderIt.conn.createStatement("SELECT part_number, items.description, unit_of_issue, unit_price, quantity, (unit_price * quantity) as totalCost, hazmat_codes.letter as hazmatCode FROM items OUTER LEFT JOIN hazmat_codes ON items.hazmat_codes_id = hazmat_codes.hazmat_codes_id WHERE items.purchase_orders_id = :purchaseOrdersId");
				itemStatement.params.purchaseOrdersId = id;
				
				var index = 1;
				var htmlItems = newTabBrowser.contentDocument.getElementById('htmlItems');
				while ( itemStatement.executeStep() )
				{			
					var itemRow = newTabBrowser.contentDocument.createElement('tr');
					itemRow.setAttribute('class', 'items');
					var itemNumberCell = newTabBrowser.contentDocument.createElement('td');
					itemNumberCell.innerHTML = index;
					itemRow.appendChild(itemNumberCell);
					
					var itemPartNumberCell = newTabBrowser.contentDocument.createElement('td');
					itemPartNumberCell.innerHTML = itemStatement.row.part_number;
					itemRow.appendChild(itemPartNumberCell);
					
					var itemDescriptionCell = newTabBrowser.contentDocument.createElement('td');
					var description = itemStatement.row.description + ' Hazmat Code: (<span style="font-weight: bold;">' + itemStatement.row.hazmatCode + "</span>)";
					itemDescriptionCell.innerHTML = description;
					itemRow.appendChild(itemDescriptionCell);
					
					var itemUnitOfIssueCell = newTabBrowser.contentDocument.createElement('td');
					itemUnitOfIssueCell.innerHTML = itemStatement.row.unit_of_issue;
					itemRow.appendChild(itemUnitOfIssueCell);
					
					var itemQuantityCell = newTabBrowser.contentDocument.createElement('td');
					itemQuantityCell.innerHTML = itemStatement.row.quantity;
					itemRow.appendChild(itemQuantityCell);
					
					var itemUnitPriceCell = newTabBrowser.contentDocument.createElement('td');
					itemUnitPriceCell.innerHTML = parseFloat(itemStatement.row.unit_price).toFixed(2);
					itemRow.appendChild(itemUnitPriceCell);
		
					var itemTotalCostCell = newTabBrowser.contentDocument.createElement('td');
					itemTotalCostCell.setAttribute('class', 'end');
					
					var totalCost = parseFloat(itemStatement.row.totalCost);
					
					itemTotalCostCell.innerHTML = totalCost.toFixed(2);
					itemRow.appendChild(itemTotalCostCell);
					
					if ( totalCost > 2500 )
					{
						var htmlEquipmentBarCode = newTabBrowser.contentDocument.getElementById('htmlEquipmentBarCode');
						htmlEquipmentBarCode.checked = true;
					}
					
					htmlItems.appendChild(itemRow);
					index++;
				}
				
				itemStatement.reset();
				
				/*
				 * Add blank rows to the end of the form.
				 */
				var remainingRows = 14 - index;
				
				while ( remainingRows >= 0 )
				{
					var itemRow = newTabBrowser.contentDocument.createElement('tr');
					itemRow.appendChild(newTabBrowser.contentDocument.createElement('td'));
					itemRow.appendChild(newTabBrowser.contentDocument.createElement('td'));
					itemRow.appendChild(newTabBrowser.contentDocument.createElement('td'));
					itemRow.appendChild(newTabBrowser.contentDocument.createElement('td'));
					itemRow.appendChild(newTabBrowser.contentDocument.createElement('td'));
					itemRow.appendChild(newTabBrowser.contentDocument.createElement('td'));
					
					var endCell = newTabBrowser.contentDocument.createElement('td')
					endCell.setAttribute('class', 'end');
					itemRow.appendChild(endCell);
				
					htmlItems.appendChild(itemRow);
					
					remainingRows--;
				}
				
				gBrowser.tabContainer.advanceSelectedTab(1, true);
				
				NRLOrderIt.updateMessage('purchaseorder.generate');
				
				if ( NRLOrderIt.prefs.getBoolPref('general.print') )
				{					
					var printSetup = new jsPrintSetup();
					printSetup.setOption('orientation', jsPrintSetup.kPortraitOrientation);
					printSetup.setPaperSizeUnit(jsPrintSetup.kPaperSizeInches);
					printSetup.setOption('marginTop', 0.5);
					printSetup.setOption('marginBottom', 0.5);
					printSetup.setOption('marginLeft', 0.4);
					printSetup.setOption('marginRight', 0.3);
					printSetup.setOption('printBGColors', 1);
					printSetup.setOption('headerStrLeft', "");
					printSetup.setOption('headerStrCenter', "");
					printSetup.setOption('headerStrRight', "");
					printSetup.setOption('footerStrLeft', "");
					printSetup.setOption('footerStrCenter', "");
					printSetup.setOption('footerStrRight', "");
					printSetup.setOption('shrinkToFit', 1);
					printSetup.setOption('paperHeight', 11);
					printSetup.setOption('paperWidth', 8.5);
					printSetup.printWindow(newTabBrowser.contentWindow);
					
					if ( NRLOrderIt.prefs.getBoolPref('general.closeonprint') )
					{
						gBrowser.removeCurrentTab();
					}
				}
				
			}, true);						
		}
	}
	
	/**
	 * Creates a copy of the selected purchase order, including items, within the database.
	 */
	function copy()
	{
		var purchaseOrderTree = document.getElementById('NRLOrderIt-PurchaseOrder-Tree');
		var currentIndex = purchaseOrderTree.view.selection.currentIndex;
		
		if ( currentIndex > -1 )
		{
			var purchaseOrderTitleColumn = purchaseOrderTree.columns.getNamedColumn('NRLOrderIt-PurchaseOrder-Tree-Title');
			id = purchaseOrderTree.view.getCellValue(currentIndex, purchaseOrderTitleColumn);
			
			var statement = NRLOrderIt.conn.createStatement("SELECT title, originator, deliver_to, priority, date_required, companies_id, job_order_numbers_id FROM purchase_orders WHERE purchase_orders_id = :purchaseOrdersId GROUP BY purchase_orders.purchase_orders_id");
			statement.params.purchaseOrdersId = id;
			statement.executeStep();
			
			title = "Copy of " + statement.row.title;
			originator = statement.row.originator;
			deliverTo = statement.row.deliver_to;
			priority = statement.row.priority;
			dateRequired = new Date(parseInt(statement.row.date_required) * 1000);
			company = statement.row.companies_id;
			jobOrderNumber = statement.row.job_order_numbers_id;
			dateSubmitted = new Date('not set');
			dateReceived = new Date('not set');
			statement.reset();
			
			var originalId = id;
			
			insert();
			update();
			
			var itemStatement = NRLOrderIt.conn.createStatement("SELECT part_number, description, unit_of_issue, unit_price, quantity, hazmat_codes_id FROM items WHERE purchase_orders_id = :purchaseOrdersId");
			itemStatement.params.purchaseOrdersId = originalId;
			
			while ( itemStatement.executeStep() )
			{
				item.partNumber = itemStatement.row.part_number;
				item.description = itemStatement.row.description;
				item.unitOfIssue = itemStatement.row.unit_of_issue;
				item.unitPrice = itemStatement.row.unit_price;
				item.quantity = itemStatement.row.quantity;
				item.hazmatCode = itemStatement.row.hazmat_codes_id;
				
				insertItem();
			}
			
			rebuildTree();
			
			NRLOrderIt.updateMessage('purchaseorder.copy');
		}
	}
}