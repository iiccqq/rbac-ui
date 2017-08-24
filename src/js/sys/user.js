$(function() {
	vm.reload();
});

var vm = new Vue({
	el: '#app',
	data: {
		q: {username:null,status:-1},
		showList: true,
		title: null,
		start:0,
		limit:10,
		pageSize:10,
		page:[],
		pageIndex:1,
		total:0,
		ischeckall:false,
		roleList: {},
		userList: [],
		user:{
			status:1,
			roleIdList:[]
		},
		checkboxmodel:[]
	},
	watch: {
		  pageSize:'pageSizeChange',
		  pageIndex:'pageIndexChange',
		  checkboxmodel:'checkboxmodelChange'
	},
	methods: {
		checkall :function () {
			vm.checkboxmodel = [];
			if(vm.ischeckall){
				for(var i=0;i< this.userList.length;i++) {
		        	vm.checkboxmodel.push(this.userList[i].userId);
		        }
		     }			
		},		
		checkboxmodelChange :function () {
			vm.ischeckall = (vm.checkboxmodel.length !=0 && vm.checkboxmodel.length == vm.list.length);
		},
		pageSizeChange :function () { 
			vm.start = 0;
		    vm.limit = vm.pageSize;
		    vm.reload();
		    vm.checkboxmodelChange();
		},		
		pageIndexChange :function () {
			vm.start = (vm.pageIndex-1)*vm.pageSize;
		    vm.reload();
		    vm.checkboxmodelChange();
		},		
		choosePage : function(page){
			vm.pageIndex = page.index;
		},
		query: function() {
			vm.reload();
		},
		add: function() {
			vm.showList = false;
			vm.title = "新增";
			vm.roleList = {};
			vm.user = {
				status: 1,
				roleIdList: []
			};

			//获取角色信息
			vm.getRoleList();
		},
		update: function() {
			var userId = vm.checkboxmodel;
			if(userId.length != 1) {
				alert('修改请选择一行数据');
				return;
			}

			vm.showList = false;
			vm.title = "修改";

			vm.getUser(userId);
			//获取角色信息
			vm.getRoleList();
		},
		del: function() {
			var userIds = vm.checkboxmodel;
			if(userIds == null) {
				return;
			}

			confirm('确定要删除选中的记录？', function() {
				$.ajax({
					type: "DELETE",
					url: baseURL + "sys/users/" + userid+ "/users",
					contentType: "application/json",
					data: JSON.stringify(userIds),
					success: function(r) {
						if(r.code == 0) {
							alert('操作成功', function() {
								vm.reload();
							});
						} else {
							alert(r.msg);
						}
					}
				});
			});
		},
		saveOrUpdate: function() {
			if(vm.validator()) {
				return;
			}

			var url = baseURL + "sys/users/" + userid;
			$.ajax({
				type:  vm.user.userId == null ? "POST" : "PUT",
				url: url,
				contentType: "application/json",
				data: JSON.stringify(vm.user),
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
		getUser: function(userId) {
			$.get(baseURL + "sys/users/" + userId , function(r) {
				vm.user = r.user;
				vm.user.password = null;
			});
		},
		getRoleList: function() {
			$.getJSON(baseURL + "sys/users/" + userid +"/roles",function(r) {
				vm.roleList = r.list;
			});
		},
		reload: function() {
			vm.showList = true;
			var url = baseURL + "sys/users/" + userid + "/list";
			var params = {};
			params.username = vm.q.username;
			if(vm.q.status != -1)
				params.status__1 = parseInt(vm.q.status);
			var p = {
				'params': JSON.stringify(params),
				'start': vm.start,
				'limit': vm.limit
			};
			$.getJSON(url, p,
				function(r) {
					vm.userList = r.list;
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
				});
		},
		validator: function() {
			if(isBlank(vm.user.username)) {
				alert("用户名不能为空");
				return true;
			}

			if(vm.user.userId == null && isBlank(vm.user.password)) {
				alert("密码不能为空");
				return true;
			}

			if(isBlank(vm.user.email)) {
				alert("邮箱不能为空");
				return true;
			}

			if(!validator.isEmail(vm.user.email)) {
				alert("邮箱格式不正确");
				return true;
			}
		}
	}
});