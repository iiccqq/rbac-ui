$(function () {   

	$.get(baseURL + "sys/users/" + userid + "/configs",{'code':'sys_config_status'}, function(r) {
		vm.qselect.status = r.list;
		if(r.list.length > 0)
			vm.q.status = r.list[0].value;
	});

   vm.reload();
});

var vm = new Vue({
		el: '#app',
		data: {
			q: {},
			qselect: {},
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
						url: baseURL + "sys/users/" + userid + "/configs",
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
				$.get(baseURL + "sys/users/" + userid + "/configs/" + id, function(r) {
					vm.item = r.item;					
				});
			},
			saveOrUpdate: function() {
				if(vm.validator()) {
					return;
				}


				var url = "sys/users/" + userid + "/config";
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
				var url = baseURL + "sys/users/" + userid + "/configspage";
				var para = {};
				if(vm.q.parentid != -1)
					para.parentid__1 = vm.q.parentid;
				para.value__0=vm.q.value;
				para.text__0=vm.q.text;
				if(vm.q.status != -1)
					para.status__1 = vm.q.status;
				para.remark__0=vm.q.remark;
				para.code__0=vm.q.code;
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
				if(isBlank(vm.item.parentid)) {
					alert("父id");
					return true;
				}
				if(isBlank(vm.item.value)) {
					alert("值");
					return true;
				}
				if(isBlank(vm.item.text)) {
					alert("文本");
					return true;
				}
				if(isBlank(vm.item.status)) {
					alert("状态   0：正常  1：停用");
					return true;
				}
				if(isBlank(vm.item.remark)) {
					alert("备注");
					return true;
				}
				if(isBlank(vm.item.code)) {
					alert("别名");
					return true;
				}
				
			}
		}
	});