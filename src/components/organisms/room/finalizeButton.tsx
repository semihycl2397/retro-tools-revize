import React from "react";
import Swal from "sweetalert2";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Buttons from "@/components/atoms/buttons/button";

interface FinalizeButtonProps {
  templateOwnerId: string | null;
  actualUserId: string;
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  setIsFinalized: React.Dispatch<React.SetStateAction<boolean>>;
  roomId: string;
}

const FinalizeButton: React.FC<FinalizeButtonProps> = ({
  templateOwnerId,
  actualUserId,
  isActive,
  setIsActive,
  setIsFinalized,
  roomId,
}) => {
  const handleFinalize = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "This will finalize the comments step!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#219ebc",
      cancelButtonColor: "rgba(99, 99, 99, 0.5)",
      confirmButtonText: "Yes, finalize!",
      cancelButtonText: "No, cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const roomRef = doc(db, "rooms", roomId);
          await updateDoc(roomRef, {
            is_active: false,
          });
          setIsActive(false);

          Swal.fire(
            "Finalized!",
            "Comments step has been finalized.",
            "success"
          );
        } catch (error) {
          console.error("Error finalizing comments step:", error);
        }
      }
    });
  };

  return (
    <>
      {templateOwnerId === actualUserId && isActive && (
        <Buttons
          htmlType="button"
          onClick={handleFinalize}
          text="Finalize Comments"
        />
      )}
    </>
  );
};

export default FinalizeButton;
