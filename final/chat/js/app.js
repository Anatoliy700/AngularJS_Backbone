$(function () {

  $.ajaxSetup({
    // url: 'js/data.json',
    url: 'backend/index.php',
    type: 'POST',
    contentType: 'application/json',
    dataType: 'json'
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
    }
  });

  const MessageModel = Backbone.Model.extend({
    defaults: {
      "from": "me",
      "to": "",
      "date": "",
      "unixtime": "",
      "body": ""
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
    unixtimeLastMsg: 0,

    checkLastMsg(unixtime) {
      if (unixtime <= this.unixtimeLastMsg) {
        return false;
      } else {
        this.unixtimeLastMsg = unixtime;
        return true;
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

    initialize() {
      this.model = new SendMessageModel();
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

    render() {
      this.$el.html(this.template);
      this.$el.on('submit', 'form', (e) => this.submit(e));
      return this;
    },

    request(messageModel) {
      let params = rootView.model.toJSON();
      Object.assign(params, this.model.toJSON());
      $.ajax({
        data: JSON.stringify(dataReguest.getData('send_msg', params)),
        success: (response) => {
          if (response.result && response.result.success) {
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
      return this;
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

    initialize() {
      this.collection.on('add', this.addOne, this);
    },

    render() {
      this.collection.each(function (messageModel) {
        this.addOne(messageModel);
        return this;
      });
    },

    addOne(messageModel) {
      this.$el.append(new MessageView({model: messageModel}).render().el);
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

    auth(e) {
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
        this.$el.append(this.messagesViewsCollection.el);

        // this.$el.append(new MessagesViewsCollection({collection: messagesColection}).el);
        this.$el.append(this.sendMessageForm.render().el);
        // this.$el.append(new SendMessageView().el);
      } else {
        window.location = '#2';
      }
    },

    request(limit = 10, offset = 0) {
      let params = this.model.toJSON();
      params.filter = {
        limit: limit,
        offset: offset
      };
      $.ajax({
        data: JSON.stringify(dataReguest.getData('get_msg', params)),
        success: (response) => {
          if (response && !response.error && response.result) {
            let messages = response.result.messages;
            _.each(messages, function (message) {
              if (messagesColection.checkLastMsg(message.unixtime)) {
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