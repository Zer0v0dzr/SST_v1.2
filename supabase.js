// ============================================================
// Supabase Database Module
// Stop-Signal Task (SST)
// ============================================================

const SUPABASE_URL =
    "https://sxvtbwtitdbaflaigahj.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_9LVOphB0mpLVwN5x6qLCLA_ha1Z5DH6";


// ------------------------------------------------------------
// Initialize Supabase client
// ------------------------------------------------------------

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);


// ------------------------------------------------------------
// Current experiment session
// ------------------------------------------------------------

let currentSessionID = null;


// ------------------------------------------------------------
// Generate UUID
// ------------------------------------------------------------

function generateSessionID() {

    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return crypto.randomUUID();
    }

    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {

            const r =
                (Math.random() * 16) | 0;

            const v =
                c === "x"
                    ? r
                    : (r & 0x3) | 0x8;

            return v.toString(16);
        }
    );
}


// ------------------------------------------------------------
// Create SST session
//
// Call once after participant ID is confirmed.
// ------------------------------------------------------------

async function createSSTSession(subjectID) {

    currentSessionID = generateSessionID();

    const { error } = await supabaseClient
        .from("sst_sessions")
        .insert({
            session_id: currentSessionID,
            subject: subjectID,
            completed: false
        });

    if (error) {

        console.error(
            "Supabase: failed to create SST session:",
            error
        );

        return false;
    }

    console.log(
        "Supabase: SST session created:",
        currentSessionID
    );

    return true;
}


// ------------------------------------------------------------
// Upload one SST trial
//
// This function receives the SAME trial object that is saved
// locally to the CSV.
// ------------------------------------------------------------

async function uploadSSTTrial(trialData) {

    if (!currentSessionID) {

        console.error(
            "Supabase: no active session. Trial not uploaded."
        );

        return false;
    }

    const row = {

        session_id: currentSessionID,

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


    const { error } = await supabaseClient
        .from("sst_trials")
        .insert(row);


    if (error) {

        console.error(
            "Supabase: trial upload failed:",
            error
        );

        return false;
    }


    console.log(
        "Supabase: trial uploaded:",
        trialData.phase,
        trialData.block,
        trialData.trial
    );

    return true;
}


// ------------------------------------------------------------
// Mark experiment as completed
// ------------------------------------------------------------

async function completeSSTSession() {

    if (!currentSessionID) {

        console.error(
            "Supabase: no active session."
        );

        return false;
    }


    const { error } = await supabaseClient
        .from("sst_sessions")
        .update({
            completed: true,
            completed_at: new Date().toISOString()
        })
        .eq(
            "session_id",
            currentSessionID
        );


    if (error) {

        console.error(
            "Supabase: failed to complete session:",
            error
        );

        return false;
    }


    console.log(
        "Supabase: SST session completed:",
        currentSessionID
    );

    return true;
}
