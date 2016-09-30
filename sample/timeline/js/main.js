var viewModel;

$(document).ready(function() {
    viewModel = {
        itemHeight : 160,
        rowHeight : 14,
        myItems : ko.observableArray([]),
        search : function() {
            $.get('data.json', function(data) {
                viewModel.myItems.removeAll();
                for (var i = 0; i < data.length; i++){
                    viewModel.myItems.push(data[i]);
                }
            });
        }
    };
    ko.applyBindings(viewModel, document.getElementById('timeline'));

});
