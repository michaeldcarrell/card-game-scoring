// let socket = io.connect('http://localhost:8080');
let socket = io("https://ce-scoring.herokuapp.com/");

let roomCode = Cookies.get('ce-room-code');
let playerName = Cookies.get('ce-player-name');
let playerNumber;
let scores;


socket.emit('new-player', {
    playerName: playerName,
    roomCode: roomCode
});

socket.on('player-joined', function(data) {
    if (data.roomCode === roomCode) {
        if (playerName === data.playerName) {
            if (data.scores[data.playerNumber]) {
                scores = data.scores[data.playerNumber].score;
            } else {
                scores = {};
            }
            addRounds(data.roundNumber);
            playerNumber = data.playerNumber;
            if (data.result) {
                console.log('Player Added to room', data);
            } else {
                console.log('Room refused player', data);
            }
        } else {
            console.log(data.roomCode, roomCode);
        }
    }
});

socket.on('connect-to-room', function() {
    document.getElementById('connection-container').style.display = 'none';
    document.getElementById('scoring-container').style.display = 'block';
});

socket.on('cannot-connect-to-room', function() {
    console.log('No Such Room');
});

socket.on('new-round', function(data) {
    if (data.roomCode === roomCode) {
        addRounds(data.roundNumber);
        document.getElementById('round-select').value = data.roundNumber;
    }
})

socket.on('scoreboard-update', function(data) {
    if (data.roomCode === roomCode) {
        if (data.scores[playerNumber]) {
            console.log(data.scores);
            scores = data.scores[playerNumber].score;
        }
    }
})

let addRounds = function(currentRoundNum) {
    let selecter = document.getElementById('round-select');
    let options = selecter.options;
    for (let i = 0; i < options.length; i++) {
        options[i].remove();
    }

    for (let i = 1; i <= currentRoundNum; i++) {
        let option = document.createElement('option');
        option.value = i.toString();
        option.innerHTML = 'Round ' + i.toString();
        selecter.appendChild(option);
    }
}

document.getElementById('submit-score').addEventListener('click', function () {
    let roundSel = document.getElementById('round-select');
    let scoreInpt = document.getElementById('round-score');
    let currentRound = roundSel.value;
    socket.emit('player-submitted-score', {
        playerName: playerName,
        playerNumber: playerNumber,
        roomCode: roomCode,
        roundNumber: parseInt(currentRound),
        roundScore: parseInt(scoreInpt.value)
    })
    roundSel.value = parseInt(currentRound) + 1;
    if (scores) {
        if (scores[parseInt(currentRound)]) {
            scoreInpt.value = scores[parseInt(currentRound)];
        } else {
            scoreInpt.value = 0;
        }
    } else {
        scoreInpt.value = 0;
    }
});

document.getElementById('round-select').addEventListener('change', function() {
    let scoreInpt = document.getElementById('round-score');
    let currentRound = this.value;
    console.log('Current Round', currentRound);
    if (scores[currentRound - 1]) {
        scoreInpt.value = scores[currentRound - 1];
    } else {
        scoreInpt.value = 0
    }
})

console.log(Cookies.get('ce-player-name'), Cookies.get('ce-room-code'));