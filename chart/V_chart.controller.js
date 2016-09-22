sap.ui.controller("chart.V_chart", {

	onInit : function(oEvent) {

		this.tags = new sap.ui.model.json.JSONModel();

		// initialize model
		var model = new sap.ui.model.json.JSONModel();
		model.setData({
			data : []
		});

		this.getAvailableTags("MySchemaDummy");
		var oVizFrame = this.getView().byId("id1");
        this.setFrameProperties(oVizFrame);
		oVizFrame.setModel(model);
		this.updateWebSocketClient();
		this.setSelectedMeasures();
	},

	updateWebSocketClient : function() {
		that = this;
		// Establish the WebSocket connection and set up event handlers
		//this.webSocket = new WebSocket("ws://localhost:4567/echo/?selectedSensors=" + this.getSelectedSensors());
		this.webSocket = new WebSocket("ws://52.59.224.66:8001/posco?selectedSensors=" + this.getSelectedSensors());
		this.webSocket.onclose = function() {
			//alert("WebSocket connection closed");
		};

		this.webSocket.onmessage = jQuery.proxy(function(msg) {
			message = JSON.parse(msg.data);

			var tags = this.tags.getProperty("/tags");
			for (var i=0; i < tags.length; i++) {
				if (tags[i].selected && tags[i].selected == true && tags[i].name == message.sensor) {
					var oModel = that.getView().byId("id1").getModel();
					data = oModel.getProperty("/data");
					data.push(message);
					if (data.length > 500) {
						data.shift();
					}
					oModel.updateBindings();
				}
			}
			this.startDate = message.timestamp-10000;
			this.endDate = "lastDataPoint";
			this.getView().byId("id1").setVizProperties({plotArea:{
			window:{start: this.startDate, end: this.endDate }}});
			this.getView().byId("id1").setVizScales({scales:{
			timeAxis:{start: this.startDate, end: this.endDate }}});
		}, this);
	},

	getAvailableTags(schema) {
		this.tags.setData({
			tags : [{"name": "s1val0", "description": "Sensor 1 Value1", "selected": true },
			        {"name": "s1val1", "description": "Sensor 1 Value2", "selected": true },
			        {"name": "s1val2", "description": "Sensor 1 Value3", "selected": true },
			        {"name": "s1val3", "description": "Sensor 1 Value4"},
			        {"name": "s2val0", "description": "Sensor 2 Value1"},
			        {"name": "s2val1", "description": "Sensor 2 Value2"},
			        {"name": "s2val2", "description": "Sensor 2 Value3"},
			        {"name": "s2val3", "description": "Sensor 2 Value4"},
			        {"name": "s3val0", "description": "Sensor 3 Value1"},
			        {"name": "s3val1", "description": "Sensor 3 Value2"},
			        {"name": "s3val2", "description": "Sensor 3 Value3"},
			        {"name": "s3val3", "description": "Sensor 3 Value4"},
			        {"name": "s4val0", "description": "Sensor 4 Value1"},
			        {"name": "s4val1", "description": "Sensor 4 Value2"},
			        {"name": "s4val2", "description": "Sensor 4 Value3"},
			        {"name": "s4val3", "description": "Sensor 4 Value4"}]
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
				that.webSocket.close();
				that.updateWebSocketClient();
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

		// add dimension feeds
		var feed = new sap.viz.ui5.controls.common.feeds.FeedItem();
		feed.setType("Dimension");
		feed.setValues("Date");
		feed.setUid("timeAxis");
		oVizFrame.addFeed(feed);

		var feed = new sap.viz.ui5.controls.common.feeds.FeedItem();
		feed.setType("Measure");
		feed.setValues("Value");
		feed.setUid("valueAxis");
		oVizFrame.addFeed(feed);

		var feed = new sap.viz.ui5.controls.common.feeds.FeedItem();
		feed.setType("Dimension");
		feed.setValues("Sensor");
		feed.setUid("color");
		oVizFrame.addFeed(feed);

		// add measure
		var measure = new sap.viz.ui5.data.MeasureDefinition();
		measure.setName("Value");
		measure.bindProperty("value","value");
		oVizFrame.getDataset().addMeasure(measure);

		// clear model
		var oModel = this.getView().byId("id1").getModel();
		data = oModel.getProperty("/data");
		data.length = 0;
		oModel.updateBindings();
		
	},

	getSelectedSensors() {
		var tags = this.tags.getProperty("/tags");
		var sensors = "";
		for (var i=0; i < tags.length; i++) {
			if (tags[i].selected && tags[i].selected == true) {
				sensors = sensors + tags[i].name;
				if (i < tags.length) {
					 sensors = sensors + ","
				}
			}
		}
		return sensors;		
	},
	
	setFrameProperties(oVizFrame) {
		oVizFrame.setVizProperties({
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
			 yAxis : {
                 scale: {
                	 fixedRange : true,
                     minValue : 0,
                     maxValue : 1
                 },
			 },
			plotArea : {
				gap: {
					visible: false
				},
				marker : {
					visible : false
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
			}
		});
	}

});
