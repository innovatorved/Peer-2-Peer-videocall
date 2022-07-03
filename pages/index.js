import { useEffect, useState, useRef } from "react";

import Peer from "simple-peer";
import io from "socket.io-client";
let socket;

import PRINT from '../Modules/production';


export default function Home() {

  const [ callerInfo, setCallerInfo ] = useState({
    recievingCall: false,
    caller: "",
    signal: null
  })
  const [ MyStream, SetMyStream ] = useState();
  const [ username, setusername ] = useState("");

  const MyVideo = useRef();
  const UserVideo = useRef();
  const connectionRef = useRef();

  const socketInitializer = async (username) => {
    await fetch("/api/server");
    socket = io();

    socket.on("connect", () => {
      PRINT("connected");
    });

    socket.on("me", (id) => {
      PRINT(id)
    })

    socket.on(username, (data) => {
      setCallerInfo({
        recievingCall: true,
        caller: data.caller,
        signal: data.signal
      })
    })
  };

  const GetPermissionForCameraAndAudio = () => {
    navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then((stream) => {
      SetMyStream(stream);
      MyVideo.current.srcObject = stream;
      PRINT("Permission Accepted");

    }).catch(() => {
      PRINT("Permission Denied");

    })
  }



  useEffect(() => {
    //  Execute on page load
    const u = prompt("Enter the Username");
    setusername(u);
    GetPermissionForCameraAndAudio();
    socketInitializer(u);

  }, [])


  const MakeCall = (to) => {

    const peer = new Peer({
      // Call Started
      initiator: true,
      trickle: false,
      stream: MyStream
    })

    peer.on("signal", (data) => {
			socket.emit("MakeCall", {
				user: to,
				signal: data,
				from: username,
			})
		})

    peer.on("stream", (stream) => {
			UserVideo.current.srcObject = stream
		})

    PRINT(`callAccepted${username}`)

    socket.on(`callAccepted${username}`, (signal) => {
			peer.signal(signal)
		})

    connectionRef.current = peer;

  }

  const AnswerCall = () => {

    const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: MyStream
		})

    peer.on("signal", (data) => {
      PRINT(callerInfo)
			socket.emit("AnswerCall", {to: callerInfo.caller , signal: data })
		})

    peer.on("stream", (stream) => {
			UserVideo.current.srcObject = stream
		})

    peer.signal(callerInfo.signal)

		connectionRef.current = peer;

  }

  const leaveCall = () => {
    setCallerInfo({...callerInfo , recievingCall : false})
		connectionRef.current.destroy()
	}


  return (
    <div>

      <div className="myvideo">
        <video playsInline muted ref={MyVideo} autoPlay style={{ width: "300px" }} />
      </div>

      <div className="uservideo">
        <video playsInline ref={UserVideo} autoPlay style={{ width: "300px" }} />
      </div>

      <div className="CallToSomeOne">
        <input type="button" value="ClickToCall" onClick={()=>{
          const to = prompt("USer To Call");
          MakeCall(to);
        }} />
      </div>

      <div className="acceptcall">
        {
          callerInfo.recievingCall ? (
          <h1>
            Call Comes
            <button onClick={AnswerCall} >Recieve Call</button>
          </h1>
        ) : ( 
          <h1>
            {`${callerInfo.recievingCall} dbejkbs`}
          </h1>
         )
        }
      </div>

      <div className="endCall">
        <button onClick={leaveCall}>EndCall</button>
      </div>
    </div>
  )
}

