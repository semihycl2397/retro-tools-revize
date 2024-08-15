import React, { useState, useEffect } from "react";
import { Steps } from "antd";
import { useRouter } from "next/router";
import io from "socket.io-client";
import { auth } from "@/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import StepList from "./stepList";
import FinalizeButton from "./finalizeButton";
import FinalizeGroupingButton from "./FinalizeGroupingButton";
import RoomTask from "./roomTask";
import {
  fetchComments,
  fetchRoomData,
  initializeSnapshot,
  fetchUserVotes,
} from "./utils";
import { Comment, Step } from "./utils";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
if (!socketUrl) {
  throw new Error("NEXT_PUBLIC_SOCKET_URL is not defined");
}
const socket = io(socketUrl);

const Room: React.FC = () => {
  const [comments, setComments] = useState<{ [key: string]: Comment[] }>({});
  const [newComments, setNewComments] = useState<{ [key: string]: string }>({});
  const [isFinalized, setIsFinalized] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [steps, setSteps] = useState<Step[]>([]);
  const [templateOwnerId, setTemplateOwnerId] = useState<string | null>(null);
  const [totalVotes, setTotalVotes] = useState<number>(0);
  const [userVotes, setUserVotes] = useState<{ [key: string]: number }>({});
  const [actualUserId, setActualUserId] = useState<string>("");
  const [tempUserId, setTempUserId] = useState<string>("");
  const [commentGroups, setCommentGroups] = useState<{
    [key: string]: string[];
  }>({});
  const [groupLikes, setGroupLikes] = useState<{ [key: string]: number }>({});
  const [groupDislikes, setGroupDislikes] = useState<{ [key: string]: number }>(
    {}
  );

  const [currentStep, setCurrentStep] = useState(0);

  const router = useRouter();
  const { roomId } = router.query;

  useEffect(() => {
    const storedUserId =
      typeof window !== "undefined" ? localStorage.getItem("user_id") : null;
    const storedTempUserId =
      typeof window !== "undefined"
        ? localStorage.getItem("temp_user_id")
        : null;

    const userId = storedUserId || uuidv4();
    const tempId = storedTempUserId || uuidv4();

    if (typeof window !== "undefined") {
      localStorage.setItem("user_id", userId);
      localStorage.setItem("temp_user_id", tempId);
    }

    setActualUserId(userId);
    setTempUserId(tempId);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setActualUserId(user.uid);
        localStorage.setItem("user_id", user.uid);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (roomId && typeof roomId === "string") {
      fetchRoomData(
        roomId,
        setTemplateOwnerId,
        setSteps,
        setIsActive,
        fetchComments,
        setComments,
        setCommentGroups,
        setGroupLikes,
        setGroupDislikes
      );
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId && typeof roomId === "string") {
      initializeSnapshot(roomId, setIsFinalized, setIsActive);
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId && typeof roomId === "string" && actualUserId) {
      fetchUserVotes(roomId, actualUserId, setUserVotes, setTotalVotes);
    }
  }, [roomId, actualUserId]);

  useEffect(() => {
    const checkFinalizedStatus = async () => {
      if (roomId && typeof roomId === "string") {
        const roomRef = doc(db, "rooms", roomId);
        const roomDoc = await getDoc(roomRef);

        if (roomDoc.exists()) {
          const roomData = roomDoc.data();
          if (roomData.is_finalized) {
            setIsFinalized(true);
            setCurrentStep(2);
          } else if (!roomData.is_active) {
            setCurrentStep(1);
          } else {
            setCurrentStep(0);
          }
        }
      }
    };

    checkFinalizedStatus();
  }, [roomId]);

  const next = () => {
    if (currentStep === 1 && !isFinalized) {
      setIsFinalized(true);
    }
    setCurrentStep((prev) => prev + 1);
  };

  const stepsContent = [
    {
      title: "Comments",
      content: (
        <div>
          <StepList
            steps={steps}
            comments={comments}
            isActive={isActive}
            newComments={newComments}
            setNewComments={setNewComments}
            tempUserId={tempUserId}
            actualUserId={actualUserId}
            socket={socket}
            roomId={roomId as string}
            userVotes={userVotes}
            setComments={setComments}
            setUserVotes={setUserVotes}
          />
          <FinalizeButton
            templateOwnerId={templateOwnerId}
            actualUserId={actualUserId}
            isActive={isActive}
            setIsActive={setIsActive}
            setIsFinalized={setIsFinalized}
            roomId={roomId as string}
            onFinalize={next}
          />
        </div>
      ),
    },
    {
      title: "Grouping and Voting",
      content: (
        <div>
          <StepList
            steps={steps}
            comments={comments}
            isActive={isActive}
            newComments={newComments}
            setNewComments={setNewComments}
            tempUserId={tempUserId}
            actualUserId={actualUserId}
            socket={socket}
            roomId={roomId as string}
            userVotes={userVotes}
            setComments={setComments}
            setUserVotes={setUserVotes}
          />
          <FinalizeGroupingButton
            templateOwnerId={templateOwnerId}
            setTemplateOwnerId={setTemplateOwnerId}
            actualUserId={actualUserId}
            roomId={roomId as string}
            onFinalize={next}
            isFinalized={isFinalized}
            setIsFinalized={setIsFinalized}
            setIsActive={setIsActive}
          />
        </div>
      ),
    },
    {
      title: "Meeting Notes",
      content: <RoomTask roomId={roomId as string} />,
    },
  ];

  return (
    <div>
      <Steps current={currentStep} style={{ marginTop: 23 }}>
        {stepsContent.map((item) => (
          <Steps.Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div style={{ marginTop: 24 }}>{stepsContent[currentStep].content}</div>
    </div>
  );
};

export default Room;
