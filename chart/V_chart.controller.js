sap.ui.controller("chart.V_chart", {

	onInit : function(oEvent) {

		this.model = new sap.ui.model.json.JSONModel();
		this.tags = new sap.ui.model.json.JSONModel();

		// initialize model
		this.model.setData({
			data : []
		});

		this.getAvailableTags("MySchemaDummy");
		this.setSelectedMeasures();
		this.createWebSocketClient();

		var oVizFrame1 = this.getView().byId("id1");

		oVizFrame1.setVizProperties({
			general : {
				layout : {
					padding : 0.04
				}
			},
			valueAxis : {
				visible : true,
				label : {

				},
				title : {
					visible : false
				}
			},
			timeAxis : {
				title : {
					visible : false
				},
				levelConfig : {
					"year" : {
						row : 2
					}
				},
				interval : {
					unit : ''
				}
			},
			plotArea : {
				window : {
					start : Date.now(),
					end : Date.now() + 30000
				},
				dataLabel : {

					visible : false
				}
			},
			legend : {
				title : {
					visible : false
				}
			},
			title : {
				visible : false
			},
			interaction : {
				syncValueAxis : false
			}
		});

		oVizFrame1.setModel(this.model);
	},

	createWebSocketClient : function() {
		// Establish the WebSocket connection and set up event handlers
		this.webSocket = new WebSocket("ws://54.93.174.137:8001/posco");
		this.webSocket.onclose = function() {
			alert("WebSocket connection closed");
		};

		this.webSocket.onmessage = jQuery.proxy(function(msg) {
			var data = this.model.getProperty("/data");
			message = JSON.parse(msg.data);
			data.push(message);
			if (data.length > 30) {
				data.shift();
			}
			this.model.setProperty("/data", data);
		}, this);
	},

	getAvailableTags(schema) {
		this.tags.setData({
			tags : [{"name": "s1val00", "description": "Sensor 1 Value1", "selected": true },
			        {"name": "s1val01", "description": "Sensor 1 Value2" },
			        {"name": "s1val02", "description": "Sensor 1 Value3" },
			        {"name": "s1val03", "description": "Sensor 1 Value4" },
			        {"name": "s2val00", "description": "Sensor 2 Value1" },
			        {"name": "s2val01", "description": "Sensor 2 Value2" },
			        {"name": "s2val02", "description": "Sensor 2 Value3" },
			        {"name": "s2val03", "description": "Sensor 2 Value4" },
			        {"name": "s3val00", "description": "Sensor 3 Value1" },
			        {"name": "s3val01", "description": "Sensor 3 Value2" },
			        {"name": "s3val02", "description": "Sensor 3 Value3" },
			        {"name": "s3val03", "description": "Sensor 3 Value4" },
			        {"name": "s4val00", "description": "Sensor 4 Value1" },
			        {"name": "s4val01", "description": "Sensor 4 Value2" },
			        {"name": "s4val02", "description": "Sensor 4 Value3" },
			        {"name": "s4val03", "description": "Sensor 4 Value4" }]
		});
	},

	handleTagSelect(oEvent) {
		var that= this;
		var dialog = new sap.m.Dialog({
			title: 'Available Tags',
			content: new sap.m.List({
				mode: 'MultiSelect',
				includeItemInSelection: true,
				rememberSelections: true,
				items: {
					path: '/tags',
					template: new sap.m.StandardListItem({
						description: "{name}",
						title: "{description}",
						selected: "{selected}"
					})
				}
			}),
			beginButton: new sap.m.Button({
				text: 'Close',
				press: function () {
					dialog.close();
				}
			}),
			afterClose: function() {
				that.setSelectedMeasures();
				dialog.destroy();
			}
		});

		dialog.setModel(this.tags);
		// to get access to the global model
		this.getView().addDependent(dialog);
		dialog.open();
	},

	setSelectedMeasures() {
		var oVizFrame = this.getView().byId("id1");
		oVizFrame.removeAllFeeds();
		oVizFrame.getDataset().removeAllMeasures();

		// add dimension feed
		var feed = new sap.viz.ui5.controls.common.feeds.FeedItem();
		feed.setType("Dimension");
		feed.setValues("Date");
		feed.setUid("timeAxis");
		oVizFrame.addFeed(feed);

		// add measures
		var tags = this.tags.getProperty("/tags");
		for (var i=0; i < tags.length; i++) {
			if (tags[i].selected && tags[i].selected == true ) {
				var measure = new sap.viz.ui5.data.MeasureDefinition();
				measure.setName(tags[i].name);
				measure.bindProperty("value",tags[i].name);
				oVizFrame.getDataset().addMeasure(measure);

				var feed = new sap.viz.ui5.controls.common.feeds.FeedItem();
				feed.setType("Measure");
				feed.setValues(tags[i].name);
				feed.setUid("valueAxis");
				oVizFrame.addFeed(feed);
			}
		}
	}

});
