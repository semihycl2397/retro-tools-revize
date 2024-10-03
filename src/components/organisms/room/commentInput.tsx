import React, { useState } from "react";
import { Form, Row, Col } from "antd";
import * as yup from "yup";
import { Filter } from 'bad-words';
import Inputs from "@/components/atoms/inputs/inputs";
import Buttons from "@/components/atoms/buttons/button";
import styles from "./index.module.scss";

interface CommentInputProps {
  stepId: string;
  newComment: string;
  setNewComments: React.Dispatch<
    React.SetStateAction<{ [key: string]: string }>
  >;
  isActive: boolean;
  sendComment: (stepId: string) => void;
  comments?: string[];
}

const filter = new Filter();

const commentSchema = yup.object().shape({
  comment: yup
    .string()
    .required("Yorum boş olamaz")
    .min(1, "Yorum çok kısa olamaz"),
});

const CommentInput: React.FC<CommentInputProps> = ({
  stepId,
  newComment,
  setNewComments,
  isActive,
  sendComment,
  comments = [],
}) => {
  const [error, setError] = useState<string | null>(null);

  const repeatedCharRegex = /(.)\1{3,}/;

  const hasMinimumWords = (comment: string) => {
    const wordCount = comment.trim().split(/\s+/).length;
    return wordCount >= 3;
  };

  const handleSendComment = async () => {
    if (filter.isProfane(newComment)) {
      setError("Yorum yasaklı kelimeler içeriyor.");
      return;
    }

    if (!hasMinimumWords(newComment)) {
      setError("Yorum en az 3 kelime içermelidir.");
      return;
    }

    if (repeatedCharRegex.test(newComment)) {
      setError("Yorum tekrarlayan karakterler içeremez.");
      return;
    }

    try {
      await commentSchema.validate({ comment: newComment });
      sendComment(stepId);
      setError(null);
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setError(error.message);
      }
    }
  };

  return (
    <Form.Item
      validateStatus={error ? "error" : ""}
      help={error}
      className={styles.commentInputContainer}
    >
      {isActive && (
        <Row gutter={8} align="middle">
          <Col span={18}>
         
            <textarea
              name="comment"
              value={newComment}
              onChange={(e) =>
                setNewComments((prevComments) => ({
                  ...prevComments,
                  [stepId]: e.target.value,
                }))
              }
              className={styles.textareaInput}
              rows={5}
              style={{
                width: "100%",
                resize: "none",
                padding: "10px",
              }}
            />
          </Col>
          <Col span={6}>
            <Buttons
              text="Send"
              onClick={handleSendComment}
              className={styles.button}
            />
          </Col>
        </Row>
      )}

      <div
        className={styles.commentsList}
        style={{
          maxHeight: "300px",
          overflowY: "auto",
          marginTop: "20px",
        }}
      >
        {comments.map((comment, index) => (
          <div
            key={index}
            className={styles.comment}
            style={{
              padding: "8px",
              marginBottom: "10px",
              borderRadius: "8px",
              backgroundColor: "#f0f0f0",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              width: "90%",
              margin: "0 auto",
              minHeight: "40px",
              maxHeight: "150px",
              overflow: "hidden",
            }}
          >
            {comment}
          </div>
        ))}
      </div>
    </Form.Item>
  );
};

export default CommentInput;
