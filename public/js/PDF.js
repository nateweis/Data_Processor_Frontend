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
        $timeout(()=>drawStartsChart(),50)
        
        // console.log(ctrl.currentPumpData)
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


    // ************************************************
    // To see it works in angular
    this.pastPumpData = {"Pump1 Starts": 209, "Pump2 Starts": 544} //dummy data
    

    const determinYScale = (num) => {
        let lrgNum = num, tenLrg = 10, arr =[]

        while(lrgNum - tenLrg >=0 ) tenLrg *= 10

        tenLrg = (tenLrg / 10) * 3
        while(tenLrg <= lrgNum) tenLrg *=2
        for(let i = 0; i< 4; i++){arr.push((tenLrg / 3) * i)}
        return arr
    }

    

    const drawStartsChart = () => {
        let canvas = document.getElementById('piechart');
        const ctx = canvas.getContext('2d')
        canvas.width = 400
        canvas.height = 250

        let highNum = 0 , data = []
        if(ctrl.pastPumpData){
            const sk2 = Object.keys(ctrl.pastPumpData)
            sk2.forEach(k => {
                const ar = k.split(" ") 
                if(ar[ar.length -1] === "Starts"){
                    ctrl.pastPumpData[k] >= highNum ? highNum = ctrl.pastPumpData[k] : highNum = highNum;
                    data.push(ctrl.pastPumpData[k])
                }
            })
        }
        const sk = Object.keys(ctrl.currentPumpData) 
        sk.forEach(k => {
            const ar = k.split(" ") 
            if(ar[ar.length -1] === "Starts"){
                ctrl.currentPumpData[k] >= highNum ? highNum = ctrl.currentPumpData[k] : highNum = highNum;
                data.push(ctrl.currentPumpData[k])
            }
        })    
        const yScale = determinYScale(highNum) // getting the y scale 

        let width = 25 // bar width 
        let X = 50 // first bar position 

        ctx.font = '24px serif'; 
        ctx.fillText("Starts", 175 , 40);
        
        ctx.fillStyle = '#000000'
        ctx.strokeStyle = 'rgba(0,0,0,.2)'
        for(let i = 0; i < yScale.length; i++){ // set up the y scale 
            let y = 170
            ctx.font = '12px serif'; 
            ctx.fillText(yScale[i], 10 , y + (-33.3333 * i));

            ctx.beginPath();
            ctx.moveTo(35, y + (-33.3333 * i));
            ctx.lineTo(350, y + (-33.3333 * i));
            ctx.stroke();
            ctx.closePath();
            
        }


        for(let i = 0; i < data.length; i++){ // loop through the bars 
            const h = (data[i] / yScale[yScale.length -1]) * 100

            if(i % 2 === 0){
                ctrl.pastPumpData ? X += 50 : X+= 120
                ctx.fillStyle = '#056ee6'
                ctx.fillRect(X , (canvas.height - h)-80, width, h) //making bar
            }
            else{
                ctx.fillStyle = '#d97502'
                ctx.fillRect(X, (canvas.height - h)-80, width, h) //making bar
            }


            ctx.font = '12px serif'; // words on top of bar
            ctx.fillStyle = '#000000'
            ctx.fillText(`${data[i]}`, X +4, (canvas.height - h)-85);

            X += 35 // move over for next bar
        }

        // Bottom Legend 
        ctx.font = '12px serif';
        ctx.fillStyle = "#056ee6"
        ctx.fillRect(120, 220, 10, 10)
        ctx.fillStyle = '#000000'
        ctx.fillText("Pump 1", 135, 229)

        ctx.fillStyle = "#d97502"
        ctx.fillRect(200, 220, 10, 10)
        ctx.fillStyle = '#000000'
        ctx.fillText("Pump 2", 215, 229)

        if(ctrl.pastPumpData){
            ctx.fillText("Date 1", 110, 190)
            ctx.fillText("Date 2", 230, 190)
        }

    }
    // ************************************************


}]