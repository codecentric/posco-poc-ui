sap.ui.controller("table.list", {

	onInit : function(oEvent) {
		//Initialize Date-Time picker
		this.getView().byId("starttime").setDateValue(new Date(new Date().getTime() - 1000 * 60 * 10));
		this.getView().byId("endtime").setDateValue(new Date());		

		this.model = new sap.ui.model.json.JSONModel();
		this.onRefresh();
		this.getView().setModel(this.model);		
	},
	
	onRefresh: function(oEvent) {
		var start = this.getView().byId("starttime").getDateValue().getTime();
		var end = this.getView().byId("endtime").getDateValue().getTime();
		if (end - start > (1000 * 60 *60 * 3)) {
			start = end - 1000 * 60 * 60 * 3;
			this.getView().byId("starttime").setDateValue(new Date(start));
		}
		this.model.loadData("http://35.156.38.187:8001/metrics/cassandra?start=" + start +"&end=" + end, null, false);
//			this.model.setData({
//				"metrics":[  
//				           {  
//				              "start":1478080335,
//				              "end":1478090335,
//				              "count":10000,
//				              "min":123.9,
//				              "max":333.34,
//				              "mean":239.03,
//				              "stdev":50.2
//				           },
//				           {  
//				              "start":1488080335,
//				              "end":1488090335,
//				              "count":10001,
//				              "min":125.9,
//				              "max":335.34,
//				              "mean":235.03,
//				              "stdev":49.2
//				           } ]
//			});
	},
	
	handleChange: function(oEvent) {
		var oDTP = oEvent.oSource;
		var sValue = oEvent.getParameter("value");
		var bValid = oEvent.getParameter("valid");
		if (bValid) {
			oDTP.setValueState(sap.ui.core.ValueState.None);
		} else {
			oDTP.setValueState(sap.ui.core.ValueState.Error);
		}
	},
	
	getDate: function(value) {
		  //return new Date(value);
		var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({pattern : "dd/MM/yyyy" });
		var timeFormat = sap.ui.core.format.DateFormat.getTimeInstance({pattern: "KK:mm:ss a"});       
		// timezoneOffset is in hours convert to milliseconds
		var TZOffsetMs = new Date(0).getTimezoneOffset()*60*1000;
		// format date and time to strings offsetting to GMT
		var dateStr = dateFormat.format(new Date(value));
		var timeStr = timeFormat.format(new Date(value));
		return dateStr + " " + timeStr; 
	}

});