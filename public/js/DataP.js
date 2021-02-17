export const dp = ['$http', function($http){
    const ctrl = this; 
    
    this.finalProcessedObject = {}

    // extender for the excel file processing 
    this.excelFileProcessing = function(excelFile){
        ctrl.finalProcessedObject = {}
        const rows = excelFile
            
        ctrl.processAlarms(rows)
        ctrl.processRuntimes(rows)
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
            if(sK[sK.length - 1] === "Time" || sK[sK.length - 1] === "Run" || sK[sK.length - 1] === "Running") { //making an obj to push into our array 
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
            const runTime = pumpNumber === "Time" ? pumpNumber : pumpNumber += " Time"
            
            runtimeObj[starts] = 0
            runtimeObj[runTime] = [0, 0, 0]
            for (let i = 0; i < rows.length; i++) {
                if(parseInt(rows[i][rawKeys[v.index]]) === 1 && v.type !== "Time"){  
                    if(i === 0){
                        runtimeObj[starts] += 1 // adding to pump 1/2 starts
                    }
                    else if(parseInt(rows[i-1][rawKeys[v.index]]) !== 1){
                        runtimeObj[starts] += 1 // adding to pump 1/2 starts

                        if(rows[i+1] && parseInt(rows[i+1][rawKeys[v.index]]) === 0){ //seeing how long pump was on for
                            const currentTime = rows[i]["Time"].split(":") //getting the times for current on and next time off
                            const nextTime = rows[i + 1]["Time"].split(":")
                            for(let j=0; j < currentTime.length; j++){ //subtracting the next time off from time on to see how long it was on for 
                                let sum
                                let num1 = parseInt(currentTime[j])
                                let num2 = parseInt(nextTime[j])
                                if(num2 >= num1) sum = num2 - num1
                                else j > 0 ? sum = (60 - num1) + num2 : sum = (24 - num1) + num2
                                runtimeObj[runTime][j] += sum
                            }
                        }
                        

                       
                    }
                }
            }
            
        });
        
        delete runtimeObj["Time"]
        console.log(runtimeObj)
        // console.log(ctrl.finalProcessedObject)
    }

    // ****************************** END OF PROCESS RUNTIME FUNCTION **************************************** ///

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