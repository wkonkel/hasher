with (Hasher('Application')) {
  route('#', function() {
    render(login_form());
  });

  define('login_form', function() {
    return div(
      form({ action: login_form_submitted },
        h1("Login"),
        text({ name: 'login', placeholder: 'Login' }),
        password({ name: 'password', placeholder: 'Password' }),
        button('Go'),
        ' or ',
        a({ href: '#forgot-password' }, 'forgot password')
      )
    );
  });

  define('login_form_submitted', function(data) {
    alert('form_submitted');
    console.log(data);
  });




  route('#forgot-password', function() {
    render(forgot_password_form());
  });

  define('forgot_password_form', function() {
    return div(
      form({ action: forgot_password_action },
        h1('Forgot Password'),
        text({ name: 'email' }),
        button('Go'),
        ' or ',
        a({ href: '#' }, 'Login')
      )
    );
  });

  define('forgot_password_action', function(data) {
    alert('forgot_password_action');
    console.log(data);
  });
}
