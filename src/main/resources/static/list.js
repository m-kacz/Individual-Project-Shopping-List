
function request() {
		const Http = new XMLHttpRequest();
		var start = 0;
		var totalPrice = parseFloat(start);
		var url = "http://35.246.83.29:9002/showall";
		Http.open("GET", url);
		var id = 0;
		Http.onreadystatechange = function(e) {
			if (Http.readyState == 4) {
				console.log(JSON.parse(Http.responseText));
				data = JSON.parse(Http.responseText);
				$("#list1 tbody tr").remove();
				var tableRef = document.getElementById('list1').getElementsByTagName('tbody')[0];

				var headerRow = list1.insertRow(0);
				var cell = headerRow.insertCell(0);
				cell.innerHTML = "<b>Item</b>";
				var cell2 = headerRow.insertCell(1);
				cell2.innerHTML = "<b>Quantity</b>";
				var cell3 = headerRow.insertCell(2);
				cell3.innerHTML = "<b>Price</b>";
				var cell4 = headerRow.insertCell(3);
				cell4.innerHTML = "<b>Total</b>";
				var cell5 = headerRow.insertCell(4);
				cell5.innerHTML = "<b>Purchased</b>";
				var cell6 = headerRow.insertCell(5);
				cell6.innerHTML = "<b></b>";
				var cell7 = headerRow.insertCell(6);
				cell7.innerHTML = "<b></b>";
				var cell8 = headerRow.insertCell(7);
				cell8.innerHTML = "<b></b>";

				data.forEach(function(loop) {
							if (checkHide.checked == false) {

								var tableRef = document.getElementById('list1').getElementsByTagName('tbody')[0];
								var newRow = tableRef.insertRow(list1.rows.length);
								var idName = id + "n";
								var idI = id + "i";
								var idQ = id + "q";
								var idP = id + "p";
								var idT = id + "t";
								var idPur = id + "pur";
								var idChe = id + "c";
								var idEdi = id;
								var idDel = id + "1";

								var newRow = list1.insertRow();
								newRow.id = "myTr";

								var a1 = newRow.insertCell(0);
								var t1 = document.createElement("span");
								t1.innerHTML = loop.item;
								t1.contentEditable = true;
								a1.appendChild(t1);

								var a2 = newRow.insertCell(1);
								var t2 = document.createElement("span");
								t2.innerHTML = loop.quantity;
								t2.contentEditable = true;
								a2.appendChild(t2);

								var a3 = newRow.insertCell(2);
								var t3 = document.createElement("span");
								t3.innerHTML = "£" + loop.price;
								t3.contentEditable = true;
								a3.appendChild(t3);

								var a4 = newRow.insertCell(3);
								var t4 = document.createElement("span");
								t4.innerHTML = "£" + loop.total;
								t4.contentEditable = false;
								a4.appendChild(t4);

								var a5 = newRow.insertCell(4);
								var t5 = document.createElement('input');
								t5.type = 'checkbox';
								t5.className="toggle";

								t5.checked = loop.purchased;
								t5.onclick = function() {
									console.log(t1.innerHTML);
									console.log(t2.innerHTML);
									console.log(t3.innerHTML);
									console.log(t4.innerHTML);
									console.log(t5.checked);
									var id = document.getElementById(idName).value;
									var item = t1.innerHTML;
									var quantity = t2.innerHTML;
									var price = (t3.innerHTML).substr(1);
									var total = (t4.innerHTML).substr(1);
									var newTot = quantity * price;
									console.log(price);
									console.log(total);
									var purchased = t5.checked;
									var updatedItem = new Object();
									updatedItem.id = id;
									updatedItem.item = item;
									updatedItem.quantity = quantity;
									updatedItem.price = price;
									updatedItem.total = newTot;
									updatedItem.purchased = purchased;
									var updateJSON = JSON
											.stringify(updatedItem);
									$
											.ajax({
												type : "PUT",
												url : "http://35.246.83.29:9002/updateItem",
												contentType : "application/json",
												data : updateJSON,
												dataType : 'json',
												complete : function(data) {
													request();
												}
											});
								}
								t5.id = idPur;
								a5.appendChild(t5);

								var a6 = newRow.insertCell(5);
								var t6 = document.createElement('button');
								t6.className = 'btn btn-primary w-100';
								var t6a = document.createElement('span');
								t6a.className = 'glyphicon glyphicon-refresh';
								t6.appendChild(t6a);
								t6.id = idEdi;
								t6
										.addEventListener(
												'click',
												function() {
													console.log(t1.innerHTML);
													console.log(t2.innerHTML);
													console.log(t3.innerHTML);
													console.log(t4.innerHTML);
													console.log(t5.checked);
													var id = document
															.getElementById(idName).value;
													var item = t1.innerHTML;
													var quantity = t2.innerHTML;
													var price = (t3.innerHTML)
															.substr(1);
													var total = (t4.innerHTML)
															.substr(1);
													var newTot = quantity
															* price;
													console.log(price);
													console.log(total);
													var purchased = t5.checked;
													var updatedItem = new Object();
													updatedItem.id = id;
													updatedItem.item = item;
													updatedItem.quantity = quantity;
													updatedItem.price = price;
													updatedItem.total = newTot;
													updatedItem.purchased = purchased;
													var updateJSON = JSON
															.stringify(updatedItem);
													$
															.ajax({
																type : "PUT",
																url : "http://35.246.83.29:9002/updateItem",
																contentType : "application/json",
																data : updateJSON,
																dataType : 'json',
																complete : function(
																		data) {
																	request();
																}
															});
												});
								a6.appendChild(t6);
								
								var a8 = newRow.insertCell(6);
								var t8 = document.createElement('button');
								t8.className = 'btn btn-danger w-100';
								var t8a = document.createElement('span');
								t8a.className = 'glyphicon glyphicon-remove';
								t8.appendChild(t8a);
								t8.id = idDel;
								t8
										.addEventListener(
												'click',
												function() {
													console
															.log("pressed"
																	+ document
																			.getElementById(idName).value);
													var Http3 = new XMLHttpRequest();
													Http3
															.open(
																	"DELETE",
																	'http://35.246.83.29:9002/deleteRecord/'
																			+ document
																					.getElementById(idName).value);
													Http3.setRequestHeader(
															"Content-Type",
															"application/json");
													Http3.onload = function() {
														request();
													}
													Http3.send();
													return false;
												});
								a8.appendChild(t8);
								var a7 = newRow.insertCell(7);
								var t7 = document.createElement('input');
								t7.type = 'text';
								t7.value = loop.id;
								t7.id = idName;
								t7.style.display = "none";
								a7.appendChild(t7);

								var t4total = parseFloat(loop.total);
								totalPrice = totalPrice + t4total;
								id = id + 1;
								console.log("id=" + id);
							} else {

								if (loop.purchased == false) {
									var tableRef = document.getElementById(
											'list1').getElementsByTagName(
											'tbody')[0];
									var newRow = tableRef
											.insertRow(list1.rows.length);
									var idName = id + "n";
									var idI = id + "i";
									var idQ = id + "q";
									var idP = id + "p";
									var idT = id + "t";
									var idPur = id + "pur";
									var idChe = id + "c";
									var idEdi = id;
									var idDel = id + "1";

									var newRow = list1.insertRow();
									newRow.id = "myTr";

									var a1 = newRow.insertCell(0);
									var t1 = document.createElement("span");
									t1.innerHTML = loop.item;
									t1.contentEditable = true;
									a1.appendChild(t1);

									var a2 = newRow.insertCell(1);
									var t2 = document.createElement("span");
									t2.innerHTML = loop.quantity;
									t2.contentEditable = true;
									a2.appendChild(t2);

									var a3 = newRow.insertCell(2);
									var t3 = document.createElement("span");
									t3.innerHTML = "£" + loop.price;
									t3.contentEditable = true;
									a3.appendChild(t3);

									var a4 = newRow.insertCell(3);
									var t4 = document.createElement("span");
									t4.innerHTML = "£" + loop.total;
									t4.contentEditable = false;
									a4.appendChild(t4);

									var a5 = newRow.insertCell(4);
									var t5 = document.createElement('input');
									t5.type = 'checkbox';
									t5.className="toggle";

									t5.checked = loop.purchased;
									t5.onclick = function() {
										console.log(t1.innerHTML);
										console.log(t2.innerHTML);
										console.log(t3.innerHTML);
										console.log(t4.innerHTML);
										console.log(t5.checked);
										var id = document.getElementById(idName).value;
										var item = t1.innerHTML;
										var quantity = t2.innerHTML;
										var price = (t3.innerHTML).substr(1);
										var total = (t4.innerHTML).substr(1);
										var newTot = quantity * price;
										console.log(price);
										console.log(total);
										var purchased = t5.checked;
										var updatedItem = new Object();
										updatedItem.id = id;
										updatedItem.item = item;
										updatedItem.quantity = quantity;
										updatedItem.price = price;
										updatedItem.total = newTot;
										updatedItem.purchased = purchased;
										var updateJSON = JSON
												.stringify(updatedItem);
										$
												.ajax({
													type : "PUT",
													url : "http://35.246.83.29:9002/updateItem",
													contentType : "application/json",
													data : updateJSON,
													dataType : 'json',
													complete : function(data) {
														request();
													}
												});
									}
									t5.id = idPur;
									a5.appendChild(t5);

									var a6 = newRow.insertCell(5);
									var t6 = document.createElement('button');
									t6.className = 'btn btn-primary w-100';
									var t6a = document.createElement('span');
									t6a.className = 'glyphicon glyphicon-refresh';
									t6.appendChild(t6a);				
									t6.id = idEdi;
									t6
											.addEventListener(
													'click',
													function() {
														console
																.log(t1.innerHTML);
														console
																.log(t2.innerHTML);
														console
																.log(t3.innerHTML);
														console
																.log(t4.innerHTML);
														console.log(t5.checked);
														var id = document
																.getElementById(idName).value;
														var item = t1.innerHTML;
														var quantity = t2.innerHTML;
														var price = (t3.innerHTML)
																.substr(1);
														var total = (t4.innerHTML)
																.substr(1);
														var newTot = quantity
																* price;
														console.log(price);
														console.log(total);
														var purchased = t5.checked;
														var updatedItem = new Object();
														updatedItem.id = id;
														updatedItem.item = item;
														updatedItem.quantity = quantity;
														updatedItem.price = price;
														updatedItem.total = newTot;
														updatedItem.purchased = purchased;
														var updateJSON = JSON
																.stringify(updatedItem);
														$
																.ajax({
																	type : "PUT",
																	url : "http://35.246.83.29:9002/updateItem",
																	contentType : "application/json",
																	data : updateJSON,
																	dataType : 'json',
																	complete : function(
																			data) {
																		request();
																	}
																});

													});
									a6.appendChild(t6);

									var a8 = newRow.insertCell(6);
									var t8 = document.createElement('button');
									t8.className = 'btn btn-danger w-100';
									var t8a = document.createElement('span');
									t8a.className = 'glyphicon glyphicon-remove';
									t8.appendChild(t8a);
									t8.id = idDel;
									t8
											.addEventListener(
													'click',
													function() {
														var Http3 = new XMLHttpRequest();
														Http3
																.open(
																		"DELETE",
																		'http://35.246.83.29:9002/deleteRecord/'
																				+ document
																						.getElementById(idName).value);
														Http3
																.setRequestHeader(
																		"Content-Type",
																		"application/json");
														Http3.onload = function() {
															request();
														}
														Http3.send();
														return false;
													});
									a8.appendChild(t8);
									var a7 = newRow.insertCell(7);
									var t7 = document.createElement('input');
									t7.type = 'text';
									t7.value = loop.id;
									t7.id = idName;
									t7.style.display = "none";
									a7.appendChild(t7);

									var t4total = parseFloat(loop.total);
									totalPrice = totalPrice + t4total;
									id = id + 1;
									console.log("id=" + id);
								}
							}
						});
				var newRow0 = list1.insertRow();
				newRow0.id = "myTr0";

				var a1 = newRow0.insertCell(0);
				var t1 = document.createTextNode("");
				a1.appendChild(t1);

				var a2 = newRow0.insertCell(1);
				var t2 = document.createTextNode("");
				a2.appendChild(t2);

				var a3 = newRow0.insertCell(2);
				var t3 = document.createTextNode("Total:");
				a3.appendChild(t3);

				var a4 = newRow0.insertCell(3);
				var t4 = document.createTextNode("£" + totalPrice);
				a4.appendChild(t4);

				var a5 = newRow0.insertCell(4);
				var t5 = document.createTextNode("");
				a5.appendChild(t5);

				var a6 = newRow0.insertCell(5);
				var t6 = document.createTextNode("");
				a6.appendChild(t6);

				var a7 = newRow0.insertCell(6);
				var t7 = document.createTextNode("");
				a7.appendChild(t7);

				var newRow = list1.insertRow();
				newRow.id = "myTr";
				
				var a1 = newRow.insertCell(0);
				var t1 = document.createElement('input');
				t1.type = 'text';
				t1.placeholder = "Enter New Item";
				t1.id = "newItem";
				a1.appendChild(t1);

				var a2 = newRow.insertCell(1);
				var t2 = document.createElement('input');
				t2.type = 'text';
				t2.placeholder = "Enter Quantity";
				t2.id = "newQuantity";
				a2.appendChild(t2);

				var a3 = newRow.insertCell(2);
				var t3 = document.createElement('input');
				t3.type = 'text';
				t3.placeholder = "Enter Price";
				t3.id = "newPrice";
				a3.appendChild(t3);

				var a4 = newRow.insertCell(3);
				var t4 = document.createElement('submit');
				//t4.type = 'submit';
				var t4a = document.createElement('span');
				t4a.className = 'glyphicon glyphicon-plus';
				t4.appendChild(t4a);
							
				//t4.innerHTML = "Add new item";
				t4.addEventListener('click', function() {
					var item = newItem.value;
					var quantity = newQuantity.value;
					var qInt = parseFloat(quantity);
					var numbers = /^[0-9.]+$/;
					var numbers2 = /^[0-9]+$/;
					var price = newPrice.value;
					var pInt = parseFloat(price);
					var total = newQuantity.value * newPrice.value;
					var purchased = "false";
					if(item == ""){
						alert("Item name is missing!");
						return false;
					}
					else if(item.length>30){
						alert("Item name cannot be longer than 30 characters");
						return false;
					}
					else if(quantity == ""){
						alert("Quantity is missing!");
						return false;
					}
					else if(!(quantity.match(numbers))){
						alert("Numbers only!");
						return false;
					}
					else if(qInt>999){
						alert("The maximum quantity is 999");
						return false;
					}
					else if(qInt<0){
						alert("The minimum quantity is 1");
						return false;
					}
					else if(!(quantity.match(numbers2))){
						alert("Quantity must be a whole number!");
						return false;
					}
					else if(price == ""){
						alert("Price is missing!");
						return false;
					}
					else if(price>999.99){
						alert("The maximum price is £999.99!");
						return false;
					}
					else if(price<=0.01){
						alert("The minimum price is £0.01");
						return false;
					}
					else if(!(price.match(numbers))){
						alert("Numbers only!");
						return false;
					}
					var addNew = new Object();
					addNew.item = item;
					addNew.quantity = quantity;
					addNew.price = price;
					addNew.total = total;
					addNew.purchased = purchased;
					var addNewJSON = JSON.stringify(addNew);
					console.log(addNewJSON);

					$.ajax({
						type : "POST",
						url : "http://35.246.83.29:9002/save",
						contentType : "application/json",
						data : addNewJSON,
						dataType : 'json',
						complete : function(data) {
							request();
						}
					});
				});
				t4.id = "newItemButton";
				t4.className = 'btn btn-success w-100';
				a4.appendChild(t4);
			}
		}
		Http.send();
	}