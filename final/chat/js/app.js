$(function () {

  $.ajaxSetup({
    // url: 'backend/index.php',
    url: 'http://chat.easycs.ru',
    // url: 'backend/proxy.php?url=http://chat.easycs.ru&mode = native',
    method: 'POST',
    // contentType: 'application/json',
    // dataType: 'json',
    // crossDomain: true
  });

  const DataReguest = Backbone.Model.extend({
    defaults: {
      jsonrpc: "2.0",
      method: '',
      params: {},
      id: 0,
    },

    getData(method, params) {
      this.set({method: method, params: params, id: this.get('id') + 1});
      return this.toJSON();
    }
  });
  let dataReguest = new DataReguest();

  const AuthData = Backbone.Model.extend({
    defaults: {
      auth_sid: null,
      auth_token: null
    },

    validate(attr) {
      if (!attr.auth_sid || !attr.auth_token) {
        return 'noAuth';
      }

      if (attr.auth_sid === this.get('auth_sid') && attr.auth_token === this.get('auth_token')) {
        window.location = '#1';
      }
    }
  });

  const LoginModel = Backbone.Model.extend({
    defaults: {
      nickname: '',
      password: ''
    },

    validate(attr) {
      //проверка на допустимый nickname и password
    }
  });

  const RegisterModel = Backbone.Model.extend({
    defaults: {
      nickname: '',
      password: '',
      email: '',
      display_name: ''
    },
    validate(attr) {
      if (!attr.nickname || !attr.email || !attr.display_name || attr.password !== attr.password_check) {
        return 'incorrect';
      }
      this.unset('password_check');
    }
  });

  const SendMessageModel = Backbone.Model.extend({
    defaults: {
      to: 'all',
      message: ''
    },
    validate(attr) {
      if (attr.to === 'me') {
        return 'no send me';
      }
    }
  });

  const MessageModel = Backbone.Model.extend({
    defaults: {
      "from": "me",
      "to": "",
      "date": "",
      "unixtime": "",
      "body": "",
      "id": null
    },

    initialize() {
      this.setNowDate();
    },

    setNowDate() {
      let today = new Date();
      let dd = correctItem(today.getDate());
      let mm = correctItem(today.getMonth() + 1); //January is 0!
      let yyyy = today.getFullYear();
      let hh = correctItem(today.getHours());
      let min = correctItem(today.getMinutes());
      let ss = correctItem(today.getSeconds());

      function correctItem(item) {

        if (item < 10) {
          return item = '0' + item
        }
        return item;
      }

      this.set('unixtime', today.getTime());
      this.set('date', `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`);
    }
  });

  const MessagesModelsCollection = Backbone.Collection.extend({
    model: MessageModel,
    messagesIdArr: [],

    checkUniqueMsg(id) {
      if (!this.messagesIdArr.length || !this.messagesIdArr.includes(id)) {
        this.messagesIdArr.push(id);
        return true;
      } else {
        return false;
      }
    }
  });

  const LoginView = Backbone.View.extend({
    tagName: 'div',
    className: 'wrapLogin',
    template: _.template($('#loginTemplate').html()),

    initialize() {
      this.model = new LoginModel();
    },
    //перенес привязку события в render
    /*
            events: {
              'submit': 'submit'
            },
    */


    submit(event) {
      event.preventDefault();
      let data = {
        nickname: this.$el.find('input[name=nickname]').val(),
        password: this.$el.find('input[name=password]').val()
      };

      this.model.set(data);
      if (!this.model.isValid()) {
        this.model.clear();
        return;
      }

      this.$el.find('form')[0].reset();

      this.request();
    },

    render() {
      this.$el.html(this.template);
      this.$el.on('submit', 'form', (e) => this.submit(e));
      return this;
    },

    request() {
      $.ajax({
        data: JSON.stringify(dataReguest.getData('login', this.model.toJSON())),
        // data: '{"jsonrpc": "2.0", "method": "test", "params": {"key":"value"}, "id": 100500}',
        success: (response) => {
          if (!response.error && response.result) {
            rootView.model.set(response.result, {validate: true});
          }
        },
        error(err) {
          console.error('err: ', err);
        }
      });
    }
  });

  const RegisterView = Backbone.View.extend({
    tagName: 'div',
    className: 'wrapRegister',
    template: _.template($('#registerTemplate').html()),

    initialize() {
      this.model = new RegisterModel();
    },
    //перенес привязку события в render
    /*
        events: {
          'submit': 'submit'
        },
    */

    submit(event) {
      event.preventDefault();
      let data = {
        nickname: this.$el.find('input[name=nickname]').val(),
        password: this.$el.find('input[name=password]').val(),
        password_check: this.$el.find('input[name=password-check]').val(),
        email: this.$el.find('input[name=email]').val(),
        display_name: this.$el.find('input[name=display_name]').val(),
      };

      this.model.set(data);
      if (!this.model.isValid()) {
        this.model.clear();
        return;
      }

      this.$el.find('form')[0].reset();

      this.request();
    },

    render() {
      this.$el.html(this.template);
      this.$el.on('submit', 'form', (e) => this.submit(e));
      return this;
    },

    request() {
      $.ajax({
        data: JSON.stringify(dataReguest.getData('register', this.model.toJSON())),
        success: (response) => {
          if (!response.error && response.result) {
            rootView.model.set(response.result, {validate: true});
          }
        },
        error(err) {
          console.error('err: ', err);
        }
      });
    }

  });

  const SendMessageView = Backbone.View.extend({
    tagName: 'div',
    className: 'wrapSendMessage',
    template: _.template($('#sendMessageTemplate').html()),
    $elemTo: null,

    initialize() {
      this.model = new SendMessageModel();
      this.model.on('change:to', this.setTo, this)
    },
    //перенес привязку события в render
    /*
        events: {
          'submit': 'submit'
        },
    */

    submit(event) {
      event.preventDefault();
      let data = {
        message: this.$el.find('textarea[name=message]').val()
      };

      data.body = data.message;

      this.model.set(data);
      if (!this.model.isValid()) {
        this.model.clear();
        return;
      }

      let messageModel = new MessageModel(this.model.toJSON());
      messagesColection.add(messageModel);

      //отправка сообщения на сервер и в случае успеха, вывод его в чат
      this.request(messageModel);

      this.$el.find('form')[0].reset();
    },

    setTo() {
      this.$elemTo.text(this.model.get('to'));
    },

    setInModelAttrTo() {
      this.model.set('to', 'all');
    },


    render() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.on('submit', 'form', (e) => this.submit(e));
      this.$el.on('dblclick', '#sendMessageTo_all', () => this.setInModelAttrTo());
      this.$el.keypress('#sendMessage > textarea', (e) => this.submitKeys(e));
      this.$elemTo = this.$el.find('#sendMessageTo_name');
      return this;
    },

    submitKeys(e) {//ctrl + enter
      if (e.ctrlKey && e.keyCode === 10) {
        // this.submit();
        this.$el.find('input[type=submit]').click();
      }
    },

    request(messageModel) {
      let params = rootView.model.toJSON();
      Object.assign(params, this.model.toJSON());
      $.ajax({
        data: JSON.stringify(dataReguest.getData('send_msg', params)),
        success: (response) => {
          if (response.result && response.result.success && response.result.id) {
            messageModel.set('id', response.result.id);
            messagesColection.messagesIdArr.push(response.result.id);
            messageModel.trigger('send', true);
          } else {
            messageModel.trigger('send', false);
          }
        },
        error(err) {
          console.error('err: ', err);
        }
      });
    }

  });

  const MessageView = Backbone.View.extend({
    tagName: 'div',
    className: 'wrapMessage',
    template: _.template($('#messageTemplate').html()),

    initialize() {
      this.model.on('send', this.setStatusSend, this);
    },

    render() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.dblclick(() => this.setToMessage());
      return this;
    },

    setToMessage() {
      rootView.sendMessageForm.model.set('to', this.model.get('from'), {validate: true});
    },

    setStatusSend(status) {
      if (status) {
        this.$el.removeClass('error').addClass('success');
      } else {
        this.$el.addClass('error');
      }
    }
  });

  const MessagesViewsCollection = Backbone.View.extend({
    tagName: 'div',
    className: 'wrapMessages',
    arrMessageView: [],

    initialize() {
      this.collection.on('add', this.addOne, this);
    },

    render() {
      this.$el.empty();
      if (this.arrMessageView.length) {
        _.each(this.arrMessageView, view => this.addOne(view));
      } else {
        this.collection.each(function (messageModel) {
          this.addOne(messageModel);
        }, this);
      }
      return this;
    },

    addOne(messageModelOrView) {
      let view;
      if (!messageModelOrView.el) {
        view = new MessageView({model: messageModelOrView});
        this.arrMessageView.push(view);
      } else {
        view = messageModelOrView;
      }
      this.$el.append(view.render().el);
    }
  });

  const RootView = Backbone.View.extend({
    el: '#content',
    template: _.template($('#rootMenuTemplate').html()),
    loginForm: null,
    registerForm: null,
    sendMessageForm: null,
    timerGetMessage: null,
    initialize() {
      this.model = new AuthData();
      this.model.on('change', this.auth, this);
      // this.model.on('all', this.auth, this);
      this.loginForm = new LoginView();
      this.registerForm = new RegisterView();
      this.sendMessageForm = new SendMessageView();
      this.messagesViewsCollection = null;
      this.render();
    },

    auth() {
      if (this.model.isValid()) {
        window.location = '#1';
      }
    },

    setTimerGetMessage(status) {
      if (status === 'start') {
        this.timerGetMessage = setInterval(() => {
          this.getMessages()
        }, 1000);
      } else if (status === 'stop') {
        clearInterval(this.timerGetMessage);
        this.timerGetMessage = null;
      }
    },

    getMessages() {
      if (this.model.isValid()) {
        this.request();
      }
    },

    render() {
      this.$el.html(this.template);
    },

    login() {
      if (this.timerGetMessage) {
        this.setTimerGetMessage('stop');
      }
      this.render();
      this.$el.append(this.loginForm.render().el);
      // this.$el.append(new LoginView().render().el);
    },

    register() {
      if (this.timerGetMessage) {
        this.setTimerGetMessage('stop');
      }
      this.render();
      this.$el.append(this.registerForm.render().el);
      // this.$el.append(new RegisterView().render().el);
    },

    chat() {
      if (this.model.isValid()) {
        //делаем запрос для получения 10 сообщений
        // this.getMessages();
        if (!this.timerGetMessage) {
          this.setTimerGetMessage('start');
        }
        //выводим коллекцию представлений
        this.render();

        this.messagesViewsCollection ||
        (this.messagesViewsCollection = new MessagesViewsCollection({collection: messagesColection}));
        this.$el.append(this.messagesViewsCollection.render().el);

        // this.$el.append(new MessagesViewsCollection({collection: messagesColection}).el);
        this.$el.append(this.sendMessageForm.render().el);
        // this.$el.append(new SendMessageView().el);
      } else {
        window.location = '#2';
      }
    },

    request(limit = 10, offset = 0) {
      let params = this.model.toJSON();
      /*
            params.filter = {
              limit: limit,
              offset: offset
            };
      */
      Object.assign(params, {
        limit: limit,
        offset: offset
      });
      $.ajax({
        data: JSON.stringify(dataReguest.getData('get_msg', params)),
        success: (response) => {
          if (response && !response.error && response.result) {
            let messages = response.result.messages;
            // console.log(response);
            _.each(messages, function (message) {
              if (messagesColection.checkUniqueMsg(message.id)) {
                messagesColection.add(new MessageModel(message));
              }
            }, this);
          }
        },
        error(err) {
          console.error('err: ', err);
        }
      });
    }


  });

  const Router = Backbone.Router.extend({
    routes: {
      '1': 'chat',
      '2': 'login',
      '3': 'register',
      ':*': 'start'
    },

    start() {
      this.login();
    },

    login() {
      rootView.login();
    },

    register() {
      rootView.register();
    },

    chat() {
      rootView.chat();
    }

  });

  let messagesColection = new MessagesModelsCollection();
  let rootView = new RootView();
  let router = new Router();
  Backbone.history.start();
});