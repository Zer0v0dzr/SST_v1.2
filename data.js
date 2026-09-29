// ===================================
// Data Export
// ===================================

function exportCSV(data, subjectID){

    if(data.length === 0){

        console.log(
            "No data"
        );

        return;
    }


    // ===================================
    // Fixed CSV column order
    // ===================================

    const headers = [

        "subject",

        "phase",

        "block",

        "trial",

        "type",

        "direction",

        "response",

        "RT",

        "accuracy",

        "choiceError",

        "goOmission",

        "SSD",

        "stopSuccess",

        "prematureResponse",

        "trialTimestamp"
    ];


    let csv =
        headers.join(",") +
        "\n";


    data.forEach(row=>{

        const values =
            headers.map(header=>{

                const value =
                    row[header];


                if(
                    value === null ||
                    value === undefined
                ){

                    return "";
                }


                // CSV escaping
                const text =
                    String(value);


                if(
                    text.includes(",") ||
                    text.includes("\"") ||
                    text.includes("\n")
                ){

                    return (
                        "\"" +
                        text.replace(
                            /"/g,
                            "\"\""
                        ) +
                        "\""
                    );
                }


                return text;
            });


        csv +=
            values.join(",") +
            "\n";
    });


    // UTF-8 BOM
    // Prevents Excel encoding problems

    const blob =
        new Blob(

            [
                "\uFEFF" +
                csv
            ],

            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        subjectID +
        "_SST.csv";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );
}