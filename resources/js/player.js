// let socket = io.connect('http://localhost:8080');
let socket = io("https://ce-scoring.herokuapp.com/");

let roomCode = Cookies.get('ce-room-code');
let playerName = Cookies.get('ce-player-name');
let playerNumber;
let scores;
let connection = {
    connected: true,
    roomExists: false,
    at: new Date()
};


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
                // console.log('Player Added to room', data);
            } else {
                // console.log('Room refused player', data);
            }
        } else {
            // console.log(data.roomCode, roomCode);
        }
    }
});

setInterval(function() {
    socket.emit('client-poll');
}, 2000);

setInterval(function() {
    let currentTime = new Date();
    let lastSuccessfulPoll = connection.at;
    if (currentTime - lastSuccessfulPoll > 5000 && connection.roomExists === true) {
        connection .connected = false;
        // console.log(new Date(), 'Disconnected')
        document.getElementById('connection-container').style.display = 'none';
        document.getElementById('scoring-container').style.display = 'none';
        document.getElementById('re-connection-container').style.display = 'block';
    }
}, 5000);

socket.on('client-poll', function() {
    // console.log(new Date(), 'Connected')
    connection.connected = true;
    connection.at = new Date();
    if (connection.roomExists === true) {
        document.getElementById('scoring-container').style.display = 'block';
        document.getElementById('re-connection-container').style.display = 'none';
    }
});

socket.on('connect-to-room', function() {
    connection.roomExists = true;
    document.getElementById('connection-container').style.display = 'none';
    document.getElementById('scoring-container').style.display = 'block';
});

socket.on('cannot-connect-to-room', function() {
    document.getElementById('connection-container').style.display = 'none';
    document.getElementById('no-room-container').style.display = 'block';
    document.getElementById('no-room-room-code').innerText = roomCode ?? '';
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
            // console.log(data.scores);
            scores = data.scores[playerNumber].score;
        }
    }
})

let addRounds = function(currentRoundNum) {
    let selecter = document.getElementById('round-select');
    let options = selecter.options;
    for (let i = options.length - 1; i >= 0; i--) {
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
    let scoreInput = document.getElementById('round-score');
    let score = parseInt(scoreInput.value)
    if (document.getElementById('negative').style.display !== 'none') {
        score = -1 * score;
    }
    let currentRound = roundSel.value;
    socket.emit('player-submitted-score', {
        playerName: playerName,
        playerNumber: playerNumber,
        roomCode: roomCode,
        roundNumber: parseInt(currentRound),
        roundScore: score
    })
    roundSel.value = parseInt(currentRound) + 1;
    if (scores) {
        if (scores[parseInt(currentRound)]) {
            setScore(scores[parseInt(currentRound)]);
        } else {
            setScore(0);
        }
    } else {
        setScore(0);
    }
});

document.getElementById('back-to-lobby-btn').addEventListener('click', function() {
    document.location.href = '/';
})

document.getElementById('round-select').addEventListener('change', function() {
    let scoreInpt = document.getElementById('round-score');
    let currentRound = this.value;
    // console.log('Current Round', currentRound);
    if (scores[currentRound - 1]) {
        setScore(scores[currentRound - 1]);
    } else {
        setScore(0);
    }
});

let resetPosNeg = function(direction) {
    if (direction === 'pos') {
        document.getElementById('positive').style.display = 'block';
        document.getElementById('negative').style.display = 'none';
    } else {
        document.getElementById('positive').style.display = 'none';
        document.getElementById('negative').style.display = 'block';
    }
}

let setScore = function(score) {
    let scoreInput = document.getElementById('round-score');
    if (score >= 0){
        resetPosNeg('pos');
        scoreInput.value = score;
    } else {
        resetPosNeg('neg');
        scoreInput.value = -1 * score
    }
}

document.getElementById('positive').addEventListener('click', function() {
    this.style.display = 'none';
    document.getElementById('negative').style.display = 'block';
})

document.getElementById('negative').addEventListener('click', function() {
    this.style.display = 'none';
    document.getElementById('positive').style.display = 'block';
})