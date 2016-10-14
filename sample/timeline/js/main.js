var vm;

$(document).ready(function() {
    vm = {
        width: 745,
        itemHeight: 160,
        rowHeight: 14,
        timeStep: ko.observable('3M'),
        startTime: ko.observable(),
        endTime: ko.observable(),
        operator: ko.observable(),
        packageCode: ko.observable(),
        packageName: ko.observable(),
        totalTimeValue: ko.observable(),
        myItems: ko.observableArray(),
        setMyItems: function(data) {
            vm.myItems.removeAll();
            if (!vm.totalTimeValue) {
                return [];
            }
            // 循环，和前一次X值做比较，小于10的平移
            for (var i = 0; i < data.length; i++) {
                data[i].x = (moment(data[i].time).valueOf() - vm.startTime().valueOf()) / vm.totalTimeValue() * vm.width + 44;
                if (data[i].type == 'in') {
                    data[i].y = 290;
                } else {
                    data[i].y = 50;
                }
            }

            // in out 各自排序
            var groupData = _.groupBy(data, function(item) {
                return item.type;
            });
            var typeArr = ['in', 'out'];
            var typeData;
            var tempX = 0;
            for (var j = 0; j < typeArr.length; j++) {
                typeData = _.sortBy(groupData[typeArr[j]], function(item) {
                    return item.time
                });
                tempX = 0;
                for (var i = 0; i < typeData.length; i++) {
                    if (moment(data[i].time).isBetween(vm.startTime(), vm.endTime())) {
                        if (typeData[i].x - tempX < 10) {
                            typeData[i].x = tempX + 10;
                        }
                        tempX = typeData[i].x;
                        vm.myItems.push(typeData[i]);
                    }
                }
            }
        },
        myScales: ko.observableArray([]),
        setMyScales: function() {
            var days;
            var dd = 86400000;
            var n;
            var m;
            this.myScales.removeAll();
            if (!this.totalTimeValue) {
                return [];
            }
            if (this.totalTimeValue() == dd) {
                // 1天，2小时一个刻度
                for (var i = 0; i <= 24; i = i + 2) {
                    this.myScales.push({
                        value: i / 24 * this.width,
                        text: this.startTime().clone().add(i, 'hours').format('H:00')
                    });
                }
            } else if (this.totalTimeValue() <= dd * 10) {
                //10天以下, 1天一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {
                    n = this.startTime().clone().add(i, 'days').format('D');
                    this.myScales.push({
                        value: i / days * this.width,
                        text: n + '日'
                    });
                }
            } else if (this.totalTimeValue() <= dd * 21) {
                //21天以下，2天一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {
                    n = this.startTime().clone().add(i, 'days').format('D');
                    if (n % 2 == 1 && n != 31) {
                        this.myScales.push({
                            value: i / days * this.width,
                            text: n + '日'
                        });
                    }
                }
            } else if (this.totalTimeValue() <= dd * 62) {
                //2个月以下，5天一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {
                    n = this.startTime().clone().add(i, 'days').format('D');
                    if (n % 5 == 1 && n != 31) {
                        this.myScales.push({
                            value: i / days * this.width,
                            text: n + '日'
                        });
                    }
                }
            } else if (this.totalTimeValue() <= dd * 92) {
                //3个月以下，5天一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {
                    n = this.startTime().clone().add(i, 'days').format('D');
                    if (n % 10 == 1 && n != 31) {
                        this.myScales.push({
                            value: i / days * this.width,
                            text: n + '日'
                        });
                    }
                }
            } else if (this.totalTimeValue() <= dd * 366) {
                //1年以下，1月一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {
                    n = this.startTime().clone().add(i, 'days').format('D');
                    if (n == 1) {
                        this.myScales.push({
                            value: i / days * this.width,
                            text: this.startTime().clone().add(i, 'days').format('M') + '月'
                        });
                    }
                }
            } else if (this.totalTimeValue() <= dd * (366 + 365 * 2)) {
                //3年以下，3月一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {
                    n = this.startTime().clone().add(i, 'days').format('D');
                    m = this.startTime().clone().add(i, 'days').format('M');
                    if (n == 1 && m % 3 == 1) {
                        this.myScales.push({
                            value: i / days * this.width,
                            text: m + '月'
                        });
                    }
                }
            } else if (this.totalTimeValue() <= dd * 365.25 * 10) {
                //10年以下，1年一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {
                    n = this.startTime().clone().add(i, 'days').format('DDD');
                    if (n == 1) {
                        this.myScales.push({
                            value: i / days * this.width,
                            text: this.startTime().clone().add(i, 'days').format('YYYY年')
                        });
                    }
                }
            } else {
                //10年以上，5年一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {

                    n = this.startTime().clone().add(i, 'days').format('DDD');
                    m = this.startTime().clone().add(i, 'days').format('YYYY');

                    if (n == 1 && m.match(/\d+[05]$/)) {
                        this.myScales.push({
                            value: i / days * this.width,
                            text: m + '年'
                        });
                    }
                }
            }
        },
        myBigScales: ko.observableArray([]),
        setMyBigScales: function() {
            var days;
            var dd = 86400000;
            var n;
            var m;

            // 大刻度
            this.myBigScales.removeAll();
            if (!this.totalTimeValue) {
                return [];
            }
            if (this.totalTimeValue() == dd) {
                // 1天，2小时一个刻度
                this.myBigScales.push({value: 0, text: this.startTime().format('YYYY年M月D日')});
                this.myBigScales.push({
                    value: this.width,
                    text: this.startTime().clone().add(1, 'days').format('YYYY年M月D日')
                });
            } else if (this.totalTimeValue() <= dd * 92) {
                //10天以下, 1天一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {
                    n = this.startTime().clone().add(i, 'days').format('D');
                    if (n == '1') {
                        this.myBigScales.push({
                            value: i / days * this.width,
                            text: this.startTime().clone().add(i, 'days').format('YYYY年M月')
                        });
                    }
                }
                if (this.myBigScales().length == 0) {
                    this.myBigScales.push({value: 0, text: this.startTime().format('YYYY年M月')});
                }
            } else if (this.totalTimeValue() <= dd * (366 + 365 * 2)) {
                //1年以下，1月一个刻度
                days = this.totalTimeValue() / dd;
                for (var i = 0; i <= days; i++) {
                    n = this.startTime().clone().add(i, 'days').format('D');
                    if (this.startTime().clone().add(i, 'days').format('DDD') == '1') {
                        this.myBigScales.push({
                            value: i / days * this.width,
                            text: this.startTime().clone().add(i, 'days').format('YYYY年')
                        });
                    }
                }
                if (this.myBigScales().length == 0) {
                    this.myBigScales.push({value: 0, text: this.startTime().clone().format('YYYY年')});
                }
            }
        },
        myMilestones: ko.observableArray([]),
        setMyMilestones: function(milestone) {
            // 里程碑
            vm.myMilestones.removeAll();
            if (!vm.totalTimeValue) {
                return [];
            }
            for (var i = 0; i < milestone.length; i++) {
                if (moment(milestone[i].time).isBetween(vm.startTime(), vm.endTime())) {
                    vm.myMilestones.push({
                        text: milestone[i].text + milestone[i].time,
                        value: (moment(milestone[i].time).valueOf() - vm.startTime().valueOf()) / vm.totalTimeValue() * vm.width - 12
                    });
                }
            }
        },
        changeTimeStep: function() {
            if (this.timeStep().match(/1M|3M|1Y/)) {
                $('#timeFrom').datebox('setValue', '');
                $('#timeTo').datebox('setValue', '');
                $('#timeFrom').datebox({'disabled': true});
                $('#timeTo').datebox({'disabled': true});
            } else {
                $('#timeFrom').datebox({'disabled': false});
                $('#timeTo').datebox({'disabled': false});
            }
            return true;
        },
        search: function() {
            var start;
            var end;
            if (this.timeStep() == '1M' || this.timeStep() == '3M' || this.timeStep() == '1Y') {
                end = moment();
                if (this.timeStep() == '1M') {
                    start = moment().subtract(1, 'months');
                } else if (this.timeStep() == '3M') {
                    start = moment().subtract(3, 'months');
                } else if (this.timeStep() == '1Y') {
                    start = moment().subtract(1, 'years');
                }
                this.endTime(end);
                this.startTime(start);
                this.totalTimeValue(end.valueOf() - start.valueOf());
            } else if (this.timeStep() == 'DIY') {
                end = moment($('#timeTo').datebox('getValue'));
                start = moment($('#timeFrom').datebox('getValue'));
                if (end == start) {
                    start = moment().subtract(1, 'days');
                }
                this.endTime(end);
                this.startTime(start);
                this.totalTimeValue(end.clone().add(1, 'days').valueOf() - start.valueOf());
            } else {
                return;
            }
            this.setMyScales();
            this.setMyBigScales();
            $.getJSON('data.json', this.setMyItems);
            $.getJSON('milestone.json', this.setMyMilestones);
        },
        highlight: function(evt) {
            $('.record').removeClass('highlight');
            $(evt.target).parent('div.record').addClass('highlight');
            return false;
        },
        unhighlight: function(evt) {
            $('.record').removeClass('highlight');
        }
    };

    ko.applyBindings(vm, document.getElementById('timeline'));

    $('[name=search]').click();

});

function myformatter(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return y + '-' + (m < 10
        ? ('0' + m)
        : m) + '-' + (d < 10
        ? ('0' + d)
        : d);
}

function myparser(s) {
    if (!s)
        return new Date();
    var ss = (s.split('-'));
    var y = parseInt(ss[0], 10);
    var m = parseInt(ss[1], 10);
    var d = parseInt(ss[2], 10);
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
        return new Date(y, m - 1, d);
    } else {
        return new Date();
    }
}
