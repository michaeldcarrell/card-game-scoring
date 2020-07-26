// let socket = io.connect('http://localhost:8080');
let socket = io("https://ce-scoring.herokuapp.com/");

let roomCode = Cookies.get('ce-room-manage-code');
document.getElementById('room-code').innerHTML = 'Room Code: ' + roomCode;

let playerNames = [];
let playerNameNumbers = {};

let playerRoundScores = {};
let maxRounds = 0;

socket.on('score', function(data){
    console.log(data);
});

socket.on('new-player', function(data) {
    if (data.roomCode === roomCode) {
        //create function which finds players with the same name
        let playerNotExists = !playerNames.includes(data.playerName);
        if (playerNotExists) {
            addPlayerViaSocket(data.playerName);
            playerNames.push(data.playerName);
        }
        console.log(playerNames);
        console.log(playerNameNumbers);
        socket.emit('player-joined', {
            roomCode: roomCode,
            playerName: data.playerName,
            playerNumber: playerNameNumbers[data.playerName].playerNumber,
            roundNumber: document.getElementById('header').children.length - 3,
            scores: playerRoundScores,
            result: playerNotExists
        })
        console.log(data.playerName, data.roomCode);
    }
})

socket.on('player-submitted-score', function(data){
    console.log(data);
    document.getElementById('inpt-score-player-' + data.playerNumber + '-round-' + data.roundNumber).value = data.roundScore;
    totalPlayer(data.playerNumber);
    if (checkForNextRound(maxRound(), maxPlayer())) {
        addNewRound();
    }
});

let totalPlayer = function(playerID) {
    console.log('Total Player', playerID)
    let rowCollection = document.getElementsByClassName('scores-player-' + playerID);
    let playerTotalScore = 0;
    let roundScores = {};
    for (let i = 0; i < rowCollection.length; i++) {
        let currentValue = rowCollection[i].value;
        if (currentValue === "") {
            currentValue = "0";
        }
        playerTotalScore += parseInt(currentValue);
        roundScores[i] = parseInt(currentValue);
    }
    document.getElementById('player-' + playerID + '-total').innerHTML = playerTotalScore.toString();
    playerRoundScores[playerID] = {score: roundScores}
    socket.emit('scoreboard-update', {
        roomCode: roomCode,
        scores: playerRoundScores
    });
};

let addGameButtons = function (playerCount) {
    if(playerCount === 0) {
        // document.getElementById('new-game').style.display = 'block';
        document.getElementById('new-round').style.display = 'block';
    }
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
    if (columnPosition > maxRounds) {
        maxRounds = columnPosition;
        socket.emit('new-round', {
            roomCode: roomCode,
            roundNumber: maxRounds
        })
    }
};

let addPlayer = function() {
    let currentPlayerCount = parseInt(document.getElementById('data').getAttribute('data-player-count'))
    let currentPlayerNames = document.getElementById('data').getAttribute('data-players')
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
    for (let round = 1; round < currentRounds; round++) {
        addRound(round, playersNumber, row, numberOfPlayers);
    }
    let total = row.insertCell(currentRounds);
    total.innerHTML = "0";
    total.id = 'player-' + playersNumber + '-total';


    let runningTotal = row.insertCell(currentRounds + 1);
    runningTotal.innerHTML = "0";
    runningTotal.id = 'player-' + playersNumber + 'running-total';

    document.getElementById('inpt-player-name').value = '';
    document.getElementById('data')
        .setAttribute('data-player-count', (currentPlayerCount + 1).toString())
    if (currentPlayerCount > 0) {
        currentPlayerNames += ' ' + playerName
    } else {
        currentPlayerNames = playerName
    }
    document.getElementById('data').setAttribute('data-players', currentPlayerNames)

    addGameButtons(currentPlayerCount);
    playerNameNumbers[playerName] = {playerNumber: playersNumber}
};

let newGame = () => {
    let table = document.getElementById('score-table')
    for (let playerIndex = table.rows.length - 1; playerIndex >= 0; playerIndex--) {
        let row = table.rows[playerIndex]
        let totalColumnIndex = row.children.length - 1;
        for (let columnIndex = totalColumnIndex; columnIndex > 1; columnIndex--) {
            if (columnIndex < totalColumnIndex) {
                row.deleteCell(columnIndex);
            }
        }
        if (playerIndex > 0) {
            document.getElementById('inpt-score-player-' + playerIndex +'-round-1').value = '';
            document.getElementById('player-' + playerIndex + '-total').innerHTML = '0';
        }
    }
}

let checkForNextRound = function(maxRound, maxPlayer) {
    let allRoundsFilled = true;
    for (let i = 1; i <= maxPlayer; i++) {
        let playerRoundScore = document
            .getElementById('inpt-score-player-' + i + '-round-' + maxRound.toString())
            .value
        if (playerRoundScore === '') {
            allRoundsFilled = false;
        }
    }
    return allRoundsFilled
}

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
                // let currentRounds = document.getElementById('header').children.length - 2;
                // let rows = document.getElementById('score-table').rows;
                // let header = document.createElement('th');
                // header.innerHTML = 'Round ' + (currentRounds).toString();
                // header.classList.add('round');
                // header.id = 'round-' + (currentRounds).toString() + '-header';
                // let headers = document.getElementById('header');
                // headers.insertBefore(header, document.getElementById('total-header'));
                // for (let player = 1; player < rows.length; player++) {
                //     let currentRow = rows[player];
                //     addRound(currentRounds, rows[player].id.replace('row-', ''), rows[player], rows.length);
                // }
                //
                // document.getElementById('navbar').style.width = (document.getElementById('score-table').offsetWidth + 20).toString() + 'px';
                addNewRound();

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

let addNewRound = function() {
    let currentRounds = document.getElementById('header').children.length - 3;
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
}

document.getElementById('new-round').addEventListener('click', (event) => {
    addNewRound();
});

// document.getElementById('new-game').addEventListener('click', (event) => newGame());

// testing inits
let eventFire = function (el, etype){
    if (el.fireEvent) {
        el.fireEvent('on' + etype);
    } else {
        let evObj = document.createEvent('Events');
        evObj.initEvent(etype, true, false);
        el.dispatchEvent(evObj);
    }
}
let addPlayerViaSocket = function(playerName) {
    let nameInput = document.getElementById('inpt-player-name');
    let addPlayerBtn = document.getElementById('add-player');
    nameInput.value = playerName;
    addPlayerBtn.click();
};

let initRounds = function(number) {
    for (let i = 0; i < number; i++) {
        eventFire(document.getElementById('new-round'), 'click')
    }
};
