

export const dp = ['$http', '$scope', 'DataProcessingService', function($http, $scope, DataProcessingService){
    const ctrl = this; 
    
    this.finalProcessedObject = {}
    $scope.pumps = {
        type: "other"
    };
   





    // ================================== //
    //          Helper Functions          //
    // ================================== // 
    // Converst secondst to time in an obj
    const convertFromSecs = (time) => {
        let sec = 0, min= 0, hr = 0
        for(let i = 0; i < time; i++){
            sec++
            if(sec >= 60) {
                sec = 0
                min++
                if(min >= 60){
                    min = 0
                    hr++
                }
            }
        }
        return {h: hr, m: min, s: sec}
    }

    // lets the next button be available 
    this.didStep = () => {
        // console.log($scope.pumps.type)
    }

    // ****************************** END OF HELPER fUNCTIONS FUNCTION **************************************** ///

    // extender for the excel file processing 
    this.excelFileProcessing = function(excelFile){
        ctrl.finalProcessedObject = {date: excelFile[0]["Date"]}
        const rows = excelFile
        
        const k = Object.keys(rows[0]).length >= Object.keys(rows[rows.length -1]).length ? 0 : rows.length -1 //in case the first cell is missing keys
        let rawKeys = Object.keys(rows[k]);
        let sk = []
        for(let i =0; i< rawKeys.length; i++){
            const temp = rawKeys[i].split("\\")
            const last = temp.length -1
            sk.push(temp[last])
        }
        if(sk.indexOf("High Pressure Fault") > 0) $scope.pumps.type = "booster"
        else if(sk.indexOf("Over Temp Fault") > 0) $scope.pumps.type = "condensate"
        else if(sk.indexOf("Low Level Alarm") > 0) $scope.pumps.type = "tankfill"
        else $scope.pumps.type = "sewer"

        
        if($scope.pumps.type === "booster") ctrl.processSleep(rows)
        if($scope.pumps.type === "condensate") ctrl.processTemp(rows)
        ctrl.processAlarms(rows)
        ctrl.processRuntimes(rows) 
        
        // console.log(ctrl.finalProcessedObject)
        ctrl.finalProcessedObject = {...ctrl.finalProcessedObject, ...$scope.pumps}
        DataProcessingService.activateMakePdf(ctrl.finalProcessedObject)
    }


    // ================================== //
    //     Procssing The Alarm Data       //
    // ================================== // 

    this.processAlarms = function(rows){
        const k = Object.keys(rows[0]).length >= Object.keys(rows[rows.length -1]).length ? 0 : rows.length -1 //in case the first cell is missing keys
        let rawKeys = Object.keys(rows[k]);
        let indexHolder = [];
        
        //*** Making an Array of Relvent Variables ***
        for (let i = 0; i < rawKeys.length; i++) { // finding the keys we want 
            const sk1 = rawKeys[i].split("\\") // sK stands for split keys 
            const sk2 = sk1[sk1.length - 1].split(" ")
            if(sk2[sk2.length - 1] === "Fault" || sk2[sk2.length - 1] === "Alarm" || sk2[sk2.length - 1] === "Start") { //making an obj to push into our array 
                const obj = {
                    type: sk1[sk1.length - 1],
                    index: i
                }
                const sk3 = sk1[sk1.length - 2]
                if(sk3.split(" ")[1] === "1" || sk3.split(" ")[1] === "2") obj.type = sk3 + " "+ sk1[sk1.length - 1]
                
                indexHolder.push(obj)//push into the array 
            }
        }

        // *** Using the Array of relevent Variables to make an obj of counted faults ****

        const countObj = {} // an object to hold the number count 
        indexHolder.forEach(v => { // looping throught both the the relevent indexes and the actual excel rows 
            countObj[v.type] = 0
            for (let i = 0; i < rows.length; i++) {
                if(parseInt(rows[i][rawKeys[v.index]]) === 1){
                    if(i === 0) countObj[v.type] += 1
                    else if(parseInt(rows[i-1][rawKeys[v.index]]) !== 1) countObj[v.type] += 1
                }
            }
             // 
        });

        ctrl.finalProcessedObject = {...ctrl.finalProcessedObject, ...countObj}
        
    }
    
    // ****************************** END OF PROCESS ALARMS FUNCTION **************************************** ///



    // ================================== //
    //    Procssing The Runtime Data      //
    // ================================== // 
    this.processRuntimes = (rows) => {
        const k = Object.keys(rows[0]).length >= Object.keys(rows[rows.length -1]).length ? 0 : rows.length -1 //in case the first cell is missing keys
        let rawKeys = Object.keys(rows[k]);
        let indexHolder = [];
        
        //*** Making an Array of Relvent Variables ***
        for (let i = 0; i < rawKeys.length; i++) {
            const sK = rawKeys[i].split("\\") // sK stands for split keys 
            // console.log(sK[sK.length - 1])
            if(sK[sK.length - 1] === "Run" || sK[sK.length - 1] === "Running") { //making an obj to push into our array 
                const obj = {
                    index: i
                }
                obj.type = sK[sK.length - 1] === "Time" ? sK[sK.length - 1] : sK[sK.length - 2] + " "+ sK[sK.length - 1]
                indexHolder.push(obj)
            }
        }

        // *** Using the Array of relevent Variables to make an obj of runtimeinfo ****
        const runtimeObj = {} // an object to hold the number runtime info
        indexHolder.forEach(v => { // looping throught both the the relevent indexes and the actual excel rows 
            let pumpNumber = v.type
            const starts = pumpNumber === "Time" ? pumpNumber : pumpNumber += " Starts"
            pumpNumber = v.type
            const runTime = pumpNumber === "Time" ? pumpNumber : pumpNumber += " Time Raw"
            pumpNumber = v.type
            const rtTotal = pumpNumber === "Time" ? pumpNumber : pumpNumber += " Time Total"
            pumpNumber = v.type
            const rtAvrg = pumpNumber === "Time" ? pumpNumber : pumpNumber += " Time Avrage"
            
            runtimeObj[starts] = 0
            runtimeObj[runTime] = 0
            runtimeObj[rtTotal] = {h:0, m:0, s:0}
            runtimeObj[rtAvrg] = {h:0, m:0, s:0}
            for (let i = 0; i < rows.length; i++) {
                if(parseInt(rows[i][rawKeys[v.index]]) === 1 && v.type !== "Time"){  
                    if(i === 0){
                        runtimeObj[starts] += 1 // adding to pump 1/2 starts

                        if(rows[i+1] && parseInt(rows[i+1][rawKeys[v.index]]) === 0){ //if the next row is a 0 see how long pump was on for
                            const currentTime = rows[i]["Time"].split(":") //getting the times for current on and next time off
                            const nextTime = rows[i + 1]["Time"].split(":")
                            const toSecondsAr = [3600, 60, 1]
                            let num1 = 0, num2 = 0

                            for(let j=0; j < currentTime.length; j++){ //converting the times to seconds 
                                num1 += parseInt(currentTime[j]) * toSecondsAr[j]
                                num2 += parseInt(nextTime[j]) * toSecondsAr[j]
                            }

                            const sum = num2 >= num1 ? num2 - num1 : (86400 - num1) + num2 //subtracting the next time off from time on to see how long it was on for 
                            runtimeObj[runTime] += sum //getting the raw time data 
                            
                        }

                    }
                    else if(parseInt(rows[i-1][rawKeys[v.index]]) !== 1){ //if the row before does not equal 1 
                        runtimeObj[starts] += 1 // adding to pump 1/2 starts

                        const toSecondsAr = [3600, 60, 1]
                        const currentTime = rows[i]["Time"].split(":") //getting the times for current on and next time off
                        const currentDate = parseInt(rows[i]["Date"].split(" ")[1])  * 86400
                        
                        let nextTime, nextDate
                        for(let j = i; j < rows.length; j++){
                            if(rows[j] && parseInt(rows[j][rawKeys[v.index]]) === 0){
                                nextTime = rows[j]["Time"].split(":")
                                nextDate = parseInt(rows[j]["Date"].split(" ")[1]) * 86400
                                break;
                            }
                        }


                        if(nextTime){
                            let num1 = 0, num2 = 0

                            for(let j=0; j < currentTime.length; j++){ //converting the times to seconds 
                                num1 += parseInt(currentTime[j]) * toSecondsAr[j]
                                num2 += parseInt(nextTime[j]) * toSecondsAr[j]
                            }

                            num2 += nextDate;
                            num1 += currentDate
                            
                            const sum = num2 - num1 //subtracting the next time off from time on to see how long it was on for 
                            runtimeObj[runTime] += sum //getting the raw time data 
                        }
                            
                    } //end of else if 
                }
            }
            
            if(v.type !== "Time"){ //converting the raw seconds into min & hrs
                const avgSec = runtimeObj[runTime] / runtimeObj[starts] //getting the avarage runtime 
                runtimeObj[rtTotal] = convertFromSecs(runtimeObj[runTime])
                runtimeObj[rtAvrg] = convertFromSecs(avgSec)

                delete runtimeObj[runTime]
            }

        });

        delete runtimeObj["Time"]
        // console.log(runtimeObj)
        ctrl.finalProcessedObject = {...ctrl.finalProcessedObject, ...runtimeObj}
        
    }

    // ****************************** END OF PROCESS RUNTIME FUNCTION **************************************** ///





    // ================================== //
    //     Procssing The Sleep Data       //
    // ================================== // 

    this.processSleep = (rows) => {
        const k = Object.keys(rows[0]).length >= Object.keys(rows[rows.length -1]).length ? 0 : rows.length -1 //in case the first cell is missing keys
        let rawKeys = Object.keys(rows[k]);
        let indexHolder = [];

        //*** Making an Array of Relvent Variables ***
        for (let i = 0; i < rawKeys.length; i++) {
            const sK = rawKeys[i].split("\\") // sK stands for split keys 
            // console.log(sK[sK.length - 1])
            if(sK[sK.length - 1] === "Run") { //making an obj to push into our array 
                const obj = {
                    index: i,
                    type: sK[sK.length - 2]
                }
                indexHolder.push(obj)
            }
        }

        // *** Using the Array of relevent Variables to make an obj of sleep ****
        const sleepObj = { // an object to hold the number sleep info
            sleepCount: 0,
            sleepTimeRaw: 0,
            sleepTimeTotal: {h:0, m:0, s:0},
            bothRunningCount:0
        } 
        for(let i = 0; i < rows.length; i++){
            if(parseInt(rows[i][rawKeys[indexHolder[0].index]]) === 1 && parseInt(rows[i][rawKeys[indexHolder[1].index]]) === 1){sleepObj.bothRunningCount +=1}
            if(parseInt(rows[i][rawKeys[indexHolder[0].index]]) === 0 && parseInt(rows[i][rawKeys[indexHolder[1].index]]) === 0){
                if(i === 0){sleepObj.sleepCount += 1}
                else if(parseInt(rows[i -1][rawKeys[indexHolder[0].index]]) !== 0 || parseInt(rows[i -1][rawKeys[indexHolder[1].index]]) !== 0){ //if the previous row is not the same as this row add to the count and time
                    sleepObj.sleepCount += 1 // adding to the sleep count 

                    const toSecondsAr = [3600, 60, 1]
                    const currentTime = rows[i]["Time"].split(":") //getting the times for current sleep

                    let nextTime
                    for(let j = i; j < rows.length; j++){ // getting the time for next time its not is sleep 
                        if(rows[j] && (parseInt(rows[j][rawKeys[indexHolder[0].index]]) === 1 || parseInt(rows[j][rawKeys[indexHolder[1].index]]) === 1)){
                            nextTime = rows[j]["Time"].split(":")
                            break;
                        }
                    }

                    if(nextTime){ // converting the time string to seconds and adding to the obj
                        let num1 = 0, num2 = 0

                        for(let j=0; j < currentTime.length; j++){ //converting the times to seconds 
                            num1 += parseInt(currentTime[j]) * toSecondsAr[j]
                            num2 += parseInt(nextTime[j]) * toSecondsAr[j]
                        }
                        
                        const sum = num2 >= num1 ? num2 - num1 : (86400 - num1) + num2 //subtracting the next time off from time on to see how long it was on for 
                        sleepObj.sleepTimeRaw += sum //getting the raw time data 
                    }


                }
            }
        }

        sleepObj.sleepTimeTotal = convertFromSecs(sleepObj.sleepTimeRaw)
        delete sleepObj.sleepTimeRaw
        // console.log(sleepObj)
        ctrl.finalProcessedObject = {...ctrl.finalProcessedObject, ...sleepObj}
        
    }

    // ****************************** END OF PROCESS SLEEP FUNCTION **************************************** ///

    // ================================== //
    //    Processing Tempurature Data     //
    // ================================== //    

    this.processTemp = (rows) => {
        const k = Object.keys(rows[0]).length >= Object.keys(rows[rows.length -1]).length ? 0 : rows.length -1 //in case the first cell is missing keys
        let rawKeys = Object.keys(rows[k]);
        let tempIndex = 0;
        let totalTemp = 0;
        const tempObj = {
            avgTemp:0,
            minTemp: 0,
            maxTemp:0
        }

        for (let i = 0; i < rawKeys.length; i++) {
            const sK = rawKeys[i].split("\\") // sK stands for split keys 
            if(sK[sK.length - 1] === "Temperature") tempIndex = i
        }

        let min = parseInt(rows[0][rawKeys[tempIndex]]), max = parseInt(rows[0][rawKeys[tempIndex]])
        for(let i = 0; i < rows.length; i++){
            totalTemp += parseInt(rows[i][rawKeys[tempIndex]])
            if(parseInt(rows[i][rawKeys[tempIndex]]) > max) max = parseInt(rows[i][rawKeys[tempIndex]])
            if(parseInt(rows[i][rawKeys[tempIndex]]) < min) min = parseInt(rows[i][rawKeys[tempIndex]])
        }
        
        tempObj.avgTemp = parseInt(totalTemp / rows.length)
        tempObj.minTemp = min
        tempObj.maxTemp = max
        // console.log(tempObj)
        ctrl.finalProcessedObject = {...ctrl.finalProcessedObject, ...tempObj}
        
    }

    // ****************************** END OF PROCESS TEMPURATURE FUNCTION **************************************** ///


    // ================================================================================================================================ //
    //                                     THIS IS THE START OF THE DATA PROCESSING PROCESS                                            //
    // ============================================================================================================================== //

    this.showFile = function(){
        const myFile = document.getElementById("fileBtn");
        // console.log(myFile.files[0])

        let reader = new FileReader()
        reader.readAsBinaryString(myFile.files[0])
        reader.onload = (e) => {
            let data = e.target.result
            let wb = XLSX.read(data, {type: "binary"})
            wb.SheetNames.forEach(sheet => {
                let rowObj = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheet])
                // console.log(rowObj)
                ctrl.excelFileProcessing(rowObj)
                
            })

            // console.log(wb)
        }
    }


}]