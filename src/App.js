import React, {Component} from 'react';


import DragBox from './components/DragBox'
import PDFGenerator from './components/PDFGenerator'


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
        <PDFGenerator />
      </>
    )
  }
}

export default App;
