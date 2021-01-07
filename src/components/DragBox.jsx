import React, { Component } from 'react'

import XLSX from 'xlsx'



class DragBox extends Component {

    handleDrop = (file) => {
        let reader = new FileReader()
        reader.readAsBinaryString(file)
        reader.onload = (e) => {
            let data = e.target.result
            let wb = XLSX.read(data, {type: "binary"})
            wb.SheetNames.forEach(sheet => {
                let rowObj = XLSX.utils.sheet_to_json(wb.Sheets[sheet])
                console.log(rowObj)
            })
        }
    }


    render() {
        return (
            <>
                <input type="file"  onChange={(e)=>this.handleDrop(e.target.files[0])}/> 
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