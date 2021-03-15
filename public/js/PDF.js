export const pdf = ['$http', '$rootScope', '$timeout', function($http, $rootScope, $timeout){
    const ctrl = this;
    this.showPdfPreview = false;
    this.currentPumpData = {};
    this.pastPumpData = {"Pump 1 Starts": 433, "Pump 2 Starts" : 366, "Pump 1 Total": {h: 117, m: 21, s: 49}, "Pump 2 Total": {h:137, m:41, s:30}} //dummy data
    
    this.backToSelectFile = () => ctrl.showPdfPreview = false
    const displayPdfPages = (pump) => {ctrl.includePath = `partials/previews/${pump}.html`, ctrl.showPdfPreview= true}

    // ================================== //
    // Getting the Y Scale for the Graghs //
    // ================================== //
    const determinYScale = (num) => {
        let lrgNum = num, tenLrg = 10, arr =[]

        while(lrgNum - tenLrg >=0 ) tenLrg *= 10 // find the next number up divisable by 10

        tenLrg = (tenLrg / 10) * 3 // divide that number by 10 so they have the same amount of digits then multiply by 3 so divisable by 3 (for 3 even parts)
        while(tenLrg <= lrgNum) tenLrg *=2 // if new number not grater then original num then double it
        for(let i = 0; i< 4; i++){arr.push((tenLrg / 3) * i)}
        return arr
    }
    // *****
    const determinYScaleTime = (num, t) => {
        let n = num, arr =[], timeUp = 0, topScale = t === 'h' ? 18 : 15
        while(n > topScale) topScale *=2 // if new number not grater then original num then double it
        if(topScale === 60) timeUp = 1 // for converting 60 m/s to the next time slot

        for(let i = 0; i< 4; i++){ // taking parts of the top time and formating it to the appropiate time
            let holderNum = (topScale /3) * i ;
            if(t !== 'h' && holderNum < 9) holderNum = '0' + holderNum;
            if(t === 's'){
                if(timeUp === 1 && i === 3) arr.push(`0:01:00`)
                else arr.push(`0:00:${holderNum}`)
            }
            else if(t === 'm'){
                if(timeUp === 1 && i === 3) arr.push(`1:00:00`)
                else arr.push(`0:${holderNum}:00`)
            }
            else arr.push(`${holderNum}:00:00`)
        }

        return arr
    }

    // ***************** END *******************************

    
    // ================================== //
    //      Draw the Canvas Graphs        //
    // ================================== //

    const drawGraph = (graph, scale, d, dP, title) => {
        let canvas = document.getElementById(graph);
        const ctx = canvas.getContext('2d')
        canvas.width = 400;
        canvas.height = 250;
        let data = d, yScale = scale, dataPercentage = dP


        let width = 25 // bar width 
        let X = 50 // first bar position 

        ctx.font = '24px serif'; 
        const text = ctx.measureText(title);
        ctx.fillText(title, (canvas.width - text.width)/2 , 40);
        
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
            const h = dataPercentage[i]

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
            let t = ctx.measureText(`${data[i]}`)
            ctx.fillStyle = '#000000'
            ctx.fillText(`${data[i]}`, X + ((width - t.width)/2), (canvas.height - h)-85);

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

    // ***************** END *******************************

    // ================================== //
    //      Draw the Canvas Starts        //
    // ================================== //
    
    const drawStartsChart = () => {
        let highNum = 0 , data = [], dataPercentage = []

        if(ctrl.pastPumpData){ // finding out wich numbers are relevent and which is the largest relevent number 
            const sk2 = Object.keys(ctrl.pastPumpData)
            sk2.forEach(k => {
                const ar = k.split(" ") 
                if(ar[ar.length -1] === "Starts"){
                    ctrl.pastPumpData[k] >= highNum ? highNum = ctrl.pastPumpData[k] : highNum = highNum;
                    data.push(ctrl.pastPumpData[k]);
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

        for(let i = 0; i < data.length; i++){ dataPercentage.push((data[i] / yScale[yScale.length -1]) * 100) }// turning relevent data into a percentage for the graphs 

        

        drawGraph('startschart', yScale, data, dataPercentage, "Starts")
    }
    // ******************** END ****************************
    
    // ================================== //
    //     Draw the Canvas Total Run      //
    // ================================== //

    const drawTotalRuntimeChart = () => {
        const time = processTime("Total");
        const yScale = determinYScaleTime(time.highNum, time.timePlace);
        const lastYscale = yScale[yScale.length -1].split(":");
        let dataPercentage=[], calculatedLastYscale =0
        
        const toSecondsAr = [3600, 60, 1]
        for(let i =0; i < 3; i++) calculatedLastYscale += (parseInt(lastYscale[i]) * toSecondsAr[i]) // converting the last y to seconds

        time.rawTime.forEach( t =>{ // turning the data into a graph percentage
            let holder = 0;
            holder += parseInt(t.h) * 3600;
            holder += parseInt(t.m) * 60;
            holder += parseInt(t.s);
            
            dataPercentage.push((holder / calculatedLastYscale) * 100)
        })
        
        drawGraph('totalrunchart', yScale, time.data, dataPercentage, "Total Runtime")
    }

    // ******************** END ****************************

    // ================================================================================================================================ //
    //                                          THIS IS THE START OF THE PDF MAKING PROCESS                                            //
    // ============================================================================================================================== //
    
    // takes data and makes it into a pdf
    $rootScope.$on('makePdf', (event, data)=> makeIntoPdf(data))
    
    const makeIntoPdf = (dataObj) => {
        $timeout(()=>displayPdfPages(dataObj.type) )   
        ctrl.currentPumpData = dataObj;
        $timeout(()=>drawStartsChart(),50)
        $timeout(()=>drawTotalRuntimeChart(),50)
        
        // console.log(ctrl.currentPumpData)
    }

    // ================================== //
    //           Process Time             //
    // ================================== //
    const processTime = (str) => {
        let highNum = 0, timePlace = 0, data =[], rawTime=[]

        if(ctrl.pastPumpData){ // finding out wich numbers are relevent and which is the largest relevent number 
            const sk2 = Object.keys(ctrl.pastPumpData)
            sk2.forEach(k => {
                const ar = k.split(" ") 
                if(ar[ar.length -1] === str){
                    const timeObj = ctrl.pastPumpData[k]
                    rawTime.push(timeObj)

                    let tN = 0, tP = 0 //getting the highest val and time of each pump
                    if(timeObj.h > 0) {tN = timeObj.h, tP = 3}
                    else if(timeObj.m > 0) {tN = timeObj.m, tP = 2}
                    else {tN = timeObj.s, tP = 1}
                    
                    if(tP > timePlace){highNum = tN, timePlace = tP} //determing if the pumps highest val is the overall highest val
                    else if (tP === timePlace){ if(tN > highNum) highNum = tN}

                    if(timeObj.m < 10) timeObj.m = "0" + timeObj.m // formating the data to into time for display 
                    if(timeObj.s < 10) timeObj.s = "0" + timeObj.s
                    data.push(`${timeObj.h}:${timeObj.m}:${timeObj.s}`)
                }
            })
        }
        const sk = Object.keys(ctrl.currentPumpData) 
        sk.forEach(k => {
            const ar = k.split(" ") 
            if(ar[ar.length -1] === str){
                const timeObj = ctrl.currentPumpData[k]
                rawTime.push(timeObj)

                let tN = 0, tP = 0 //getting the highest val and time of each pump
                if(timeObj.h > 0) {tN = timeObj.h, tP = 3}
                else if(timeObj.m > 0) {tN = timeObj.m, tP = 2}
                else {tN = timeObj.s, tP = 1}

                if(tP > timePlace){highNum = tN, timePlace = tP} //determing if the pumps highest val is the overall highest val
                else if (tP === timePlace){ if(tN > highNum) highNum = tN}

                if(timeObj.m < 10) timeObj.m = "0" + timeObj.m // formating the data to into time for display 
                if(timeObj.s < 10) timeObj.s = "0" + timeObj.s
                data.push(`${timeObj.h}:${timeObj.m}:${timeObj.s}`)
            }
        })

        if(timePlace === 3) timePlace = 'h'
        if(timePlace === 2) timePlace = 'm'
        if(timePlace === 1) timePlace = 's'

        return {highNum, timePlace, data, rawTime}
    }

    // ******************** END ****************************

    // ================================== //
    //        Final PDF Commit            //
    // ================================== //

    this.savePdf = () => {
        const e = document.getElementById(`${ctrl.currentPumpData.type}PdfDiv`)

        html2canvas(e).then(canvas => {
            const imgData = canvas.toDataURL('image/png')
            const doc = new jspdf.jsPDF()
            const imgHeight = canvas.height * 210 / canvas.width
            // console.log(imgHeight)
            doc.addImage(imgData, 0, 0, 210, imgHeight)
            doc.save("newPdf.pdf")
        })
    }


    // ******************* END *****************************
    


}]