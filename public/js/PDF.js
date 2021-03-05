export const pdf = ['$http', '$rootScope', function($http, $rootScope){
    const ctrl = this;
    this.currentPumpData = {}
    
    // takes data and makes it into a pdf
    $rootScope.$on('makePdf', (event, data)=> makeIntoPdf(data))

    const makeIntoPdf = (dataObj) => {
        // ctrl.currentPumpData = dataObj
        // const e = document.getElementById('pdfDiv')
        
        // html2canvas(e).then(canvas => {
        //     const imgData = canvas.toDataURL('image/png')
        //     const doc = new jspdf.jsPDF()
        //     const imgHeight = canvas.height * 210 / canvas.width
        //     console.log(imgHeight)
        //     doc.addImage(imgData, 0, 0, 210, imgHeight)
        //     doc.save("newPdf.pdf")
        // })
    }


}]