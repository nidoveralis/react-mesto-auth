import { React, useState } from 'react';
import { Link, withRouter } from "react-router-dom";

function Register(props) {
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  function emailInputValue(e) {
    setEmailValue(e.target.value);
  };

  function passwordInputValue(e) {
    setPasswordValue(e.target.value);
  };

  function signUp() {
    const { password,email } = {
      password: passwordValue,
      email: emailValue
    };
    props.onRegister({ password,email })
  }

  return(
    <div className="login">
      <form className="login__form">
        <h2 className="login__title">Регистрация</h2>
        <fieldset className="login__field">
          <input type='text' className="login__input" name="mail" placeholder="Email" onChange={emailInputValue} />
        </fieldset>
        <fieldset className="login__field">
        <input type='password' className="login__input" name="password" placeholder="Пароль" onChange={passwordInputValue} />
        </fieldset>
      </form>
      <div className="login__buttons">
        <button className="login__button" onClick={signUp}>Зарегистрироваться</button>
        <Link to="./signin" className="login__sing-in">Уже зарегистрированы? Войти</Link>
      </div>
    </div>
  )
};
export default withRouter(Register);