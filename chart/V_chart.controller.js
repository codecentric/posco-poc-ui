sap.ui.controller("chart.V_chart", {

	onInit : function(oEvent) {

		this.zoomfactor = 5;
		this.tags = new sap.ui.model.json.JSONModel();

		// initialize model
		var model = new sap.ui.model.json.JSONModel();
		model.setData({
			data : [],
		    alarms : []
		});

		this.getAvailableTags("MySchemaDummy");
		var oVizFrame = this.getView().byId("id1");
        this.setFrameProperties(oVizFrame);
		this.getView().setModel(model);
		this.updateWebSocketClient();
		this.setSelectedMeasures();
	},

	updateWebSocketClient : function() {
		that = this;
		// Establish the WebSocket connection and set up event handlers
		//this.webSocket = new WebSocket("ws://localhost:4567/echo/?selectedSensors=" + this.getSelectedSensors());
		this.webSocket = new WebSocket("ws://" + window.location.hostname +"35.156.38.187:8001/posco?selectedSensors=" + this.getSelectedSensors());

		this.webSocket.onmessage = jQuery.proxy(function(msg) {
			message = JSON.parse(msg.data);
			var tags = this.tags.getProperty("/tags");
			var oModel = that.getView().getModel();
			var alarms = oModel.getProperty("/alarms");
			var alarmsMap = {}
            for (var i=0; i<alarms.length; i++) {
            	alarmsMap[alarms[i].sensor] = alarms[i];
            }
			for (var i=0; i < tags.length; i++) {
				if (tags[i].selected && tags[i].selected == true && tags[i].name == message.sensor) {
					alarmsMap[message.sensor] = message;					
					data = oModel.getProperty("/data");
					data.push(message);
					if (data.length > 500) {
						data.shift();
					}
					data.sort();
					alarms.length = 0;
					for (var j in alarmsMap) {
		            	alarms.push(alarmsMap[j]);
		            }

				}
			}
			oModel.updateBindings();

			this.startDate = message.timestamp-(50000/this.zoomfactor);
			this.endDate = "lastDataPoint";
			this.getView().byId("id1").setVizProperties({plotArea:{
			window:{start: this.startDate, end: this.endDate }}});
			this.getView().byId("id1").setVizScales({scales:{
			timeAxis:{start: this.startDate, end: this.endDate }}});
		}, this);
	},

	getAvailableTags(schema) {
		this.tags.setData({
			tags : [{"name": "sensor_1", "description": "Sensor 1", "selected": true },
			        {"name": "sensor_2", "description": "Sensor 2", "selected": true },
			        {"name": "sensor_3", "description": "Sensor 3", "selected": true },
			        {"name": "sensor_4", "description": "Sensor 4"},
			        {"name": "sensor_5", "description": "Sensor 5"},
			        {"name": "sensor_6", "description": "Sensor 6"},
			        {"name": "sensor_7", "description": "Sensor 7"},
			        {"name": "sensor_8", "description": "Sensor 8"},
			        {"name": "sensor_9", "description": "Sensor 9"},
			        {"name": "sensor_10", "description": "Sensor 10"},
			        {"name": "sensor_11", "description": "Sensor 11"},
			        {"name": "sensor_12", "description": "Sensor 12"},
			        {"name": "sensor_13", "description": "Sensor 13"},
			        {"name": "sensor_14", "description": "Sensor 14"},
			        {"name": "sensor_15", "description": "Sensor 15"},
			        {"name": "sensor_16", "description": "Sensor 16"}]
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
		var oModel = this.getView().getModel();
		oModel.getProperty("/data").length = 0;
		oModel.getProperty("/alarms").length = 0;
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
	},
	
	handleZoomIn(event) {
		if (this.zoomfactor < 10) {
			this.zoomfactor++;
		}
	},

	handleZoomOut(event) {		
		if (this.zoomfactor > 1) {
			this.zoomfactor--;
		}
	},
	
	getSensorStatus(value) {
		switch(value) {
	     case 1:
	        return "Warning";
	        break;
	     case 2:
	        return "Error";
	        break;
	     default:
	         return "O.k.";
		}
	},
	
	getSensorColor(value) {
		switch(value) {
	     case 1:
	        return "Warning";
	        break;
	     case 2:
	        return "Error";
	        break;
	     default:
	         return "Success";
		}
	}

});
