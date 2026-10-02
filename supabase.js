// ============================================================
// Supabase Database Module
// Stop-Signal Task (SST)
// ============================================================

const SUPABASE_URL =
    "https://sxvtbwtitdbaflaigahj.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9LVOphB0mpLVwN5x6qLCLA_ha1Z5DH6";


// ============================================================
// Initialize Supabase
// ============================================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ============================================================
// Session state
// ============================================================

let currentSessionID = null;


// ============================================================
// Generate UUID
// ============================================================

function generateSessionID(){

    if(
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ){
        return crypto.randomUUID();
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"
        .replace(/[xy]/g, function(c){

            const r =
                Math.random() * 16 | 0;

            const v =
                c === "x"
                ? r
                : (r & 0x3 | 0x8);

            return v.toString(16);
        });
}


// ============================================================
// Retry helper
// ============================================================

function wait(ms){

    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}


// ============================================================
// Create session
// ============================================================

async function createSSTSession(subjectID){

    if(currentSessionID){
        return true;
    }

    currentSessionID =
        generateSessionID();

    for(let attempt = 1; attempt <= 3; attempt++){

        try{

            const { error } =
                await supabaseClient
                    .from("sst_sessions")
                    .insert({
                        session_id:
                            currentSessionID,

                        subject:
                            subjectID,

                        completed:
                            false
                    });

            if(!error){

                console.log(
                    "Supabase: SST session created:",
                    currentSessionID
                );

                return true;
            }

            console.error(
                "Supabase: session creation attempt " +
                attempt +
                " failed:",
                error
            );

        }catch(error){

            console.error(
                "Supabase: session creation attempt " +
                attempt +
                " failed:",
                error
            );
        }

        if(attempt < 3){
            await wait(1000 * attempt);
        }
    }


    console.warn(
        "Supabase unavailable. " +
        "Experiment will continue with local CSV backup."
    );

    return false;
}


// ============================================================
// Upload one trial
// ============================================================

async function uploadSSTTrial(trialData){

    if(!currentSessionID){

        console.warn(
            "Supabase: no active session; " +
            "trial retained locally only."
        );

        return false;
    }


    const row = {

        session_id:
            currentSessionID,

        subject:
            trialData.subject ?? null,

        phase:
            trialData.phase ?? null,

        block:
            trialData.block ?? null,

        trial:
            trialData.trial ?? null,

        type:
            trialData.type ?? null,

        direction:
            trialData.direction ?? null,

        response:
            trialData.response ?? null,

        rt:
            trialData.RT ?? null,

        accuracy:
            trialData.accuracy ?? null,

        choice_error:
            trialData.choiceError ?? null,

        go_omission:
            trialData.goOmission ?? null,

        ssd:
            trialData.SSD ?? null,

        stop_success:
            trialData.stopSuccess ?? null,

        premature_response:
            trialData.prematureResponse ?? null,

        trial_timestamp:
            trialData.trialTimestamp ?? null
    };


    for(let attempt = 1; attempt <= 3; attempt++){

        try{

            const { error } =
                await supabaseClient
                    .from("sst_trials")
                    .insert(row);

            if(!error){

                console.log(
                    "Supabase: trial uploaded:",
                    trialData.phase,
                    trialData.block,
                    trialData.trial
                );

                return true;
            }


            /*
             * PostgreSQL unique violation.
             * 如果因为网络返回异常而重复提交，
             * 数据库中已经存在这一 trial，
             * 就把它视为已经保存成功。
             */

            if(error.code === "23505"){

                console.log(
                    "Supabase: trial already exists:",
                    trialData.phase,
                    trialData.block,
                    trialData.trial
                );

                return true;
            }


            console.error(
                "Supabase: trial upload attempt " +
                attempt +
                " failed:",
                error
            );

        }catch(error){

            console.error(
                "Supabase: trial upload attempt " +
                attempt +
                " failed:",
                error
            );
        }


        if(attempt < 3){

            await wait(
                1000 * attempt
            );
        }
    }


    console.warn(
        "Supabase: trial upload failed after retries. " +
        "Trial remains available in local CSV:",
        trialData
    );

    return false;
}


// ============================================================
// Complete session
// ============================================================

async function completeSSTSession(){

    if(!currentSessionID){

        console.warn(
            "Supabase: no active session."
        );

        return false;
    }


    for(let attempt = 1; attempt <= 3; attempt++){

        try{

            const { error } =
                await supabaseClient
                    .from("sst_sessions")
                    .update({
                        completed:
                            true,

                        completed_at:
                            new Date().toISOString()
                    })
                    .eq(
                        "session_id",
                        currentSessionID
                    );


            if(!error){

                console.log(
                    "Supabase: SST session completed:",
                    currentSessionID
                );

                return true;
            }


            console.error(
                "Supabase: completion attempt " +
                attempt +
                " failed:",
                error
            );

        }catch(error){

            console.error(
                "Supabase: completion attempt " +
                attempt +
                " failed:",
                error
            );
        }


        if(attempt < 3){

            await wait(
                1000 * attempt
            );
        }
    }


    console.warn(
        "Supabase: session completion update failed."
    );

    return false;
}
