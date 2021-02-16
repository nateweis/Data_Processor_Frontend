export const dp = ['$http', function($http){
    const ctrl = this; 
    
    this.newFile = {}

    // ================================== //
    //     Procssing The Alarm Data       //
    // ================================== // 

    this.processAlarms = function(rows){
        let rawKeys = Object.keys(rows[0]);
        let indexHolder = [];
        for (let i = 0; i < rawKeys.length; i++) {
            const sk1 = rawKeys[i].split("\\")
            const sk2 = sk1[sk1.length - 1].split(" ")
            if(sk2[sk2.length - 1] === "Fault" || sk2[sk2.length - 1] === "Alarm" || sk2[sk2.length - 1] === "Start") {
                const obj = {
                    type: sk1[sk1.length - 1],
                    index: i
                }
                if(obj.type === "Fault") obj.type = sk1[sk1.length - 2] + " Fault"
                const sk3 = sk1[sk1.length - 2].split(" ")
                if(sk3[1] === "1" || sk3[1] === "2") obj.pump = parseInt(sk3[1])
                

                indexHolder.push(obj)
            }
        }

        console.log(indexHolder)


        rows.forEach(row => {
            // console.log(row)
        });
    }

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