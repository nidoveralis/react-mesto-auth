import { React, useEffect, useState, useContext } from 'react';
import { Switch, Route, Redirect, useHistory } from 'react-router-dom';
import Main from './Main';
import Header from './Header';
import Footer from './Footer';
import PopupWithForm from './PopupWithForm';
import ImagePopup from './ImagePopup';
import EditProfilePopup from './EditProfilePopup';
import EditAvatarPopup from './EditAvatarPopup';
import AddPlacePopup from './AddPlacePopup';
import Login from './Login';
import ProtectedRoute from './ProtectedRoute';
import Register from './Register';
import InfoTooltip from './InfoTooltip';
import { api } from '../utils/Api';
import { objectValid } from '../utils/utils';
import { CurrentUserContext } from '../contexts/CurrentUserContext';

function App() {
  const history = useHistory();
  const userContext = useContext(CurrentUserContext);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isImagePopupOpen, setIsImagePopupOpen] = useState(false);
  const [infoTooltipPopupOpen, setInfoTooltipPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState({});
  const [currentUser,setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userData, setUserData] = useState('');
  const [answer, setAnswer] = useState('');

  function openMainComponent() {
    changeLoggedIn();
    history.push('/');
  };

  function handleInfoTool(data) {
    setAnswer(data);
    setInfoTooltipPopupOpen(true);
  };

  function logIn(data) {
    api.signIn(data).then(()=>{
      openMainComponent();
    })
    .catch(()=>{
    setAnswer('error');
    setInfoTooltipPopupOpen(true);
    });
  };

  function handleRegister(data) {
    api.signUp(data.password, data.email).then((data)=>{
      if(data){
        handleInfoTool('success');
        history.push('/signin');
      }
    })
    .catch(()=>handleInfoTool('error'))
  };
  
  function removeUserToken() {
    localStorage.removeItem('jwt');
    setLoggedIn(false);
  };

  function changeLoggedIn() {
    setLoggedIn(true);
  };

  function handleEscClose(e) {
    if(e.key === 'Escape'){
      closeAllPopups(e);
    };
  };

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
    document.addEventListener('keydown', handleEscClose);
  };

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
    document.addEventListener('keydown', handleEscClose);
  };

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
    document.addEventListener('keydown', handleEscClose);
  };

  function handleCardClick(card) {
    setSelectedCard(card);
    setIsImagePopupOpen(true);
    document.addEventListener('keydown', handleEscClose);
  };

  function closeAllPopups() {
    setIsEditAvatarPopupOpen(false);
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsImagePopupOpen(false);
    setInfoTooltipPopupOpen(false);
    setSelectedCard({});
    document.removeEventListener('keydown', handleEscClose);
  };

  function clickOnPlace(e) {
    if(e.target.classList.contains('popup_opened') || e.target.classList.contains('popup__button-close')){
      closeAllPopups();
    };
  };

  useEffect(()=>{
    const jwt = localStorage.getItem('jwt');
      if(jwt) {
        api.checkToken(jwt).then(data=>{
          setUserData(data.data.email);
          openMainComponent();
        })
        .catch(e=>console.log(e));
      }
  }, [loggedIn]);

  useEffect(()=>{
    api.getUserInfo().then(data=>{
      setCurrentUser(data);
    })
    .catch(e=>console.log(e));
  }, []);

  useEffect(() => {
    api.getInitialCards().then(data=>{
      setCards(data);
    })
    .catch(e=>console.log(e));
  }, []);

  function handleUpdateUser(user) {
    api.setUserInfo(user).then(data=>{
      setCurrentUser(data);
      closeAllPopups();
    })
    .catch(e=>console.log(e));
  };

  function handleUpdateAvatar(avatar) {
    api.setUserAvatar(avatar).then(data=>{
      setCurrentUser(data);
      closeAllPopups();
    })
    .catch(e=>console.log(e));
  };

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    api.changeLikeCardStatus(card._id, !isLiked).then((newCard) => {
      setCards((state) => state.map((c) => c._id === card._id ? newCard : c));
    })
    .catch(e=>console.log(e))
  };

  function handleUpdateAddPlace(item) {
    api.addNewCard(item).then(newCard=>{
      setCards([newCard, ...cards]); 
      closeAllPopups();
    })
    .catch(e=>console.log(e))
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id).then((res) => {
      setCards(prevCards=>prevCards.filter(item=>{return (item._id!==card._id)}))
    })
    .catch(e=>console.log(e))
  };

  return (
    <CurrentUserContext.Provider value={currentUser} >
      <div className="App">
          <div className="page">
            <Header message={userData} onSingOut={removeUserToken}/>
            <Switch>
              <ProtectedRoute exact path="/" 
                compoment={Main}
                onEditAvatar = {handleEditAvatarClick} 
                onEditProfile={handleEditProfileClick} 
                onAddPlace ={handleAddPlaceClick} 
                onCardClick = {handleCardClick} 
                cards={cards} 
                onCardLike={handleCardLike} 
                onCardDelete={handleCardDelete}
               loggedIn={loggedIn}>
              </ProtectedRoute>
              <Route path="/signin" >
                <Login handleLogin={changeLoggedIn} onLogin={logIn} answer={handleInfoTool}/>
              </Route>
              <Route path="/signup" >
                <Register answer={handleInfoTool} onRegister={handleRegister}/>
              </Route>
              <Route path="*" >
                <Redirect to="/" />
              </Route>
              <Route >
                {loggedIn ?  <Redirect to="/" /> : <Redirect to="/signin" />}
              </Route>
            </Switch>
            <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={clickOnPlace} onUpdateUser={handleUpdateUser} />
            <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={clickOnPlace} onUpdateAvatar={handleUpdateAvatar} /> 
            <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={clickOnPlace} onAddPlace={handleUpdateAddPlace} />
            <PopupWithForm onClose = {clickOnPlace} active = {false} name = {'deleteCard'} title = {'Вы уверены?'} children = {<input type="submit" value="Да" className="popup__button-save popup__button-save_delete" />}/>
            <ImagePopup active = {isImagePopupOpen} onClose = {clickOnPlace} card={selectedCard} />
            <InfoTooltip active = {infoTooltipPopupOpen} onClose = {clickOnPlace} answer={answer}/>
          </div>
      </div>
      
      
    </CurrentUserContext.Provider>
  );
}

export default App;