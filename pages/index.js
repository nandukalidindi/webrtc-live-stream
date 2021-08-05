import React, { useEffect, useState, useRef } from 'react';
import Head from 'next/head';

const CAMERA_CONSTRAINTS = {
  video: { width: 960, height: 540 }
};

export default () => {
  const [connected, setConnected] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState(null);
  const [shoutOut, setShoutOut] = useState('you');

  const inputStreamRef = useRef();
  const videoRef = useRef();
  const wsRef = useRef();
  const mediaRecorderRef = useRef();
  const requestAnimationRef = useRef();
  const nameRef = useRef();

  const enableCamera = async () => {
    inputStreamRef.current = await navigator.mediaDevices.getUserMedia(
      CAMERA_CONSTRAINTS
    );

    videoRef.current.srcObject = inputStreamRef.current;

    await videoRef.current.play();    

    setCameraEnabled(true);
  };

  const stopStreaming = () => {
    mediaRecorderRef.current.stop();
    setStreaming(false);
  };

  const startStreaming = () => {
    setStreaming(true);

    const protocol = window.location.protocol.replace('http', 'ws');
    wsRef.current = new WebSocket(
      `${protocol}//${window.location.host}/rtmp?key=${streamKey}`
    );

    wsRef.current.addEventListener('open', function open() {
      setConnected(true);
    });

    wsRef.current.addEventListener('close', () => {
      setConnected(false);
      stopStreaming();
    });

    const videoTracks = inputStreamRef.current.getTracks(); // 30 FPS

    // Let's do some extra work to get audio to join the party.
    // https://hacks.mozilla.org/2016/04/record-almost-everything-in-the-browser-with-mediarecorder/
    // const audioStream = new MediaStream();
    // const audioTracks = inputStreamRef.current.getAudioTracks();
    // audioTracks.forEach(function(track) {
    //   audioStream.addTrack(track);
    // });

    const outputStream = new MediaStream();
    videoTracks.forEach(function(t) {
      outputStream.addTrack(t);
    });

    mediaRecorderRef.current = new MediaRecorder(outputStream, {
      mimeType: 'video/webm',
      videoBitsPerSecond: 3000000
    });

    mediaRecorderRef.current.addEventListener('dataavailable', e => {
      wsRef.current.send(e.data);
    });

    mediaRecorderRef.current.addEventListener('stop', () => {
      stopStreaming();
      wsRef.current.close();
    });

    mediaRecorderRef.current.start(1000);
  };

  useEffect(() => {
    nameRef.current = shoutOut;
  }, [shoutOut]);

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      <Head>
        <title>Streamr</title>
      </Head>
      <h1>Streamr</h1>

      {!cameraEnabled && (
        <button className="button button-outline" onClick={enableCamera}>
          Enable Camera
        </button>
      )}

      {cameraEnabled &&
        (streaming ? (
          <div>
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
            <button className="button button-outline" onClick={stopStreaming}>
              Stop Streaming
            </button>
          </div>
        ) : (
          <>
            <input
              placeholder="Stream Key"
              type="text"
              onChange={e => setStreamKey(e.target.value)}
            />
            <button
              className="button button-outline"
              disabled={!streamKey}
              onClick={startStreaming}
            >
              Start Streaming
            </button>
          </>
        ))}
      <div className="row">
        <div className="column">
          <h2>Input</h2>
          <video ref={videoRef} controls width="100%" height="auto" muted></video>
        </div>        
      </div>
    </div>
  );
};
