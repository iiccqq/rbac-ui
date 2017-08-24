$(function () {   

   	$('#create_date').daterangepicker({
		locale: {
			format: 'YYYY/MM/DD',
			applyLabel: '确定',
			cancelLabel: '取消',
			fromLabel: '起始时间',
			toLabel: '结束时间',
			customRangeLabel: '自定义',
			daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
			monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
				'七月', '八月', '九月', '十月', '十一月', '十二月'
			],
			firstDay: 1

		}
	});

   vm.reload();
});

var vm = new Vue({
		el: '#app',
		data: {
			q: {},
			showList: true,
			title: null,
			list: [],
			item: {},
			start: 0,
			limit: 10,
			pageSize: '10',
			page: [],
			pageIndex: 1,
			total: 0,
			ischeckall: false,
			checkboxmodel: []
		},
		watch: {
			pageSize: 'pageSizeChange',
			pageIndex: 'pageIndexChange',
			checkboxmodel: 'checkboxmodelChange'
		},
		methods: {
			checkall: function() {
				vm.checkboxmodel = [];
				if(vm.ischeckall) {
					for(var i = 0; i < this.list.length; i++) {
						vm.checkboxmodel.push(this.list[i].id);
					}
				}
			},
			checkboxmodelChange: function() {
				vm.ischeckall = (vm.checkboxmodel.length !=0 && vm.checkboxmodel.length == vm.list.length);
			},
			pageSizeChange: function() {
				vm.start = 0;
				vm.limit = parseInt(vm.pageSize);
				vm.reload();
				vm.checkboxmodelChange();
			},
			pageIndexChange: function() {
				vm.start = (vm.pageIndex - 1) * parseInt(vm.pageSize);
				vm.reload();
				vm.checkboxmodelChange();
			},
			choosePage: function(page) {
				vm.pageIndex = page.index;
			},
			query: function() {
				vm.reload();
			},
			add: function() {
				vm.showList = false;
				vm.title = "新增";
				vm.item = {};
			},
			update: function() {
				var id = vm.checkboxmodel;
				if(id.length != 1) {
					alert('修改请选择一行数据');
					return false;
				}

				vm.showList = false;
				vm.title = "修改";
				vm.getItem(id);
			},
			del: function(event) {
				var ids = vm.checkboxmodel;
				if(ids.length == 0) {
					alert('没有选择任何项');
					return false;
				}

				confirm('确定要删除选中的记录？', function() {
					$.ajax({
						type: "DELETE",
						url: baseURL + "sys/users/" + userid + "/logs",
						contentType: "application/json",
						data: JSON.stringify(ids),
						success: function(r) {
							if(r.code == 0) {
								alert('操作成功', function(index) {
									vm.reload();
								});
							} else {
								alert(r.msg);
							}
						}
					});
				});
			},
			getItem: function(id) {
				$.get(baseURL + "sys/users/" + userid + "/logs/" + id, function(r) {
					vm.item = r.item;					
				});
			},
			saveOrUpdate: function() {
				if(vm.validator()) {
					return;
				}


				var url = "sys/users/" + userid + "/log";
				$.ajax({
					type: vm.item.id == null ? "POST" : "PUT",
					url: baseURL + url,
					contentType: "application/json",
					data: JSON.stringify(vm.item),
					success: function(r) {
						if(r.code === 0) {
							alert('操作成功', function() {
								vm.reload();
							});
						} else {
							alert(r.msg);
						}
					}
				});
			},
			reload: function() {
				vm.showList = true;
				var url = baseURL + "sys/users/" + userid + "/logspage";
				var para = {};
				para.username__0=vm.q.username;
				para.operation__0=vm.q.operation;
				para.method__0=vm.q.method;
				para.params__0=vm.q.params;
				para.time__1=vm.q.time;
				para.ip__0=vm.q.ip;
				var create_date = $("#create_date").val();
				if(create_date != null && create_date != '') {
					var start_create_date = create_date.substring(0, 10);
					var end_create_date = create_date.substring(12, 23);
					para.create_date__2 = Date.parse(start_create_date);
					var end = new Date(Date.parse(end_create_date));
					end = end.valueOf();
					end = end +  24 * 60 * 60 * 1000;
					end_create_date = new Date(end);
					para.create_date__3 = Date.parse(end_create_date); 
				}			
				var p = {
					'params': JSON.stringify(para),
					'start': vm.start,
					'limit': vm.limit
				};
				$.getJSON(url, p, function(r) {
					vm.list = r.list;
					vm.total = r.total;
					vm.checkboxmodel = [];
					vm.page = [];
					var totalPageNum = parseInt((vm.total + parseInt(vm.pageSize) - 1) / parseInt(vm.pageSize));
					if(vm.pageIndex - 1 > 0)
						vm.page.push({
							'index': vm.pageIndex - 1,
							'text': '«'
						});
					for(var i = 1; i <= totalPageNum; i++) {
						if(i == vm.pageIndex)
							vm.page.push({
								'index': i,
								'text': i
							});
						else
							vm.page.push({
								'index': i,
								'text': i
							});
					}
					if(vm.pageIndex + 1 <= totalPageNum)
						vm.page.push({
							'index': vm.pageIndex + 1,
							'text': '»'
						});
				})

			},
			validator: function() {
				if(isBlank(vm.item.username)) {
					alert("用户名");
					return true;
				}
				if(isBlank(vm.item.operation)) {
					alert("用户操作");
					return true;
				}
				if(isBlank(vm.item.method)) {
					alert("请求方法");
					return true;
				}
				if(isBlank(vm.item.params)) {
					alert("请求参数");
					return true;
				}
				if(isBlank(vm.item.time)) {
					alert("执行时长(毫秒)");
					return true;
				}
				if(isBlank(vm.item.ip)) {
					alert("IP地址");
					return true;
				}
				if(isBlank(vm.item.createDate)) {
					alert("创建时间");
					return true;
				}
				
			}
		}
	});