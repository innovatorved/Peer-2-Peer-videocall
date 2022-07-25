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

  const [ userToCall, setUserToCall ] = useState("");

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
  // let isMobileDevice = false;
  const [isMobileDevice , setIsMobileDevice] = useState(true); 

  useEffect(() => {

    let details = navigator.userAgent;
    let regexp = /android|iphone|kindle|ipad/i;
    setIsMobileDevice(regexp.test(details))
    const u = prompt("Enter the Username");
    setusername(u);
    GetPermissionForCameraAndAudio();
    socketInitializer(u);
    
    if (isMobileDevice === true ) return ;
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div>
      {
        isMobileDevice !== true ? 
        (
          <div className="flex items-center justify-center mt-20 space-x-3">
      
            <div>
              <h1 className="text-center text-xl font-serif mb-5 text-[#212f3c]">Peer 2 Peer Web App</h1>
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
            </div>
      
            <div className="space-y-4">
      
              <div className="flex">
                <input type="text" id="website-admin" className="rounded-none rounded-l-lg bg-gray-50 border border-blue-600 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5"
                  placeholder="User" value={userToCall}
                  onChange={(e) => {
                    e.preventDefault();
                    setUserToCall(e.target.value);
                  }}
                />
                <button
                  className="inline-flex items-center px-3 text-xs text-blue-600 bg-gray-200 rounded-r-md border border-l-0 border-blue-600"
                  onClick={() => {
                    MakeCall(userToCall);
                  }}
                >
                  Click to Call
                </button>
              </div>
      
              <div className="acceptcall ">
                {callerInfo.recievingCall ? (
                  <h1>
                    Call Comes :
                    <button className="inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out" onClick={AnswerCall}>Recieve Call</button>
                  </h1>
                ) : (
                  <h1>{`status : ${callerInfo.recievingCall}`}</h1>
                )}
              </div>
      
              <div className="endCall inline-block px-6 py-2 border-2 border-blue-600 text-blue-600 font-medium text-xs leading-tight uppercase rounded hover:bg-black hover:bg-opacity-5 focus:outline-none focus:ring-0 transition duration-150 ease-in-out">
                <button onClick={leaveCall}>EndCall</button>
              </div>
      
            </div>
          </div>
        )
        :(<h1>Open in Desktop</h1>)
      }
    </div>
  )
}
