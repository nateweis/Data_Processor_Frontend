export const graph = ['$http', '$rootScope', function($http, $rootScope){
    const ctrl = this;
    this.currentPumpData = {}
    this.pastPumpData = {}

    $rootScope.$on('makePdf', (event, data)=> makeIntoPdf(data))

    const makeIntoPdf = (dataObj) => {
        ctrl.currentPumpData = dataObj[0];
        ctrl.pastPumpData = dataObj[2];
    }

}]