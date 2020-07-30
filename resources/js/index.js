let roomCode = document.getElementById('room-code');
    playerName = document.getElementById('player-name');
    joinBtn = document.getElementById('join');
    newRoomBtn = document.getElementById('create-new-card');

joinBtn.addEventListener('click', function() {
    Cookies.set('ce-room-code', roomCode.value.toLowerCase().trim());
    Cookies.set('ce-player-name', playerName.value.trim());
    document.location.href = '/player'
});

newRoomBtn.addEventListener('click', function () {
    document.location.href = '/scoreboard';
});

