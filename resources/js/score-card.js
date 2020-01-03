let totalPlayer = (playerID) => {
    let rowCollection = document.getElementsByClassName('scores-player-' + playerID);
    let playerTotalScore = 0;
    for (let i = 0; i < rowCollection.length; i++) {
        let currentValue = rowCollection[i].value;
        if (currentValue === "") {
            currentValue = "0";
        }
        playerTotalScore += parseInt(currentValue);
    }
    document.getElementById('player-' + playerID + '-total').innerHTML = playerTotalScore.toString();
};

let getAdvanceToNextScore = () => {
    let tabIndexElements = document.querySelectorAll('input, [tabindex]:not([tabindex="-1"])');
    let elementIds = {};
    for (let elementId = 0; elementId < tabIndexElements.length; elementId++) {
        elementIds[elementId] = tabIndexElements[elementId].id;
    }
    return elementIds
};

let addRound = (columnPosition, playersNumber, row, numberOfPlayers) => {
    let roundInput = row.insertCell(columnPosition);
    roundInput.innerHTML = "<td class=\"round\"><input type=\"number\" " +
        "class=\"round-inpt form-unit form-control round-" + columnPosition +" scores-player-" + playersNumber + "\" " +
        "id=\"inpt-score-player-" + playersNumber + "-round-" + columnPosition + "\" " +
        "tabindex=\"" + columnPosition.toString() + (numberOfPlayers - playersNumber).toString() + "\"></td>";
    document.getElementById("inpt-score-player-" + playersNumber + "-round-" + columnPosition).addEventListener('change', (event) => {
        totalPlayer(playersNumber);
    });
};

let addPlayer = () => {
    let playerName = document.getElementById('inpt-player-name').value;
    if (playerName === '') return;
    if (document.getElementById('score-card').classList.contains('hidden')) {
        document.getElementById('score-card').classList.remove('hidden')
    }
    let numberOfPlayers = document.getElementById('score-table').rows.length;
    let playersNumber = document.getElementById('score-table').rows.length;
    let currentRounds = document.getElementById('header').children.length - 2;
    let scoreCard = document.getElementById('score-table');

    let row = scoreCard.insertRow(numberOfPlayers);
    let name = row.insertCell(0);
    row.id = 'row-' + playersNumber;

    name.innerHTML = playerName;
    for (let round = 1; round <= currentRounds; round++) {
        addRound(round, playersNumber, row, numberOfPlayers);
    }
    let total = row.insertCell(currentRounds + 1);
    total.innerHTML = "0";
    total.id = 'player-' + playersNumber + '-total';
    document.getElementById('inpt-player-name').value = '';
};

let playerRoundFromId = (currentId) => {
    return {
        round: currentId.slice(currentId.indexOf('round-') + 6),
        player: currentId.slice(currentId.indexOf('player-') + 7, currentId.indexOf('round-') - 1)
    }
};

let maxPlayer = () => document.getElementById('score-table').rows.length - 1;

let maxRound = () => document.getElementsByClassName('round').length;

document.getElementById('add-player').addEventListener('click', (event) => addPlayer());
document.addEventListener('keyup', function(event) {
    if (event.key === "Enter" || event.which === 13) {
        if (event.target.id === 'inpt-player-name') {
            addPlayer();
        } else if (event.target.id.slice(0, 18) === "inpt-score-player-") {
            let playerRound = playerRoundFromId(document.activeElement.id);
            let nextInput = {
                round: 0,
                player: 0
            };
            if (parseInt(playerRound.player) === maxPlayer() && parseInt(playerRound.round) !== maxRound()) {
                nextInput.player = 1;
                nextInput.round = parseInt(playerRound.round) + 1;
            } else if (parseInt(playerRound.player) === maxPlayer() && parseInt(playerRound.round) === maxRound()) {
                let currentRounds = document.getElementById('header').children.length - 2;
                let rows = document.getElementById('score-table').rows;
                let header = document.createElement('th');
                header.innerHTML = 'Round ' + (currentRounds + 1).toString();
                header.classList.add('round');
                header.id = 'round-' + (currentRounds + 1).toString() + '-header';
                let headers = document.getElementById('header');
                headers.insertBefore(header, document.getElementById('total-header'));
                for (let player = 1; player < rows.length; player++) {
                    let currentRow = rows[player];
                    addRound(currentRounds + 1, rows[player].id.replace('row-', ''), rows[player], rows.length);
                }

                document.getElementById('navbar').style.width = (document.getElementById('score-table').offsetWidth + 20).toString() + 'px';
                nextInput.player = 1;
                nextInput.round = parseInt(playerRound.round) + 1;
            } else {
                nextInput.player = parseInt(playerRound.player) + 1;
                nextInput.round = parseInt(playerRound.round);
            }
            let nextElementId = 'inpt-score-player-' + nextInput.player + '-round-' + nextInput.round;
            document.getElementById(nextElementId).focus();
            document.getElementById(nextElementId).select();
        }
    }
});

document.getElementById('new-round').addEventListener('click', (event) => {
    let currentRounds = document.getElementById('header').children.length - 2;
    let rows = document.getElementById('score-table').rows;
    let header = document.createElement('th');
    header.innerHTML = 'Round ' + (currentRounds + 1).toString();
    header.classList.add('round');
    header.id = 'round-' + (currentRounds + 1).toString() + '-header';
    let headers = document.getElementById('header');
    headers.insertBefore(header, document.getElementById('total-header'));
    for (let player = 1; player < rows.length; player++) {
        let currentRow = rows[player];
        addRound(currentRounds + 1, rows[player].id.replace('row-', ''), rows[player], rows.length);
    }

    document.getElementById('navbar').style.width = (document.getElementById('score-table').offsetWidth + 20).toString() + 'px';
});
