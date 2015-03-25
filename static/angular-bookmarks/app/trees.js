(function () {
    'use strict';

    function CbgenRestangular(Restangular) {
        return Restangular.withConfig(function (RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl('/bookmarks/api/');
        });
    };

    angular
        .module('treesApp', ['ui.tree','ui.bootstrap', 'restangular'])
        .factory('CbgenRestangular', CbgenRestangular)
        .directive('bookmarks', function() {
             return {
                // require: ['^uiTreeNodes', '^uiTree'],
                // приоритет директивы (см. выше)
                priority: 0,
                // шаблон, заданный явно
                //template: '<div>Hello {{ greet }}</div>',
                // шаблон, заданный в виде ссылки или выражения
                templateUrl: '/static/angular-bookmarks/templates/ButtonRenderer.html',
               // templateUrl: 'ButtonRenderer.html',
                // заменять ли исходный DOM на шаблон
                replace: true,
                // включить ли некоторые части исходного DOM в шаблон
                //transclude: false,
                // ограничить применение директивы
                restrict: 'A',
                // создавать/не создавать замыкание области видимости
                scope: {
                    user: "@",
                    source: "@",
                    token: "@"
                },
                // контроллер для директивы
                controller: 'ModalBookmarksCtrl',
                //controller: function($scope, $element, $attrs, $transclude, otherInjectables) {
                //},
                // здесь можно изменять исходный DOM
                compile: function compile(tElement, tAttrs, transclude) {
                    return {
                        pre: function preLink(scope, iElement, iAttrs, controller) {},
                        post: function postLink(scope, iElement, iAttrs, controller) {}
                    }
                },
                // здесь находится основная функциональность директивы
                link: function(scope, element, attributes) {
                    scope.greet = 'bsdfs'
                }
            }

        })
        .controller('treesCtrl', function ($scope, $log, $http, CbgenRestangular, $modalInstance, items) {
            $scope.new_node = {};
            $scope.data = [];
            $scope.nodes = [];
            $scope.errors = [];
            $scope.loadData = loadData;

//        $scope.newSubNode = newSubNode;
            $scope.newNode = newNode;
            $scope.removeNodes = removeNodes;
            $scope.nodeToggle = nodeToggle;
            $scope.collapseAll = collapseAll;
            $scope.expandAll = expandAll;
            $scope.editeNode = editeNode;
            $scope.cancelEditingNode = cancelEditingNode;
            $scope.changeNode = changeNode;
            $scope.new_bookmark_source = {'name':'Новый файл', 'id':1};
            $scope.new_folder_name_source = {'basename':'Новая папка', 'name':'Новая папка'};
            $scope.close = close;
            $scope.chose_parent = chose_parent;
            $scope.items = items;
            $scope.debug = true;
            try{
                $scope.user = user_id;
                $log.debug($scope.user);
            }
            catch(err){
                $scope.user
            }
           // $scope.chosen_parent;
            $scope.treeOptions = treeOptions();
            $scope.loadData();


            function loadData() {
                return CbgenRestangular.all('nodes').getList().then(function (results) {
                    return $scope.nodes = results;
                });
            };

            function UpdateChildren(node) {
                return CbgenRestangular.one('nodes', node.$modelValue.id).get().then(function (data) {
//                     $log.debug(data);
//                     for(var i in data){$log.debug(i)}
                     //node.$modelValue = data;
                    node.$modelValue.children = data.children;
                    return node
                 })
            };

            function newNode(type, node) {
                var new_node = {
                        data: {
                            name: 'Новая подпапка',
                            user: $scope.user||$scope.items.user,
                            //source: null
                        },
                        parent: null,
                        children: []
                    };


                if (type=='sub_folder') {
                    new_node.data.user = new_node.data.user || node.$modelValue.user;
                    new_node.parent = node.$modelValue.id;
                }
                else if(type=='folder') {
                    new_node.data.name = $scope.new_folder_name_source.name;
                }
                else if(type=='source') {
                    //todo: выбор папки добавить, придумать как сделать.
                    new_node.parent = search_checked_nodes($scope.nodes)[0];
                    new_node.data.name = $scope.new_bookmark_source.name;
                    new_node.data.source =  $scope.items.source;
                };
                if ($scope.debug){
                    console.log(new_node);//todo: надо заменить на $log, как-только отлавливать строчку
                };
                CbgenRestangular.all('nodes').getList().then(function(data){
                    data.post(new_node).then(function (result) {
                        if (type=='folder') {
                            return $scope.loadData(); //todo: кривовато, дерево схлопывается.
                        }
                        else if (type=='sub_folder') {
                            if(node.collapsed) {
                                return nodeToggle(node);
                            }
                            else{
                                UpdateChildren(node);
                            }
                        }
                        else if (type=='source') {

                            //if(node.collapsed) {
                            //    return nodeToggle(node);
                            //}
                            return $scope.loadData(); //todo: кривовато, дерево схлопывается.
                        };
                    });
                });
            };

            function removeNodes(node) {
                if ($scope.debug) {
                    console.log(node);//todo: надо заменить на $log, как-только отлавливать строчку
                };
                if (window.confirm('Вы точно хотите удалить этот элемент?')) {
                        CbgenRestangular.one('nodes', node.$modelValue.id).get().then(function(data){
                            data.remove().then(function(data){
                                node.remove()
                            });
                        });
                }
            };

            function changeNode(node) {
                if (window.confirm('Вы точно хотите изменить этот элемент?')) {
                    if ($scope.debug) {
                        console.log(node);//todo: надо заменить на $log, как-только отлавливать строчку
                    };
                    CbgenRestangular.one('nodes', node.$modelValue.id).get().then(function(data){
                        for (var i in node.$modelValue) {
                            data[i] = node.$modelValue[i] //todo: наверное все же лечше сделать блочок с data
                        }
                        return data.put().then(function (data) {
                                delete node.$modelValue.oldname;
                                delete node.$modelValue.editing;
                                return UpdateChildren(node);
                            }
                        );
                    });
                };
            };


            function nodeToggle(node) {
                if ($scope.debug) {
                    console.log(node);//todo: надо заменить на $log, как-только отлавливать строчку
                };
                UpdateChildren(node).then(function (node) {
                    if(node.$modelValue.children.length) {
                        node.toggle();
                    };
                });
            };


            function chose_parent(node){
                if ($scope.debug) {
                    console.log(node);//todo: надо заменить на $log, как-только отлавливать строчку
                };
                var checked_status = node.$modelValue.checked;
                //search_checked_nodes($scope.nodes);
                //node.$modelValue.checked = checked_status;
                search_checked_nodes($scope.nodes);
                node.$modelValue.checked = checked_status;
                //todo: странная конструкция сверху используется для того, чтобы убрать галки с других элементов и оставить только на выделенном, надо переделать
            };

            function search_checked_nodes(nodes){
                var checked_nodes = [];
                if ($scope.debug) {
                    console.log(nodes);//todo: надо заменить на $log, как-только отлавливать строчку
                };
                for (var node in nodes){
                    if ($scope.debug) {
                        console.log(nodes[node]);//todo: надо заменить на $log, как-только отлавливать строчку
                    };

                    if (nodes[node] && typeof nodes[node] == 'object'){
                        try{
                            if(nodes[node].hasOwnProperty('checked')){
//                                console.log(nodes[node]);
//                                console.log(nodes[node].check);
                                console.log(nodes[node].id);
                                if(nodes[node].checked){
                                    console.log(nodes[node].checked);
                                    nodes[node].checked = false;
                                    checked_nodes.push(nodes[node].id);
                                };
                                console.log(checked_nodes)
                                }
                        }
                        catch(err){
                            if ($scope.debug) {
                                console.log(nodes[node])
                            };
                            console.log(err);
                        }
                        try{
                            if (nodes[node].hasOwnProperty('children')){
                                var children_checked_nodes;
                                var children = nodes[node].children
                                children_checked_nodes = search_checked_nodes(children);
                                //todo: в данный момент не понимаю почему возвращается объект, а не список, надо будет погуглить или yield засунуть
                                if(typeof children_checked_nodes == 'array'){
                                    checked_nodes += children_checked_nodes
                                }else if(typeof children_checked_nodes == 'object'){
                                    for(var i in children_checked_nodes){
                                        console.log(children_checked_nodes[i]);
                                        checked_nodes.push(children_checked_nodes[i]);
                                        console.log(checked_nodes);
                                        }
                                }
                            };
                        }
                        catch(err){
                            console.log(err);
                        };
                    };
                };
                if ($scope.debug) {
                    console.log(checked_nodes);//todo: надо заменить на $log, как-только отлавливать строчку
                };
                return checked_nodes;
            };
            function collapseAll() {
//
                var scope = getRootNodesScope();
                scope.collapseAll();
            };

            function expandAll() {
                var scope = getRootNodesScope();
                scope.expandAll();
            };

            function getRootNodesScope() {
                return angular.element(document.getElementById("tree-root")).scope(); //todo: как-то не уверсально
            };

            function editeNode(node) {
//                console.log(node.$modelValue)
                node.$modelValue.editing = true;
                node.$modelValue.oldname = node.$modelValue.name;
            };

            function cancelEditingNode(node) {
                console.log(node);
                node.$modelValue.name = node.$modelValue.oldname;
                delete node.$modelValue.oldname;
                delete node.$modelValue.editing;
                //node.$modelValue.editing = true;
            };

            function close() {
                $modalInstance.dismiss('close');
            };

            function treeOptions() {
                return {
                    accept: function (sourceNodeScope, destNodesScope, destIndex) {
                        var parent_id;
                        return true; //TODO: заглушка
//                        for (var x in event) {
//                            console.log(x, event[x]);
//                        };
//                        var a = destNodesScope.$modelValue[0]
//                        console.log(a);
//                        &&destNodesScope.$modelValue[0].parent
                        try{
                            parent_id = destNodesScope.$modelValue[0].parent_id;
                            console.log(parent_id);
                        }
                        catch(error){

                            console.log(parent_id)
                            console.log(error)
                        }
                        if(parent_id){
                            console.log('source', sourceNodeScope);
                            console.log('dest', destNodesScope.$modelValue[0]);
                            return true;
                        }
                    },
                    beforeDrop: function (event) {
                        for (var x in event) {
                            console.log(x, event[x]);
                        };
//                        console.log(event.source.nodeScope.$modelValue);
//                        console.log(event.dest.nodesScope.$modelValue);
                        window.alert('бекенд перетаскивания не реализован');
                    },
                    dropped: function (event) {
                        return
                        for (var x in event) {
                            console.log(x, event[x]);
                        };
                        console.log(event.source.nodeScope.$modelValue);
                        console.log(event.dest.nodesScope.$modelValue);
                        window.alert('бекенд перетаскивания не реализован');

                        /*event: Event arguments, it's an object.

                         source: Source object
                         nodeScope: The scope of source node which was dragged.
                         nodesScope: The scope of the parent nodes of source node when it began to drag.
                         index: The position when it began to drag.
                         dest: Destination object
                         nodesScope: The scope of ui-tree-nodes which you just dropped in.
                         index: The position you dropped in.
                         elements: The dragging relative elements.
                         placeholder: The placeholder element.
                         dragging: The dragging element.
                         pos: Position object.
                         */

                    }
                };
            };

            return $scope.loadData();

            });
        //кусок относящийся к модальности модального окна
        angular.module('treesApp').controller('ModalBookmarksCtrl', function ($scope, $modal, $log) {

            //$scope.source = 123123;
            //$scope.user = 3;
            //$scope.items = 3;
            $scope.open = function (size) {

                var modalInstance = $modal.open({
                 //   require: ['^uiTreeNodes', '^uiTree'],
                    templateUrl: '/static/angular-bookmarks/templates/TreeContentRender.html',
                    //templateUrl: 'TreeContentRender.html',
                    controller: 'treesCtrl',
                    size: size,
                    resolve: {
                    items: function () {
                        return {
                           // 'items':$scope.items,
                            'user':$scope.user,
                            'source':$scope.source,
                            'token':$scope.token
                    };
                    /*    items: {
                        source: function () {
                          return $scope.source;
                        },
                        user: function () {
                          return $scope.user;
                        }
                    } */
                    }
                    }
                });
        //$log.info($scope);
            //modalInstance.result.then(function (selectedItem) {
            //  $scope.selected = selectedItem;
            //},
            //function () {
            //  $log.info('Modal dismissed at: ' + new Date());
            //});
          };
        });



}).call(this);

