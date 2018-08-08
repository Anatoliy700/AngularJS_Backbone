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
    }
  });

  const LoginModel = Backbone.Model.extend({
    defaults: {
      nickname: '',
      password: ''
    },

    /*
        initialize() {
          console.log('loginModel');
        },
    */

    validate(attr) {
      console.log('val', attr);
      if (attr.nickname === 'qwe') {
        return 'rrr';
      }
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
      // console.log('reg: ', attr);
    }
  });

  const SendMessageModel = Backbone.Model.extend({
    defaults: {
      auth_sid: '',
      auth_token: '',
      to: 'all',
      message: ''
    },
    validate(attr) {
    }
  });

  const LoginView = Backbone.View.extend({
    tagName: 'div',
    className: 'wrapLogin',
    template: _.template($('#loginTemplate').html()),

    initialize() {
      this.model = new LoginModel();
    },

    events: {
      'submit': 'submit'
    },


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
      console.log(data, this.model.toJSON(), this.model);
    },

    render() {
      this.$el.html(this.template);
      return this;
    },

    request() {
      $.ajax({
        data: JSON.stringify(dataReguest.getData('login', this.model.toJSON())),
        success: (response) => {
          if (!response.error && response.result) {
            rootView.model.set(response.result);
          }
          console.log('success: ', response, this);
        },
        error(err) {
          console.log('err: ', err);
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

    events: {
      'submit': 'submit'
    },

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
      console.log(data, this.model.toJSON(), this.model);
    },

    render() {
      this.$el.html(this.template);
      return this;
    },

    request() {
      $.ajax({
        data: JSON.stringify(dataReguest.getData('register', this.model.toJSON())),
        success: (response) => {
          if (!response.error && response.result) {
            rootView.model.set(response.result);
          }
          console.log('success: ', response, this);
        },
        error(err) {
          console.log('err: ', err);
        }
      });
    }

  });

  const SendMessageView = Backbone.View.extend({
    tagName: 'div',
    className: 'wrapSendMessage',
    template: _.template($('#sendMessageTemplate').html()),

    initialise() {
      this.model = new SendMessageModel();
    },

    render() {
      this.$el.html(this.template);
      return this;
    }
  });

  const RootView = Backbone.View.extend({
    el: '#content',
    template: _.template($('#rootMenuTemplate').html()),
    loginForm: null,
    registerForm: null,
    sendMessageForm: null,
    initialize() {
      this.model = new AuthData();
      this.model.on('change', this.auth, this);
      this.loginForm = new LoginView();
      this.registerForm = new RegisterView();
      this.sendMessageForm = new SendMessageView();
      this.render();
    },

    auth() {
      // console.log('auth: ', this.model.toJSON());
      console.log('auth_valid: ', this.model.isValid());
      this.chat();

    },

    render() {
      this.$el.html(this.template);
    },

    login() {
      this.render();
      this.$el.append(this.loginForm.render().el);
    },

    register() {
      this.render();
      this.$el.append(this.registerForm.render().el);
    },

    chat() {
      if (this.model.isValid()) {
        //делаем запрос для получения 10 сообщений
        this.request();
        //парсим сообщения, создаем для каждого модель и собираем из них коллекцию моделей
        //создаем коллекцию представлений для моделей сообщений
        //выводим коллекцию представлений
        console.log('chat');
      } else {
        this.login();
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
           console.log(response);
          }
          console.log('chat: ', response, this);
        },
        error(err) {
          console.log('err: ', err);
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


  let rootView = new RootView();
  let router = new Router();
  Backbone.history.start();

});