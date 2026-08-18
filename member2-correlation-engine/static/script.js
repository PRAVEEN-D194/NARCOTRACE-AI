let sampleData = null;


/* ================= LOAD SAMPLE DATA ================= */

async function loadSampleData() {

    try {

        const response =
            await fetch("/api/sample");

        sampleData =
            await response.json();


        fillInputFields();


        renderEntities(
            sampleData.entities[0],
            sampleData.entities[1]
        );


        renderTransactions(
            sampleData.transactions
        );


        updateWalletFlow(
            sampleData.entities[0],
            sampleData.entities[1],
            sampleData.transactions
        );

    }

    catch (error) {

        console.error(
            "Error loading sample data:",
            error
        );

    }

}


/* ================= FILL INPUT FIELDS ================= */

function fillInputFields() {

    const a =
        sampleData.entities[0];

    const b =
        sampleData.entities[1];


    document.getElementById(
        "usernameA"
    ).value = a.username;


    document.getElementById(
        "platformA"
    ).value = a.platform;


    document.getElementById(
        "textA"
    ).value = a.text;


    document.getElementById(
        "walletA"
    ).value =
        a.wallets[0] || "";


    document.getElementById(
        "usernameB"
    ).value = b.username;


    document.getElementById(
        "platformB"
    ).value = b.platform;


    document.getElementById(
        "textB"
    ).value = b.text;


    document.getElementById(
        "walletB"
    ).value =
        b.wallets[0] || "";

}


/* ================= CREATE ENTITY ================= */

function createEntity(
    type
) {

    const isA =
        type === "A";


    return {

        id:
            isA ? "CUSTOM-A" : "CUSTOM-B",

        platform:
            document.getElementById(
                isA
                    ? "platformA"
                    : "platformB"
            ).value,

        username:
            document.getElementById(
                isA
                    ? "usernameA"
                    : "usernameB"
            ).value,

        text:
            document.getElementById(
                isA
                    ? "textA"
                    : "textB"
            ).value,

        activity_hours:
            isA
                ? [22, 23, 0]
                : [22, 23, 0],

        activity_days:
            isA
                ? ["Mon", "Wed", "Fri"]
                : ["Mon", "Wed", "Fri"],

        post_count:
            isA
                ? 15
                : 14,

        wallets: [

            document.getElementById(
                isA
                    ? "walletA"
                    : "walletB"
            ).value

        ]

    };

}


/* ================= ANALYZE ================= */

async function analyzeRelationship() {

    const entityA =
        createEntity("A");

    const entityB =
        createEntity("B");


    const transactions =
        sampleData
            ? sampleData.transactions
            : [];


    const button =
        document.getElementById(
            "analyzeBtn"
        );


    button.textContent =
        "ANALYZING...";


    try {

        const response =
            await fetch(
                "/api/analyze",
                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:

                        JSON.stringify({

                            entity_a:
                                entityA,

                            entity_b:
                                entityB,

                            transactions:
                                transactions

                        })

                }
            );


        const result =
            await response.json();


        renderEntities(
            entityA,
            entityB
        );


        renderScores(
            result.scores
        );


        renderResult(
            result
        );


        updateWalletFlow(
            entityA,
            entityB,
            transactions
        );


        renderTransactions(
            transactions
        );

    }

    catch (error) {

        console.error(
            "Analysis error:",
            error
        );

        alert(
            "Unable to analyze the relationship."
        );

    }


    button.textContent =
        "ANALYZE RELATIONSHIP →";

}


/* ================= ENTITY DISPLAY ================= */

function renderEntities(
    a,
    b
) {

    document.getElementById(
        "entityA"
    ).innerHTML = `

        <div class="entity-name">
            ${a.username || "Unknown"}
        </div>

        <div class="entity-meta">
            Platform: ${a.platform}
        </div>

        <div class="entity-meta">
            Wallet:
            ${a.wallets.join(", ") || "Not available"}
        </div>
    `;


    document.getElementById(
        "entityB"
    ).innerHTML = `

        <div class="entity-name">
            ${b.username || "Unknown"}
        </div>

        <div class="entity-meta">
            Platform: ${b.platform}
        </div>

        <div class="entity-meta">
            Wallet:
            ${b.wallets.join(", ") || "Not available"}
        </div>
    `;

}


/* ================= SCORE DISPLAY ================= */

function renderScores(
    scores
) {

    const labels = {

        username_similarity:
            "ALIAS MATCHING",

        semantic_similarity:
            "SEMANTIC SIMILARITY",

        behavior_similarity:
            "BEHAVIOR MATCHING",

        temporal_similarity:
            "TEMPORAL MATCHING",

        financial_correlation:
            "FINANCIAL CORRELATION"

    };


    const scoreGrid =
        document.getElementById(
            "scoreGrid"
        );


    scoreGrid.innerHTML =
        "";


    Object.keys(
        labels
    ).forEach(
        key => {

            scoreGrid.innerHTML += `

                <div class="score-card">

                    <div class="score-label">

                        ${labels[key]}

                    </div>

                    <div class="score-value">

                        ${scores[key]}%

                    </div>

                </div>

            `;

        }
    );

}


/* ================= RESULT DISPLAY ================= */

function renderResult(
    result
) {

    document.getElementById(
        "overall"
    ).textContent =
        result.scores.overall_confidence
        + "%";


    document.getElementById(
        "status"
    ).textContent =
        result.status;


    const reasons =
        document.getElementById(
            "reasons"
        );


    reasons.innerHTML =
        "";


    if (
        result.reasons.length === 0
    ) {

        reasons.innerHTML =
            "<li>No strong correlation signals detected.</li>";

    }

    else {

        result.reasons.forEach(
            reason => {

                reasons.innerHTML += `

                    <li>
                        ✓ ${reason}
                    </li>

                `;

            }
        );

    }

}


/* ================= WALLET FLOW ================= */

function updateWalletFlow(
    a,
    b,
    transactions
) {

    document.getElementById(
        "walletEntityA"
    ).textContent =
        a.username || "—";


    document.getElementById(
        "walletEntityB"
    ).textContent =
        b.username || "—";


    document.getElementById(
        "walletAFlow"
    ).textContent =
        a.wallets[0] || "—";


    document.getElementById(
        "walletBFlow"
    ).textContent =
        b.wallets[0] || "—";


    const directTransaction =
        transactions.find(

            tx =>

                (
                    tx.from_wallet ===
                    a.wallets[0]

                    &&

                    tx.to_wallet ===
                    b.wallets[0]
                )

                ||

                (
                    tx.from_wallet ===
                    b.wallets[0]

                    &&

                    tx.to_wallet ===
                    a.wallets[0]
                )

        );


    document.getElementById(
        "transactionAmount"
    ).textContent =
        directTransaction

            ? directTransaction.amount

            : "NO DIRECT LINK";

}


/* ================= TRANSACTION TABLE ================= */

function renderTransactions(
    transactions
) {

    const table =
        document.getElementById(
            "transactionTable"
        );


    table.innerHTML =
        "";


    if (
        transactions.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td colspan="4">

                    No transaction data available.

                </td>

            </tr>

        `;

        return;

    }


    transactions.forEach(
        transaction => {

            table.innerHTML += `

                <tr>

                    <td>

                        ${transaction.from_wallet}

                    </td>

                    <td>

                        ${transaction.to_wallet}

                    </td>

                    <td>

                        ${transaction.amount}

                    </td>

                    <td>

                        ${transaction.timestamp}

                    </td>

                </tr>

            `;

        }
    );

}


/* ================= BUTTON EVENTS ================= */

document.getElementById(
    "loadSampleBtn"
).addEventListener(
    "click",
    loadSampleData
);


document.getElementById(
    "analyzeBtn"
).addEventListener(
    "click",
    analyzeRelationship
);


/* ================= INITIAL LOAD ================= */

loadSampleData();