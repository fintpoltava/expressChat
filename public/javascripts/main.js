function GetDate(jsonDate) {
  var value = new Date(jsonDate);
  return value.toISOString().slice(0, 19).replace('T', ' ')
}

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
    var text = $('#messageTmpl').tmpl(msg);

    $('#messages').prepend(text);
  });

  socket.on('chat users', function(msg){

    $('#users').html('');
    msg.forEach(function (t) {
      $('#users').append("<li class='list-group-item'>"+t+"</li>");
    })
  });



})
