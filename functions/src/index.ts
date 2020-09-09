import * as functions from "firebase-functions";
import admin = require("firebase-admin");
// import gcm = require('node-gcm');
admin.initializeApp(functions.config().firebase);

const db = admin.firestore();
// const recipients: gcm.IRecipient = { to: "/topics/BluewaveSignal"};
interface MemberInfo {
  id?: string;
  token?: string;
  userName?: string;
}
interface MyMembersInfo {
  a?: MemberInfo;
  b?: MemberInfo;
  c?: MemberInfo;
  d?: MemberInfo;
}

function getRandomInt(maxCnt, id: number) {
  let tempId: number = 0;
  if (maxCnt < 2) return 0;
  else {
    while (1) {
      tempId = Math.floor(Math.floor(Math.random() * maxCnt * 100) / 100) + id;
      if (tempId >= maxCnt) tempId = tempId - maxCnt;
      if (tempId !== id) {
        return tempId;
      }
    }
  }
  return 0;
}

export const sendToMyMembersNotification = functions.firestore
  .document("Rooms/{roomId}")
  .onCreate(async (docSnapshot, context) => {
    //const connect = docSnapshot.data()
    // const flagClosed = connect!.flagClosed

    const roomId = context.params.roomId;
    let possibleUsersRef = db.collection("users");
    let masterRef = db.collection("Rooms").doc(roomId);
    let videoRef = db.collection("videos");
    let addInfoA: MemberInfo = { id: "", token: "", userName: "" };
    let addInfoB: MemberInfo = { id: "", token: "", userName: "" };
    let addInfoC: MemberInfo = { id: "", token: "", userName: "" };
    let addInfoD: MemberInfo = { id: "", token: "", userName: "" };

    var cnt: number = 4;
    let activityType: string = "";
    let activityDuration: string = "";
    let youtubeLink: string = "";
    var tempCnt: number = 0;
    let udid: string = "";
    let videoPlayerId: number = 0;
    let selectedId: number = 0;
    let videoLink: string = "";
    let masterFcmToken: string = "";
    var currentMembers: MyMembersInfo = {
      a: addInfoA,
      b: addInfoB,
      c: addInfoC,
      d: addInfoD
    };
    await masterRef.get().then(snapshot => {
      activityType = snapshot.get("activityType");
      activityDuration = snapshot.get("activityDuration");
      udid = snapshot.get("master");
      currentMembers = snapshot.get("members");

      if (typeof currentMembers === typeof undefined) {
        currentMembers = { a: addInfoA, b: addInfoB, c: addInfoC, d: addInfoD };
      }
      if (currentMembers.a.id != "") {
        tempCnt += 1;
      }
      if (currentMembers.b.id != "") {
        tempCnt += 1;
      }
      if (currentMembers.c.id != "") {
        tempCnt += 1;
      }
      if (currentMembers.d.id != "") {
        tempCnt += 1;
      }
    });

    await possibleUsersRef
      .doc(udid)
      .get()
      .then(snapshot => {
        videoPlayerId = Number(snapshot.get("videoId"));
        videoLink = String(snapshot.get("videoLink"));
        masterFcmToken = String(snapshot.get("fcmToken"));
      });

    await videoRef
      .where("category", "==", activityType)
      .where("time", "==", activityDuration)
      .get()
      .then(snapshot => {
        let numberOfLinks = snapshot.docs.length;
        if (numberOfLinks === 0) {
          youtubeLink = "";
        } else {
          selectedId = getRandomInt(numberOfLinks, videoPlayerId);
          youtubeLink = snapshot.docs[selectedId].get("url");
        }
      });

    await db
      .collection("users")
      .doc(udid)
      .set({ videoId: selectedId }, { merge: true });

    if (videoLink === youtubeLink) {
      await videoRef
        .where("category", "==", activityType)
        .where("time", "==", activityDuration)
        .get()
        .then(snapshot => {
          let numberOfLinks = snapshot.docs.length;
          if (numberOfLinks === 0) {
            youtubeLink = "";
          } else {
            selectedId = getRandomInt(numberOfLinks, videoPlayerId);
            youtubeLink = snapshot.docs[selectedId].get("url");
          }
        });
    }
    await db
      .collection("users")
      .doc(udid)
      .set({ videoId: selectedId, videoLink: youtubeLink }, { merge: true });

    await possibleUsersRef
      .where("joined", "==", false)
      .where("goal", "==", activityType)
      .get()
      .then(snapshot => {
        if (snapshot.empty) {
          console.log("No matching documents.");
          return;
        }

        let n = snapshot.docs.length;

        if (n < 4) {
          cnt = n;
        }

        for (let i = 0; i < n; i++) {
          let memberFullInfo = snapshot.docs[i];
          if (memberFullInfo.get("fcmToken") === masterFcmToken) continue;
          if (
            memberFullInfo.get("udid") === currentMembers.a.id ||
            memberFullInfo.get("fcmToken") === currentMembers.a.token
          )
            continue;
          if (
            memberFullInfo.get("udid") === currentMembers.b.id ||
            memberFullInfo.get("fcmToken") === currentMembers.b.token
          )
            continue;
          if (
            memberFullInfo.get("udid") === currentMembers.c.id ||
            memberFullInfo.get("fcmToken") === currentMembers.c.token
          )
            continue;
          if (
            memberFullInfo.get("udid") === currentMembers.d.id ||
            memberFullInfo.get("fcmToken") === currentMembers.d.token
          )
            continue;

          switch (tempCnt) {
            case 0: {
              addInfoA.id = memberFullInfo.get("udid");
              addInfoA.token = memberFullInfo.get("fcmToken");
              addInfoA.userName = memberFullInfo.get("userName");
              if (typeof addInfoA.token === typeof undefined) {
                addInfoA.token = "null";
              }
              currentMembers.a = addInfoA;
              break;
            }
            case 1: {
              addInfoB.id = memberFullInfo.get("udid");
              addInfoB.token = memberFullInfo.get("fcmToken");
              addInfoB.userName = memberFullInfo.get("userName");
              if (typeof addInfoB.token === typeof undefined) {
                addInfoB.token = "null";
              }
              currentMembers.b = addInfoB;
              break;
            }

            case 2: {
              addInfoC.id = memberFullInfo.get("udid");
              addInfoC.token = memberFullInfo.get("fcmToken");
              addInfoC.userName = memberFullInfo.get("userName");
              if (typeof addInfoC.token === typeof undefined) {
                addInfoC.token = "null";
              }
              currentMembers.c = addInfoC;
              break;
            }
            case 3: {
              addInfoD.id = memberFullInfo.get("udid");
              addInfoD.token = memberFullInfo.get("fcmToken");
              addInfoD.userName = memberFullInfo.get("userName");
              if (typeof addInfoD.token === typeof undefined) {
                addInfoD.token = "null";
              }
              currentMembers.d = addInfoD;
              break;
            }

            default: {
              console.log("okay");
              break;
            }
          }
          tempCnt += 1;
          if (tempCnt == cnt) break;
        }
      })
      .catch(err => {
        console.log("Error getting documents", err);
      });

    await db
      .collection("Rooms")
      .doc(roomId)
      .set(
        {
          videoLink: youtubeLink,
          startPlay: false,
          members: currentMembers
        },
        { merge: true }
      );

    const registrationTokens = [
      currentMembers.a.token,
      currentMembers.b.token,
      currentMembers.c.token,
      currentMembers.d.token
    ];
    const registeredNames = [
      currentMembers.a.userName,
      currentMembers.b.userName,
      currentMembers.c.userName,
      currentMembers.d.userName
    ];

    for (let j = 0; j < cnt; j++) {
      var notificationBody =
        registeredNames[j] +
        " invited you to a " +
        activityType +
        " Work out, Ready? ";
      const payload = {
        notification: {
          title: "Hey!",
          body: notificationBody,
          sound: "default",
          click_action: "connected"
        },
        data: {
          senderId: roomId,
          videoLink: youtubeLink
        }
      };
      const options = {
        content_available: true
      };
      await admin
        .messaging()
        .sendToDevice(registrationTokens[j], payload, options);
    }
  });
