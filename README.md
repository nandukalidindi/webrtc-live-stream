# webrtc-live-stream
Sample application that sends Video feed from Browser camera to a NodeJS server

NOTE: This is not using WebRTC yet, getUserMedia usage !== WebRTC. ICE candidates, STUN / TURN servers and signaling using SDP makes WebRTC

Code sample from https://mux.com/blog/the-state-of-going-live-from-a-browser/

# Docker steps
docker build -t yolov5

docker run -p 1935:1935 rtmp-server
docker run --network="host" -it yolov5 // for localhost access inside the docker environment
python detect.py --weights 'fire_and_smoke.pt' --source 'rtmp://localhost/show/test'