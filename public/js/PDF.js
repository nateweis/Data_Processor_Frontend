export const pdf = ['$http', '$rootScope', '$timeout', function($http, $rootScope, $timeout){
    const ctrl = this;
    this.showPdfPreview = false;
    this.currentPumpData = {};

    this.backToSelectFile = () => ctrl.showPdfPreview = false
    const displayPdfPages = (pump) => {ctrl.includePath = `partials/previews/${pump}.html`, ctrl.showPdfPreview= true}
    
    // takes data and makes it into a pdf
    $rootScope.$on('makePdf', (event, data)=> makeIntoPdf(data))
    
    const makeIntoPdf = (dataObj) => {
        $timeout(()=>displayPdfPages(dataObj.type) )   
        ctrl.currentPumpData = dataObj;
        
        console.log(ctrl.currentPumpData)
    }

    // ================================== //
    //        Final PDF Commit            //
    // ================================== //

    this.savePdf = () => {
        const e = document.getElementById('pdfDiv')

        html2canvas(e).then(canvas => {
            const imgData = canvas.toDataURL('image/png')
            const doc = new jspdf.jsPDF()
            const imgHeight = canvas.height * 210 / canvas.width
            // console.log(imgHeight)
            doc.addImage(imgData, 0, 0, 210, imgHeight)
            doc.save("newPdf.pdf")
        })
    }


}]