import UploadActions from "../actions/UploadActions";
import alt from "../alt";
import socket from "filepizza-socket";

const SPEED_REFRESH_TIME = 2000;

export default alt.createStore(
  class UploadStore {
    constructor() {
      this.bindActions(UploadActions);

      this.fileName = "";
      this.fileSize = 0;
      this.fileType = "";
      this.peers = 0;
      this.speedUp = 0;
      this.status = "ready";
      this.token = null;
      this.shortToken = null;
    }

    onUploadFile(file) {
      if (this.status !== "ready") return;
      this.status = "processing";

      socket.emit('rtcConfig', {}, (rtcConfig) => {
        const pc = new RTCPeerConnection(rtcConfig)
        const dc = pc.createDataChannel("file.pizza transfer")

        dc.onmessage = function (event) {
          console.log("received: " + event.data);
        };

        dc.onopen = function () {
          console.log("datachannel open");
        };

        dc.onclose = function () {
          console.log("datachannel close");
        };

        socket.on("updateDownloaders", function (data, res) {
          console.log(data)
        });

        socket.emit(
          "upload",
          {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type
          },
          (res) => {
            this.setState({
              status: "uploading",
              token: res.token,
              shortToken: res.shortToken,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            });
          }
        );
      });
    }
  },
  "UploadStore"
);
