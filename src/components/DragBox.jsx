import React, { Component } from 'react'

import XLSX from 'xlsx'



class DragBox extends Component {
    constructor(props){
        super(props)
        this.state={}
    }

    handleDrop = (file) => {
        // console.log(file)
        let reader = new FileReader()
        reader.readAsBinaryString(file[0])
        reader.onload = (e) => {
            let data = e.target.result
            let wb = XLSX.read(data, {type: "binary"})
            wb.SheetNames.forEach(sheet => {
                let rowObj = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheet])
                // console.log(rowObj)
                this.setState({exslRows: rowObj})
                this.processRow(rowObj)
            })

            // console.log(wb)
        }
    }

    processRow = (rows) => {
        rows.forEach(r => {
            console.log(r)
        })
        
    }


    render() {
        return (
            <>
                <input type="file"  onChange={(e)=>this.handleDrop(e.target.files)}/> 

                <div className='pic-box' style={style.dragbox} onDrop={(e)=>this.handleDrop(e.dataTransfer.files)}></div>
            </>
        )
    }
}

const style = {
    dragbox: {
        width: '200px',
        height: '200px',
        border: '1px solid black',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
    }
}

export default DragBox