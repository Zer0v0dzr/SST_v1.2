// ===================================
// SSD staircase
// ===================================


let SSD = {

    Left: CONFIG.initialSSD,

    Right: CONFIG.initialSSD

};




// 更新SSD

function updateSSD(direction, stopSuccess){


    if(stopSuccess){


        SSD[direction]
        += CONFIG.stepSSD;


    }
    else{


        SSD[direction]
        -= CONFIG.stepSSD;


    }



    // 限制范围

    if(
        SSD[direction] < CONFIG.minSSD
    ){

        SSD[direction]=CONFIG.minSSD;

    }


    if(
        SSD[direction] > CONFIG.maxSSD
    ){

        SSD[direction]=CONFIG.maxSSD;

    }



    return SSD[direction];

}
// Formal trials use one staircase, isolated from the unchanged practice SSDs.
let formalSSD = CONFIG.initialSSD;
function resetFormalSSD(){
    formalSSD = CONFIG.initialSSD;
}
function updateFormalSSD(stopSuccess){
    formalSSD = Math.min(CONFIG.maxSSD, Math.max(CONFIG.minSSD,
        formalSSD + (stopSuccess ? CONFIG.stepSSD : -CONFIG.stepSSD)));
    return formalSSD;
}
