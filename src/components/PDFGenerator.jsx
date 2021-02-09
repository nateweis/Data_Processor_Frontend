import React, { Component } from 'react'
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {HTML} from './template/test'

const specialElementHandler = {
    "#editor": (element, render)=> { return true}
}

class PDFGenerator extends Component {
        

    generatePDF = () => {
        window.html2canvas = html2canvas;
        var doc = new jsPDF({
          orientation: "landscape",
          unit: "px",
          width: 500
        //   format: [4, 2]
        });
        doc.html(HTML, {
            callback: function(doc) {
              console.log("in callback");
              doc.save("first.pdf");
            },
            x:10,
            y:10
          })
    }

    render() {
        return (
            <>
                <button onClick={this.generatePDF}>Generate PDF</button>   
            </>
        )  
    }
}

export default PDFGenerator