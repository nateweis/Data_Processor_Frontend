export const dp = ['$http', function($http){
    const ctrl = this; 
    
    this.newFile = {}

    // ================================== //
    //     Procssing The Alarm Data       //
    // ================================== // 

    this.processAlarms = function(rows){
        let rawKeys = Object.keys(rows[0]);
        let indexHolder = [];

        //*** Making an Array of Relvent Variables ***
        for (let i = 0; i < rawKeys.length; i++) { // finding the keys we want 
            const sk1 = rawKeys[i].split("\\")
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
            rows.forEach(row => {
                if(parseInt(row[rawKeys[v.index]]) === 1) countObj[v.type] += 1
            });
        });

        console.log(countObj)
        
    }
    
    // ****************************** END OF PROCESS ALARMS FUNCTION **************************************** ///

    this.processRows = function(rows){
        ctrl.processAlarms(rows)
    }

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
                ctrl.processRows(rowObj)
                
            })

            // console.log(wb)
        }
    }


}]