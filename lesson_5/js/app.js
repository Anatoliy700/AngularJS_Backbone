$(function () {
  // globalEvents = _.extend({}, Backbone.Events);
  Product = Backbone.Model.extend({
    defaults: {
      title: 'none',
      level: 0,
      productivity: 0.1,
      complete: 0,
      consumes: null
    },

    validate: function (modelAttributes, options) {
      if(modelAttributes.consumes){
        var consumedProductModel = options.store.where({title: modelAttributes.consumes})[0];
        if(consumedProductModel.get('amount') < 10){
          return 'Мало корма';
        }
        // console.log('validate ', modelAttributes, consumedProductModel);
      }
    }
  });

  Farm = Backbone.Collection.extend({
    model: Product
  });

  StoreItem = Backbone.Model.extend({
    defaults: {
      title: 'none',
      amount: 0,
      price: 0
    }
  });

  Store = Backbone.Collection.extend({});

  ProductView = Backbone.View.extend({
    tagName: 'td',
    template_render: _.template($('#productView_template').html()),
    template_update: _.template($($('#productView_template').html()).find('#productView_template_update').html()
      .replace(/\&lt;/g, '<').replace(/\&gt;/g, '>')),

    /*
        template_update: _.template('<div class="level"><%= level %></div>\n' +
          '                <div class="production"><%= complete %>%</div>'),
    */
    initialize: function () {
      var thisView = this;
      // this.$el = $('#' + this.model.get('title'));
      _.bindAll(thisView, 'render', 'update', 'invalid');
      this.listenTo(this.model, 'completeProduction', this.completeProduction);
      this.listenTo(this.model, 'upgrade', this.upgrade);
      this.model.bind("change", thisView.update);
      this.model.bind("invalid", thisView.invalid);
    },

    invalid: function (model) {
      this.$el.find('.production').text(model.validationError);
      // console.log('invalid', model);
    },

    upgrade: function () {
      var level = this.model.get('level');
      this.model.set('level', level + 1);
    },
    completeProduction: function () {
      var storedProducts = myStore.where({title: this.model.get('title')});
      var amount = storedProducts[0].get('amount');
      var complete = this.model.get('complete');
      var produced = Math.floor(this.model.get('complete') / 100);
      this.model.set('complete', Math.round(complete / 100 - produced) * 100);
      storedProducts[0].set('amount', amount + produced);
      if (this.model.get('consumes') !== null) {
        storedProducts = myStore.where({title: this.model.get('consumes')});
        if (storedProducts.length && storedProducts[0].get('amount') >= 10) {
          var amount = storedProducts[0].get('amount');
          storedProducts[0].set('amount', amount - 10);
        }
      }
      if (Math.random() > 0.5) {
        this.model.trigger('upgrade');
      }
    },

    update: function () {
      this.$el.find('.data').html(this.template_update(this.model.attributes));
    },

    render: function () {
      this.$el.html(this.template_render(this.model.attributes));
      return this;
    }
  });

  ProductViewCollectoin = Backbone.View.extend({
    tagName: 'tr',
    $parentTable: $('#farm'),
    initialize: function () {
      // this.collection.on('add', this.test(), this);
      this.collection.on('add', this.renderOne, this);
      this.render();
    },

    render: function () {
      this.collection.each(function (model) {
        this.renderOne(model);
      }, this);
      this.$parentTable.append(this.el);
    },

    renderOne: function (model) {
      this.$el.append(new ProductView({model: model}).render().el);
    }
  });

  var storeViews = {};

  storeViews.storeItem = Backbone.View.extend({
    tagName: 'tr',
    template: _.template('<td><%= title %></td>\n' +
      '                 <td><%= price %></td>\n' +
      '                 <td><%= amount %></td>\n' +
      '                 <td><%- price * amount %></td>'),
    initialize: function (options) {
      _.bindAll(this, 'render');
      this.model.bind('change', this.render);
      this.model.on('fire', this.fire, this);
      this.model.on('wildChickens', this.wildChickens, this);
    },

    wildChickens: function () {
      var amountWildchickens = _.random(0, 20);
      console.log('amountWildchickens: ', amountWildchickens, this.model.toJSON());
      myStore.where({title: 'hen'})[0].set('amount',
        myStore.where({title: 'hen'})[0].get('amount') + amountWildchickens);
    },

    fire: function () {
      console.log('fire', this.model.toJSON());
      this.model.set('amount', 0);
    },

    render: function () {
      this.$el.empty();
      this.$el.html(this.template(this.model.attributes));
      return this;
    }
  });

  storeViews.Store = Backbone.View.extend({
    collection: null,
    initialize: function () {
      _.bindAll(this, 'render', 'renderOne');
      this.collection.on('add', this.renderOne, this);
      // this.collection.bind('all', this.render);
    },

    render: function () {
      var element = this.$el;
      element.empty();

      this.collection.forEach(function (model) {
        this.renderOne(model);
        /*
                var itemView = new storeViews.storeItem({
                  model: model
                });

                element.append(itemView.render().el);
              */
      }, this);
      return this;
    },

    renderOne: function (model) {
      this.$el.append(new storeViews.storeItem({model: model}).render().el);
    }
  });

  AddProductItem = Backbone.View.extend({
    el: '#addProductItem',
    events: {
      'submit': 'submit'
    },

    submit: function (e) {
      e.preventDefault();
      var title = this.$el.find('input[name=title]').val();
      var productivity = parseFloat(this.$el.find('input[name=productivity]').val());
      var consumes = this.$el.find('input[name=consumes]').val();
      var price = parseInt(this.$el.find('input[name=price]').val());

      if (title && productivity && price) {

        var model = new Product({
          title: title,
          productivity: productivity,
          level: 1,
          consumes: consumes ? consumes : null
        });
        myfarm.add(model);

        var storeModel = new StoreItem({
          title: title,
          price: price,
          amount: 0
        });
        myStore.add(storeModel);
      }
      // console.log(myfarm, myStore);
      this.$el[0].reset();
    }
  });

  myfarm = new Farm;
  myStore = new Store;
  farmSetup = [
    {
      title: 'grain',
      productivity: 5,
      level: 1,
      consumes: null
    },
    {
      title: 'hen',
      productivity: 1,
      level: 1,
      consumes: 'grain'
    },
    {
      title: 'fox',
      productivity: 0.5,
      level: 1,
      consumes: 'hen'
    }
  ];
  storeSetup = [
    {
      title: 'hen',
      price: 100,
      amount: 0
    },
    {
      title: 'fox',
      price: 777,
      amount: 0
    },
    {
      title: 'grain',
      price: 15,
      amount: 100
    }
  ];

  // views = [];

  for (item in farmSetup) {
    if (farmSetup.hasOwnProperty(item)) {
      var model = new Product(farmSetup[item]);
      myfarm.add(model);
      /*
            views.push(
              new ProductView({
                model: model
              })
            )
      */
    }
  }

  for (item in storeSetup) {
    if (storeSetup.hasOwnProperty(item)) {
      var storeModel = new StoreItem(storeSetup[item]);
      myStore.add(storeModel);
    }
  }
  storeView = new storeViews.Store({collection: myStore, el: $('#store')});
  storeView.render();

  productViews = new ProductViewCollectoin({collection: myfarm});

  addProductItem = new AddProductItem();

  var gameTimer = setInterval(function () {
    _.each(myfarm.models, function (model) {
      var level = model.get('level');
      var productivity = model.get('productivity') * (level > 0 ? Math.log(level + 1) : 0);
      var complete = model.get('complete');
      if (Math.random() < 0.001) {
        // console.log('fire');
        myStore.where({title: model.get('title')})[0].trigger('fire');
        return;
      }
      if (complete >= 100) {
        model.trigger('completeProduction');
      } else {
        complete = Math.round(100 * (complete + productivity)) / 100;
        model.set({complete: complete}, {validate: true, store: myStore});
      }
    });
    if (Math.random() < 0.02) {
      // console.log('wildChickens', model.toJSON());
      myStore.where({title: 'hen'})[0].trigger('wildChickens');
    }
  }, 1000);
});