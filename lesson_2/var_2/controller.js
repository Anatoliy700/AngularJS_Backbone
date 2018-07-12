myApp.controller('shoppingCart', function ($scope) {

  $scope.cartProducts = [
    {
      id: 1,
      category: 'Переферия',
      name: 'Клавиатура',
      amount: 1,
      price: 900
    },
    {
      id: 2,
      category: 'Переферия',
      name: 'Мышка',
      amount: 1,
      price: 300
    },
    {
      id: 3,
      category: 'Комплектующие',
      name: 'Процессор',
      amount: 1,
      price: 15000
    }
  ];
  $scope.shopProducts = [
    {
      id: 1,
      category: 'Переферия',
      name: 'Клавиатура',
      amount: 1,
      price: 900
    },
    {
      id: 2,
      category: 'Переферия',
      name: 'Мышка',
      amount: 1,
      price: 300
    },
    {
      id: 3,
      category: 'Комплектующие',
      name: 'Процессор',
      amount: 1,
      price: 15000
    },
    {
      id: 4,
      category: 'Комплектующие',
      name: 'Кулер',
      amount: 1,
      price: 1000
    }
  ];
  $scope.idProducts = [];
  $scope.categories = [
    'Периферия',
    'Комплектующие'
  ];
  $scope.btnAddProduct = true;
  $scope.btnAddCategory = true;
  $scope.addNewProductForm = {
    show: false,
    errorClass: {
      name: '',
      category: '',
      amount: '',
      price: ''
    }
  };
  $scope.addNewCategoryForm = {
    show: false,
    message: '',
    errorClass: {
      name: ''
    }
  };
  $scope.discount = {
    value: 10,
    startDiscount: 30000,
    factor: null
  };

  $scope.shopProducts.forEach(function (item) {
    $scope.idProducts[item.id] = item.id;
  });


  $scope.getTotal = function () {
    var total = 0;
    // var filterData = $filter('filter')($scope.consumptionItems, $scope.search);
    for (var item in $scope.cartProducts) {
      if ($scope.cartProducts.hasOwnProperty(item)) {
        total += $scope.cartProducts[item].amount * $scope.cartProducts[item].price;
      }
    }
    return total;
  };
  $scope.addCart = function (product) {
    delete(product.$$hashKey);

    if (!product.amount || product.amount < 1 || product.amount > 10) {
      return;
    }

    let indexCart = $scope.cartProducts.findIndex((function (item) {
      return item.id === product.id;
    }));
    if (indexCart === -1) {
      let productCopy = JSON.parse(JSON.stringify(product));
      $scope.cartProducts.push(productCopy);
    } else {
      $scope.cartProducts[indexCart].amount += product.amount;
    }
  };
  $scope.showAddNewProductForm = function () {
    $scope.btnAddProduct = false;
    $scope.addNewProductForm.show = true;
  };
  $scope.closeAddNewProductForm = function () {
    $scope.btnAddProduct = true;
    $scope.addNewProductForm.show = false;
    $scope.newProduct = null;
    $scope.addNewProductForm.errorClass = {
      name: '',
      category: '',
      amount: '',
      price: ''
    }
  };
  $scope.addNewProduct = function () {
    let valid = true;
    if (!$scope.newProduct || !$scope.newProduct.name || $scope.newProduct.name.length === 0) {
      $scope.addNewProductForm.errorClass.name = 'error';
      valid = false;
    } else {
      $scope.addNewProductForm.errorClass.name = '';

    }
    if (!$scope.newProduct || !$scope.newProduct.category || !$scope.categories.includes($scope.newProduct.category)) {
      $scope.addNewProductForm.errorClass.category = 'error';
      valid = false;
    } else {
      $scope.addNewProductForm.errorClass.category = '';
    }

    if (!$scope.newProduct || !$scope.newProduct.price || isNaN($scope.newProduct.price)) {
      $scope.addNewProductForm.errorClass.price = 'error';
      valid = false;
    } else {
      $scope.addNewProductForm.errorClass.price = '';
    }

    if (valid) {
      $scope.newProduct.id = $scope.idProducts.length;
      $scope.idProducts[$scope.newProduct.id] = $scope.newProduct.id;
      $scope.newProduct.amount = 1;
      $scope.shopProducts.push(JSON.parse(JSON.stringify($scope.newProduct)));
      $scope.btnAddProduct = true;
      $scope.addNewProductForm.show = false;
      $scope.newProduct = null;
    }
  };
  $scope.showAddNewCategoryForm = function () {
    $scope.btnAddCategory = false;
    $scope.addNewCategoryForm.show = true;
  };
  $scope.closeAddNewCategoryForm = function () {
    $scope.btnAddCategory = true;
    $scope.addNewCategoryForm.show = false;
    $scope.newCategory = null;
    $scope.addNewCategoryForm.errorClass = {
      name: '',
    }
  };
  $scope.addNewCategory = function () {
    let valid = true;
    let nameNewCategory;
    if (!$scope.newCategory || !$scope.newCategory.name) {
      $scope.addNewCategoryForm.message = 'Введите название';
      $scope.addNewCategoryForm.errorClass.name = 'error';
      valid = false;
    } else {
      nameNewCategory = $scope.newCategory.name.charAt(0).toUpperCase() + $scope.newCategory.name.substr(1).toLowerCase();
      if ($scope.categories.includes(nameNewCategory)) {
        $scope.addNewCategoryForm.message = 'Категория с данным именем уже существует';
        $scope.addNewCategoryForm.errorClass.name = 'error';
        valid = false;
      } else if (!isNaN(nameNewCategory)) {
        $scope.addNewCategoryForm.message = 'Не должно быть числом';
        $scope.addNewCategoryForm.errorClass.name = 'error';
        valid = false;
      } else {
        $scope.addNewCategoryForm.errorClass.name = '';
      }
    }
    if (valid) {
      $scope.categories.push(nameNewCategory);
      $scope.btnAddCategory = true;
      $scope.addNewCategoryForm.show = false;
      $scope.newCategory = null;
    }
  };

  $scope.calcDiscount = function () {
    $scope.discount.factor = (100 - $scope.discount.value) / 100;
    return $scope.getTotal() > $scope.discount.startDiscount;
  }

});