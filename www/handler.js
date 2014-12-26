var OpusEncoderProcessor = function( wsh )
{
    this.wsh = wsh;
    this.bufferSize = 4096; // for webaudio script processor
    this.downSample = 2;
    this.opusFrameDur = 60; // msec
    this.opusRate = 24000;
    this.i16arr = new Int16Array( this.bufferSize / this.downSample );
    this.f32arr = new Float32Array( this.bufferSize / this.downSample );
    this.opusEncoder = new OpusEncoder( this.opusRate, 1, 2049, this.opusFrameDur );
}

OpusEncoderProcessor.prototype.onAudioProcess = function( e )
{
    if( isRecording )
    {
	var data = e.inputBuffer.getChannelData( 0 )
	var i = 0, ds = this.downSample;
	
	if( encode )
	{
	    for( var idx = 0; idx < data.length; idx += ds )
		this.f32arr[ i++ ] = data[ idx ];

	    var res = this.opusEncoder.encode_float( this.f32arr );

	    for( var idx = 0; idx < res.length; ++idx )
		this.wsh.send( res[ idx ] );
	}
	else
	{
	    for( var idx = 0; idx < data.length; idx += ds )
		this.i16arr[ i++ ] = data[ idx ] * 0xFFFF; // int16

	    this.wsh.send( this.i16arr );
	}
    }
}

var MediaHandler = function( audioProcessor )
{
    var context = new (window.AudioContext||window.webkitAudioContext)();
    if( !context.createScriptProcessor )
	context.createScriptProcessor = context.createJavaScriptNode;

    if( context.sampleRate < 44000 || context.SampleRate > 50000 )
    {
	alert( "Unsupported sample rate: " + String( context.sampleRate ) );
	return;
    };

    //initialize mic
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
    this.context = context;
    this.audioProcessor = audioProcessor;
    var userMediaConfig = {
	"audio": {
	    "mandatory": {},
	    "optional": []
	}
    }
    
    navigator.getUserMedia( userMediaConfig, this.callback.bind( this ), this.error );
}

MediaHandler.prototype.callback = function( stream )
{
    console.log( 'starting callback' );
    this.micSource = this.context.createMediaStreamSource( stream );
    this.processor = this.context.createScriptProcessor( this.audioProcessor.bufferSize, 1, 1 );
    this.processor.onaudioprocess = this.audioProcessor.onAudioProcess.bind( this.audioProcessor );
    this.micSource.connect( this.processor );
    this.processor.connect( this.context.destination );
    console.log( 'ending callback' );
}

MediaHandler.prototype.error = function( err ) { alert( "Problem" ); }
