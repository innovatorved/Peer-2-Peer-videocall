import PRINT from './production';

const GetPermissionForCameraAndAudio = (MyVideo , SetMyStream) => {
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
export default GetPermissionForCameraAndAudio;