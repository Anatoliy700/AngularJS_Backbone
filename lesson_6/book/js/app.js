$(function () {
    //Общий объект для листалки страниц
    var Pager = {};
    //Отдельная кнопочка на листалке
    Pager.PageButton = Backbone.View.extend({
        //вот тут я облажался на занятии.
        tagName: 'span',
        //задаем шаблон underscore
        template: _.template('<a href="#<%= number%>"><%= number%></a>'),
        //Стандартная инициализация
        initialize: function(){
            //Для устранения проблемы контекста this
            _.bindAll(this, 'render');
            //Привязка любого изменения модели к отрисовки этой вьюхи
            this.model.bind('change', this.render);
        },
        //отрисовка
        render: function(){
            this.$el.empty();
            this.$el.html(this.template(this.model.attributes));
            return this;
        }
    });
    //Вьюха для обертки листалки
    Pager.Line = Backbone.View.extend({
        initialize: function(){
            //Для устранения проблемы контекста this
            _.bindAll(this, 'render');
            //Привязка любого изменения модели к отрисовки этой вьюхи
            this.collection.bind('all', this.render);
        },
        render: function(){
            var element = this.$el;
            element.empty();
            //Проход по всем моделькам коллеции. Модельки - номера страниц
            _.each(this.collection.models,function(model){
                var itemView = new Pager.PageButton({model:model});
                //А можно еще itemView.render().el.html()
                //тогда нам вообще все равно во что вьюха
                //оборачивает
                var el = itemView.render().el;
                element.append(el);
            });
            return this;
        }
    });
    //Моделька кнопочки страницы
    Pager.SinglePage = Backbone.Model.extend({
    });
    //Коллекция кнопочек
    Pager.LineCollection = Backbone.Collection.extend({
    });
    var pagerCollection = new Pager.LineCollection();
    var pager = new Pager.Line({collection:pagerCollection,el:$('#pager')});
    //Чтобы нулевая страница была с самого начала
    pagerCollection.add(new Pager.SinglePage({number:1}));

    //модель сраницы пустая
    var PageModel = Backbone.Model.extend({
        defaults: {
            text: 'книга не загружена'
        }
    });

    //Представление страницы
    var PageView = Backbone.View.extend({
        //Инициализация
        initialize: function () {
            //Для устранения проблемы контекста this
            _.bindAll(this, 'render');
            //Привязка любого изменения модели к отрисовки этой вьюхи
            this.model.bind('change', this.render);
        },
        //отрисовка вьюхи
        render: function () {
            //очищение элемента
            this.$el.empty();
            //заполнение элемента
            this.$el.html(this.model.get('text'));
            return this;
        }
    });

    //создание экземпляра модели
    var page = new PageModel();
    // создание экземпляра вьюхи
    var book_page = new PageView({el: $('#page'), model: page});
    //первичная отрисовка
    book_page.render();

    var Router = Backbone.Router.extend({
        routes: {
            ":pageNumber": "turnpage"
        },
        //Функция переворота страницы
        turnpage: function (pageNumber) {
            //jQuery ajax запрос
            $.ajax({
                //адрес с которого брать книгу
                url: 'js/data.json',
                //в случае успеха
                success: function (result) {
                    //Получен ли ответ
                    if (typeof result !== 'undefined') {
                        //Есть ли нужная страница
                        if (typeof result[pageNumber - 1] !== 'undefined') {
                            page.set('text', result[pageNumber - 1]);
                        }

                        var i;
                        //Убрать все элементы коллекции
                        //reset быстрее. И работает со всеми
                        pagerCollection.reset();
                        for (i = 0; i < result.length; i++) {
                            pagerCollection.add(new Pager.SinglePage({number:i+1}));
                        }

                        /*//не делайте так :)
                        $("#pager").empty();
                        for (i = 0; i < result.length; i++) {
                            $("#pager").append('<a href="#' + (i + 1) + '">' + i + '</a>');
                        }*/
                    }
                },
                //в случае фейла
                error: function (a, b, c) {
                    console.log(a, b, c);
                    console.log('Request error');
                }
            });
        }
    });
    window.router = new Router();
    Backbone.history.start();
});