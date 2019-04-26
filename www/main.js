var isRecording = false, encode = false;
var wsh = new WebSocket( 'ws://' + window.location.href.split( '/' )[2] + '/ws' );

function onWsMessage( msg ){ console.log(msg); }

wsh.onmessage = onWsMessage;
var ap = new OpusEncoderProcessor( wsh );
var mh = new MediaHandler( ap );

function sendSettings()
{
    if( document.getElementById( "encode" ).checked )
	encode = 1;
    else
	encode = 0;

    var rate = String( mh.context.sampleRate / ap.downSample );
    var opusRate = String( ap.opusRate );
    var opusFrameDur = String( ap.opusFrameDur )

    var msg = "m:" + [ rate, encode, opusRate, opusFrameDur ].join( "," );
    console.log( msg );
    wsh.send( msg );
}

function startRecord()
{
    document.getElementById( "record").innerHTML = "Stop";
    document.getElementById( "encode" ).disabled = true;
    mh.context.resume(); // needs an await?
    sendSettings();
    isRecording = true;
    console.log( 'started recording' );
}

function stopRecord()
{
    isRecording  = false;
    document.getElementById( "record").innerHTML = "Record";
    document.getElementById( "encode" ).disabled = false;
    console.log( 'ended recording' );    
}

function toggleRecord()
{
    if( isRecording )
	stopRecord();
    else
	startRecord();
}
