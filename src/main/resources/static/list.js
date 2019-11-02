/*! Tablesaw - v3.1.2 - 2019-03-19
 * https://github.com/filamentgroup/tablesaw
 * Copyright (c) 2019 Filament Group; Licensed MIT */
(function(root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([ "jquery" ], function(jQuery) {
			return (root.Tablesaw = factory(jQuery, root));
		});
	} else if (typeof exports === 'object') {
		if ("document" in root) {
			module.exports = factory(require('jquery'), root);
		} else {
			// special jQuery case for CommonJS (pass in a window)
			module.exports = factory(require('jquery')(root), root);
		}
	} else {
		root.Tablesaw = factory(jQuery, root);
	}
}
		(
				typeof window !== "undefined" ? window : this,
				function($, window) {
					"use strict";

					var document = window.document;

					// Account for Tablesaw being loaded either before or after
					// the DOMContentLoaded event is fired.
					var domContentLoadedTriggered = /complete|loaded/
							.test(document.readyState);
					document.addEventListener("DOMContentLoaded", function() {
						domContentLoadedTriggered = true;
					});

					var Tablesaw = {
						i18n : {
							modeStack : "Stack",
							modeSwipe : "Swipe",
							modeToggle : "Toggle",
							modeSwitchColumnsAbbreviated : "Cols",
							modeSwitchColumns : "Columns",
							columnToggleButton : "Columns",
							columnToggleError : "No eligible columns.",
							sort : "Sort",
							swipePreviousColumn : "Previous column",
							swipeNextColumn : "Next column"
						},
						// cut the mustard
						mustard : "head" in document && // IE9+, Firefox 4+,
														// Safari 5.1+, Mobile
														// Safari 4.1+, Opera
														// 11.5+, Android 2.3+
						(!window.blackberry || window.WebKitPoint) && // only
																		// WebKit
																		// Blackberry
																		// (OS
																		// 6+)
						!window.operamini,
						$ : $,
						_init : function(element) {
							Tablesaw.$(element || document).trigger(
									"enhance.tablesaw");
						},
						init : function(element) {
							// Account for Tablesaw being loaded either before
							// or after the DOMContentLoaded event is fired.
							domContentLoadedTriggered = domContentLoadedTriggered
									|| /complete|loaded/
											.test(document.readyState);
							if (!domContentLoadedTriggered) {
								if ("addEventListener" in document) {
									// Use raw DOMContentLoaded instead of
									// shoestring (may have issues in Android
									// 2.3, exhibited by stack table)
									document.addEventListener(
											"DOMContentLoaded", function() {
												Tablesaw._init(element);
											});
								}
							} else {
								Tablesaw._init(element);
							}
						}
					};

					$(document).on(
							"enhance.tablesaw",
							function() {
								// Extend i18n config, if one exists.
								if (typeof TablesawConfig !== "undefined"
										&& TablesawConfig.i18n) {
									Tablesaw.i18n = $.extend(Tablesaw.i18n,
											TablesawConfig.i18n || {});
								}

								Tablesaw.i18n.modes = [
										Tablesaw.i18n.modeStack,
										Tablesaw.i18n.modeSwipe,
										Tablesaw.i18n.modeToggle ];
							});

					if (Tablesaw.mustard) {
						$(document.documentElement).addClass(
								"tablesaw-enhanced");
					}

					(function() {
						var pluginName = "tablesaw";
						var classes = {
							toolbar : "tablesaw-bar"
						};
						var events = {
							create : "tablesawcreate",
							destroy : "tablesawdestroy",
							refresh : "tablesawrefresh",
							resize : "tablesawresize"
						};
						var defaultMode = "stack";
						var initSelector = "table";
						var initFilterSelector = "[data-tablesaw],[data-tablesaw-mode],[data-tablesaw-sortable]";
						var defaultConfig = {};

						Tablesaw.events = events;

						var Table = function(element) {
							if (!element) {
								throw new Error("Tablesaw requires an element.");
							}

							this.table = element;
							this.$table = $(element);

							// only one <thead> and <tfoot> are allowed, per the
							// specification
							this.$thead = this.$table.children()
									.filter("thead").eq(0);

							// multiple <tbody> are allowed, per the
							// specification
							this.$tbody = this.$table.children()
									.filter("tbody");

							this.mode = this.$table.attr("data-tablesaw-mode")
									|| defaultMode;

							this.$toolbar = null;

							this.attributes = {
								subrow : "data-tablesaw-subrow",
								ignorerow : "data-tablesaw-ignorerow"
							};

							this.init();
						};

						Table.prototype.init = function() {
							if (!this.$thead.length) {
								throw new Error(
										"tablesaw: a <thead> is required, but none was found.");
							}

							if (!this.$thead.find("th").length) {
								throw new Error(
										"tablesaw: no header cells found. Are you using <th> inside of <thead>?");
							}

							// assign an id if there is none
							if (!this.$table.attr("id")) {
								this.$table.attr("id", pluginName + "-"
										+ Math.round(Math.random() * 10000));
							}

							this.createToolbar();

							this._initCells();

							this.$table.data(pluginName, this);

							this.$table.trigger(events.create, [ this ]);
						};

						Table.prototype.getConfig = function(
								pluginSpecificConfig) {
							// shoestring extend doesn’t support arbitrary args
							var configs = $.extend(defaultConfig,
									pluginSpecificConfig || {});
							return $
									.extend(
											configs,
											typeof TablesawConfig !== "undefined" ? TablesawConfig
													: {});
						};

						Table.prototype._getPrimaryHeaderRow = function() {
							return this._getHeaderRows().eq(0);
						};

						Table.prototype._getHeaderRows = function() {
							return this.$thead.children().filter("tr").filter(
									function() {
										return !$(this).is(
												"[data-tablesaw-ignorerow]");
									});
						};

						Table.prototype._getRowIndex = function($row) {
							return $row.prevAll().length;
						};

						Table.prototype._getHeaderRowIndeces = function() {
							var self = this;
							var indeces = [];
							this._getHeaderRows().each(function() {
								indeces.push(self._getRowIndex($(this)));
							});
							return indeces;
						};

						Table.prototype._getPrimaryHeaderCells = function($row) {
							return ($row || this._getPrimaryHeaderRow())
									.find("th");
						};

						Table.prototype._$getCells = function(th) {
							var self = this;
							return $(th)
									.add(th.cells)
									.filter(
											function() {
												var $t = $(this);
												var $row = $t.parent();
												var hasColspan = $t
														.is("[colspan]");
												// no subrows or ignored rows
												// (keep cells in ignored rows
												// that do not have a colspan)
												return (!$row
														.is("["
																+ self.attributes.subrow
																+ "]") && (!$row
														.is("["
																+ self.attributes.ignorerow
																+ "]") || !hasColspan));
											});
						};

						Table.prototype._getVisibleColspan = function() {
							var colspan = 0;
							this._getPrimaryHeaderCells().each(
									function() {
										var $t = $(this);
										if ($t.css("display") !== "none") {
											colspan += parseInt($t
													.attr("colspan"), 10) || 1;
										}
									});
							return colspan;
						};

						Table.prototype.getColspanForCell = function($cell) {
							var visibleColspan = this._getVisibleColspan();
							var visibleSiblingColumns = 0;
							if ($cell.closest("tr").data("tablesaw-rowspanned")) {
								visibleSiblingColumns++;
							}

							$cell
									.siblings()
									.each(
											function() {
												var $t = $(this);
												var colColspan = parseInt($t
														.attr("colspan"), 10) || 1;

												if ($t.css("display") !== "none") {
													visibleSiblingColumns += colColspan;
												}
											});
							// console.log( $cell[ 0 ], visibleColspan,
							// visibleSiblingColumns );

							return visibleColspan - visibleSiblingColumns;
						};

						Table.prototype.isCellInColumn = function(header, cell) {
							return $(header).add(header.cells).filter(
									function() {
										return this === cell;
									}).length;
						};

						Table.prototype.updateColspanCells = function(cls,
								header, userAction) {
							var self = this;
							var primaryHeaderRow = self._getPrimaryHeaderRow();

							// find persistent column rowspans
							this.$table
									.find("[rowspan][data-tablesaw-priority]")
									.each(
											function() {
												var $t = $(this);
												if ($t
														.attr("data-tablesaw-priority") !== "persist") {
													return;
												}

												var $row = $t.closest("tr");
												var rowspan = parseInt($t
														.attr("rowspan"), 10);
												if (rowspan > 1) {
													$row = $row.next();

													$row
															.data(
																	"tablesaw-rowspanned",
																	true);

													rowspan--;
												}
											});

							this.$table
									.find(
											"[colspan],[data-tablesaw-maxcolspan]")
									.filter(
											function() {
												// is not in primary header row
												return $(this).closest("tr")[0] !== primaryHeaderRow[0];
											})
									.each(
											function() {
												var $cell = $(this);

												if (userAction === undefined
														|| self.isCellInColumn(
																header, this)) {
												} else {
													// if is not a user action
													// AND the cell is not in
													// the updating column, kill
													// it
													return;
												}

												var colspan = self
														.getColspanForCell($cell);

												if (cls
														&& userAction !== undefined) {
													// console.log( colspan ===
													// 0 ? "addClass" :
													// "removeClass", $cell );
													$cell[colspan === 0 ? "addClass"
															: "removeClass"]
															(cls);
												}

												// cache original colspan
												var maxColspan = parseInt(
														$cell
																.attr("data-tablesaw-maxcolspan"),
														10);
												if (!maxColspan) {
													$cell
															.attr(
																	"data-tablesaw-maxcolspan",
																	$cell
																			.attr("colspan"));
												} else if (colspan > maxColspan) {
													colspan = maxColspan;
												}

												// console.log( this, "setting
												// colspan to ", colspan );
												$cell.attr("colspan", colspan);
											});
						};

						Table.prototype._findPrimaryHeadersForCell = function(
								cell) {
							var $headerRow = this._getPrimaryHeaderRow();
							var headerRowIndex = this._getRowIndex($headerRow);
							var results = [];

							for (var rowNumber = 0; rowNumber < this.headerMapping.length; rowNumber++) {
								if (rowNumber === headerRowIndex) {
									continue;
								}

								for (var colNumber = 0; colNumber < this.headerMapping[rowNumber].length; colNumber++) {
									if (this.headerMapping[rowNumber][colNumber] === cell) {
										results
												.push(this.headerMapping[headerRowIndex][colNumber]);
									}
								}
							}

							return results;
						};

						// used by init cells
						Table.prototype.getRows = function() {
							var self = this;
							return this.$table.find("tr").filter(
									function() {
										return $(this).closest("table").is(
												self.$table);
									});
						};

						// used by sortable
						Table.prototype.getBodyRows = function(tbody) {
							return (tbody ? $(tbody) : this.$tbody).children()
									.filter("tr");
						};

						Table.prototype.getHeaderCellIndex = function(cell) {
							var lookup = this.headerMapping[0];
							for (var colIndex = 0; colIndex < lookup.length; colIndex++) {
								if (lookup[colIndex] === cell) {
									return colIndex;
								}
							}

							return -1;
						};

						Table.prototype._initCells = function() {
							// re-establish original colspans
							this.$table
									.find("[data-tablesaw-maxcolspan]")
									.each(
											function() {
												var $t = $(this);
												$t
														.attr(
																"colspan",
																$t
																		.attr("data-tablesaw-maxcolspan"));
											});

							var $rows = this.getRows();
							var columnLookup = [];

							$rows.each(function(rowNumber) {
								columnLookup[rowNumber] = [];
							});

							$rows
									.each(function(rowNumber) {
										var coltally = 0;
										var $t = $(this);
										var children = $t.children();

										children
												.each(function() {
													var colspan = parseInt(
															this
																	.getAttribute("data-tablesaw-maxcolspan")
																	|| this
																			.getAttribute("colspan"),
															10);
													var rowspan = parseInt(
															this
																	.getAttribute("rowspan"),
															10);

													// set in a previous rowspan
													while (columnLookup[rowNumber][coltally]) {
														coltally++;
													}

													columnLookup[rowNumber][coltally] = this;

													// TODO? both colspan and
													// rowspan
													if (colspan) {
														for (var k = 0; k < colspan - 1; k++) {
															coltally++;
															columnLookup[rowNumber][coltally] = this;
														}
													}
													if (rowspan) {
														for (var j = 1; j < rowspan; j++) {
															columnLookup[rowNumber
																	+ j][coltally] = this;
														}
													}

													coltally++;
												});
									});

							var headerRowIndeces = this._getHeaderRowIndeces();
							for (var colNumber = 0; colNumber < columnLookup[0].length; colNumber++) {
								for (var headerIndex = 0, k = headerRowIndeces.length; headerIndex < k; headerIndex++) {
									var headerCol = columnLookup[headerRowIndeces[headerIndex]][colNumber];

									var rowNumber = headerRowIndeces[headerIndex];
									var rowCell;

									if (!headerCol.cells) {
										headerCol.cells = [];
									}

									while (rowNumber < columnLookup.length) {
										rowCell = columnLookup[rowNumber][colNumber];

										if (headerCol !== rowCell) {
											headerCol.cells.push(rowCell);
										}

										rowNumber++;
									}
								}
							}

							this.headerMapping = columnLookup;
						};

						Table.prototype.refresh = function() {
							this._initCells();

							this.$table.trigger(events.refresh, [ this ]);
						};

						Table.prototype._getToolbarAnchor = function() {
							var $parent = this.$table.parent();
							if ($parent.is(".tablesaw-overflow")) {
								return $parent;
							}
							return this.$table;
						};

						Table.prototype._getToolbar = function($anchor) {
							if (!$anchor) {
								$anchor = this._getToolbarAnchor();
							}
							return $anchor.prev().filter("." + classes.toolbar);
						};

						Table.prototype.createToolbar = function() {
							// Insert the toolbar
							// TODO move this into a separate component
							var $anchor = this._getToolbarAnchor();
							var $toolbar = this._getToolbar($anchor);
							if (!$toolbar.length) {
								$toolbar = $("<div>").addClass(classes.toolbar)
										.insertBefore($anchor);
							}
							this.$toolbar = $toolbar;

							if (this.mode) {
								this.$toolbar.addClass("tablesaw-mode-"
										+ this.mode);
							}
						};

						Table.prototype.destroy = function() {
							// Don’t remove the toolbar, just erase the classes
							// on it.
							// Some of the table features are not yet
							// destroy-friendly.
							this
									._getToolbar()
									.each(
											function() {
												this.className = this.className
														.replace(
																/\btablesaw-mode\-\w*\b/gi,
																"");
											});

							var tableId = this.$table.attr("id");
							$(document).off("." + tableId);
							$(window).off("." + tableId);

							// other plugins
							this.$table.trigger(events.destroy, [ this ]);

							this.$table.removeData(pluginName);
						};

						// Collection method.
						$.fn[pluginName] = function() {
							return this.each(function() {
								var $t = $(this);

								if ($t.data(pluginName)) {
									return;
								}

								new Table(this);
							});
						};

						var $doc = $(document);
						$doc.on("enhance.tablesaw", function(e) {
							// Cut the mustard
							if (Tablesaw.mustard) {
								var $target = $(e.target);
								if ($target.parent().length) {
									$target = $target.parent();
								}

								$target.find(initSelector).filter(
										initFilterSelector)[pluginName]();
							}
						});

						// Avoid a resize during scroll:
						// Some Mobile devices trigger a resize during scroll
						// (sometimes when
						// doing elastic stretch at the end of the document or
						// from the
						// location bar hide)
						var isScrolling = false;
						var scrollTimeout;
						$doc.on("scroll.tablesaw", function() {
							isScrolling = true;

							window.clearTimeout(scrollTimeout);
							scrollTimeout = window.setTimeout(function() {
								isScrolling = false;
							}, 300); // must be greater than the resize
										// timeout below
						});

						var resizeTimeout;
						$(window).on("resize", function() {
							if (!isScrolling) {
								window.clearTimeout(resizeTimeout);
								resizeTimeout = window.setTimeout(function() {
									$doc.trigger(events.resize);
								}, 150); // must be less than the scrolling
											// timeout above.
							}
						});

						Tablesaw.Table = Table;
					})();

					(function() {
						var classes = {
							stackTable : "tablesaw-stack",
							cellLabels : "tablesaw-cell-label",
							cellContentLabels : "tablesaw-cell-content"
						};

						var data = {
							key : "tablesaw-stack"
						};

						var attrs = {
							labelless : "data-tablesaw-no-labels",
							hideempty : "data-tablesaw-hide-empty"
						};

						var Stack = function(element, tablesaw) {
							this.tablesaw = tablesaw;
							this.$table = $(element);

							this.labelless = this.$table.is("["
									+ attrs.labelless + "]");
							this.hideempty = this.$table.is("["
									+ attrs.hideempty + "]");

							this.$table.data(data.key, this);
						};

						Stack.prototype.init = function() {
							this.$table.addClass(classes.stackTable);

							if (this.labelless) {
								return;
							}

							var self = this;

							this.$table
									.find("th, td")
									.filter(
											function() {
												return !$(this)
														.closest("thead").length;
											})
									.filter(
											function() {
												return (!$(this).is(
														"[" + attrs.labelless
																+ "]")
														&& !$(this)
																.closest("tr")
																.is(
																		"["
																				+ attrs.labelless
																				+ "]") && (!self.hideempty || !!$(
														this).html()));
											})
									.each(
											function() {
												var $newHeader = $(
														document
																.createElement("b"))
														.addClass(
																classes.cellLabels);
												var $cell = $(this);

												$(
														self.tablesaw
																._findPrimaryHeadersForCell(this))
														.each(
																function(index) {
																	var $header = $(this
																			.cloneNode(true));
																	// TODO
																	// decouple
																	// from
																	// sortable
																	// better
																	// Changed
																	// from
																	// .text()
																	// in
																	// https://github.com/filamentgroup/tablesaw/commit/b9c12a8f893ec192830ec3ba2d75f062642f935b
																	// to
																	// preserve
																	// structural
																	// html in
																	// headers,
																	// like <a>
																	var $sortableButton = $header
																			.find(".tablesaw-sortable-btn");
																	$header
																			.find(
																					".tablesaw-sortable-arrow")
																			.remove();

																	// TODO
																	// decouple
																	// from
																	// checkall
																	// better
																	var $checkall = $header
																			.find("[data-tablesaw-checkall]");
																	$checkall
																			.closest(
																					"label")
																			.remove();
																	if ($checkall.length) {
																		$newHeader = $([]);
																		return;
																	}

																	if (index > 0) {
																		$newHeader
																				.append(document
																						.createTextNode(", "));
																	}

																	var parentNode = $sortableButton.length ? $sortableButton[0]
																			: $header[0];
																	var el;
																	while ((el = parentNode.firstChild)) {
																		$newHeader[0]
																				.appendChild(el);
																	}
																});

												if ($newHeader.length
														&& !$cell
																.find("."
																		+ classes.cellContentLabels).length) {
													$cell
															.wrapInner("<span class='"
																	+ classes.cellContentLabels
																	+ "'></span>");
												}

												// Update if already exists.
												var $label = $cell.find("."
														+ classes.cellLabels);
												if (!$label.length) {
													$cell
															.prepend(document
																	.createTextNode(" "));
													$cell.prepend($newHeader);
												} else {
													// only if changed
													$label
															.replaceWith($newHeader);
												}
											});
						};

						Stack.prototype.destroy = function() {
							this.$table.removeClass(classes.stackTable);
							this.$table.find("." + classes.cellLabels).remove();
							this.$table.find("." + classes.cellContentLabels)
									.each(
											function() {
												$(this).replaceWith(
														$(this.childNodes));
											});
						};

						// on tablecreate, init
						$(document).on(
								Tablesaw.events.create,
								function(e, tablesaw) {
									if (tablesaw.mode === "stack") {
										var table = new Stack(tablesaw.table,
												tablesaw);
										table.init();
									}
								})
								.on(
										Tablesaw.events.refresh,
										function(e, tablesaw) {
											if (tablesaw.mode === "stack") {
												$(tablesaw.table)
														.data(data.key).init();
											}
										}).on(
										Tablesaw.events.destroy,
										function(e, tablesaw) {
											if (tablesaw.mode === "stack") {
												$(tablesaw.table)
														.data(data.key)
														.destroy();
											}
										});

						Tablesaw.Stack = Stack;
					})();

					return Tablesaw;
				}));

function request() {
	const Http = new XMLHttpRequest();
	var start = 0;
	var totalPrice = parseFloat(start);
	// var url = "http://35.246.83.29:9002/showall";
	var url = "http://35.246.83.29:9002/showall";
	Http.open("GET", url);
	var id = 0;
	Http.onreadystatechange = function(e) {
		if (Http.readyState == 4) {
			console.log(JSON.parse(Http.responseText));
			data = JSON.parse(Http.responseText);
			$("#list1 tbody tr").remove();
			var tableRef = document.getElementById('list1')
					.getElementsByTagName('tbody')[0];

			var headerRow = list1.insertRow(0);
			var cell = headerRow.insertCell(0);
			cell.width = "120px";
			cell.innerHTML = "<b>Item</b>";
			var cell2 = headerRow.insertCell(1);
			cell2.width = "120px";
			cell2.innerHTML = "<b>Quantity</b>";
			var cell3 = headerRow.insertCell(2);
			cell3.width = "120px";
			cell3.innerHTML = "<b>Price</b>";
			var cell4 = headerRow.insertCell(3);
			cell4.width = "120px";
			cell4.innerHTML = "<b>Total</b>";
			var cell5 = headerRow.insertCell(4);
			cell5.width = "120px";
			cell5.innerHTML = "<b>Purchased</b>";
			var cell6 = headerRow.insertCell(5);
			cell6.width = "120px";
			cell6.innerHTML = "<b></b>";
			var cell7 = headerRow.insertCell(6);
			cell7.width = "1px";
			cell7.innerHTML = "<b></b>";
			// var cell8 = headerRow.insertCell(7);
			// cell8.innerHTML = "<b></b>";
			// cell.className ="body";
			// cell2.className ="body";
			// cell3.className ="body";
			// cell4.className ="body";
			// cell5.className ="body";
			// cell6.className ="body";
			// cell7.className ="body";
			// cell8.className ="body";

			data
					.forEach(function(loop) {
						if (checkHide.checked == false) {

							var tableRef = document.getElementById('list1')
									.getElementsByTagName('tbody')[0];
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
							// a1.className ="body";
							t1.innerHTML = loop.item;
							t1.contentEditable = true;
							a1.appendChild(t1);

							var a2 = newRow.insertCell(1);
							var t2 = document.createElement("span");
							// a2.className ="body";
							t2.innerHTML = loop.quantity;
							t2.contentEditable = true;
							a2.appendChild(t2);

							var a3 = newRow.insertCell(2);
							var t3 = document.createElement("span");
							// a3.className ="body";
							t3.innerHTML = "£" + loop.price;
							t3.contentEditable = true;
							a3.appendChild(t3);

							var a4 = newRow.insertCell(3);
							var t4 = document.createElement("span");
							// a4.className ="body";
							t4.innerHTML = "£" + loop.total;
							t4.contentEditable = false;
							a4.appendChild(t4);

							var a5 = newRow.insertCell(4);
							var t5 = document.createElement('input');
							// a5.className ="body";
							t5.style.textAlign = "center";
							t5.type = 'checkbox';
							t5.className = "toggle";

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
								var updateJSON = JSON.stringify(updatedItem);
								$.ajax({
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
							// a6.className ="body";
							var t6 = document.createElement('button');
							t6.className = 'btn btn-primary w-100';
							var t6a = document.createElement('span');
							t6a.className = 'glyphicon glyphicon-refresh';
							t6.appendChild(t6a);
							t6.id = idEdi;
							t6.addEventListener('click', function() {
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
								var updateJSON = JSON.stringify(updatedItem);
								$.ajax({
									type : "PUT",
									url : "http://35.246.83.29:9002/updateItem",
									contentType : "application/json",
									data : updateJSON,
									dataType : 'json',
									complete : function(data) {
										request();
									}
								});
							});
							a6.appendChild(t6);

							// var a8 = newRow.insertCell(6);
							var t7a = document.createElement('span');
							t7a.innerHTML = "    ";
							a6.appendChild(t7a);

							var t8 = document.createElement('button');
							// a8.className ="body";
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
							a6.appendChild(t8);
							var a7 = newRow.insertCell(6);
							// a7.className ="body";
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
								var tableRef = document.getElementById('list1')
										.getElementsByTagName('tbody')[0];
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
								// a1.className ="body";
								t1.innerHTML = loop.item;
								t1.contentEditable = true;
								a1.appendChild(t1);

								var a2 = newRow.insertCell(1);
								var t2 = document.createElement("span");
								// a2.className ="body";
								t2.innerHTML = loop.quantity;
								t2.contentEditable = true;
								a2.appendChild(t2);

								var a3 = newRow.insertCell(2);
								var t3 = document.createElement("span");
								// a3.className ="body";
								t3.innerHTML = "£" + loop.price;
								t3.contentEditable = true;
								a3.appendChild(t3);

								var a4 = newRow.insertCell(3);
								var t4 = document.createElement("span");
								// a4.className ="body";
								t4.innerHTML = "£" + loop.total;
								t4.contentEditable = false;
								a4.appendChild(t4);

								var a5 = newRow.insertCell(4);
								var t5 = document.createElement('input');
								// a5.className ="body";
								t5.style.textAlign = "center";
								t5.type = 'checkbox';
								t5.className = "toggle";

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
								// a6.className ="body";
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

								// var a8 = newRow.insertCell(6);
								var t7a = document.createElement('span');
								t7a.innerHTML = "    ";
								a6.appendChild(t7a);

								var t8 = document.createElement('button');
								// a8.className ="body";
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
								a6.appendChild(t8);
								var a7 = newRow.insertCell(6);
								// a7.className ="body";
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
			t1.className = "form-control";
			t1.placeholder = "Enter New Item";
			t1.id = "newItem";
			a1.appendChild(t1);

			var a2 = newRow.insertCell(1);
			var t2 = document.createElement('input');
			t2.type = 'text';
			t2.className = "form-control";
			t2.placeholder = "Enter Quantity";
			t2.id = "newQuantity";
			a2.appendChild(t2);

			var a3 = newRow.insertCell(2);
			var t3 = document.createElement('input');
			t3.type = 'text';
			t3.className = "form-control";
			t3.placeholder = "Enter Price";
			t3.id = "newPrice";
			a3.appendChild(t3);

			var a4 = newRow.insertCell(3);
			var t4 = document.createElement('submit');
			// t4.type = 'submit';
			var t4a = document.createElement('span');
			t4a.className = 'glyphicon glyphicon-plus';
			t4.appendChild(t4a);

			// t4.innerHTML = "Add new item";
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
				if (item == "") {
					alert("Item name is missing!");
					return false;
				} else if (item.length > 30) {
					alert("Item name cannot be longer than 30 characters");
					return false;
				} else if (quantity == "") {
					alert("Quantity is missing!");
					return false;
				} else if (!(quantity.match(numbers))) {
					alert("Numbers only!");
					return false;
				} else if (qInt > 999) {
					alert("The maximum quantity is 999");
					return false;
				} else if (qInt < 0) {
					alert("The minimum quantity is 1");
					return false;
				} else if (!(quantity.match(numbers2))) {
					alert("Quantity must be a whole number!");
					return false;
				} else if (price == "") {
					alert("Price is missing!");
					return false;
				} else if (price > 999.99) {
					alert("The maximum price is £999.99!");
					return false;
				} else if (price <= 0.01) {
					alert("The minimum price is £0.01");
					return false;
				} else if (!(price.match(numbers))) {
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