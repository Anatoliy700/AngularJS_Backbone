const Category = Backbone.Model.extend({
  defaults: {
    name: ''
  },

  regExp: {
    name: /^[A-Za-zА-Яа-яЁё ]+$/,
  },

  validate: function (attr, options) {
    // console.log(attr);
    let out = {
      name: null,
    };
    if (!attr.name || !this.regExp.name.test(attr.name)) {
      out.name = 'Только английские или русские символы';

      if (_.some(out, el => el)) {
        return out;
      }
    }
  }
});

const ExpsItem = Backbone.Model.extend({
  defaults: {
    name: '',
    category: '',
    amount: '',
    price: ''
  },

  regExp: {
    name: /^[A-Za-zА-Яа-яЁё ]+$/,
  },
  validate: function (attr, options) {
    // console.log(attr);
    let out = {
      name: null,
      category: null,
      amount: null,
      price: null,
    };
    if (!attr.name || !this.regExp.name.test(attr.name)) {
      out.name = 'Только английские или русские символы';
    }
    if (!attr.category) {
      out.category = 'Выберите категорию';
    }
    if (!attr.amount) {
      out.amount = 'Должно быть число';
    }
    if (!attr.price) {
      out.price = 'Должно быть число';
    }

    if (_.some(out, el => el)) {
      return out;
    }
  }
});

const Categories = Backbone.Collection.extend({
  model: Category
});

const ExpsItems = Backbone.Collection.extend({
  model: ExpsItem
});

const CategoryView = Backbone.View.extend({
  tagName: 'option',
  // template: _.template(""),
  render: function () {
    this.$el.text(this.model.get('name')).val(this.model.get('name'));
    return this;
  }
});

const ExpsItemView = Backbone.View.extend({
  tagName: 'tr',
  template: _.template("<td><%= name %></td><td><%= category %></td><td><%= amount %></td><td><%= price %></td>"),
  render: function () {
    this.$el.html(this.template(this.model.toJSON()));
    return this;
  },
});


const CategoryViews = Backbone.View.extend({
  el: $('#selectCategory'),
  template: '',
  initialize: function () {
    this.collection.on('add', this.renderElem, this);
    this.render();
  },
  render: function () {
    this.collection.each(this.renderElem, this);
  },

  renderElem: function (category) {
    let categoryView = new CategoryView({model: category});
    this.$el.append(categoryView.render().el);
  }
});

const ExpsItemViews = Backbone.View.extend({
  tagName: 'tbody',
  template: _.template("<td><%= ind %></td>"),
  thead: $('#totalPrice'),

  initialize: function () {
    this.collection.on('add', this.render, this);
    this.$parentEl = $('#expsTable');
    this.$parentEl.append(this.$el);
    this.render();

  },
  render: function () {
    this.$el.text('');
    this.collection.each(this.renderElem, this);
    let totalPrice = this.collection.toJSON().reduce(function (memo, item) {
      return memo + item.price * item.amount;
    }, 0);
    // this.$el.appendTo('#expsTable');
    this.thead.text(totalPrice);
    return this;
  },

  renderElem: function (expsItem, ind) {
    let expsItemView = new ExpsItemView({model: expsItem});
    let $child = expsItemView.render().$el.prepend($(this.template({ind: ++ind})));
    this.$el.append($child);
  },

});

const AddExpsItem = Backbone.View.extend({
  el: $('#addExpsItem'),
  events: {
    'submit': 'submit'
  },
  submit: function (event) {
    event.preventDefault();
    let newExpsItemData = {
      name: $(event.currentTarget).find('input[name = name]').val(),
      category: $(event.currentTarget).find('select[name = category]').val(),
      amount: parseInt($(event.currentTarget).find('input[name = amount]').val()),
      price: parseFloat($(event.currentTarget).find('input[name = price]').val()),
    };

    let newExpsItem = new ExpsItem(newExpsItemData);
    // newExpsItem.on('invalid', this.error, this);
    if (newExpsItem.isValid()) {
      this.$el.find('input, select').removeClass('error valid').not('select, input[type=submit]').val('');
      this.collection.add(newExpsItem);
    } else {
      _.each(newExpsItem.validationError, function (val, prop) {
        if (val) {
          this.$el.find(`input[name = ${prop}], select[name = ${prop}]`).removeClass('valid').addClass('error')
            .val('').next('span').text(val);
        } else {
          this.$el.find(`input[name = ${prop}], select[name = ${prop}]`).removeClass('error').addClass('valid')
            .next('span').text('');
        }
      }, this)
    }
  }
});

const AddCategory = Backbone.View.extend({
  el: $('#addCategory'),
  events: {
    'submit': 'submit'
  },
  submit: function (event) {
    event.preventDefault();
    let newCategoryData = {
      name: $(event.currentTarget).find('input[name = name]').val()
    };

    let newCategory = new Category(newCategoryData);
    newCategory.on('invalid', this.error, this);
    let valid = false;
    if (newCategory.isValid()) {
      if (_.some(this.collection.toJSON(), val => val.name === newCategory.get('name'))) {
        newCategory.validationError = {name: 'Категория уже существует'};
      } else {
        valid = true;
      }
    }
    if (valid) {
      this.$el.find('input').removeClass('error valid').not('input[type=submit]').val('');
      this.collection.add(newCategory);
    } else {
      if (newCategory.validationError) {
        _.each(newCategory.validationError, function (val, prop) {
          if (val) {
            this.$el.find(`input[name = ${prop}]`).removeClass('valid').addClass('error')
              .val('').next('span').text(val);
          } else {
            this.$el.find(`input[name = ${prop}]`).removeClass('error').addClass('valid')
              .next('span').text('');
          }
        }, this)
      }
    }

  },

  error: function (event) {
    // console.log(event, 222);
  }
});

let categories = new Categories([
  {name: 'продукты'},
  {name: 'одежда'},
  {name: 'техника'}
]);

let expsItems = new ExpsItems([
  {
    name: 'яблоки',
    category: 'продукты',
    amount: 2,
    price: 55
  },
  {
    name: 'штаны',
    category: 'одежда',
    amount: 1,
    price: 1500
  },
  {
    name: 'чайник',
    category: 'техника',
    amount: 1,
    price: 999
  }
]);

let categoryViews = new CategoryViews({collection: categories});

let expsItemViews = new ExpsItemViews({collection: expsItems});

let addExpsItem = new AddExpsItem({collection: expsItems});

let addCategory = new AddCategory({collection: categories});


