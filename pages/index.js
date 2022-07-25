import { useEffect, useState, useRef } from "react";

import Peer from "simple-peer";
import io from "socket.io-client";
let socket;

import PRINT from "../Modules/production";

export default function Home() {
  const [ callerInfo, setCallerInfo ] = useState({
    recievingCall: false,
    caller: "",
    signal: null,
  });
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
      PRINT(id);
    });

    socket.on(username, (data) => {
      setCallerInfo({
        recievingCall: true,
        caller: data.caller,
        signal: data.signal,
      });
    });
  };

  const GetPermissionForCameraAndAudio = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
      .then((stream) => {
        SetMyStream(stream);
        MyVideo.current.srcObject = stream;
        PRINT("Permission Accepted");
      })
      .catch(() => {
        PRINT("Permission Denied");
      });
  };

  useEffect(() => {
    //  Execute on page load
    const u = prompt("Enter the Username");
    setusername(u);
    GetPermissionForCameraAndAudio();
    socketInitializer(u);
  }, []);

  const MakeCall = (to) => {
    const peer = new Peer({
      // Call Started
      initiator: true,
      trickle: false,
      stream: MyStream,
    });

    peer.on("signal", (data) => {
      socket.emit("MakeCall", {
        user: to,
        signal: data,
        from: username,
      });
    });

    peer.on("stream", (stream) => {
      UserVideo.current.srcObject = stream;
    });

    PRINT(`callAccepted${username}`);

    socket.on(`callAccepted${username}`, (signal) => {
      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const AnswerCall = () => {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: MyStream,
    });

    peer.on("signal", (data) => {
      PRINT(callerInfo);
      socket.emit("AnswerCall", { to: callerInfo.caller, signal: data });
    });

    peer.on("stream", (stream) => {
      UserVideo.current.srcObject = stream;
    });

    peer.signal(callerInfo.signal);

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallerInfo({ ...callerInfo, recievingCall: false });
    connectionRef.current.destroy();
  };

  return (
    <div className="flex items-center justify-center mt-20 space-x-3">
      <div className="lg:flex lg:w-[820px] bg-[#1a707c] border-[#000000] rounded-3xl lg:p-5 lg:space-x-4 w-[375px] p-3 ">
        <div className="lg:w-[400px] lg:h-[310px] bg-[#F8F0F0] rounded-lg lg:p-3 w-[350px] h-[280px] p-2">
          <video playsInline muted ref={MyVideo} autoPlay />
          <div className="text-center">{username}</div>
        </div>

        <div className="lg:w-[400px] lg:h-[310px] bg-[#F8F0F0] rounded-lg lg:p-3 w-[350px] h-[280px] p-2 mt-3 lg:mt-0">
          <video playsInline ref={UserVideo} autoPlay />
          <div className="text-center">{callerInfo.caller}</div>
        </div>
      </div>

      <div>
        <div className="CallToSomeOne inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
          <input
            type="button"
            value="ClickToCall"
            onClick={() => {
              const to = prompt("User To Call");
              MakeCall(to);
            }}
          />
        </div>

        <div className="acceptcall ">
          {callerInfo.recievingCall ? (
            <h1>
              Call Comes : 
              <button className="inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out" onClick={AnswerCall}>Recieve Call</button>
            </h1>
          ) : (
            <h1>{`${callerInfo.recievingCall}`}</h1>
          )}
        </div>

        <div className="endCall inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
          <button onClick={leaveCall}>EndCall</button>
        </div>

      </div>
    </div>
  );
}
