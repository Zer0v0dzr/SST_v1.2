// ===================================
// SST Trial Generator
// ===================================

function createExperiment(){

    const experiment = {};

    // ===============================
    // Practice 1: Go only
    // ===============================

    experiment.goPractice = createGoPractice();

    // ===============================
    // Practice 2: SST
    // ===============================

    experiment.practice = createPractice(
        CONFIG.practiceTrials
    );

    // ===============================
    // Formal blocks
    // ===============================

    experiment.blocks = [];

    let trailingStops = 0;

    for(let i = 0; i < CONFIG.blocks; i++){

        const block = createBlock(
            CONFIG.trialsPerBlock,
            i,
            trailingStops
        );

        experiment.blocks.push(block);

        // Count Stop trials at the end of this block.
        // This is passed to the next block so that a Stop run
        // cannot accidentally exceed 3 across a block boundary.
        trailingStops = 0;

        for(
            let j = block.length - 1;
            j >= 0 && block[j].type === "Stop";
            j--
        ){
            trailingStops++;
        }
    }

    return experiment;
}



// ===================================
// Practice 1: Go-only practice
// 10 trials = 5 Left + 5 Right
// ===================================

function createGoPractice(){

    const trials = [];

    for(let i = 0; i < 5; i++){

        trials.push({
            type: "Go",
            direction: "Left",
            stimulus: "Left_Go",
            SSD: null
        });

        trials.push({
            type: "Go",
            direction: "Right",
            stimulus: "Right_Go",
            SSD: null
        });
    }

    shuffle(trials);

    return trials;
}



// ===================================
// Practice 2: SST practice
//
// 10 trials:
// first 2 fixed Go:
// Left Go
// Right Go
//
// remaining:
// 4 Go
// 4 Stop
//
// Stop may appear at most twice consecutively.
// ===================================

function createPractice(totalTrials){

    const firstTwo = [

        {
            type: "Go",
            direction: "Left",
            stimulus: "Left_Go",
            SSD: null
        },

        {
            type: "Go",
            direction: "Right",
            stimulus: "Right_Go",
            SSD: null
        }

    ];


    const remainingTrials = [];

    const remainNumber =
        totalTrials - firstTwo.length;

    const stopNumber = 4;

    const goNumber =
        remainNumber - stopNumber;


    // -------------------------------
    // Remaining Go trials
    // -------------------------------

    const goLeft =
        Math.floor(goNumber / 2);

    const goRight =
        goNumber - goLeft;


    for(let i = 0; i < goLeft; i++){

        remainingTrials.push({

            type: "Go",

            direction: "Left",

            stimulus: "Left_Go",

            SSD: null

        });
    }


    for(let i = 0; i < goRight; i++){

        remainingTrials.push({

            type: "Go",

            direction: "Right",

            stimulus: "Right_Go",

            SSD: null

        });
    }


    // -------------------------------
    // Stop trials
    // -------------------------------

    const stopLeft =
        Math.floor(stopNumber / 2);

    const stopRight =
        stopNumber - stopLeft;


    for(let i = 0; i < stopLeft; i++){

        remainingTrials.push({

            type: "Stop",

            direction: "Left",

            stimulus: "Left_Stop",

            SSD: CONFIG.initialSSD

        });
    }


    for(let i = 0; i < stopRight; i++){

        remainingTrials.push({

            type: "Stop",

            direction: "Right",

            stimulus: "Right_Stop",

            SSD: CONFIG.initialSSD

        });
    }


    // -------------------------------
    // Pseudo-randomization
    //
    // Practice:
    // maximum Stop run = 2
    // -------------------------------

    let valid = false;

    while(!valid){

        shuffle(remainingTrials);

        valid =
            hasValidStopRuns(
                remainingTrials,
                2,
                0
            );
    }


    return firstTwo.concat(
        remainingTrials
    );
}



// ===================================
// Formal block trials
//
// Total:
// 4 blocks × 50 = 200
//
// B1: 38 Go + 12 Stop
// B2: 37 Go + 13 Stop
// B3: 38 Go + 12 Stop
// B4: 37 Go + 13 Stop
//
// Across experiment:
//
// Go:
// Left  = 75
// Right = 75
//
// Stop:
// Left  = 25
// Right = 25
//
// Formal Stop runs:
// 1, 2, or 3 consecutive Stop trials
// are allowed.
//
// Maximum = 3.
//
// There is NO direction-run restriction.
// ===================================

function createBlock(
    totalTrials,
    blockIndex = 0,
    precedingStops = 0
){

    const stopNumber =
        CONFIG.stopTrialsPerBlock[blockIndex];

    const goNumber =
        totalTrials - stopNumber;


    // ===================================
    // Direction allocation
    // ===================================
    //
    // Block 1
    // Go   L19 R19
    // Stop L6  R6
    //
    // Block 2
    // Go   L19 R18
    // Stop L6  R7
    //
    // Block 3
    // Go   L19 R19
    // Stop L6  R6
    //
    // Block 4
    // Go   L18 R19
    // Stop L7  R6
    //
    // Overall:
    // Go   L75 R75
    // Stop L25 R25
    // ===================================

    let goLeft;
    let stopLeft;


    if(blockIndex === 3){

        goLeft =
            Math.floor(goNumber / 2);

        stopLeft =
            Math.ceil(stopNumber / 2);

    }
    else{

        goLeft =
            Math.ceil(goNumber / 2);

        stopLeft =
            Math.floor(stopNumber / 2);

    }


    const goRight =
        goNumber - goLeft;

    const stopRight =
        stopNumber - stopLeft;


    const trials = [];


    // ===================================
    // Go trials
    // ===================================

    for(let i = 0; i < goLeft; i++){

        trials.push({

            type: "Go",

            direction: "Left",

            stimulus: "Left_Go",

            SSD: null

        });
    }


    for(let i = 0; i < goRight; i++){

        trials.push({

            type: "Go",

            direction: "Right",

            stimulus: "Right_Go",

            SSD: null

        });
    }


    // ===================================
    // Stop trials
    // ===================================

    for(let i = 0; i < stopLeft; i++){

        trials.push({

            type: "Stop",

            direction: "Left",

            stimulus: "Left_Stop",

            SSD: CONFIG.initialSSD

        });
    }


    for(let i = 0; i < stopRight; i++){

        trials.push({

            type: "Stop",

            direction: "Right",

            stimulus: "Right_Stop",

            SSD: CONFIG.initialSSD

        });
    }


    // ===================================
    // Formal pseudo-randomization
    //
    // Rules:
    //
    // 1. Stop runs of 1, 2, or 3 are allowed
    // 2. Never > 3 consecutive Stop trials
    // 3. Block 1: first two trials MUST be Go
    // 4. Blocks 2–4: no special first-trial rule
    // 5. No Left/Right run restriction
    // ===================================

    let valid = false;


    while(!valid){

        shuffle(trials);


        // -----------------------------------
        // Block 1:
        // first two trials must both be Go
        // -----------------------------------

        if(
            blockIndex === 0 &&
            (
                trials[0].type !== "Go" ||
                trials[1].type !== "Go"
            )
        ){
            continue;
        }


        // -----------------------------------
        // Check maximum Stop run
        // including block boundaries
        // -----------------------------------

        valid =
            hasValidStopRuns(
                trials,
                3,
                precedingStops
            );

    }


    return trials;
}



// ===================================
// Check maximum consecutive Stop trials
// ===================================

function hasValidStopRuns(
    trials,
    maxStopRun,
    precedingStops = 0
){

    let stopRun =
        precedingStops;


    for(const trial of trials){

        if(trial.type === "Stop"){

            stopRun++;

            if(stopRun > maxStopRun){

                return false;

            }

        }
        else{

            stopRun = 0;

        }
    }


    return true;
}



// ===================================
// Fisher-Yates shuffle
// ===================================

function shuffle(array){

    for(
        let i = array.length - 1;
        i > 0;
        i--
    ){

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );


        [
            array[i],
            array[j]
        ]
        =
        [
            array[j],
            array[i]
        ];

    }

}