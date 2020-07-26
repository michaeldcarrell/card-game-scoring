let roomCode = document.getElementById('room-code');
    playerName = document.getElementById('player-name');
    joinBtn = document.getElementById('join');
    newRoomBtn = document.getElementById('create-new-card');

joinBtn.addEventListener('click', function() {
    Cookies.set('ce-room-code', roomCode.value);
    Cookies.set('ce-player-name', playerName.value);
    document.location.href = '/player'
});

newRoomBtn.addEventListener('click', function () {
    Cookies.set('ce-room-manage-code', generateRoomCode());
    document.location.href = '/scoreboard';
});

let generateRoomCode = function() {
    let result = '';
    let characters = 'abcdefghijklmnopqrstuvwxyz';
    let idLen = 6;
    for (let i = 0; i < idLen; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result
}

