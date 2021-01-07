import React, {Component} from 'react';


import DragBox from './components/DragBox'


class App extends Component{

  componentDidMount(){
    document.addEventListener('dragover', (e) => {
      e.preventDefault()
      e.stopPropagation()
      }
    )
    document.addEventListener('drop', (e) => {
      e.preventDefault()
      e.stopPropagation()
      }
    )
  }

  
  render(){
    return(
      <>
        <DragBox />
      </>
    )
  }
}

export default App;
