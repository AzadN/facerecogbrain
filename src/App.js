import React, {Component} from 'react';
import './App.css';
import Navigation from './components/navigation/Navigation';
import Logo from './components/logo/Logo';
import ImageLinkInput from './components/ImageLinkInput/ImageLinkInput';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/SignIn/Signin';
import Register from './components/register/Register';
import Rank from './components/rank/Rank';
import Particles from 'react-particles-js';


const particlesOptions = {
  particles: {
    number: {
      value: 70,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

//Introduced since an existing user's image detection page would be accessible to a new logged in user
//Hence, clearing the state of App is essential upon every login.
const initialState = {
  input: '',
  imageURL: '',
  box: {},
  route: 'signin',
  isSignedin: false,
  user:{
    id: '',
    name: '',
    email: '',
    entries: 0,
    joined: new Date()
  }
}

class App extends Component {
  constructor(){
    super();
    this.state=initialState;
  }

  loadUser=(data)=>{
    this.setState({user:{
        id: data.id,
        name: data.name,
        email: data.email,
        entries: data.entries,
        joined: data.joined
    }})
  }

  /*componentDidMount(){
    fetch('http://localhost:3001/')
      .then(response=>response.json())
      .then(console.log)
  }*/

  calculateFaceLocation=(data)=>{
    const clarifAIFace=data.outputs[0].data.regions[0].region_info.bounding_box;
    const image=document.getElementById('inputimage');
    const width=Number(image.width);
    const height=Number(image.height);
    return {
      leftCol: clarifAIFace.left_col * width,
      topRow: clarifAIFace.top_row * height,
      rightCol: width - (clarifAIFace.right_col * width),
      bottomRow: height - (clarifAIFace.bottom_row * height)
    }
  }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange=(event)=>{
    this.setState({input: event.target.value});
  }

  onRouteChange=(route)=>{
    if(route==='signout')
      this.setState(initialState); //Clear state upon signout
    else if(route==='home')
      this.setState({isSignedin: 'true'});
    this.setState({route: route});
  }

  onButtonSubmit=()=>{
    this.setState({imageURL: this.state.input});
      fetch('http://localhost:3001/imageurl',{
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              input: this.state.input
            })
          })
      .then(response=>response.json())
      .then(response  => {
        if(response)
        {
          fetch('http://localhost:3001/image',{
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count}))
            })
            .catch(console.log) //Error handling is imp
        }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
      .catch(err => console.log(err))
  }

  render() {
    const {isSignedin, imageURL, route, box}=this.state;
    return (
      <div className="App">
        <Particles className='particles'
          params={particlesOptions} 
        />
        <Navigation isSignedIn={isSignedin} onRouteChange={this.onRouteChange}/>
        {route==='home' ?
          <div>
            <Logo />
            <Rank 
                name={this.state.user.name}
                entries={this.state.user.entries}
            />
            <ImageLinkInput onInputChange={this.onInputChange} onButtonSubmit={this.onButtonSubmit}/>
            <FaceRecognition box={box} imageURL={imageURL}/>
          </div>
          :(
            route==='signin' ?
            <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>

          )
      }
      </div>
    );
  }
}

export default App;
