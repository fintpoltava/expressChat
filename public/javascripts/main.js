$(function () {
  var socket = io()
  $('form#message').submit(function () {
    var msg = $('#m').val();
    socket.emit('chat message', msg )
    $('#m').val('');
    return false
  });

  $('form#nickName').submit(function () {
    socket.emit('change name', $('#nick').val() )
    return false
  });

  socket.on('chat message', function(msg){
    $('#messages').prepend($('<li>').addClass('list-group-item').text(msg));
  });
})
