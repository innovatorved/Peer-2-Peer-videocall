import { useEffect, useState, useRef } from "react";

import Peer from "simple-peer";
import io from "socket.io-client";
let socket;

import PRINT from '../Modules/production';


export default function Home() {

  const [ callerInfo, setCallerInfo ] = useState({
    recievingCall: false,
    caller: "",
    name: "",
    signal: null
  })
  const [ MyStream, SetMyStream ] = useState();

  const MyVideo = useRef();
  const UserVideo = useRef();

  const socketInitializer = async () => {
    await fetch("/api/server");
    socket = io();

    socket.on("connect", () => {
      PRINT("connected");
    });

    socket.on("MakeCall", (data) => {
      setCallerInfo({
        recievingCall: true,
        caller: data.from,
        name: data.name,
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
    GetPermissionForCameraAndAudio();
    socketInitializer();

  }, [])

  return (
    <div>
      <div className="myvideo">
        <video playsInline muted ref={MyVideo} autoPlay style={{ width: "300px" }} />
      </div>
    </div>
  )
}

