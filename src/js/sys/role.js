$(function () {   
   vm.reload();
});

var setting = {
	data: {
		simpleData: {
			enable: true,
			idKey: "menuId",
			pIdKey: "parentId",
			rootPId: -1
		},
		key: {
			url:"nourl"
		}
	},
	check:{
		enable:true,
		nocheckInherit:true
	}
};
var ztree;
	
var vm = new Vue({
	el:'#app',
	data:{
		q:{},
		showList: true,
		title:null,
		roleList :[],
		role:{},
		start:0,
		limit:10,
		pageSize:'10',
		page:[],
		pageIndex:1,
		total:0,
		ischeckall:false,
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
				for(var i=0;i< this.roleList.length;i++) {
		        	vm.checkboxmodel.push(this.roleList[i].roleId);
		        }
		     }			
		},		
		checkboxmodelChange :function () {
			vm.ischeckall = (vm.checkboxmodel.length !=0 && vm.checkboxmodel.length == vm.list.length);
		},
		pageSizeChange :function () { 
			vm.start = 0;
		    vm.limit = parseInt(vm.pageSize);
		    vm.reload();
		    vm.checkboxmodelChange();
		},		
		pageIndexChange :function () {
			vm.start = (vm.pageIndex-1)*parseInt(vm.pageSize);
		    vm.reload();
		    vm.checkboxmodelChange();
		},		
		choosePage : function(page){
			vm.pageIndex = page.index;
		},
		query: function () {
			vm.reload();
		},
		add: function(){
			vm.showList = false;
			vm.title = "新增";
			vm.role = {};
			vm.getMenuTree(null);
		},
		update: function () {
			var roleId = vm.checkboxmodel;
			if(roleId.length != 1){
				alert('修改请选择一行数据') ;
				return false;
			}
			
			vm.showList = false;
            vm.title = "修改";
            vm.getMenuTree(roleId);
		},
		del: function (event) {
			var roleIds = vm.checkboxmodel;
			if(roleIds.length ==0){	
				alert('没有选择任务项') ;
				return false;
			}
			
			confirm('确定要删除选中的记录？', function(){
				$.ajax({
					type: "DELETE",
				    url: baseURL + "sys/users/"+userid+"/roles",
                    contentType: "application/json",
				    data: JSON.stringify(roleIds),
				    success: function(r){
						if(r.code == 0){
							alert('操作成功', function(index){
								vm.reload();
							});
						}else{
							alert(r.msg);
						}
					}
				});
			});
		},
		getRole: function(roleId){
            $.get(baseURL + "sys/users/"+userid+"/roles/"+roleId, function(r){
            	vm.role = r.role;                
                //勾选角色所拥有的菜单
    			var menuIds = vm.role.menuIdList;
    			for(var i=0; i<menuIds.length; i++) {
    				var node = ztree.getNodeByParam("menuId", menuIds[i]);
    				ztree.checkNode(node, true, false);
    			}
    		});
		},
		saveOrUpdate: function () {
            if(vm.validator()){
                return ;
            }

			//获取选择的菜单
			var nodes = ztree.getCheckedNodes(true);
			var menuIdList = new Array();
			for(var i=0; i<nodes.length; i++) {
				menuIdList.push(nodes[i].menuId);
			}
			vm.role.menuIdList = menuIdList;
			
			var url = "sys/users/" + userid + "/role";
			$.ajax({
				type: vm.role.roleId == null ? "POST":"PUT",
			    url: baseURL + url,
                contentType: "application/json",
			    data: JSON.stringify(vm.role),
			    success: function(r){
			    	if(r.code === 0){
						alert('操作成功', function(){
							vm.reload();
						});
					}else{
						alert(r.msg);
					}
				}
			});
		},
		getMenuTree: function(roleId) {
			//加载菜单树
			$.get(baseURL + "sys/users/" + userid +"/menus", function(r){
				ztree = $.fn.zTree.init($("#menuTree"), setting, r);
				//展开所有节点
				ztree.expandAll(true);
				
				if(roleId != null){
					vm.getRole(roleId);
				}
			});
	    },
	    reload: function () {
	    	vm.showList = true;
	    	var url = baseURL + "sys/users/" + userid + "/rolespage";
	    	var p = {'params':JSON.stringify(vm.q),'start':vm.start,'limit':vm.limit};	    	
	    	$.getJSON(url,p,function(r){
	    		vm.roleList = r.list;
	    		vm.total = r.total;	    		
				vm.checkboxmodel = [];
	    		vm.page = [];
		    	var totalPageNum = parseInt((vm.total  +  parseInt(vm.pageSize) - 1) / parseInt(vm.pageSize)); 
		    	if(vm.pageIndex-1>0)
	        		vm.page.push({'index':vm.pageIndex-1,'text':'«'});
	        	for(var i = 1;i<=totalPageNum;i++){
	        		if(i == vm.pageIndex)
	        			vm.page.push({'index':i,'text':i});
	        		else
	        			vm.page.push({'index':i,'text':i});
	        	}
	        	if(vm.pageIndex+1<=totalPageNum)
	        			vm.page.push({'index':vm.pageIndex+1,'text':'»'});
	    	})
	    		
		
		},
        validator: function () {
            if(isBlank(vm.role.roleName)){
                alert("角色名不能为空");
                return true;
            }
        }
	}
});

