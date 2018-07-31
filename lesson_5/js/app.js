$(function () {
    // globalEvents = _.extend({}, Backbone.Events);
    Product = Backbone.Model.extend({
        defaults: {
            title: 'none',
            level: 0,
            productivity: 0.1,
            complete: 0,
            consumes: null
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
        tagName: 'div',
        template: _.template('<div class="level"><%= level %></div>\n' +
            '                <div class="production"><%= complete %>%</div>'),
        initialize: function () {
            var thisView = this;
            this.$el = $('#' + this.model.get('title'));
            _.bindAll(thisView, 'render');
            this.listenTo(this.model, 'completeProduction', this.completeProduction);
            this.listenTo(this.model, 'upgrade', this.upgrade);
            this.model.bind("all", function (model) {
                thisView.render(model);
            });
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
            this.model.set('complete', Math.round(complete/100 - produced)*100);
            storedProducts[0].set('amount', amount + produced);
            if (this.model.get('consumes') !== null) {
                storedProducts = myStore.where({title: this.model.get('consumes')});
                if (storedProducts.length == 0 || storedProducts[0].get('amount') < 10) {
                    return;
                }
                var amount = storedProducts[0].get('amount');
                storedProducts[0].set('amount', amount - 10);
            }
            if (Math.random() > 0.5) {
                this.model.trigger('upgrade');
            }
        },
        render: function (model) {
            this.$el.find('.data').html(this.template(this.model.attributes));
            return this;
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
            _.bindAll(this, 'render');
            this.collection.bind('all', this.render);
        },

        render: function () {
            var element = this.$el;
            element.empty();

            this.collection.forEach(function (item) {
                var itemView = new storeViews.storeItem({
                    model: item
                });
                element.append(itemView.render().el);
            });

            return this;
        }
    });

    myfarm = new Farm;
    myStore = new Store;
    farmSetup = [
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
        },
        {
            title: 'grain',
            productivity: 5,
            level: 1,
            consumes: null
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

    views = [];

    for (item in farmSetup) {
        if (farmSetup.hasOwnProperty(item)) {
            var model = new Product(farmSetup[item]);
            myfarm.add(model);
            views.push(
                new ProductView({
                    model: model
                })
            )
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

    var gameTimer = setInterval(function () {
        _.each(myfarm.models, function (model) {
            var level = model.get('level');
            var productivity = model.get('productivity') * (level>0?Math.log(level+1):0);
            var complete = model.get('complete');
            if (complete > 100) {
                model.trigger('completeProduction');
            } else {
                complete = Math.round(100 * (complete + productivity)) / 100;
                model.set('complete', complete);
            }
        })
    }, 1000);
});